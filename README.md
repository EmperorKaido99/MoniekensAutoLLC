# Dad's Auto Group

Mobile-first PWA for managing auto group quotes, documents, and QR scanning.

## Tech Stack

- **Framework**: Next.js 14 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)

## Getting Started

1. Copy `.env.local` and fill in your Supabase credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
app/                    # Next.js App Router pages and API routes
components/             # Reusable UI components grouped by domain
lib/                    # Supabase clients, PDF helpers, QR utilities, shared utils
types/                  # TypeScript interfaces for quotes, documents, and settings
middleware.ts           # Supabase session refresh on every request
```
