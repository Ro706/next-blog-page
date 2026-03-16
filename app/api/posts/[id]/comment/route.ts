import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;
    await connectDB();
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Initialize array if it doesn't exist
    if (!post.comments) post.comments = [];

    post.comments.push({
      user: userId,
      text: text.trim(),
      createdAt: new Date()
    });

    await post.save();

    // Populate comments to return them with user details
    const updatedPost = await Post.findById(id).populate('comments.user', 'name');

    return NextResponse.json({ comments: updatedPost.comments });
  } catch (error: any) {
    console.error("Comment Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
