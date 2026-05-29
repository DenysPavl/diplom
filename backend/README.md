# Movie App Backend

Node.js Express backend for the movie application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/movie_app
JWT_SECRET=your_secret_key_change_this
PORT=8001
NODE_ENV=development
```

3. Make sure MongoDB is running on `localhost:27017`

4. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Project Structure

```
backend/
├── models/           # MongoDB schemas (User, Comment, Role)
├── controllers/      # Request handlers
├── services/         # Business logic
├── routers/          # API routes
├── middleware/       # Auth middleware
├── server.js         # Main entry point
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/registration` - Register new user

### User
- `GET /api/user/profile` - Get user profile
- `GET /api/user/status/:movieId` - Get movie status (favorite, watched, planned)
- `POST /api/user/favorite` - Add to favorites
- `DELETE /api/user/favorite` - Remove from favorites
- `POST /api/user/watched` - Add to watched
- `DELETE /api/user/watched` - Remove from watched
- `POST /api/user/planned` - Add to planned
- `DELETE /api/user/planned` - Remove from planned

### Comments
- `POST /api/comment` - Add comment
- `GET /api/comment/movie/:movieId` - Get comments for movie
- `DELETE /api/comment/:commentId` - Delete comment

### Categories
- `GET /api/category/all` - Get all categories
- `POST /api/category/create` - Create category
- `DELETE /api/category/:id` - Delete category
