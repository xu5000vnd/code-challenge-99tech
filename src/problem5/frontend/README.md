# Frontend - React + TypeScript + Vite

Modern React frontend application for the Problem 5 authentication system.

## Features

- ✅ **React 18** - Latest React version
- ✅ **TypeScript** - Full type safety
- ✅ **Vite** - Lightning-fast build tool
- ✅ **Tailwind CSS** - Utility-first CSS framework
- ✅ **React Router** - Client-side routing
- ✅ **Zustand** - Lightweight state management
- ✅ **Axios** - HTTP client with interceptors
- ✅ **Automatic Token Refresh** - Seamless authentication
- ✅ **Responsive Design** - Mobile-friendly UI

## Pages

### 1. Login Page (`/login`)
- Email and password authentication
- Error handling
- Loading states
- Link to registration

### 2. Register Page (`/register`)
- User registration form
- Password confirmation
- Validation
- Auto-login after registration

### 3. Dashboard (`/dashboard`)
- Welcome message
- Statistics cards
- User list with search
- Refresh functionality

### 4. Profile Page (`/profile`)
- User information display
- Active sessions management
- Logout from all devices
- Account statistics

## Tech Stack

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "zustand": "^4.4.7",
  "axios": "^1.6.2",
  "tailwindcss": "^3.3.6",
  "vite": "^5.0.8",
  "typescript": "^5.2.2"
}
```

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running on `http://localhost:4000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server

The app will run on `http://localhost:3000`

API requests are proxied to `http://localhost:4000/api`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx           # Main layout with navigation
│   │   └── PrivateRoute.tsx     # Protected route wrapper
│   ├── pages/
│   │   ├── LoginPage.tsx        # Login form
│   │   ├── RegisterPage.tsx     # Registration form
│   │   ├── DashboardPage.tsx    # Main dashboard
│   │   └── ProfilePage.tsx      # User profile
│   ├── services/
│   │   └── api.ts               # API client with interceptors
│   ├── store/
│   │   └── authStore.ts         # Authentication state
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## State Management

Using **Zustand** for simple and efficient state management:

```typescript
const { user, login, logout } = useAuthStore();
```

### Auth Store Features

- User authentication
- Token management
- Auto token refresh
- Logout functionality
- Error handling

## API Integration

### Automatic Token Refresh

The app automatically refreshes expired access tokens using the refresh token:

```typescript
// Axios interceptor handles 401 errors
// Automatically refreshes token and retries request
```

### API Endpoints Used

```typescript
// Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/logout-all
GET  /api/auth/sessions

// Users
GET  /api/users/me
GET  /api/users
GET  /api/users/:id
PUT  /api/users/:id
DELETE /api/users/:id
```

## Styling

### Tailwind CSS

Utility-first CSS framework for rapid UI development:

```tsx
<button className="btn-primary">
  Click me
</button>
```

### Custom Components

Pre-defined component classes in `index.css`:

- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.input-field` - Form input
- `.card` - Card container

## Features in Detail

### 1. Authentication Flow

```
1. User enters credentials
2. App sends request to backend
3. Backend returns access + refresh tokens
4. Tokens stored in localStorage
5. Access token added to all requests
6. Auto-refresh when token expires
```

### 2. Protected Routes

```tsx
<PrivateRoute>
  <DashboardPage />
</PrivateRoute>
```

Automatically redirects to login if not authenticated.

### 3. Session Management

- View all active sessions
- See device info and IP
- Logout from specific or all devices

### 4. User Management

- Search users by name or email
- View user details
- Pagination support

## Environment Variables

Create `.env` file (optional):

```env
VITE_API_URL=http://localhost:3000
```

## Building for Development
```bash
npm run dev
```

## Building for Production

```bash
# Build
npm run build

# Output in dist/
# Serve with any static file server
```
