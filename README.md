<p align="center">
  <img src="./public/Logo.png" alt="Easy Club Logo" width="120" />
</p>

<h1 align="center">Easy Club</h1>

<p align="center">
  <strong>A Comprehensive Management Platform for Student Organizations and Clubs</strong><br />
  <sub>Event Command Center &bull; AI Ideation &bull; Financial CRM &bull; Intelligent Workspaces</sub>
</p>

<p align="center">
  <a href="https://github.com/Vaibhav-Reddy560/Easy-Club/stargazers"><img src="https://img.shields.io/github/stars/Vaibhav-Reddy560/Easy-Club?style=flat&color=f59e0b" alt="Stars" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat&logo=firebase&logoColor=black" alt="Firebase" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://www.framer.com/motion/"><img src="https://img.shields.io/badge/Framer-Motion-0055FF?style=flat&logo=framer&logoColor=white" alt="Framer Motion" /></a>
</p>

<br />

## Platform Capabilities

<table>
<tr>
<td width="50%">

### 🛡️ Role-Based Access Control

Maintain a secure organizational hierarchy with granular access control. Assign permissions for System Administrators, Senior Core, Junior Core, and General Members, and monitor activity via the Watchtower dashboard.

</td>
<td width="50%">

### 📊 Event Command Center

Track upcoming, postponed, and completed events. Assign domain-specific objectives (Management, Design, Content, Social) to members and log critical discussions and meeting minutes tied directly to specific projects.

</td>
</tr>
<tr>
<td width="50%">

### 🎨 Native Design Studio

An AI-assisted canvas for generating professional promotional assets. Features an AI Vibe Director (color palettes, typography) and supports exporting artboards for A3 Posters, Instagram, Standees, and Certificates.

</td>
<td width="50%">

### 📱 Intelligent Workspaces

Manage event registrations automatically with Google Forms synchronization and QR check-ins (Content Workspace). Leverage an AI Invitation Engine to draft professional outreach emails and volunteer briefings (Social Workspace).

</td>
</tr>
<tr>
<td width="50%">

### 💡 AI-Driven Event Ideation

Overcome creative blocks with a sophisticated ideation engine. Generate trending, highly engaging event concepts and automatically draft comprehensive event pitches, titles, and preliminary operational reports.

</td>
<td width="50%">

### 🤝 Collaboration Hub

A dedicated networking environment to initiate joint ventures with other clubs. Plan shared events, establish secure communication pipelines, and seamlessly draft Memorandum of Understandings (MOUs).

</td>
</tr>
<tr>
<td width="50%">

### 👥 Recruitment Pipeline

Administer your end-to-end talent acquisition process. Configure automated evaluations, track applicant progression, evaluate candidate skills via the Talent Matrix, and conduct internal core committee voting.

</td>
<td width="50%">

### 💵 Sponsorship CRM

A specialized Kanban-style Customer Relationship Management (CRM) board for financial tracking. Monitor sponsor pipelines (Prospecting → Closed), track tiers, and validate the fulfillment of corporate deliverables.

</td>
</tr>
</table>

## Technical Architecture

Easy Club is built utilizing modern web technologies to ensure optimal performance, scalability, and responsive design across all devices.

*   **Core Framework**: [Next.js 15](https://nextjs.org/) (App Router) & React 19
*   **Interface & Styling**: [Tailwind CSS](https://tailwindcss.com/) with native CSS enhancements for deep customizations.
*   **Animation Engine**: [Framer Motion](https://www.framer.com/motion/) for fluid, hardware-accelerated transitions.
*   **Database & Authentication**: [Firebase Firestore & Firebase Auth](https://firebase.google.com/) for real-time data synchronization and secure access.
*   **UI Components & Icons**: [Lucide React](https://lucide.dev/) for consistent, scalable iconography.
*   **AI Integrations**: Native API routes connecting to OpenAI, Gemini, and HuggingFace for robust natural language processing and generative tasks.

## Local Development Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Vaibhav-Reddy560/Easy-Club.git
cd Easy-Club
```

### 2. Install Dependencies
Ensure that you are running Node.js version 18 or higher.
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory. Populate it with your Firebase credentials and any required third-party API keys.

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# AI & External Services (Example)
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key
```

### 4. Initialize the Application
Start the Next.js development server:
```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) in your web browser to access the application.

## Design Philosophy

The user interface of Easy Club is engineered to provide a sophisticated, distraction-free environment. By utilizing a strictly curated dark mode palette (centered around `#0a0a0a`), subtle glassmorphism techniques, and strategic highlight accents, the platform ensures that administrative tasks are visually clear and structurally intuitive. Responsive micro-interactions are integrated universally to provide immediate, tactile feedback, ensuring the application feels responsive and professional on both desktop and mobile devices.

<br />

<div align="center">
  <i>Developed for the next generation of student leadership.</i>
</div>
