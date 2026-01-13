# Career Launch AI - Complete Authentication Setup Guide

## ✅ What's Been Implemented

### Frontend (Vite + React)
1. ✅ JWT-based authentication service
2. ✅ React Auth Context with hooks
3. ✅ Protected Routes
4. ✅ Login/Register pages
5. ✅ MongoDB service integration

### Backend (Express + MongoDB)
1. ✅ Complete Express server
2. ✅ JWT token generation & validation
3. ✅ MongoDB User & Roadmap models
4. ✅ Authentication middleware
5. ✅ User isolation (data access control)

---

## 🚀 Setup Instructions

### Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/career-launch-ai
   ```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/` folder:
```env
PORT=3001
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/career-launch-ai
JWT_SECRET=CareerLaunchAI_2026_SuperSecure_JWTSecret_ChangeInProduction_xyz123
JWT_EXPIRES_IN=7d
```

Start backend server:
```bash
npm run dev
```

Server will run on `http://localhost:3001`

### Step 3: Frontend Setup

Update `.env` in root folder:
```env
VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/career-launch-ai
VITE_API_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

Start frontend:
```bash
npm run dev
```

Frontend runs on `http://localhost:8080`

---

## 🔐 How Authentication Works

### Registration Flow

1. User visits `/signup`
2. Enters name, email, password
3. Frontend → `POST /api/auth/register`
4. Backend:
   - Hashes password with bcrypt
   - Creates user in MongoDB
   - Generates JWT token (valid for 7 days)
5. Frontend:
   - Stores token in localStorage
   - Redirects to `/assessment`

### Login Flow

1. User visits `/login`
2. Enters email, password
3. Frontend → `POST /api/auth/login`
4. Backend:
   - Finds user by email
   - Compares password hash
   - Generates JWT token
5. Frontend:
   - Stores token in localStorage
   - Redirects to `/dashboard`

### Protected Route Access

1. User tries to visit `/dashboard`, `/roadmap/:id`, or `/topic/:id`
2. `ProtectedRoute` component checks:
   - Is token present?
   - Is token expired?
3. If NO → Redirect to `/login`
4. If YES → Render protected page

### API Request Authorization

Every protected API call includes:
```javascript
headers: {
  Authorization: `Bearer ${token}`
}
```

Backend middleware:
1. Extracts token from header
2. Verifies JWT signature
3. Extracts `userId` from token payload
4. Attaches `req.userId` for route handlers

---

## 🔒 Data Isolation

### Roadmap Access Control

**Code Location:** `backend/routes/roadmap.js`

```javascript
// User can only access roadmaps for their selected career
const user = await User.findById(req.userId);

if (user.selectedCareer.careerId !== careerId) {
  return res.status(403).json({ message: 'Access denied' });
}
```

**What this means:**
- User A selects "Backend Developer" career
- User A can ONLY access backend-developer roadmap
- User A CANNOT access UI/UX designer roadmap

### User Progress Isolation

All progress updates are tied to `req.userId`:

```javascript
router.post('/progress', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId); // Authenticated user only
  // Update this user's progress
});
```

---

## 📁 File Structure

```
career-compass-ai-607/
├── backend/                      # Express.js API server
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Roadmap.js           # Roadmap schema
│   ├── routes/
│   │   ├── auth.js              # Register, Login
│   │   ├── user.js              # Profile, Assessment, Progress
│   │   └── roadmap.js           # Get/Create roadmaps
│   ├── middleware/
│   │   └── auth.js              # JWT verification
│   ├── server.js                # Express app
│   ├── package.json
│   └── .env                     # Backend environment variables
│
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx      # Auth state management
│   ├── services/
│   │   ├── authService.ts       # API calls for auth
│   │   └── mongoService.ts      # MongoDB client (optional)
│   ├── components/
│   │   └── auth/
│   │       └── ProtectedRoute.tsx
│   └── pages/
│       └── Login.tsx            # Login/Signup page
│
└── .env                          # Frontend environment variables
```

---

## 🎯 User Journey

### 1. New User Registration
```
Visit Landing Page → Click "Get Started" → Redirected to /signup
→ Register → Auto-login → Redirected to /assessment
→ Complete assessment → Select career → Save to MongoDB
→ Roadmap generated → User can access their roadmap
```

### 2. Returning User Login
```
Visit /login → Enter credentials → Verify JWT → Redirect to /dashboard
→ View progress → Access only their roadmap → Continue learning
```

### 3. Assessment & Career Selection

After registration:
```javascript
POST /api/user/assessment
Body: {
  selectedCareer: {
    careerId: "backend-developer",
    careerName: "Backend Developer",
    domain: "technology",
    fitScore: 92
  },
  assessmentResults: {
    interestScore: 95,
    aptitudeScore: 90,
    marketAlignment: 88
  }
}
```

This saves to user document → Used for roadmap access control

---

## 🛡️ Security Features

### 1. Password Hashing
- Uses `bcryptjs` with salt rounds = 10
- Passwords never stored in plain text

### 2. JWT Token Security
- Signed with secret key
- Includes expiration time (7 days)
- Stored in localStorage (client-side)

### 3. Middleware Protection
- All sensitive routes require valid JWT
- Token verified on EVERY request
- Expired tokens rejected

### 4. Data Isolation
- Users can only access their own data
- Roadmap access tied to career selection
- Progress updates scoped to authenticated user

---

## 🧪 Testing

### Test Registration
```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Test Login
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Test Protected Route
```bash
GET http://localhost:3001/api/user/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📝 Next Steps

1. ✅ Start backend server
2. ✅ Test registration
3. ✅ Test login
4. ✅ Complete career assessment
5. ✅ View personalized roadmap
6. ✅ Track progress

---

## 🔧 Troubleshooting

### "MongoDB connection error"
- Check `MONGODB_URI` in backend `.env`
- Verify MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0`)

### "CORS Error"
- Backend uses `cors()` middleware
- Allows all origins in development

### "Token expired"
- User needs to login again
- Increase `JWT_EXPIRES_IN` in backend `.env`

### "Access denied" for roadmap
- User must complete career assessment first
- Backend checks `user.selectedCareer.careerId`

---

**Status:** Complete JWT authentication system with data isolation ready! 🚀
