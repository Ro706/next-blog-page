"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  PencilIcon, 
  TrashIcon, 
  ChatBubbleLeftRightIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  EyeIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

interface Post {
  _id: string;
  title: string;
  published: boolean;
  upvotes: string[];
  downvotes: string[];
  comments: any[];
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchUserPosts();
    }
  }, [status, router]);

  const fetchUserPosts = async () => {
    try {
      const res = await fetch("/api/posts?user=true");
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post? This will also remove the image from storage.")) return;

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPosts(posts.filter((post) => post._id !== id));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("An error occurred while deleting the post");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your posts and track their performance.</p>
        </div>
        <Link 
          href="/posts/create" 
          className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Post</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 text-blue-600 mb-2">
            <ArrowUpIcon className="h-6 w-6" />
            <h3 className="font-semibold text-gray-700">Total Upvotes</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {posts.reduce((acc, post) => acc + (post.upvotes?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 text-red-600 mb-2">
            <ArrowDownIcon className="h-6 w-6" />
            <h3 className="font-semibold text-gray-700">Total Downvotes</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {posts.reduce((acc, post) => acc + (post.downvotes?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 text-purple-600 mb-2">
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
            <h3 className="font-semibold text-gray-700">Total Comments</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Post</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Engagement</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    You haven't created any posts yet.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          Created on {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        post.published 
                        ? "bg-green-100 text-green-700" 
                        : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center space-x-6">
                        <div className="flex items-center space-x-1.5 text-gray-500" title="Upvotes">
                          <ArrowUpIcon className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">{post.upvotes?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-gray-500" title="Downvotes">
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">{post.downvotes?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-gray-500" title="Comments">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <Link 
                          href={`/posts/${post._id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Post"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link 
                          href={`/posts/${post._id}/edit`}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Edit Post"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(post._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Post"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
