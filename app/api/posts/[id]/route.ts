import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import "@/models/User"; // Ensure User model is registered for population
import { deleteFromGCS } from '@/lib/gcs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const post = await Post.findById(id)
      .populate('author', 'name email')
      .populate('comments.user', 'name');

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, excerpt, published, tags, imageUrl } = await req.json();

    await connectDB();
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.author.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, content, excerpt, published, tags, imageUrl },
      { new: true }
    );

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.author.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete image from GCS if it exists
    if (post.imageUrl) {
      await deleteFromGCS(post.imageUrl);
    }

    await Post.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
