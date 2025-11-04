# Architecture Diagrams

## 1. Project Structure Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Problem5 Application                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    BASE LAYER                          │  │
│  │  (Reusable Abstractions for All Modules)              │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  BaseEntity  │  IBaseRepository  │  IBaseService      │  │
│  │  (id, dates) │  BaseRepository   │  BaseService       │  │
│  │              │  (CRUD ops)       │  (Business logic)  │  │
│  │              │  BaseController   │                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ▲                                   │
│                           │ extends                           │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │                   MODULE LAYER                         │  │
│  │  (Feature-Specific Implementations)                    │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │           USER MODULE                            │  │  │
│  │  ├──────────────────────────────────────────────────┤  │  │
│  │  │  User Entity  │  UserRepository  │  UserService  │  │  │
│  │  │  (extends     │  (extends Base)  │  (extends    │  │  │
│  │  │   Base)       │                  │   Base)      │  │  │
│  │  │               │  UserController  │              │  │  │
│  │  │               │  (extends Base)  │              │  │  │
│  │  │               │  UserRoutes      │              │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │      FUTURE MODULE (e.g., Product)              │  │  │
│  │  │  Same structure as User Module                  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 INFRASTRUCTURE LAYER                   │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  Config    │  Middleware  │  Utils                    │  │
│  │  (Database)│  (Auth)      │  (JWT, Helpers)           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 2. Request Flow Diagram

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ HTTP Request
     ▼
