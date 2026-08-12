# เกมจับคู่ สุวรรณสามชาดก (Syama Jataka Matching Game)

Single-Level Drag-and-Drop Educational Quiz designed specifically for Grade 4 Primary School Students (เด็กนักเรียนชั้น ป.4) based on the Thai Buddhist tale "สุวรรณสามชาดก".

## 🎮 Features
- **Drag-and-Drop Gameplay:** Interactive mechanics built with `@dnd-kit/core`.
- **Responsive & Touch-friendly:** Works smoothly on Desktop, Tablets, and Smartphones.
- **Immediate Feedback:** Clear audio-visual feedback (Green for correct, Red with shake for wrong).
- **Celebration Modal:** Displays a meaningful Grade 4 moral lesson when the game is completed.
- **Modern Tech Stack:** React, TypeScript, Vite, Vanilla CSS.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository or navigate to this folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`

## 🌍 Deployment (GitHub Pages / Vercel)

### Vercel
Deploying to Vercel is highly recommended for React+Vite apps.
1. Push this repository to GitHub.
2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. The Build settings will auto-detect Vite:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**.

### GitHub Pages
1. Install `gh-pages` package:
   ```bash
   npm install gh-pages --save-dev
   ```
2. In `package.json`, add `"homepage": "https://<USERNAME>.github.io/<REPO_NAME>/"`
3. Also update `vite.config.ts` to include `base: '/<REPO_NAME>/',`
4. Add these scripts to `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
5. Run `npm run deploy`

## 🧠 Moral Lesson (คติสอนใจสำหรับเด็ก ป.4)
"ความกตัญญูรู้คุณต่อพ่อแม่และผู้มีพระคุณ คือรากฐานของเด็กดี เมื่อเด็กๆ มีความกตัญญู ช่วยเหลือพ่อแม่ ขยัน อดทน และมีน้ำใจเมตตาต่อผู้อื่น ความดีนี้จะส่งผลให้เรามีความสุข มีความเจริญ และเป็นที่รักของทุกคน"
