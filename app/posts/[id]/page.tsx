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

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-4">
          <span className="font-semibold text-primary hover:underline cursor-pointer">{post.author?.name || 'Anonymous'}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
          {post.title}
        </h1>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="uppercase tracking-wider">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {post.imageUrl && (
        <div ref={imageRef} className="mb-12 rounded-3xl overflow-hidden shadow-2xl border border-border ring-1 ring-black/5">
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
          <Link href={`/posts/${post._id}/edit`}>
            <Button variant="outline">Edit Post</Button>
          </Link>
          <DeletePostButton id={post._id} />
        </div>
      )}

      <div ref={contentRef} className="prose prose-lg max-w-none mb-16">
        {post.content.split('\n').map((paragraph: string, idx: number) => (
          paragraph ? <p key={idx} className="mb-6 leading-relaxed text-lg lg:text-xl font-light text-foreground">{paragraph}</p> : <div key={idx} className="h-4" />
        ))}
      </div>

      <div ref={interactionRef} className="border-t border-border pt-10 space-y-12">
        {/* Voting Section */}
        <div className="flex items-center justify-between bg-secondary/50 p-6 rounded-2xl">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Button 
                variant={hasUpvoted ? "default" : "secondary"}
                size="icon"
                className="rounded-full"
                onClick={() => handleVote('upvote')}
                disabled={voting}
              >
                {hasUpvoted ? <HandThumbUpSolid className="h-5 w-5" /> : <HandThumbUpIcon className="h-5 w-5" />}
              </Button>
              <span className="font-bold text-lg">{post.upvotes?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant={hasDownvoted ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full"
                onClick={() => handleVote('downvote')}
                disabled={voting}
              >
                {hasDownvoted ? <HandThumbDownSolid className="h-5 w-5" /> : <HandThumbDownIcon className="h-5 w-5" />}
              </Button>
              <span className="font-bold text-lg">{post.downvotes?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <ChatBubbleLeftEllipsisIcon className="h-7 w-7" />
              <span className="font-bold text-lg">{post.comments?.length || 0}</span>
            </div>
          </div>
          
          <div className="hidden sm:block">
            <p className="text-sm text-muted-foreground italic">What do you think about this post?</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold flex items-center space-x-3">
            <span>Comments</span>
            <Badge variant="secondary" className="text-sm font-medium">{post.comments?.length || 0}</Badge>
          </h3>

          {session ? (
            <form onSubmit={handleComment} className="relative group">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-5 bg-background border-2 focus-visible:ring-primary outline-none transition-all resize-none min-h-[120px] rounded-2xl"
              />
              <Button
                type="submit"
                size="icon"
                disabled={submittingComment || !commentText.trim()}
                className="absolute bottom-4 right-4 rounded-xl shadow-lg"
              >
                {submittingComment ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="h-5 w-5" />
                )}
              </Button>
            </form>
          ) : (
            <div className="bg-secondary p-6 rounded-2xl text-center border border-border">
              <p className="font-medium mb-3">Want to join the discussion?</p>
              <Link href="/auth/signin">
                <Button>Sign In to Comment</Button>
              </Link>
            </div>
          )}

          <div className="space-y-6">
            {post.comments && post.comments.length > 0 ? (
              post.comments.slice().reverse().map((comment: any, idx: number) => (
                <div key={idx} className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold">{comment.user?.name || 'Anonymous'}</span>
                    <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-card-foreground leading-relaxed">{comment.text}</p>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-muted-foreground italic">
                No comments yet. Be the first to share your thoughts!
              </div>
            )}
          </div>
        </div>

        <footer className="pt-8 flex justify-center">
          <Link href="/">
            <Button variant="ghost" className="font-bold rounded-2xl group">
              <ChevronLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to feed
            </Button>
          </Link>
        </footer>
      </div>
    </article>
  );
}
