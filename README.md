# 📌 Untold — Anonymous Digital Corkboard

> An anonymous, text-only digital corkboard where people share raw, unfiltered thoughts, micro-confessions, quiet hopes, and small wins. Built with a distinctive **Soft Neubrutalism** aesthetic.

---

## ✨ Features

- 💌 **100% Anonymous**: No registration, no login, no tracking, no usernames.
- 🎨 **Soft Neubrutalism Aesthetic**: Vibrant pastel sticky notes, bold 2px borders, hard drop shadows, and organic rotation angles.
- 🗂️ **7 Thought Categories**:
  - 🏆 Small Wins (`#FFD13B`)
  - 💌 Secret Crush (`#FFAEC0`)
  - 🌿 Wholesome (`#88E788`)
  - 🙈 Silly & Awkward (`#FF8552`)
  - 🌤️ Quiet Hope (`#70C7FA`)
  - 🌧️ Heavy Heart (`#D7B4F3`)
  - ✉️ Unsent Letters (`#F4A261`)
- 💫 **Meaningful Reactions**: React with `⭐ Star`, `👂 Heard`, or `🫂 Hug` (optimistic UI with local interaction memory).
- 🏆 **Top Posts Drawer**: Filter top notes by Today, This Week, or All-Time.
- 🛡️ **Spam & Abuse Protection**: Client-side character limits (500 chars), honeypot anti-spam field, and safe text trimming.
- ⚡ **Real-Time Polling**: Auto-refreshes board every 60 seconds with optimistic client updates.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Neubrutalism Design System
- **Database**: [Turso](https://turso.tech/) (LibSQL distributed edge SQLite) with fallback to local SQLite (`local.db`)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com)

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Knecrow/untold.git
cd untold
npm install
```

### 2. Environment Setup

Create `.env.local` based on `.env.example`:

```env
# For local SQLite development (no Turso account needed):
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=

# For production (Turso cloud):
# TURSO_DATABASE_URL=libsql://untold-youruser.turso.io
# TURSO_AUTH_TOKEN=your-token-here
```

### 3. Initialize Database & Seed

```bash
# Push schema to SQLite
npm run db:push

# Seed demo posts
npm run db:seed
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub.
2. Create a free database at [Turso](https://turso.tech):
   ```bash
   turso db create untold
   turso db show untold --url
   turso db tokens create untold
   ```
3. Push schema to Turso:
   ```bash
   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npm run db:push
   ```
4. Import the repository into [Vercel](https://vercel.com).
5. Add Environment Variables in Vercel:
   - `TURSO_DATABASE_URL`: `libsql://untold-youruser.turso.io`
   - `TURSO_AUTH_TOKEN`: `your_turso_auth_token`
6. Deploy! 🚀
