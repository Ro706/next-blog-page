import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const runtime = "nodejs";

import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import "@/models/User"; // Ensure User model is registered for population

export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find({ published: true })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("GET Posts Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID missing from session' }, { status: 401 });
    }

    const { title, content, excerpt, published, tags, imageUrl } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await connectDB();
    const post = await Post.create({
      title,
      content,
      excerpt,
      imageUrl,
      published,
      tags,
      author: userId,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error("POST Post Error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A post with this slug/title already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
