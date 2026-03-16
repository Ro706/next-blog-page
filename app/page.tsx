import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import PostList from "@/components/PostList";

export const runtime = 'nodejs';

async function getPosts() {
  await connectDB();
  const posts = await Post.find({ published: true })
    .populate("author", "name")
    .sort({ createdAt: -1 })
    .lean();
  
  // Serialize Mongo IDs
  return posts.map((post: any) => ({
    ...post,
    _id: post._id.toString(),
    author: post.author ? { ...post.author, _id: post.author._id.toString() } : null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }));
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="space-y-8">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Welcome to <span className="text-blue-600">DevBlog</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Thoughts, stories and ideas.
        </p>
      </header>

      <PostList posts={posts} />
    </div>
  );
}
