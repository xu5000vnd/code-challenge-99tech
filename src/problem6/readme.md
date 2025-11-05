# Top Users Dashboard - System Design

## 1. Requirements

### 1.1. Functional Requirements
- User can see top 10 users on dashboard
- User can add some actions to change top 10 users

### 1.2. Non-Functional Requirements

**Scale Estimation:**
- Total Users: **10M**
- Active Users per day: **5%** → 500k users/day
- Actions per user per day: **5 actions/user/day**

**Traffic Calculation:**
```
10M × 5% × 5 = 2.5M actions/day
              = 104k actions/hour
              = 1,736 actions/minute
              = ~29 actions/second
```

## 2. Core Entities
- **Authentication**
- **User**
- **Analytics**

## 3. API Design

### Endpoints
```
GET  /api/v1/dashboard/top-users    # Retrieve top 10 users
POST /api/v1/users/:id/action       # Record user action
```

## 4. Data Flow
1. **View Dashboard**: User → Open web/mobile → See top 10 users
2. **Perform Action**: User → Open web/mobile → Login → Do action

## 5. High-Level Design

### Frontend
- Web application
- Mobile application

### Backend Services
- **Authentication Service**: Handle user authentication and authorization
- **User Service**: Manage user data and operations
- **Analytics Service**: Process and aggregate user actions

### Infrastructure
- **WebSocket**: Real-time updates for dashboard
- **Load Balancer**: Distribute traffic across services
- **API Gateway**: Single entry point for all API requests
- **Distributed Caching**: Redis for fast data access
- **Database**: Persistent data storage
- **Message Queue**: Asynchronous task processing

## 6. Deep Dive

### Database Strategy
- **Master-Slave Replication**: High availability and read scalability
- **Read/Write Separation**: 
  - Write operations → Master DB
  - Read operations → Slave replicas

### Caching Strategy
- **Redis Cluster**: Distributed caching for horizontal scaling
- **Cache Layer**:
  - Store top 10 users ranking
  - TTL-based cache invalidation
  - Real-time updates via pub/sub

### Scalability Considerations
- Horizontal scaling of backend services
- Database sharding for user data
- CDN for static content delivery
- Rate limiting to prevent abuse

## 7. System Architecture Diagram

![System Design - Top Users Dashboard](./design-system-top-user.png)
