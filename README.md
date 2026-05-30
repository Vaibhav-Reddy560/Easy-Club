<div align="center">
  <h1>👑 Easy Club</h1>
  <p><strong>The Ultimate Operating System for College Clubs & Organizations.</strong></p>
  <p>Empowering student leaders to manage events, design stunning assets, track sponsorships, and collaborate effortlessly.</p>
</div>

---

## ✨ Overview

**Easy Club** is a modern, premium, full-stack application built to solve the operational chaos of running student organizations. With a sleek dark-mode interface and **signature gold accents (🟡)**, it feels less like a management tool and more like a professional command center.

From planning your flagship hackathons to recruiting your next Junior Core, **Easy Club** brings all your workflows into one centralized, AI-powered hub.

---

## 🚀 The Core Engine (Features by Navigation)

The application is structured into three main operational pillars: **Management**, **Explore**, and **Growth**. Here is a complete breakdown of every feature available in your command center:

### 🛡️ Management
The foundational tools for running your organization internally.

*   **🛡️ My Team**: Control access and permissions across your organization. Assign and track roles such as Admins, Senior Core, Junior Core, and General Members to maintain a secure hierarchy.
*   **📁 My Clubs & Event Command Center**: Your centralized workspace for everything event-related.
    *   **Event Lifecycle Management**: Track upcoming, completed, and postponed events.
    *   **Task Delegation**: Assign domain-specific tasks (Design, Content, Management, Social) to members and track progress to 100%.
    *   **Meeting Minutes**: Log key topics, attendees, and progress notes directly tied to specific events.
    *   **🎨 AI-Powered Design Studio**: Built directly into your club workspace. Stop switching between Canva, Photoshop, and your browser. Generate stunning assets with our **AI Vibe Director** (color palettes, typography, Unsplash backgrounds). Export perfectly scaled artboards for **A3 Posters, Instagram (4:5), WhatsApp, Banners, Standees, and Certificates**.
*   **🤝 Collab Hub**: The ultimate networking tool. Send, receive, and manage collaboration requests with other clubs on the platform. Plan shared events, share activity logs, and communicate through secure pipelines.

### 🌍 Explore
Discover what's happening outside your organization and get inspired.

*   **🌐 Explore Clubs**: A semantic search engine to discover other clubs and organizations on the platform. Browse their events, domains, and open collaboration opportunities.
*   **⚡ Event Ideation**: Running out of ideas? Use the AI-driven Ideation engine to brainstorm trending, engaging, and high-impact event concepts tailored to your club's domain.

### 📈 Growth
Tools designed to scale your club's presence, finances, and manpower.

*   **👥 Membership X Recruitment**: Handle your entire intake process end-to-end. Host automated tests or fee-based recruitments. Track applicants, evaluate skills, and conduct voting directly in the dashboard.
*   **📊 Social Tracker**: An integrated analytics suite to monitor your club's social media performance and digital footprint. Track engagement, reach, and campaign success across platforms.
*   **💵 Funding X Sponsorship (CRM)**: A dedicated Kanban-style tracker for your finances. Move sponsors through pipeline stages (*Prospecting → Contacted → Negotiating → Closed*). Track exact sponsorship values (Title, Platinum, Gold) and ensure you meet all promised deliverables.

---

## 💻 Tech Stack

The application is built for speed, responsiveness, and premium aesthetics.

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router) & React 19
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS for deep custom animations
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Database / Backend**: [Firebase Firestore](https://firebase.google.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Export Engine**: HTML-to-Image for lossless canvas rendering

---

## 🛠️ Getting Started

Follow these steps to run the application locally:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/easy-club.git
cd easy-club
```

### 2. Install dependencies
Ensure you are using `npm` and Node.js 18+.
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env.local` file in the root directory and add your Firebase credentials and any required API keys (e.g., Unsplash).
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# Add other necessary keys...
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

---

## 🖤 Design Philosophy
We believe management tools shouldn't be boring. **Easy Club** uses a strictly curated dark mode with deep blacks (`#0a0a0a`), subtle glassmorphism effects, and vibrant gold accents (`#f59e0b`). Micro-animations and hover states are implemented universally to ensure the application feels alive and responsive to every interaction.

---
<div align="center">
  <i>Built with ❤️ for student leaders.</i>
</div>
