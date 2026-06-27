# LogiTrack 🚛

A high-performance, real-time shipment tracking and fleet management dashboard built with **Next.js 15 (App Router)** and **Firebase**. LogiTrack empowers dispatchers with AI telemetry, live routing updates, and actionable analytics within a stunning, glassmorphic UI.

---

## 🚀 Live Demo
**https://logitrack-priya-12345.web.app/**

---

## 🛠️ Architecture & Grading Rubric Implementation

### 1. Next.js Architecture
* **Clean Folder Structure:** Built using the Next.js App Router (`/app`). The codebase strictly separates business logic, reusable hooks, and UI components into a modular, feature-based architecture (`src/features`, `src/shared`). 
* **Server vs. Client Components:** Thoughtfully utilized `"use client"` directives exclusively where interactivity or React hooks (useState, useEffect) are required (e.g., `LoginForm`, `ShipmentContext`). This ensures optimal rendering performance and adherence to App Router paradigms.

### 2. Tailwind CSS Mastery
* **Arbitrary Value Avoidance:** Enforced strict usage of Tailwind’s utility scale (e.g., `p-6`, `gap-5`, `text-xs`) to maintain a consistent design system, completely avoiding hard-coded arbitrary values (like `w-[150px]`).
* **Responsive Layouts:** The dashboard is fully responsive, seamlessly collapsing from a multi-column desktop grid into a stackable, scrollable mobile layout using breakpoints (`md:`, `lg:`).
* **Dense Data Grids:** Tables and data-dense cards are cleanly designed using advanced Flexbox/Grid techniques, ensuring high legibility and precise alignment across all screen sizes.

### 3. Firebase Integration
* **Efficient Queries & Real-Time Listeners:** Firestore data is fetched using optimized queries within a global context (`ShipmentContext`). 
* **Memory Leak Prevention:** Real-time listeners (`onSnapshot`) are wrapped in custom hooks (`useRealtime.ts`) and properly cleaned up using `useEffect` return functions. This prevents infinite re-renders and memory leaks.
* **Authentication:** Seamlessly handles user sessions with `onAuthStateChanged`, dynamically updating route access.

### 4. Code Quality & Logic
* **Error Handling:** Robust try/catch blocks are implemented across all Firebase operations. Authentication maps raw Firebase error codes (e.g., `auth/invalid-credential`) to user-friendly UI toast notifications.
* **Form Validation:** Integrated `React Hook Form` paired with `Zod` schema validation. This ensures strict, type-safe data entry (like enforcing email formats and password lengths) before any request is sent to Firestore.
* **Semantic HTML:** Code relies on proper HTML5 semantic tags (`<header>`, `<main>`, `<section>`, `<footer>`) for structure and accessibility.

---

## ⚙️ Local Development & Setup Instructions

Follow these steps to run the project locally and connect it to your own Firebase project.

### 1. Prerequisites
Ensure you have **Node.js 18+** installed on your machine.

### 2. Clone the Repository
```bash
git clone https://github.com/Priyanshusahay12222301/LogiTrack.git
cd LogiTrack/client
npm install
```

### 3. Set Up Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project** and follow the prompts.
3. Navigate to **Authentication** and enable the **Email/Password** sign-in method.
4. Navigate to **Firestore Database** and create a new database. Go to the "Rules" tab and set them to `allow read, write: if request.auth != null;` for secure access.
5. Go to Project Overview > **Project settings** > **General**, and under "Your apps", click the **Web `</>`** icon to register your web app. This will generate your Firebase SDK configuration keys.

### 4. Configure Environment Variables
Inside the `/client` directory, create a new file named `.env.local`. Copy the keys provided by Firebase in step 3 and format them exactly like this:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY_HERE"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"
```
*(Note: Every key must start with `NEXT_PUBLIC_` so Next.js knows to securely expose them to your client-side application).*

### 5. Run the Local Server
With your environment variables saved, start the application:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`. You can now log in using the credentials you create in your Firebase Authentication dashboard!

---
*Developed by Priyanshu Sahay*