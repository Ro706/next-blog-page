import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import EditPostForm from "@/components/EditPostForm";

async function getPost(id: string) {
  try {
    await connectDB();
    const post = await Post.findById(id).lean();
    return post;
  } catch (error) {
    return null;
  }
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post: any = await getPost(id);
  const session = await auth();

  if (!post) {
    notFound();
  }

  const userId = (session?.user as any)?.id;
  if (!userId || post.author.toString() !== userId) {
    redirect("/");
  }

  const initialData = {
    title: post.title,
    content: post.content,
    excerpt: post.excerpt || "",
    imageUrl: post.imageUrl || "",
    tags: post.tags?.join(", ") || "",
    published: post.published,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Post</h1>
      <EditPostForm id={id} initialData={initialData} />
    </div>
  );
}
