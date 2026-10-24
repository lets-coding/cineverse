# 🎬 CineVerse - Full-Stack Movie Streaming & Discovery Platform

> A production-ready, high-performance OTT movie discovery, adaptive streaming, and authorized download platform with role-based admin dashboard, designed for zero-cost deployment on modern free-tier services.

---

## 🌟 Key Features

### 1. Modern OTT Design & UX
- **Cinematic Dark Theme by Default** (with instant light mode toggle and `localStorage` persistence).
- **Responsive Layouts**: Engineered for mobile smartphones, tablets, laptops, and ultra-wide screens.
- **Hero Banner Showcase**: Large backdrop hero with movie synopsis, ratings, genre pills, Watch Now, and Watchlist actions.
- **Categorized Streaming Rows**: Trending Now, Popular Movies, Top Rated Masterpieces, and Recently Added Releases with smooth scroll controls.
- **Sleek Movie Cards**: Crisp 2:3 aspect ratio posters, rating badges, quality indicators (4K, 1080p, 720p), hover overlays, and instant watchlist toggle.
- **Full-featured Footer**: Compliant with DMCA takedown contact, Copyright Policy, Privacy, and Terms of Service.

### 2. Multi-Facet Search & Dynamic Catalog Filtering
- **Debounced Instant Search**: Search live across title, original title, director, cast members, keywords, and synopsis with dropdown preview suggestions.
- **Regional Industry & Country Categorization**:
  - Hollywood
  - Bollywood
  - South Indian Cinema (Tamil, Telugu, Malayalam, Kannada)
  - Korean Cinema & K-Drama
  - Japanese Cinema & Anime
  - Chinese & Hong Kong Cinema
  - British, French, Spanish, and International Cinema
- **Multi-Factor Filters**:
  - Genre: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, Horror, Mystery, Romance, Sci-Fi, Thriller
  - Content Type: Movie, TV Series, Short Film, Documentary
  - Release Year / Range
  - Minimum Rating filter (⭐ 6+, 7+, 8+, 9+)
  - Video Quality (4K, 1080p, 720p)
  - Sorting: Newest, Most Popular, Highest Rated, Oldest, Alphabetical (A-Z)
- **URL Parameter Synchronization**: Shareable search and filter state via URL queries (e.g. `/browse?genre=sci-fi&industry=hollywood&sort=rating`).

### 3. Professional HTML5 Video Player
- **HLS Adaptive Bitrate Streaming**: Built with `hls.js` for automatic quality adaptation based on client bandwidth.
- **Native MP4 Fallback**: Seamless playback fallback for standard MP4/WebM files.
- **Manual Quality Rendition Selector**: Reads real rendition levels from the HLS manifest (Auto, 1080p, 720p, 480p, 360p) without disrupting playback position.
- **Playback Speed Controller**: 0.25x, 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, and 2x.
- **WebVTT Subtitle Tracks**: Multi-language subtitles support with on-the-fly toggling.
- **Picture-in-Picture (PiP) & Fullscreen Modes**.
- **Keyboard Shortcuts**:
  - `Space` / `K`: Play / Pause
  - `Left Arrow` / `J`: Rewind 10s
  - `Right Arrow` / `L`: Forward 10s
  - `Up Arrow` / `Down Arrow`: Volume adjustment
  - `M`: Mute / Unmute
  - `F`: Toggle Fullscreen
  - `C`: Subtitles On / Off
- **Auto-Hide Controls**: Smooth 3-second inactivity auto-fade.
- **Session Progress Memory**: Resumes playback from previous position synced to database.

### 4. Authorized Download Management
- **Security & Authorization**: Downloads are strictly authorized per movie title.
- **Multi-Resolution Downloads**: Shows resolution (e.g. 1920x1080), file format, file size (e.g. 1.4 GB), and authorized link.
- **Download Metrics**: Automatically tracks download events on the server.
- **Distributor Protection**: Displays publisher disabled message when title is streaming-only.

