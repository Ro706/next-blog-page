import mongoose, { Schema, model, models, Document } from 'mongoose';
import './User'; // Register User model for population

export interface IPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  slug: string;
  excerpt: string;
  imageUrl?: string;
  published: boolean;
  tags: string[];
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  comments: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    slug: {
      type: String,
      unique: true,
      required: [true, 'Slug is required'],
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    published: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    upvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    downvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  { timestamps: true }
);

// Pre-save middleware to generate slug if not present
PostSchema.pre('validate', async function() {
  const doc = this as any;
  if (doc.title && !doc.slug) {
    doc.slug = doc.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || `post-${Date.now()}`;
  }
});

const Post = models.Post || model<IPost>('Post', PostSchema);

export default Post;
