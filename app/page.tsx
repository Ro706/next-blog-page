import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import PostList from "@/components/PostList";
import HeroSection from "@/components/HeroSection";

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
      <HeroSection />
      <PostList posts={posts} />
    </div>
  );
}
