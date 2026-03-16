"use client";

import { useEffect, useRef, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DeletePostButton from "@/components/DeletePostButton";
import gsap from "gsap";
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon, 
  ChatBubbleLeftEllipsisIcon,
  ChevronLeftIcon,
  PaperAirplaneIcon
} from "@heroicons/react/24/outline";
import { 
  HandThumbUpIcon as HandThumbUpSolid, 
  HandThumbDownIcon as HandThumbDownSolid 
} from "@heroicons/react/24/solid";

export default function PostPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: session } = useSession();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [voting, setVoting] = useState(false);
  
  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPost();
  }, [id]);

  useEffect(() => {
    if (post) {
      const ctx = gsap.context(() => {
        gsap.from(headerRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out"
        });
        if (imageRef.current) {
          gsap.from(imageRef.current, {
            scale: 0.95,
            opacity: 0,
            duration: 1,
            delay: 0.2,
            ease: "power3.out"
          });
        }
        gsap.from(contentRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: 0.4,
          ease: "power3.out"
        });
        gsap.from(interactionRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          delay: 0.6,
          ease: "power3.out"
        });
      });
      return () => ctx.revert();
    }
  }, [post]);

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (!session) {
      alert("Please sign in to vote");
      return;
    }
    if (voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/posts/${id}/vote`, {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        setPost((prev: any) => ({
          ...prev,
          upvotes: data.hasUpvoted ? [...(prev.upvotes || []), (session.user as any).id] : (prev.upvotes || []).filter((id: string) => id !== (session.user as any).id),
          downvotes: data.hasDownvoted ? [...(prev.downvotes || []), (session.user as any).id] : (prev.downvotes || []).filter((id: string) => id !== (session.user as any).id),
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVoting(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert("Please sign in to comment");
      return;
    }
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${id}/comment`, {
        method: "POST",
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        const data = await res.json();
        setPost((prev: any) => ({
          ...prev,
          comments: data.comments,
        }));
        setCommentText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
  if (!post) notFound();

  const isAuthor = session?.user && (session.user as any).id === post.author?._id;
  const userId = (session?.user as any)?.id;
  const hasUpvoted = post.upvotes?.includes(userId);
  const hasDownvoted = post.downvotes?.includes(userId);

  return (
    <article className="max-w-3xl mx-auto pb-20">
      <header ref={headerRef} className="mb-10 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
          <span className="font-semibold text-blue-600 hover:underline cursor-pointer">{post.author?.name || 'Anonymous'}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          {post.title}
        </h1>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {post.imageUrl && (
        <div ref={imageRef} className="mb-12 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 ring-1 ring-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-auto object-cover max-h-[600px] hover:scale-105 transition-transform duration-700"
          />
        </div>
      )}

      {isAuthor && (
        <div className="flex justify-end mb-10 space-x-3">
          <Link
            href={`/posts/${post._id}/edit`}
            className="px-5 py-2.5 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all active:scale-95"
          >
            Edit Post
          </Link>
          <DeletePostButton id={post._id} />
        </div>
      )}

      <div ref={contentRef} className="prose prose-lg max-w-none prose-blue mb-16">
        {post.content.split('\n').map((paragraph: string, idx: number) => (
          paragraph ? <p key={idx} className="mb-6 text-gray-800 leading-relaxed text-lg lg:text-xl font-light">{paragraph}</p> : <div key={idx} className="h-4" />
        ))}
      </div>

      <div ref={interactionRef} className="border-t border-gray-100 pt-10 space-y-12">
        {/* Voting Section */}
        <div className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleVote('upvote')}
                disabled={voting}
                className={`p-2 rounded-full transition-all ${hasUpvoted ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-500'}`}
              >
                {hasUpvoted ? <HandThumbUpSolid className="h-7 w-7" /> : <HandThumbUpIcon className="h-7 w-7" />}
              </button>
              <span className="font-bold text-lg text-gray-700">{post.upvotes?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleVote('downvote')}
                disabled={voting}
                className={`p-2 rounded-full transition-all ${hasDownvoted ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 text-gray-500'}`}
              >
                {hasDownvoted ? <HandThumbDownSolid className="h-7 w-7" /> : <HandThumbDownIcon className="h-7 w-7" />}
              </button>
              <span className="font-bold text-lg text-gray-700">{post.downvotes?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <ChatBubbleLeftEllipsisIcon className="h-7 w-7" />
              <span className="font-bold text-lg">{post.comments?.length || 0}</span>
            </div>
          </div>
          
          <div className="hidden sm:block">
            <p className="text-sm text-gray-400 italic">What do you think about this post?</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <span>Comments</span>
            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-medium">{post.comments?.length || 0}</span>
          </h3>

          {session ? (
            <form onSubmit={handleComment} className="relative group">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none min-h-[120px]"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:bg-gray-400 active:scale-95 shadow-lg"
              >
                {submittingComment ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="h-5 w-5" />
                )}
              </button>
            </form>
          ) : (
            <div className="bg-blue-50 p-6 rounded-2xl text-center border border-blue-100">
              <p className="text-blue-800 font-medium mb-3">Want to join the discussion?</p>
              <Link href="/auth/signin" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all">
                Sign In to Comment
              </Link>
            </div>
          )}

          <div className="space-y-6">
            {post.comments && post.comments.length > 0 ? (
              post.comments.slice().reverse().map((comment: any, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-900">{comment.user?.name || 'Anonymous'}</span>
                    <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-gray-400 italic">
                No comments yet. Be the first to share your thoughts!
              </div>
            )}
          </div>
        </div>

        <footer className="pt-8 flex justify-center">
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all group">
            <ChevronLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to feed
          </Link>
        </footer>
      </div>
    </article>
  );
}