### 5. Secure Admin Dashboard (`/admin`)
- **Protected RBAC Access**: Server-enforced JWT authentication rejecting unauthorized requests with HTTP 401/403.
- **Executive Analytics**: Real-time counters for Total Movies, Published vs. Drafts, Categories, Registered Users, Total Stream Views, and Total Downloads.
- **Audit Logs**: Records administrative actions (create, edit, delete, publish, feature).
- **CRUD Movie Management**:
  - Add / Edit movies with complete metadata form.
  - Multi-select genres, industries, countries, and audio languages.
  - Cast and director manager with character roles.
  - Video streaming sources and subtitle tracks manager.
  - Download options manager.
  - SEO metadata (custom title & description).
  - Draft mode & Featured movie toggle.
- **Bulk Operations**: Bulk publish, bulk unpublish, and bulk delete.
- **Export Capabilities**: Export entire movie catalog to CSV or JSON with one click.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | Lightning-fast build and reactive user experience |
| **Language** | TypeScript | End-to-end type safety |
| **Styling** | Tailwind CSS v3 | Modern, dark-first responsive component styling |
| **Icons** | Lucide React | Clean, modern iconography |
| **Video Player** | HTML5 + HLS.js | Adaptive bitrate streaming and WebVTT subtitles |
| **Backend** | Node.js + Express | RESTful API server with centralized error handling |
| **Database** | PostgreSQL / SQLite (Prisma ORM) | Relational schema with migrations and relations |
| **Security** | Helmet, CORS, Rate Limit, Bcrypt, JWT | Hardened web security and role-based access |

---

## 🚀 Quick Start Guide (Local Setup)

### Prerequisites
- **Node.js** >= 18 (Tested on Node.js v24)
- **npm** or **pnpm**

### Step 1: Install Dependencies
Open a terminal in the project directory:

```bash
# 1. Install server dependencies
cd server
npm install

# 2. Install client dependencies
cd ../client
npm install
cd ..
```

### Step 2: Database Setup & Seeding
The project comes pre-configured with **SQLite** for instant, zero-configuration local development:

```bash
# Push Prisma schema to local database
cd server
npm run prisma:push

# Seed database with realistic movies, categories, streaming sources, and test users
npm run prisma:seed
cd ..
```

### Step 3: Run the Development Servers
In two separate terminal windows:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Client starts at http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 🔑 Pre-Configured Demo Credentials

For immediate evaluation, the database seed includes pre-configured accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@cineverse.com` | `AdminPassword123!` | Full Admin Panel (`/admin`), Movie CRUD, Bulk Actions, Analytics |
| **Member User** | `user@cineverse.com` | `UserPassword123!` | Public Catalog, Watchlist, Favorites, History, Reviews |

> 💡 **Tip:** On the Sign In page (`/login`), click the **"Demo Admin"** or **"Demo User"** quick-fill button to log in with one click!

---

## 🧪 Running Automated Tests

Run the integration test suite covering authentication, route protection, movie filtering, streaming details, view tracking, and download authorization:

```bash
cd server
npm test
```

Test Results Summary:
```
 ✓ src/__tests__/api.test.ts (11 tests passed)
   - GET /api/health -> healthy
   - POST /api/auth/login -> admin authentication & JWT token
   - POST /api/auth/login -> standard user authentication
   - GET /api/admin/stats -> blocks unauthenticated visitors (401)
   - GET /api/admin/stats -> blocks regular user from admin routes (403)
   - GET /api/admin/stats -> allows admin and returns statistics (200)
   - GET /api/movies -> paginated catalog list
   - GET /api/movies -> combined genre filtering
   - GET /api/movies/slug/:slug -> movie details with video & download sources
   - POST /api/movies/:id/view -> view counter increment
   - POST /api/movies/:id/download/:downloadId -> authorized download link generation