┌─────────────────────────────────────────────────────────┐
│                    Express Server                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. ┌──────────────┐                                    │
│     │   Routing    │  Match route to controller         │
│     └──────┬───────┘                                    │
│            │                                             │
│  2. ┌──────▼───────┐                                    │
│     │  Middleware  │  JWT Authentication (if protected) │
│     └──────┬───────┘                                    │
│            │                                             │
│  3. ┌──────▼───────────┐                                │
│     │   Controller     │  Parse request, validate       │
│     │  (HTTP Layer)    │  Call service method           │
│     └──────┬───────────┘                                │
│            │                                             │
│  4. ┌──────▼───────────┐                                │
│     │     Service      │  Business logic                │
│     │ (Business Layer) │  Validation, transformation    │
│     └──────┬───────────┘                                │
│            │                                             │
│  5. ┌──────▼───────────┐                                │
│     │   Repository     │  Data access operations        │
│     │  (Data Layer)    │  Query building                │
│     └──────┬───────────┘                                │
│            │                                             │
└────────────┼─────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                       TypeORM                            │
├─────────────────────────────────────────────────────────┤
│  Query Builder │ Entity Manager │ Connection Pool       │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                    │
└─────────────────────────────────────────────────────────┘
```

## 3. Module Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      USER MODULE                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │              ROUTES (userRoutes.ts)              │   │
│  │  POST   /register                                │   │
│  │  POST   /login                                   │   │
│  │  GET    /me          [protected]                 │   │
│  │  GET    /:id         [protected]                 │   │
│  │  GET    /            [protected]                 │   │
│  │  PUT    /:id         [protected]                 │   │
│  │  DELETE /:id         [protected]                 │   │
│  └────────────────┬────────────────────────────────┘   │
│                   │                                      │
│  ┌────────────────▼────────────────────────────────┐   │
│  │         CONTROLLER (UserController.ts)          │   │
│  │  • create()        → Register user               │   │
│  │  • login()         → Authenticate user           │   │
│  │  • getCurrentUser()→ Get logged-in user          │   │
│  │  • findById()      → Get user by ID              │   │
│  │  • findAll()       → List users with filters     │   │
│  │  • update()        → Update user                 │   │
│  │  • delete()        → Delete user                 │   │
│  └────────────────┬────────────────────────────────┘   │
│                   │                                      │
│  ┌────────────────▼────────────────────────────────┐   │
│  │           SERVICE (UserService.ts)              │   │
│  │  • create()        → Hash password, create user  │   │
│  │  • authenticate()  → Verify credentials, gen JWT │   │
│  │  • findById()      → Get user                    │   │
│  │  • findAll()       → Apply filters, get list     │   │
│  │  • update()        → Validate, update user       │   │
│  │  • delete()        → Delete user                 │   │
│  └────────────────┬────────────────────────────────┘   │
│                   │                                      │
│  ┌────────────────▼────────────────────────────────┐   │
│  │        REPOSITORY (UserRepository.ts)           │   │
│  │  • create()          → INSERT query              │   │
│  │  • findById()        → SELECT by ID              │   │
│  │  • findByEmail()     → SELECT by email           │   │
│  │  • findWithFilters() → SELECT with WHERE         │   │
│  │  • update()          → UPDATE query              │   │
│  │  • delete()          → DELETE query              │   │
│  │  • count()           → COUNT query               │   │
│  └────────────────┬────────────────────────────────┘   │
│                   │                                      │
│  ┌────────────────▼────────────────────────────────┐   │
│  │            ENTITY (User.ts)                     │   │
│  │  @Entity('users')                                │   │
│  │  • id: UUID                                      │   │
│  │  • email: string (unique)                        │   │
│  │  • name: string                                  │   │
│  │  • password: string (hashed)                     │   │
│  │  • createdAt: Date                               │   │
│  │  • updatedAt: Date                               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │                 DTOs (dto/)                       │   │
│  │  • CreateUserDto   → Validation for registration │   │
│  │  • UpdateUserDto   → Validation for updates      │   │
│  │  • LoginUserDto    → Validation for login        │   │
│  │  • UserFilterDto   → Validation for filters      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 4. Authentication Flow Diagram

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ 1. POST /api/users/register
     │    { email, name, password }
     ▼
┌─────────────────┐
│  UserController │
└────┬────────────┘
     │ 2. Validate DTO
     ▼
┌─────────────────┐
│   UserService   │
└────┬────────────┘
     │ 3. Hash password
     │ 4. Create user
     ▼
┌─────────────────┐
│  UserRepository │
└────┬────────────┘
     │ 5. INSERT INTO users
     ▼
┌─────────────────┐
│   PostgreSQL    │
└────┬────────────┘
     │ 6. Return user
     ▼
┌─────────────────┐
│     Client      │  Response: { id, email, name, ... }
└─────────────────┘

     │
     │ 7. POST /api/users/login
     │    { email, password }
     ▼
┌─────────────────┐
│  UserController │
└────┬────────────┘
     │ 8. Validate DTO
     ▼
┌─────────────────┐
│   UserService   │
└────┬────────────┘
     │ 9. Find user by email
     │ 10. Compare password
     │ 11. Generate JWT token
     ▼
┌─────────────────┐
│     Client      │  Response: { token, user }
└────┬────────────┘
     │
     │ 12. GET /api/users/me
     │     Authorization: Bearer <token>
     ▼
┌─────────────────┐
│   Middleware    │
└────┬────────────┘
     │ 13. Extract token
     │ 14. Verify token
     │ 15. Decode user info
     ▼
┌─────────────────┐
│  UserController │
└────┬────────────┘
     │ 16. Get user from token
     ▼
┌─────────────────┐
│   UserService   │
└────┬────────────┘
     │ 17. Find user by ID
     ▼
┌─────────────────┐
│     Client      │  Response: { id, email, name, ... }
└─────────────────┘
```

## 5. Database Schema Diagram

```
┌────────────────────────────────────────────┐
│              users table                    │
├────────────────────────────────────────────┤
│  id              UUID         PRIMARY KEY   │
│  email           VARCHAR(255) UNIQUE        │
│  name            VARCHAR(255)               │
│  password_hash   VARCHAR(255)               │
│  password_salt   VARCHAR(255)               │
│  created_at      TIMESTAMP                  │
│  updated_at      TIMESTAMP                  │
└────────────────────────────────────────────┘
         │
         │ Indexes:
         ├─ PRIMARY KEY (id)
         ├─ UNIQUE INDEX (email)
         └─ INDEX (name)

Future tables can be added:
┌────────────────────────────────────────────┐
│            products table                   │
├────────────────────────────────────────────┤
│  id              UUID         PRIMARY KEY   │
│  name            VARCHAR(255)               │
│  description     TEXT                       │
│  price           DECIMAL                    │
│  created_at      TIMESTAMP                  │
│  updated_at      TIMESTAMP                  │
└────────────────────────────────────────────┘
```

