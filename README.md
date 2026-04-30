# CollegeMatcher 🎓

A production-grade college discovery and decision platform — built as part of Track B (College Discovery Platform). Helps students search, compare, and evaluate colleges before making one of the most important decisions of their lives.

**Live Demo → [collegematcher.vercel.app](https://collegematcher.vercel.app)**

---

## Features

**College Listing + Search**
Browse hundreds of colleges with rich cards showing name, location, fees, rating, NAAC grade, and NIRF rank. Filter by location, college type, and fee range. Pagination built in.

**College Detail Page**
Full detail view with tabbed sections — Overview, Courses, Placements, and Reviews. Shows fee breakdown, placement stats (average, highest, placement %), and student reviews.

**Compare Colleges**
Select 2–3 colleges and view a side-by-side comparison table across fees, placement percentage, average package, rating, NAAC grade, and NIRF rank. Designed as a decision tool, not just a UI feature.

**Auth + Saved Items**
JWT-based authentication with credential login and registration. Save colleges to your personal dashboard. Dashboard shows saved colleges with aggregate stats — average fees, average package, best placement rate.

**Q&A Discussion**
Community Q&A tied to specific colleges. Ask questions, answer others, and browse a live feed with contributor stats. No login required to read; login required to post.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Neon |
| ORM | Prisma |
| Auth | NextAuth.js v4 (JWT strategy) |
| Deployment | Vercel |

---

## Getting Started

**Prerequisites:** Node.js 18+, a PostgreSQL database (Neon recommended)

**1. Clone and install**

```bash
git clone https://github.com/YOUR_USERNAME/college-platform.git
cd college-platform
npm install
```

**2. Set up environment variables**

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**3. Push the database schema**

```bash
npx prisma db push
npx prisma generate
```

**4. Seed the database** (if a seed script exists)

```bash
npx prisma db seed
```

**5. Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── colleges/             # College listing + detail APIs
│   │   ├── saved/                # Save/unsave colleges
│   │   ├── compare/              # Compare API
│   │   ├── questions/            # Q&A questions API
│   │   └── answers/              # Q&A answers API
│   ├── colleges/[id]/            # College detail page
│   ├── compare/                  # Compare page
│   ├── dashboard/                # User dashboard
│   ├── qa/                       # Q&A discussion page
│   ├── login/                    # Login page
│   └── register/                 # Registration page
├── components/
│   ├── Navbar.tsx
│   ├── CollegeCard.tsx
│   └── CompareButton.tsx
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── db.ts                     # Prisma client
│   └── utils.ts                  # Formatters and helpers
└── middleware.ts                 # Auth-protected routes
```

---

## Database Schema

Core models: `User`, `College`, `Course`, `Review`, `SavedCollege`, `SavedComparison`, `Question`, `Answer`

All stored in PostgreSQL. Schema managed via Prisma.

---

## Deployment

Deployed on Vercel with Neon PostgreSQL.

Required environment variables on Vercel:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random 32-byte hex string |
| `NEXTAUTH_URL` | Your production URL, e.g. `https://collegematcher.vercel.app` |

After setting env vars, Vercel runs `prisma generate` automatically via the `postinstall` script on every deploy.

---

## API Routes

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/colleges` | List colleges with search + filters | No |
| GET | `/api/colleges/:id` | College detail | No |
| GET/POST/DELETE | `/api/saved` | Manage saved colleges | Yes |
| GET | `/api/compare` | Compare multiple colleges | No |
| GET/POST | `/api/questions` | List / create questions | GET: No, POST: Yes |
| POST | `/api/answers` | Post an answer | Yes |
| POST | `/api/register` | Register a new user | No |

---

## Screenshots

> Add screenshots here after deployment.

---

## Built With

- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [Neon](https://neon.tech)
- [NextAuth.js](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel](https://vercel.com)