```

---

## 🌐 Production Free-Tier Deployment Guide

CineVerse is architected to run seamlessly on verified **100% free-tier services**:

```
┌─────────────────────────────────────────────────────────────┐
│                       DEPLOYMENT FLOW                       │
│                                                             │
│  [ Vercel / Netlify ]     ──>  React + Vite Frontend (SPA)  │
│           │                                                 │
│           ▼                                                 │
│  [ Render / Railway ]     ──>  Node.js + Express API        │
│           │                                                 │
│           ▼                                                 │
│  [ Neon / Supabase ]      ──>  Free Serverless PostgreSQL   │
│           │                                                 │
│           ▼                                                 │
│  [ Cloudflare R2 / S3 ]   ──>  Videos, HLS & Artwork        │
└─────────────────────────────────────────────────────────────┘
```

### 1. Database: Neon (Free Serverless PostgreSQL)
- **Free Tier Allowance**: 0.5 GiB storage, compute autosuspend, unlimited databases.
- **Setup**:
  1. Go to [neon.tech](https://neon.tech) and create a free account.
  2. Create a project named `cineverse-db`.
  3. Copy your PostgreSQL connection string:
     `postgresql://user:password@ep-sample-123.us-east-2.aws.neon.tech/neondb?sslmode=require`
  4. In your terminal, switch Prisma to PostgreSQL:
     ```bash
     cd server
     npm run db:switch postgresql
     ```
  5. Set your `DATABASE_URL` in `server/.env` and push the schema:
     ```bash
     npm run prisma:generate
     npm run prisma:push
     npm run prisma:seed
     ```

### 2. Backend API: Render (Free Web Service)
- **Free Tier Allowance**: 512 MB RAM, 0.1 CPU, automatic HTTPS, free subdomain `cineverse-api.onrender.com`.
- **Setup**:
  1. Push your repository to GitHub.
  2. Go to [render.com](https://render.com) and click **New Web Service**.
  3. Select your repository and set Root Directory to `server`.
  4. **Build Command**: `npm install && npm run build && npm run prisma:generate`
  5. **Start Command**: `npm start`
  6. **Environment Variables**:
     - `PORT`: `5000`
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: *(Your Neon PostgreSQL connection string)*
     - `JWT_SECRET`: *(Generate a 32+ character random secret string)*
     - `CLIENT_URL`: `https://cineverse.vercel.app` (your frontend URL)

### 3. Frontend: Vercel (Free Static Hosting)
- **Free Tier Allowance**: 100 GB bandwidth/month, global Edge CDN, free SSL, custom domains.
- **Setup**:
  1. Go to [vercel.com](https://vercel.com) and import your repository.
  2. Set Root Directory to `client`.
  3. Framework Preset: **Vite**.
  4. Build Command: `npm run build`
  5. Output Directory: `dist`
  6. In `client/src/api/client.ts`, configure the API base URL to point to your Render backend:
     `const API_BASE = import.meta.env.VITE_API_URL || '/api';`
  7. Add Environment Variable:
     - `VITE_API_URL`: `https://cineverse-api.onrender.com/api`

### 4. Video & Media Hosting: Cloudflare R2
- **Free Tier Allowance**: 10 GB storage, zero egress bandwidth fees.
- Store authorized movie files, HLS manifests (`.m3u8`), segments (`.ts`), and WebVTT subtitles (`.vtt`).
- Paste the public R2 URL into the CineVerse Admin Panel when publishing titles.

---

## 🔒 Security Best Practices Implemented

- **Password Hashing**: Salting and hashing with `bcryptjs` (cost factor 10).
- **Stateless JWT**: Bearer tokens with expiration.
- **Server-Side RBAC**: Admin routes verify authorization headers on every request; unauthorized users receive HTTP 403.
- **Input Validation**: Centralized request schema validation with `zod`.
- **DDoS & Rate Limiting**: Express rate limiter preventing brute-force login attempts and scraper flooding.
- **Security Headers**: `helmet` enforces HTTP headers protecting against clickjacking, XSS, and MIME-sniffing.
- **Sanitized CORS**: Strict origin whitelisting allowing only authorized client domains.

---

## 📄 License & Compliance Notice

CineVerse is provided for authorized streaming and media discovery. Video sample content included in the seed data is sourced from open-source Creative Commons film projects (Blender Foundation, Ian Hubert, Colin Levy). Always ensure proper distribution rights before uploading copyrighted commercial cinema.
