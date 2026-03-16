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

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your posts and track their performance.</p>
        </div>
        <Link href="/posts/create">
          <Button className="flex items-center space-x-2">
            <PlusIcon className="h-5 w-5" />
            <span>New Post</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Upvotes</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {posts.reduce((acc, post) => acc + (post.upvotes?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downvotes</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {posts.reduce((acc, post) => acc + (post.downvotes?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Engagement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                    You haven't created any posts yet.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {post.title}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          Created on {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-6">
                        <div className="flex items-center space-x-1.5 text-muted-foreground" title="Upvotes">
                          <ArrowUpIcon className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">{post.upvotes?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-muted-foreground" title="Downvotes">
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">{post.downvotes?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-muted-foreground" title="Comments">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/posts/${post._id}`}>
                          <Button variant="ghost" size="icon" title="View Post">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/posts/${post._id}/edit`}>
                          <Button variant="ghost" size="icon" title="Edit Post">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Delete Post"
                          onClick={() => handleDelete(post._id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
