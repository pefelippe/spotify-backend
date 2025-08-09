# Spotify Auth Backend

Backend service for Spotify authentication built with TypeScript and Express.js.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Spotify Developer Account

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Configure your Spotify credentials in `.env.local`:

   ```env
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3001/auth/callback
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

## 📊 API Endpoints

### Authentication

- `GET /auth/login` - Initiate Spotify OAuth flow
- `GET /auth/callback` - Handle OAuth callback
- `POST /auth/refresh` - Refresh access token

### Health Check

- `GET /health` - Application health status
