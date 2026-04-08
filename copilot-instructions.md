---
description: "Workspace instructions for the Shopping Online monorepo e-commerce project. Use when: working with the backend API, React admin/customer frontends, database models, or component patterns."
---

# Shopping Online Project Instructions

**Project Type:** Full-stack JavaScript monorepo (Node.js + React)  
**Structure:** Three packages: `server/`, `client-admin/`, `client-customer/`

---

## Quick Start Commands

### From Project Root

```bash
# Install and build everything (builds both clients, starts server)
npm run build && cd server && npm start

# Development: Run server separately (listens on port 3000)
cd server && npm start

# Development: In separate terminal, start each client
cd client-admin && npm start  # Runs on http://localhost:3000/admin (proxies to :3000)
cd client-customer && npm start  # Runs on http://localhost:3000/ (proxies to :3000)

# Testing
cd client-admin && npm test
cd client-customer && npm test
```

**Note:** Both React apps proxy API requests to `http://localhost:3000`. The server must be running before starting clients.

---

## Architecture Overview

### Backend (Node.js/Express - Port 3000)

**Purpose:** RESTful API serving both admin and customer interfaces  
**Key Structure:**

```
server/
├── index.js                 # Entry point: Express app setup, routes, static serving
├── api/
│   ├── admin.js             # Admin-specific endpoints
│   └── customer.js          # Customer-specific endpoints
├── models/
│   ├── Models.js            # Mongoose schema definitions
│   ├── AdminDAO.js          # Admin data access layer
│   ├── CustomerDAO.js       # Customer data access layer
│   ├── CategoryDAO.js       # Category data access layer
│   ├── ProductDAO.js        # Product data access layer
│   └── OrderDAO.js          # Order data access layer
└── utils/
    ├── CryptoUtil.js        # Encryption/hashing utilities
    ├── JwtUtil.js           # JWT token generation and verification
    ├── EmailUtil.js         # Email sending (nodemailer)
    ├── MongooseUtil.js      # MongoDB connection setup
    └── MyConstants.js       # App-wide constants (ports, salt, etc.)
```

**Route Namespacing:**
- Admin routes: `/api/admin/*`
- Customer routes: `/api/customer/*`
- Health check: `GET /hello`

**Key Dependencies:**
- `express` (4.18.2): Web framework
- `mongoose` (7.5.3): MongoDB ODM
- `jsonwebtoken` (9.0.2): JWT auth
- `nodemailer` (6.9.5): Email delivery
- `body-parser` (1.20.2): Request parsing

### Frontend: Admin (`client-admin/`)

**Purpose:** Admin dashboard for managing products, categories, orders, customers  
**Key Structure:**

```
client-admin/
├── src/
│   ├── App.js               # Main app component, routing logic
│   ├── App.css              # Global styles
│   ├── index.js             # Entry point
│   ├── components/
│   │   ├── MenuComponent.js         # Navigation
│   │   ├── LoginComponent.js        # Auth
│   │   ├── HomeComponent.js         # Dashboard
│   │   ├── CategoryComponent.js     # List categories
│   │   ├── CategoryDetailComponent.js  # Edit category
│   │   ├── ProductComponent.js      # List products
│   │   ├── ProductDetailComponent.js   # Edit product
│   │   ├── CustomerComponent.js     # Manage customers
│   │   └── OrderComponent.js        # View orders
│   └── contexts/
│       ├── MyProvider.js        # Context provider wrapper
│       └── MyContext.js         # Shared React Context (auth state, etc.)
├── public/
│   └── index.html           # HTML entry point (`homepage: "/admin"`)
└── package.json
```

**Served at:** `http://localhost:3000/admin` (via proxying and static serving)

### Frontend: Customer (`client-customer/`)

**Purpose:** E-commerce storefront for browsing products and placing orders  
**Key Structure:**

```
client-customer/
├── src/
│   ├── App.js               # Main app component, routing logic
│   ├── App.css              # Global styles
│   ├── index.js             # Entry point
│   ├── components/
│   │   ├── MenuComponent.js         # Navigation with cart badge
│   │   ├── LoginComponent.js        # Auth
│   │   ├── SignupComponent.js       # Registration
│   │   ├── HomeComponent.js         # Product listing
│   │   ├── ProductDetailComponent.js   # Product view with add-to-cart
│   │   ├── MycartComponent.js       # Shopping cart
│   │   ├── MyordersComponent.js     # Order history
│   │   ├── MyprofileComponent.js    # User profile
│   │   ├── ActiveComponent.js       # Utility component
│   │   └── InformComponent.js       # Info display
│   ├── contexts/
│   │   ├── MyProvider.js        # Context provider wrapper
│   │   └── MyContext.js         # Shared state (cart, auth, etc.)
│   └── utils/
│       ├── CartUtil.js          # Cart state persistence and sync
│       └── withRouter.js        # HOC for router integration
├── public/
│   └── index.html           # HTML entry point
└── package.json
```

**Served at:** `http://localhost:3000/` (root via static serving)

---

## Development Conventions

### 1. API Development (Backend)

**Endpoint Pattern:**
```javascript
// server/api/admin.js or customer.js
router.get('/items', async (req, res) => {
  try {
    const data = await ItemDAO.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**DAO Pattern** (Data Access Objects):
- Each entity has a `*DAO.js` class
- DAOs handle all MongoDB queries and business logic
- DAOs are called from API routes

**Authentication:**
- Routes requiring auth should validate JWT using `JwtUtil.verify(token)`
- Token passed in header: `Authorization: Bearer <token>`

### 2. React Component Development

**Component Structure:**
```javascript
import { useContext } from 'react';
import MyContext from '../contexts/MyContext';

