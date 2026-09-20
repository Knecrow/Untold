# Untold

An anonymous digital corkboard web app built with Next.js, TypeScript, and Drizzle ORM.

It lets people post short, anonymous thoughts, micro-confessions, and small wins on colorful digital sticky notes without needing an account or login.

## What it does
- Post notes anonymously without accounts or tracking
- Color-coded categories for different types of notes (thoughts, confessions, wins)
- Soft neubrutalism visual design with pastel cards and bold borders
- Database persistence using Drizzle ORM and PostgreSQL

## Built with
- Next.js & React (TypeScript)
- Tailwind CSS
- Drizzle ORM
- PostgreSQL

## How to run it locally
1. Clone the repo:
   ```bash
   git clone https://github.com/Knecrow/Untold.git
   cd Untold
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your `.env` file with your database URL:
   ```env
   DATABASE_URL="your-postgresql-url"
   ```

4. Push the schema and start the dev server:
   ```bash
   npx drizzle-kit push
   npm run dev
   ```
   Then open `http://localhost:3000` in your browser.

## License
MIT
