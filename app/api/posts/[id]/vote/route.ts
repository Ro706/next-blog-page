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

    const { type } = await req.json(); // 'upvote' or 'downvote'
    if (type !== 'upvote' && type !== 'downvote') {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    const userId = (session.user as any).id;
    await connectDB();
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Initialize arrays if they don't exist
    if (!post.upvotes) post.upvotes = [];
    if (!post.downvotes) post.downvotes = [];

    const hasUpvoted = post.upvotes.includes(userId);
    const hasDownvoted = post.downvotes.includes(userId);

    if (type === 'upvote') {
      if (hasUpvoted) {
        // Toggle off upvote
        post.upvotes = post.upvotes.filter((uid: any) => uid.toString() !== userId);
      } else {
        // Toggle on upvote, remove from downvote
        post.upvotes.push(userId);
        post.downvotes = post.downvotes.filter((uid: any) => uid.toString() !== userId);
      }
    } else {
      if (hasDownvoted) {
        // Toggle off downvote
        post.downvotes = post.downvotes.filter((uid: any) => uid.toString() !== userId);
      } else {
        // Toggle on downvote, remove from upvote
        post.downvotes.push(userId);
        post.upvotes = post.upvotes.filter((uid: any) => uid.toString() !== userId);
      }
    }

    await post.save();

    return NextResponse.json({ 
      upvotes: post.upvotes.length, 
      downvotes: post.downvotes.length,
      hasUpvoted: post.upvotes.includes(userId),
      hasDownvoted: post.downvotes.includes(userId)
    });
  } catch (error: any) {
    console.error("Vote Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