export default function MyComponent() {
  const { user, token } = useContext(MyContext);
  
  // Component logic...
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

**Context Usage:**
- Shared state (auth, user info, cart) lives in `MyContext`
- Access via `useContext(MyContext)`
- Provider wraps entire app in `App.js`

**API Calls:**
- Use `axios` for HTTP requests
- Routes proxy to `http://localhost:3000` automatically
- Always include JWT in headers when authenticated

**Routing:**
- Use `react-router-dom` (v7.*) 
- Routes defined in main `App.js`
- Admin routes under `/admin/*`, customer at `/`

### 3. Component Organization

- **Presentational components** in `components/` folder
- One component per file unless tightly coupled
- Use consistent naming: `ComponentNameComponent.js`
- Context and utilities in separate `contexts/` and `utils/` folders

---

## Common Patterns

### Authentication Flow

1. **Login** → POST `/api/{admin|customer}/login` with email/password
2. **Server** → Returns JWT token and user object
3. **Client** → Stores token in context/localStorage
4. **Subsequent Requests** → Include `Authorization: Bearer <token>` header

### Cart Management (Customer)

- Cart state stored in `MyContext` (React Context)
- `CartUtil.js` handles persistence (localStorage) and sync
- Updates flow: Component → Context → API → Confirmation

### Error Handling

- API: Use HTTP status codes (400, 401, 404, 500) with error message in response body
- Frontend: Catch errors in `.catch()` block, display user-friendly messages

---

## Database Models

**Schema Definitions** stored in `server/models/Models.js` using Mongoose  
**Entities:**
- **Admin:** Email, password (hashed), permissions
- **Customer:** Email, password, name, address, phone
- **Category:** Name, description
- **Product:** Name, description, price, category, stock, image
- **Order:** Customer ID, items (array), total, status, date

---

## Common Pitfalls & Solutions

| Pitfall | Solution |
|---------|----------|
| **Both clients running on port 3000 conflict** | Start only one client at a time during dev, or configure alternate ports |
| **"Cannot find module" in frontend** | Run `npm install` in the client directory; clear node_modules and reinstall if stubborn |
| **JWT token errors** | Ensure token is included in `Authorization` header; check token expiry in `JwtUtil.js` |
| **CORS errors** | Both clients proxy to server on port 3000; if using non-proxied calls, server must have CORS middleware |
| **MongoDB connection fails** | Check `MongooseUtil.js` connection string; verify MongoDB is running; check `MyConstants.js` for DB URL |
| **Static files not served** | Run `npm run build` in both clients to generate `/build` folders; server serves from these in production |
| **Emails not sending** | Check `EmailUtil.js` SMTP config; verify credentials in `MyConstants.js`; test with a real email service (nodemailer supports Gmail, etc.) |
| **"localhost:3000" not reachable from client** | Server must be running; React app proxy points to `http://localhost:3000` in dev mode |

---

## Testing & Debugging

### React Component Testing (both clients)

```bash
npm test  # Launches Jest in watch mode
```

- Tests use `@testing-library/*` packages
- Test file pattern: `*.test.js`
- Existing setup: `setupTests.js` configures Jest

### Server Debugging

- Add `console.log()` in API routes or DAOs
- Use Node.js debugger: `node --inspect server/index.js`
- Check browser console for client-side errors

### Network Inspection

- Open browser DevTools → Network tab
- Monitor API calls to `/api/admin/*` and `/api/customer/*`
- Check request headers for `Authorization` token

---

## Build & Deployment Notes

### Production Build

```bash
npm run build  # From project root
# OR from each package:
cd client-admin && npm run build
cd client-customer && npm run build
cd server && npm install  # Ensure deps installed
```

**Output:**
- `client-admin/build/` → Served at `/admin`
- `client-customer/build/` → Served at `/`
- App servers static files via `express.static()` in `server/index.js`

### Environment Variables

- Set `PORT` for server (defaults to 3000)
- MongoDB connection string in `server/utils/MongooseUtil.js`
- JWT secret, email credentials in `server/utils/MyConstants.js`

---

## File Edit Tips for AI Agent

**When modifying:**
- **Backend API:** Edit route in `api/admin.js` or `customer.js`, then data logic in corresponding `*DAO.js`
- **Frontend Components:** Edit component in `components/`, update context if state changes needed
- **Schemas:** Update `Models.js` and corresponding DAO methods
- **Utilities:** Centralize shared logic in `utils/` folders

**Build after changes:**
- Backend: No build needed; restart Node.js
- Frontend: `npm run build` before deployment; during dev, `npm start` watches for changes

---

## Quick Reference

| Task | Command |
|------|---------|
| Install all deps | (from root) `npm run build` (or cd into each dir and run `npm install`) |
| Start dev server + both clients | `cd server && npm start` (in one terminal, then start each client in separate terminals) |
| Start just admin client | `cd client-admin && npm start` |
| Start just customer client | `cd client-customer && npm start` |
| Run tests | `cd client-{admin\|customer} && npm test` |
| Build for prod | `npm run build` (from root) or `npm run build` in each package |
| Kill process on port 3000 | `lsof -ti:3000 \| xargs kill -9` (Mac/Linux) or `netstat -ano \| findstr :3000` (Windows) |

---

## Related Documentation

- [React Router Docs](https://reactrouter.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Express Docs](https://expressjs.com/)
- [Axios Docs](https://axios-http.com/)
