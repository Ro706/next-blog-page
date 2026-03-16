# Blog Project with Google Cloud Storage Integration

This is a modern blog application built with Next.js, MongoDB, and Google Cloud Storage (GCS) for image uploads.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Create the App](#step-1-create-the-app)
3. [Step 2: Establish Google Cloud Bucket](#step-2-establish-google-cloud-bucket)
4. [Step 3: Download API Key (Service Account)](#step-3-download-api-key-service-account)
5. [Step 4: Grant Permissions](#step-4-grant-permissions)
6. [Step 5: Integrate GCS in Blog Project](#step-5-integrate-gcs-in-blog-project)
7. [Professional Intro & GSAP Animations](#professional-intro--gsap-animations)
8. [Step 6: Running the App](#step-6-running-the-app)

---

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- Google Cloud Account

---

## Step 1: Create the App
If you are starting from scratch, you can initialize the project using:
```bash
npx create-next-app@latest blog --typescript --tailwind --eslint
cd blog
npm install @google-cloud/storage mongoose next-auth@beta bcryptjs react-hook-form zod @hookform/resolvers gsap
```

---

## Step 2: Establish Google Cloud Bucket
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. In the search bar, type **Cloud Storage** and click on **Buckets**.
4. Click **Create**.
5. Give your bucket a unique name (e.g., `my-blog-images-123`).
6. Choose a location (Region is recommended for lower latency).
7. Choose **Standard** storage class.
8. **Uncheck** "Enforce public access prevention on this bucket" if you want to serve images directly via URL (or keep it checked for private access and use signed URLs). 
9. Set Access Control to **Uniform** or **Fine-grained** (Fine-grained is better if you want specific files to be public).
10. Click **Create**.

---

## Step 3: Download API Key (Service Account)
1. In the Google Cloud Console, go to **IAM & Admin** > **Service Accounts**.
2. Click **Create Service Account**.
3. Provide a name (e.g., `blog-storage-admin`) and click **Create and Continue**.
4. Click **Done** (we will grant permissions in the next step).
5. Find your new service account in the list, click the **three dots (Actions)**, and select **Manage keys**.
6. Click **Add Key** > **Create new key**.
7. Select **JSON** and click **Create**. 
8. A JSON file will download. **Keep this file safe!** It contains sensitive credentials.

---

## Step 4: Grant Permissions
1. Go back to your **Cloud Storage Bucket**.
2. Click on the **Permissions** tab.
3. Click **Grant Access**.
4. In **New principals**, paste the `client_email` from the JSON key you just downloaded.
5. In **Select a role**, choose **Cloud Storage** > **Storage Object Admin** (this allows the app to upload and delete files).
6. Click **Save**.

**To make images publicly viewable via URL:**
1. Click **Grant Access** again.
2. Add principal: `allUsers`.
3. Role: **Storage Object Viewer**.
4. Click **Save** and confirm "Allow Public Access".

---

## Step 5: Integrate GCS in Blog Project
Create a `.env.local` file in your project root and add the following information from your JSON key and bucket:

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

## Professional Intro & GSAP Animations
The project features a high-end cinematic entrance using **GSAP** (GreenSock Animation Platform) to create a premium first impression.

### Advanced Preloader Sequence
The preloader (`components/Preloader.tsx`) orchestrates a multi-step 3D animation:
1. **3D Entrance:** A glowing blue box enters the screen with complex 3D rotation and depth (z-axis) manipulation.
2. **Dynamic Scanning Reveal:** The box acts as a "scanner," moving horizontally across the screen. As it passes over the invisible text, the letters dynamically unlock, scaling down and losing their Gaussian blur in real-time.
3. **Morphing Accent:** Once the text is fully revealed, the 3D box morphs elastically into a sleek vertical accent bar.
4. **Curtain Reveal Exit:** Instead of a simple fade, the preloader concludes with a dramatic "curtain split" where the white background splits in half and slides out to the left and right, seamlessly revealing the application dashboard underneath.

### Dashboard & Layout Animations
- **Dashboard Reveal:** Once the preloader's curtain opens, the navigation bar and main content fade in with staggered movements (`components/LayoutContent.tsx`).
- **Hero & Interactive Elements:** Staggered card entries, animated underlines, and smooth hover transitions are present throughout the app (`components/HeroSection.tsx`, `components/PostList.tsx`).

### How to Implement & Customize:
Animations are built using React's `useEffect` hook and `gsap.context()` to ensure proper memory management and cleanup.

**1. Modifying the Preloader (`components/Preloader.tsx`):**
- **Change Text:** Edit the `const letters = "DevBlog".split("");` array.
- **Adjust Scan Speed:** Modify the `duration` inside the "Box Pulse & Scan" timeline step.
- **Tweak the Split:** Adjust the `xPercent` and `duration` in the `exitTl` timeline to change how the curtains open.

**2. Managing the Transition (`components/LayoutContent.tsx`):**
- The app uses state (`isPreloaderVisible`, `isAppVisible`) to coordinate the handoff between the preloader and the main layout. When the preloader's timeline completes, it triggers `handlePreloaderComplete()`, which mounts the main dashboard and starts its entrance animations.

---

## Step 6: Running the App
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Your app should now be running at `http://localhost:3000`. You can test image uploads in the "Create Post" section.
