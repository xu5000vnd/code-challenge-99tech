# Docker Quick Start Guide

## 🐳 Fixed Issues

### Problem
The backend was trying to connect to `localhost:5432` instead of the Docker service name `db:5432`, causing `ECONNREFUSED` errors.

### Solution
- Updated `docker-compose.yml` to use environment variables instead of `.env` file
- Set `DB_HOST=db` (Docker service name)
- Updated backend port to `4000` consistently
- Fixed nginx proxy to point to `backend:4000`

## 🚀 Quick Start

### 1. Start All Services
```bash
cd src/problem5
docker-compose up --build
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Database**: localhost:5432

### 3. Stop Services
```bash
docker-compose down
```

### 4. Clean Everything (including database)
```bash
docker-compose down -v
```

## 📋 Environment Variables

### Docker (Automatic)
The `docker-compose.yml` now sets all environment variables automatically:

```yaml
environment:
  DB_HOST: db              # ← Docker service name
  DB_PORT: 5432
  DB_NAME: db
  DB_USER: postgres
  DB_PASSWORD: postgres
  JWT_SECRET: your-super-secret-jwt-key-change-in-production
  JWT_ACCESS_EXPIRES_IN: 1h
  JWT_REFRESH_EXPIRES_IN: 7d
  PORT: 4000
  NODE_ENV: production
```

### Local Development
For running outside Docker, create `backend/.env`:

```env
DB_HOST=localhost        # ← localhost for local dev
DB_PORT=5432
DB_NAME=problem5_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
```

## 🔍 Verify Services

### Check Service Health
```bash
# Check all services
docker-compose ps

# Check backend logs
docker-compose logs backend

# Check frontend logs
docker-compose logs frontend

# Check database logs
docker-compose logs db
```

### Expected Output
```
NAME       IMAGE              STATUS         PORTS
backend    problem5-backend   Up (healthy)   0.0.0.0:4000->4000/tcp
frontend   problem5-frontend  Up (healthy)   0.0.0.0:3000->80/tcp
db         postgres:15-alpine Up (healthy)   0.0.0.0:5432->5432/tcp
```

## 🧪 Test the API

### Health Check
```bash
curl http://localhost:4000/health
```

### Register a User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🐛 Troubleshooting

### Backend Can't Connect to Database

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
Make sure `DB_HOST=db` in docker-compose.yml (not `localhost`)

### Port Already in Use

**Error:**
```
Error: bind: address already in use
```

**Solution:**
```bash
# Stop conflicting services
docker-compose down

# Or change ports in docker-compose.yml
ports:
  - "4001:4000"  # Use different host port
```

### Database Not Ready

**Error:**
```
Error: connect ECONNREFUSED
```

**Solution:**
Wait for database health check to pass:
```bash
docker-compose up -d db
# Wait 10 seconds
docker-compose up backend frontend
```

### Frontend Can't Reach Backend

**Error:**
```
Network Error
```

**Solution:**
Check nginx.conf has correct backend URL:
```nginx
location /api {
    proxy_pass http://backend:4000;  # ← Must match backend service name and port
}
```

## 📦 Service Details

### Backend
- **Container**: `backend`
- **Port**: 4000
- **Health Check**: `curl -f http://localhost:4000/health`
- **Depends On**: Database (healthy)

### Frontend
- **Container**: `frontend`
- **Port**: 3000 (mapped to 80 inside container)
- **Server**: Nginx
- **API Proxy**: `/api` → `http://backend:4000`

### Database
- **Container**: `db`
- **Image**: `postgres:15-alpine`
- **Port**: 5432
- **Data**: Persisted in `postgres_data` volume
- **Init Script**: `backend/init.sql`

## 🔄 Development Workflow

### 1. Make Code Changes
Edit files in `backend/` or `frontend/`

### 2. Rebuild and Restart
```bash
# Rebuild specific service
docker-compose up --build backend

# Or rebuild all
docker-compose up --build
```

### 3. View Logs
```bash
# Follow logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### 4. Execute Commands in Container
```bash
# Backend shell
docker-compose exec backend sh

# Database shell
docker-compose exec db psql -U postgres -d db
```

## 🗑️ Clean Up

### Remove Containers
```bash
docker-compose down
```

### Remove Containers + Volumes (Database Data)
```bash
docker-compose down -v
```

### Remove Everything + Images
```bash
docker-compose down -v --rmi all
```

## 🎯 Production Deployment

### Important Changes for Production:

1. **Change JWT Secret**
   ```yaml
   JWT_SECRET: use-a-strong-random-secret-here
   ```

2. **Use Strong Database Password**
   ```yaml
   POSTGRES_PASSWORD: use-strong-password-here
   DB_PASSWORD: use-strong-password-here
   ```

3. **Enable HTTPS**
   - Add SSL certificates
   - Update nginx configuration
   - Use reverse proxy (Traefik, Nginx)

4. **Set NODE_ENV**
   ```yaml
   NODE_ENV: production
   ```

5. **Add Resource Limits**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
   ```

## ✅ Success Indicators

When everything is working:

1. ✅ All 3 containers show "Up (healthy)"
2. ✅ Backend logs show "Server is running on port 4000"
3. ✅ Frontend accessible at http://localhost:3000
4. ✅ Can register and login users
5. ✅ Database persists data after restart

## 📚 Additional Resources

- **Backend API Docs**: `backend/readme.md`
- **Frontend Docs**: `frontend/README.md`
- **Docker Compose Docs**: https://docs.docker.com/compose/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

