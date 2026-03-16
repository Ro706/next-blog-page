"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function PostList({ posts }: { posts: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".post-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="grid gap-12">
      {posts.length > 0 ? (
        posts.map((post: any) => (
          <article key={post._id.toString()} className="post-card group">
            <Link href={`/posts/${post._id.toString()}`} className="block space-y-4">
              {post.imageUrl && (
                <div className="relative h-64 w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="font-semibold text-blue-600">{post.author?.name || 'Anonymous'}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-gray-600 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center text-blue-600 font-medium pt-2">
                  Read more
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </article>
        ))
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
          <p className="mt-1 text-gray-500">Be the first to share something!</p>
          <div className="mt-6">
            <Link
              href="/posts/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create a Post
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
