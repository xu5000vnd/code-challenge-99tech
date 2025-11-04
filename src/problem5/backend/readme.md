# Problem 5 - ExpressJS CRUD API with TypeScript & TypeORM

A clean, modular ExpressJS backend application with TypeScript, TypeORM, PostgreSQL, and JWT authentication.

> 📚 **New to this project?** Start with **[QUICK_START.md](QUICK_START.md)** or see **[INDEX.md](INDEX.md)** for all documentation.

## Features

- ✅ **TypeORM Integration**: Full ORM support with decorators and migrations
- ✅ **Base Architecture**: Reusable base classes for Entity, Repository, Service, and Controller
- ✅ **Modular Structure**: Organized by feature modules (User module included)
- ✅ **JWT Authentication**: Secure token-based authentication with middleware
- ✅ **PostgreSQL Database**: Robust database operations with TypeORM
- ✅ **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- ✅ **Validation**: Class-validator for DTO validation
- ✅ **TypeScript**: Full type safety throughout the application
- ✅ **Docker Support**: Containerized deployment with Docker Compose
- ✅ **Security**: Helmet, CORS, rate limiting, and input validation

## Project Structure

```
src/
├── base/                    # Base classes and interfaces
│   ├── entities/           # BaseEntity with common fields
│   ├── repositories/       # IBaseRepository & BaseRepository
│   ├── services/           # IBaseService & BaseService
│   └── controllers/        # BaseController with CRUD operations
├── modules/                # Feature modules
│   └── user/              # User module
│       ├── entities/      # User entity
│       ├── repositories/  # UserRepository
│       ├── services/      # UserService
│       ├── controllers/   # UserController
│       ├── dto/          # Data Transfer Objects
│       └── routes/       # User routes
├── config/                # Configuration files
│   └── database.ts       # TypeORM DataSource configuration
├── middleware/           # Express middleware
├── utils/               # Utility functions
└── index.ts            # Application entry point
```

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or Docker)
- Docker & Docker Compose (for containerized deployment)

## Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd src/problem5
   ```

2. **Create environment file:**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration.

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Check health:**
   ```bash
   curl http://localhost:3000/health
   ```

### Option 2: Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL:**
   - Install PostgreSQL locally
   - Create database: `problem5_db`
   - Update `.env` with your database credentials

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (revoke refresh token)
- `POST /api/auth/logout-all` - Logout from all devices (protected)
- `GET /api/auth/sessions` - Get active sessions (protected)

> 📖 **Detailed Auth Documentation**: See [AUTH_MODULE.md](AUTH_MODULE.md)

### Users (`/api/users`) - All routes require authentication
- `GET /api/users/me` - Get current user profile
- `GET /api/users` - List users with filters
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Health Check
- `GET /health` - Application health status

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response includes both `accessToken` and `refreshToken`:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "user": { ... }
}
```

### Refresh Access Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Get Users (Authenticated)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Environment Variables

Copy `env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | problem5_db |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | password |
| `JWT_SECRET` | JWT signing secret | your-secret-key |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiration | 15m |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | 7d |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |

## Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Clean up
docker-compose down -v
```

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Base Architecture

### BaseEntity
All entities extend from `BaseEntity` which provides:
- `id`: UUID primary key
- `createdAt`: Automatic timestamp
- `updatedAt`: Automatic timestamp

### BaseRepository
Generic repository with common CRUD operations:
- `create(data)`: Create new entity
- `findById(id)`: Find by ID
- `findOne(where)`: Find single entity
- `findAll(options)`: Find multiple entities
- `update(id, data)`: Update entity
- `delete(id)`: Delete entity
- `count(where)`: Count entities

### BaseService
Generic service layer:
- `create(dto)`: Business logic for creation
- `findById(id)`: Find by ID
- `findAll(filters)`: Find with filters
- `update(id, dto)`: Update logic
- `delete(id)`: Delete logic

### BaseController
Generic controller with HTTP handlers:
- `create(req, res)`: POST handler
- `findById(req, res)`: GET by ID handler
- `findAll(req, res)`: GET list handler
- `update(req, res)`: PUT handler
- `delete(req, res)`: DELETE handler

## Creating New Modules

To create a new module, follow the User module pattern:

1. **Create Entity** (extends BaseEntity)
```typescript
@Entity('table_name')
export class YourEntity extends BaseEntity {
  @Column()
  field: string;
}
```

2. **Create Repository** (extends BaseRepository)
```typescript
export class YourRepository extends BaseRepository<YourEntity> {
  constructor() {
    super(AppDataSource.getRepository(YourEntity));
  }
}
```

3. **Create Service** (extends BaseService)
```typescript
export class YourService extends BaseService<YourEntity, CreateDto, UpdateDto> {
  constructor() {
    super(new YourRepository());
  }
}
```

4. **Create Controller** (extends BaseController)
```typescript
export class YourController extends BaseController<YourEntity, CreateDto, UpdateDto> {
  constructor() {
    super(new YourService());
  }
}
```

## Database Schema

TypeORM automatically creates tables based on entities. The User table structure:

```typescript
@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ name: 'password_hash' })
  password: string;
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse with express-rate-limit
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Input Validation**: Basic validation in controllers

## License

ISC
