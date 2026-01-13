# Career Launch AI - Backend API Server

Simple Express.js backend with JWT authentication and MongoDB.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```env
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/career-launch-ai
JWT_SECRET=CareerLaunchAI_2026_SuperSecure_JWTSecret_ChangeInProduction_xyz123
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Start server:
```bash
npm run dev
```

Server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update user profile (protected)
- `POST /api/user/assessment` - Save career assessment (protected)
- `POST /api/user/progress` - Update topic progress (protected)

### Roadmap
- `GET /api/roadmap/:careerId` - Get or create roadmap (protected)
