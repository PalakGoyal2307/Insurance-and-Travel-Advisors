# PNP Advisors Backend (Module 1)

This backend is the production-ready foundation for your real insurance website.
It includes:

- Express MVC architecture
- MongoDB Atlas via Mongoose
- Email/password authentication with bcrypt hashing
- JWT authentication with HTTP-only cookies
- Role-based authorization (`user`, `admin`)
- Profile APIs
- Contact inquiry persistence APIs
- Admin dashboard summary + user management APIs
- Security middleware (Helmet, CORS, rate limiting)

## 1. Folder Structure

```txt
backend/
  package.json
  .env.example
  src/
    app.js
    server.js
    config/
      db.js
      env.js
    controllers/
      authController.js
      contactController.js
      profileController.js
      userController.js
    middleware/
      authenticate.js
      authorize.js
      errorHandler.js
      notFound.js
      rateLimiters.js
      validateRequest.js
    models/
      ContactInquiry.js
      Counter.js
      User.js
    routes/
      adminRoutes.js
      authRoutes.js
      contactRoutes.js
      healthRoutes.js
      index.js
      profileRoutes.js
      userRoutes.js
    scripts/
      createAdmin.js
    services/
      passwordService.js
      tokenService.js
      userCodeService.js
    utils/
      ApiError.js
      asyncHandler.js
      cookieOptions.js
```

## 2. Setup Instructions

1. Open terminal in `backend` folder.
2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example`.
4. Fill values for:
   - `MONGODB_URI`
   - `JWT_ACCESS_SECRET`
   - `FRONTEND_URL`
   - admin seed values

5. Create/update admin account:

```bash
npm run seed:admin
```

6. Start development server:

```bash
npm run dev
```

## 3. Production Security Notes

- Password hashes use bcrypt (`saltRounds=12`).
- JWT token is set in an HTTP-only cookie (`COOKIE_NAME`).
- CORS is locked to `FRONTEND_URL` and credentials are enabled.
- Global rate limiter and auth-specific rate limiter are active.
- Helmet is enabled for secure HTTP headers.
- Input validation is enforced using `express-validator`.

## 4. API Endpoints (Module 1)

Base URL: `https://pnpadvisors.co.in/`

### Health

- `GET /health`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /auth/change-password`

### Profile / Users

- `GET /profile/me`
- `PATCH /profile/me`
- `GET /users/me`
- `PATCH /users/me`

### Contact

- `POST /contact`
- `GET /contact/admin/list` (admin only)
- `PATCH /contact/admin/:inquiryId/status` (admin only)

### Admin

- `GET /admin/dashboard`
- `GET /admin/users`
- `GET /admin/users/:userId`
- `PATCH /admin/users/:userId`
- `DELETE /admin/users/:userId`

## 5. Example API Testing (Postman)

### Register

`POST /api/auth/register`

```json
{
  "fullName": "Rahul Verma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "password": "Strong@123",
  "confirmPassword": "Strong@123"
}
```

### Login

`POST /api/auth/login`

```json
{
  "email": "rahul@example.com",
  "password": "Strong@123"
}
```

### Contact Inquiry

`POST /api/contact`

```json
{
  "name": "Rahul Verma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "message": "I need health insurance for family of 4",
  "context": "navbar-query",
  "source": "website"
}
```

## 6. Frontend Integration Notes (Done in Module 1)

- Added API utility layer for backend calls.
- Added Login, Register, and Profile pages matching your existing style.
- Navbar now switches:
  - Guest: `Login`, `Register`
  - Logged in: `Profile`, `Logout`
- Contact forms now store inquiry in MongoDB via backend, while keeping current EmailJS behavior.

## 7. What Comes Next (Module 2)

- Google Drive API integration
- User document upload model and APIs
- One-time upload + replace/view logic
- Folder structure automation in Drive:
  - `PNP Advisors/Users/USER001/...`

Then Module 3 and beyond will add:

- Health insurance application module
- Life insurance application module
- General insurance application module
- Full admin workflow across all modules
