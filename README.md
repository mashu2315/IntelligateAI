# IntelliGate AI

**AI-Enhanced Gateway-as-a-Service Platform**

IntelliGate AI is a smart API gateway that sits between your frontend and backend microservices. It provides a unified entry point for all API requests, with plans for AI-powered features like intelligent caching, adaptive rate limiting, and anomaly detection in future sprints.

---

## Architecture

```
Frontend (:5173)
   |
   v
API Gateway (:5000)
   |
   +---- Product Service (:5001)
   |
   +---- Order Service (:5002)
   |
   +---- MongoDB
   |
   +---- Redis
```

- **Frontend** sends all requests to the API Gateway
- **API Gateway** forwards requests to the appropriate backend service
- **Backend Services** handle business logic and return responses
- **MongoDB** stores persistent data
- **Redis** provides caching (to be implemented in future sprints)

---

## Folder Structure

```
intelligate-ai/
│
├── frontend/                  # React dashboard (Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API call functions
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Root component
│   │   └── main.jsx           # Entry point
│   └── package.json
│
├── gateway/                   # API Gateway service
│   ├── src/
│   │   ├── config/            # DB and Redis connections
│   │   ├── routes/            # Express route definitions
│   │   ├── middleware/        # Custom middleware (future)
│   │   ├── controllers/       # Route controllers (future)
│   │   ├── services/          # Business logic (future)
│   │   ├── models/            # Mongoose models (future)
│   │   ├── gateway/           # Proxy forwarding logic
│   │   ├── app.js             # Express app setup
│   │   └── server.js          # Server entry point
│   └── package.json
│
├── services/
│   ├── product-service/       # Product microservice
│   │   ├── src/
│   │   │   ├── routes/        # Route definitions
│   │   │   ├── controllers/   # Request handlers
│   │   │   ├── models/        # Data models (future)
│   │   │   ├── config/        # Configuration (future)
│   │   │   ├── app.js         # Express app
│   │   │   └── server.js      # Entry point
│   │   └── package.json
│   │
│   └── order-service/         # Order microservice
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── models/
│       │   ├── config/
│       │   ├── app.js
│       │   └── server.js
│       └── package.json
│
├── .env.example               # Environment variable reference
├── .gitignore
└── README.md
```

---

## Technology Stack

| Layer     | Technology            |
| --------- | --------------------- |
| Frontend  | React, Vite, CSS      |
| Gateway   | Node.js, Express, Axios |
| Backend   | Node.js, Express      |
| Database  | MongoDB               |
| Cache     | Redis                 |

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** (cloud instance — e.g., MongoDB Atlas)
- **Redis** (cloud instance — e.g., Redis Cloud)
- **Git**

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd intelligate-ai
```

### 2. Install dependencies

```bash
# Gateway
cd gateway
npm install

# Product Service
cd ../services/product-service
npm install

# Order Service
cd ../order-service
npm install

# Frontend
cd ../../frontend
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` in each service and update with your values:

```bash
# Gateway
cp gateway/.env.example gateway/.env

# Product Service
cp services/product-service/.env.example services/product-service/.env

# Order Service
cp services/order-service/.env.example services/order-service/.env

# Frontend
cp frontend/.env.example frontend/.env
```

---

## Environment Variables

### Gateway (`gateway/.env`)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/intelligate
REDIS_URL=redis://localhost:6379
```

### Product Service (`services/product-service/.env`)

```
PORT=5001
```

### Order Service (`services/order-service/.env`)

```
PORT=5002
```

### Frontend (`frontend/.env`)

```
VITE_GATEWAY_URL=http://localhost:5000
```

---

## How to Start

### 1. Start the Gateway

```bash
cd gateway
npm run dev
```

Gateway runs on **http://localhost:5000**

### 2. Start the Product Service

```bash
cd services/product-service
npm run dev
```

Product Service runs on **http://localhost:5001**

### 3. Start the Order Service

```bash
cd services/order-service
npm run dev
```

Order Service runs on **http://localhost:5002**

### 4. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## Health Endpoints

Test all services are running:

```bash
# Gateway
curl http://localhost:5000/health

# Product Service
curl http://localhost:5001/health

# Order Service
curl http://localhost:5002/health
```

### Sample Responses

**Gateway:**
```json
{
  "success": true,
  "service": "gateway",
  "status": "running"
}
```

**Product Service:**
```json
{
  "success": true,
  "service": "product-service",
  "status": "running"
}
```

**Order Service:**
```json
{
  "success": true,
  "service": "order-service",
  "status": "running"
}
```

---

## Sample Data Endpoints

```bash
# Get products
curl http://localhost:5001/products

# Get orders
curl http://localhost:5002/orders
```

---

## Sprint Status

### ✅ Sprint 1 — Basic Architecture (Current)

- [x] Project structure
- [x] React frontend shell
- [x] API Gateway setup
- [x] Product Service
- [x] Order Service
- [x] MongoDB connection
- [x] Redis connection
- [x] Health check endpoints
- [x] Environment configuration

### 🔲 Sprint 2 — Gateway Proxy & Routing

- API key management
- Request forwarding/proxy
- Route registration
- Basic request logging

### 🔲 Sprint 3 — Rate Limiting & Caching

- Rate limiting middleware
- Response caching with Redis
- Request/response logging

### 🔲 Sprint 4 — Dashboard & Analytics

- Dashboard UI with analytics
- Real-time monitoring
- Usage statistics

### 🔲 Sprint 5 — AI/ML Integration

- Anomaly detection
- Adaptive rate limiting
- Intelligent caching
- Latency prediction

---

## License

This project is part of a final-year academic project.
