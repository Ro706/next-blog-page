# Blog Project with Google Cloud Storage Integration

This is a modern blog application built with Next.js, MongoDB, and Google Cloud Storage (GCS) for image uploads. It features a cinematic GSAP-powered preloader and a clean, responsive interface for creating and managing blog posts.

## Project Architecture
```mermaid
flowchart TD
    User((User)) -->|Interacts| UI[Frontend - Next.js/React]
    UI -->|NextAuth| Auth[Authentication - NextAuth.js]
    UI -->|Fetch API| API[Backend - Next.js API Routes]
    
    subgraph Backend
        API -->|Mongoose| MongoDB[(MongoDB Database)]
        API -->|Google Cloud SDK| GCS[(Google Cloud Storage)]
    end

    subgraph UI_Components
        UI --> Layout[Layout & Navbar]
        UI --> Hero[Hero Section]
        UI --> PostList[Post List]
        UI --> CreatePost[Create Post Form]
        UI --> EditPost[Edit Post Form]
    end

    subgraph Auth_Flow
        Auth -->|Credentials| UserDB[User Model]
        UserDB --> MongoDB
    end

    subgraph Data_Flow
        PostList -->|Fetch| API_Posts[API /api/posts]
        CreatePost -->|Upload Image| API_Upload[API /api/upload]
        API_Upload --> GCS
        CreatePost -->|Save Post| API_Posts
        API_Posts --> MongoDB
    end
```

---

## Step-by-Step Build Guide

### Step 1: Initialize Next.js & Install Dependencies
Start by creating a new Next.js project with App Router and TypeScript.
```bash
npx create-next-app@latest blog --typescript --tailwind --eslint
cd blog
npm install @google-cloud/storage mongoose next-auth@beta bcryptjs react-hook-form zod @hookform/resolvers gsap
```

### Step 2: Database Setup (MongoDB & Mongoose Models)
1. **Connect to MongoDB:** Create `lib/mongodb.ts` to manage the Mongoose connection.
2. **Define Models:** 
   - `models/User.ts`: Store user credentials (name, email, hashed password).
   - `models/Post.ts`: Store blog post data (title, description, image URL, user reference).

### Step 3: Authentication (NextAuth.js v5)
1. **Configure Auth:** Create `auth.ts` and `auth.config.ts` to set up NextAuth with Credentials provider.
2. **Auth Middleware:** Create `middleware.ts` to protect routes (e.g., `/posts/create`).
3. **Register Route:** Implement `app/api/register/route.ts` to handle new user signups with `bcryptjs`.

### Step 4: Google Cloud Storage Setup
1. **Create Bucket:** Go to the [Google Cloud Console](https://console.cloud.google.com/), create a bucket, and set Access Control to **Fine-grained** or **Uniform**.
2. **Permissions:** Grant `Storage Object Viewer` to `allUsers` for public image access, and `Storage Object Admin` to your service account.
3. **Service Account Key:** Create a Service Account in **IAM & Admin**, download the **JSON key**, and add the credentials to your `.env.local`.
4. **GCS Utility:** Implement `lib/gcs.ts` to initialize the `@google-cloud/storage` client using the environment variables.

### Step 5: API Routes & CRUD Operations
1. **Upload API:** Create `app/api/upload/route.ts` to handle file uploads from the client to GCS.
2. **Posts API:** 
   - `app/api/posts/route.ts`: Handle `GET` (fetch all) and `POST` (create new).
   - `app/api/posts/[id]/route.ts`: Handle `GET` (fetch single), `PUT` (update), and `DELETE` (remove).

### Step 6: Frontend Development & GSAP Animations
1. **Layout & Providers:** Set up `app/layout.tsx` with a `Providers` component for NextAuth sessions.
2. **Cinematic Preloader:** Use `gsap` in `components/Preloader.tsx` to create a high-end 3D entrance animation.
3. **CRUD Components:** 
   - `components/PostList.tsx`: Display posts with staggered fade-in animations.
   - `app/posts/create/page.tsx`: A form using `react-hook-form` and `zod` for validation.
   - `app/posts/[id]/edit/page.tsx`: For updating existing posts.

---

## Environment Configuration
Create a `.env.local` file in your project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://...

# NextAuth Secret
AUTH_SECRET=your_random_secret_here

# Google Cloud Storage Configuration
GCS_PROJECT_ID=your-project-id
GCS_CLIENT_EMAIL=your-service-account-email@...iam.gserviceaccount.com
GCS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Content\n-----END PRIVATE KEY-----\n"
GCS_BUCKET_NAME=your-bucket-name
```

---

## GSAP Animation Details
The project features a high-end cinematic entrance using **GSAP** (GreenSock Animation Platform).

### Advanced Preloader Sequence
The preloader (`components/Preloader.tsx`) orchestrates a multi-step 3D animation:
1. **3D Entrance:** A glowing blue box enters with complex 3D rotation.
2. **Scanning Reveal:** The box acts as a "scanner," moving horizontally to reveal text letters dynamically.
3. **Morphing Accent:** The box elastically morphs into a sleek vertical accent bar.
4. **Curtain Reveal Exit:** The preloader concludes with a "curtain split" reveal, sliding the background out to the sides.

---

## Running the App
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Your app should now be running at `http://localhost:3000`.
