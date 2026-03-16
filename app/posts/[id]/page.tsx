"use client";

import { useEffect, useRef, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DeletePostButton from "@/components/DeletePostButton";
import gsap from "gsap";

export default function PostPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: session } = useSession();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

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
      });
      return () => ctx.revert();
    }
  }, [post]);

  if (loading) return <div className="max-w-3xl mx-auto py-20 text-center text-gray-500">Loading...</div>;
  if (!post) notFound();

  const isAuthor = session?.user && (session.user as any).id === post.author?._id;

  return (
    <article className="max-w-3xl mx-auto">
      <header ref={headerRef} className="mb-10 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
          <span className="font-semibold text-blue-600">{post.author?.name || 'Anonymous'}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          {post.title}
        </h1>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {post.imageUrl && (
        <div ref={imageRef} className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>
      )}

      {isAuthor && (
        <div className="flex justify-end mb-8 space-x-3">
          <Link
            href={`/posts/${post._id}/edit`}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            Edit Post
          </Link>
          <DeletePostButton id={post._id} />
        </div>
      )}

      <div ref={contentRef} className="prose prose-lg max-w-none prose-blue">
        {post.content.split('\n').map((paragraph: string, idx: number) => (
          paragraph ? <p key={idx} className="mb-4 text-gray-800 leading-relaxed text-lg">{paragraph}</p> : <br key={idx} />
        ))}
      </div>

      <footer className="mt-16 pt-8 border-t border-gray-100">
        <Link href="/" className="inline-flex items-center text-blue-600 font-medium hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to feed
        </Link>
      </footer>
    </article>
  );
}