## 6. Docker Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────┐  ┌────────────────────────┐ │
│  │      App Container     │  │     DB Container       │ │
│  │  (Node.js + Express)   │  │    (PostgreSQL 15)     │ │
│  ├────────────────────────┤  ├────────────────────────┤ │
│  │  Port: 3000            │  │  Port: 5432            │ │
│  │  Image: Built from     │  │  Image: postgres:15    │ │
│  │         Dockerfile     │  │         -alpine        │ │
│  │                        │  │                        │ │
│  │  Health Check:         │  │  Health Check:         │ │
│  │  GET /health           │  │  pg_isready            │ │
│  │                        │  │                        │ │
│  │  Depends on: db        │  │  Volume:               │ │
│  │                        │  │  postgres_data         │ │
│  └────────┬───────────────┘  └────────┬───────────────┘ │
│           │                           │                  │
│           └───────────┬───────────────┘                  │
│                       │                                  │
│                       ▼                                  │
│              ┌─────────────────┐                        │
│              │  problem5-network│                        │
│              │  (Bridge Network)│                        │
│              └─────────────────┘                        │
│                                                           │
└─────────────────────────────────────────────────────────┘
         │
         │ Exposed Ports
         ▼
┌─────────────────────────────────────────────────────────┐
│                      Host Machine                        │
│  localhost:3000  → App                                   │
│  localhost:5432  → PostgreSQL                            │
└─────────────────────────────────────────────────────────┘
```

## 7. Class Hierarchy Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    BASE CLASSES                          │
└─────────────────────────────────────────────────────────┘

TypeORM BaseEntity
       ▲
       │ extends
       │
┌──────┴────────┐
│  BaseEntity   │  (id, createdAt, updatedAt)
└──────┬────────┘
       │ extends
       ▼
┌──────────────┐
│     User     │  (email, name, password)
└──────────────┘


┌─────────────────────┐
│  IBaseRepository<T> │  (interface)
└──────┬──────────────┘
       │ implements
       ▼
┌─────────────────────┐
│  BaseRepository<T>  │  (generic implementation)
└──────┬──────────────┘
       │ extends
       ▼
┌─────────────────────┐
│  UserRepository     │  (User-specific methods)
└─────────────────────┘


┌─────────────────────────┐
│  IBaseService<T,C,U>    │  (interface)
└──────┬──────────────────┘
       │ implements
       ▼
┌─────────────────────────┐
│  BaseService<T,C,U>     │  (generic implementation)
└──────┬──────────────────┘
       │ extends
       ▼
┌─────────────────────────┐
│  UserService            │  (User-specific logic)
└─────────────────────────┘


┌─────────────────────────┐
│  BaseController<T,C,U>  │  (generic HTTP handlers)
└──────┬──────────────────┘
       │ extends
       ▼
┌─────────────────────────┐
│  UserController         │  (User-specific endpoints)
└─────────────────────────┘
```

## 8. Data Transformation Flow

```
Client Request (JSON)
       │
       ▼
┌──────────────────┐
│   CreateUserDto  │  Validation with class-validator
└────────┬─────────┘
         │ transform
         ▼
┌──────────────────┐
│  Service Layer   │  Business logic, password hashing
└────────┬─────────┘
         │ transform
         ▼
┌──────────────────┐
│  User Entity     │  TypeORM entity
└────────┬─────────┘
         │ save
         ▼
┌──────────────────┐
│   Database Row   │  PostgreSQL record
└────────┬─────────┘
         │ fetch
         ▼
┌──────────────────┐
│  User Entity     │  TypeORM entity
└────────┬─────────┘
         │ toResponse()
         ▼
┌──────────────────┐
│  Response DTO    │  Without password
└────────┬─────────┘
         │
         ▼
Client Response (JSON)
```
