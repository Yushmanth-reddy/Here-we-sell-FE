# Here-We-Sell: API Contract & Frontend Integration Guide

This document is generated specifically for frontend developers and UI generation tools (like Kombai). It strictly outlines the exact capabilities, schemas, and flows of the existing "Here We Sell" Go backend. 

*Do NOT invent endpoints outside of this document.*

---

## 🏗 Project Overview
A highly restricted, campus-only marketplace API for IIITM Gwalior. Students can sign in via Google OAuth to list items (textbooks, electronics, etc.), search/filter listings with infinite scroll, and view analytical dashboards (if admin).

## 💻 Tech Stack (Backend)
- Go 1.22+ & Fiber v2
- PostgreSQL 16 (pgxpool)
- Stateless JWT Authentication
- Swagger API Docs

---

## 🔐 Authentication Flow
**Method**: Stateless Google OAuth2 & JWT tokens.
1. Frontend renders a "Login with Google" button.
2. User clicks button -> Frontend navigates window to `GET /api/v1/auth/google`.
3. User signs in via Google OAuth UI.
4. Google redirects back to `GET /api/v1/auth/google/callback` with code.
5. Backend verifies code, issues a JSON Web Token (JWT), and returns a JSON payload containing the `token` and `user` object.
6. Frontend extracts the `token` and saves it (e.g., LocalStorage / SessionStorage / Secure Cookie).

## 🛡 Roles & Permissions
*   **Guest (Unauthenticated)**: Can browse all listings (`GET /listings`) and view single listings (`GET /listings/:id`).
*   **User (Authenticated)**: Can create/update/delete their *own* listings, favorite items, and update their profile bio.
*   **Admin**: Can view all users, softly ban users, hard delete any listing, and view system analytics. 

*(Admins are hard-configured via the `ADMIN_EMAILS` backend env variable).*

---

## 🌐 API Base URL
*Local Environment*: `http://localhost:3000/api/v1`
*Production*: `https://here-we-sell-backend.onrender.com/api/v1`

## 📦 Global Headers / Cookies
All protected routes require the JWT token in the `Authorization` header.
```http
Authorization: Bearer <your_jwt_token_here>
```

---

## ✅ Standard Response Format
Unless otherwise specified, successful responses wrap the payload in this standard format (based on fiber map conventions used in error boundaries):
```json
{
  "data": { ... },     // The requested resource or array
  "error": null,
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-04-13T12:00:00Z"
  }
}
```
*(Note for Frontend: Some endpoints, like Get Listings, might include extra cursor metadata alongside `data`).*

## ❌ Standard Error Format
Responses from `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, and `500 Server Error` will look like this:
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR", // e.g., INTERNAL_ERROR, DB_ERROR
    "message": "Title is required"
  },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-04-13T12:00:00Z"
  }
}
```

---

## 🛠 Endpoint Catalog

### 1. Authentication
- `GET /auth/google` (Public) - Initiates Login.
- `GET /auth/google/callback` (Public) - Receives OAuth result, returns JWT.

### 2. Listings
- `GET /listings` (Public) - Browse listings (supports full-text search, filters, pagination).
- `GET /listings/:id` (Public) - Fetch details of a single listing.
- `POST /listings` (Protected) - Create a new listing.
- `PATCH /listings/:id` (Protected) - Update a listing (Owner only).
- `DELETE /listings/:id` (Protected) - Soft delete a listing (Owner or Admin).
- `GET /users/me/listings` (Protected) - Get all listings created by the logged-in user.

### 3. Favorites
- `POST /listings/:id/favorite` (Protected) - Toggles favorite (Adds if missing, Removes if exists).
- `GET /users/me/favorites` (Protected) - Get all listings favorited by logged-in user.

### 4. User Profiles
- `GET /users/me` (Protected) - Get own profile data.
- `PATCH /users/me` (Protected) - Update own profile bio.

### 5. Admin Dashboard (Admin Only)
- `GET /admin/users` (Protected/Admin) - See all registered users.
- `PATCH /admin/users/:id/ban` (Protected/Admin) - Soft delete (ban) a user account.
- `DELETE /admin/listings/:id` (Protected/Admin) - Hard, permanent delete of a listing.
- `GET /admin/stats` (Protected/Admin) - Get aggregation metrics (Total Users, Listings, etc).

---

## 📂 Request/Response Schemas

**`Listing` Object**
```json
{
  "id": "uuid",
  "seller_id": "uuid",
  "title": "Calculus Textbook",
  "description": "Mint condition.",
  "price_cents": 1500, // Frontend must divide by 100 to show currency (₹15.00)
  "category": "textbooks",
  "condition": "like_new",
  "image_urls": ["url1.jpg", "url2.jpg"],
  "status": "active", // active, sold, deleted
  "created_at": "...",
  "updated_at": "..."
}
```

**`User` Object**
```json
{
  "id": "uuid",
  "email": "user@iiitm.ac.in",
  "first_name": "John",
  "last_name": "Doe",
  "avatar_url": "url.jpg",
  "role": "user",
  "college": "IIITM Gwalior",
  "bio": "I sell books.",
  "created_at": "..."
}
```

**`CreateListingInput` (POST `/listings`)**
```json
{
  "title": "Macbook M1",     // Required, string
  "description": "Used",     // Required, string
  "price_cents": 50000,      // Required, integer (₹500.00)
  "category": "electronics", // Required, string
  "condition": "good",       // Required, string
  "image_urls": ["url.jpg"]  // Required, array of strings (min 1, max 5)
}
```

**`UpdateProfileInput` (PATCH `/users/me`)**
```json
{
  "bio": "New bio text" // Optional, string, max 500 chars
}
```

---

## 🚦 Validation Rules
- `price_cents`: Must be greater than 0. (Backend stores currency as integers to prevent float rounding errors).
- `category`: Must be one of `textbooks`, `electronics`, `furniture`, `clothing`, `other`.
- `condition`: Must be one of `new`, `like_new`, `good`, `fair`, `poor`.
- `image_urls`: Minimum 1 image required, max 5 allowed.

---

## 📃 Pagination / Filtering / Sorting
The `GET /listings` endpoint is highly versatile. 

**Query Parameters:**
- `q` (string): Full-text search string (e.g. `macbook`). Returns typo-tolerant matches.
- `category` (string): Exact match.
- `condition` (string): Exact match.
- `min_price` (integer in cents): Minimum price.
- `max_price` (integer in cents): Maximum price.
- `sort` (string): `newest` (default), `oldest`, `price_asc`, `price_desc`.
- `limit` (int): Number of items per page (default = 20, max = 50).
- `cursor` (string): The base64 cursor token to fetch the *next* page. (Omit on initial load).

**Paginated Response Meta:**
```json
// Inside the response payload
"pagination": {
  "next_cursor": "YXNkYXNkYXM=", // Send this in the next request's ?cursor= param
  "has_more": true               // If false, hide the "Load More" button
}
```

---

## 📸 File Upload/Download Rules
*Missing Piece Note:* The backend currently expects `image_urls` as an array of strings. It does **not** currently handle raw multipart file uploads directly to S3 or Cloudinary. 
*Frontend Task*: The frontend UI must implement a client-side upload to Firebase Storage, AWS S3, or Cloudinary, retrieve the public URLs, and then send those strings via the `POST /listings` `image_urls` array.

---

## 🚥 State/Status Enums
- **Listings**:
  - `active`: Normally visible to search.
  - `sold`: Pending implementation on frontend to mark items sold.
  - `deleted`: Soft deleted (invisible, except potentially to admins).
- **Users**:
  - Ban System: Moderation is handled via `deleted_at` timestamp. If `deleted_at` is populated, the user is banned and cannot authenticate.

---

## 🔌 Frontend Integration Notes (Kombai specifically)

1. **Monetary Values**: The database exclusively talks in **cents** (`price_cents`). Frontend must consistently handle `/ 100` before rendering UI elements like `₹2500` instead of `₹250000`, and `* 100` before submitting POST forms.
2. **Infinite Scroll**: The frontend should implement an Intersection Observer on the last item card. When it enters viewport, if `has_more` is true, trigger `GET /listings?cursor={next_cursor}` and append the results to the local state.
3. **CORS Requirement**: To prevent local-dev CORS headaches, the backend is currently serving `Access-Control-Allow-Origin: *`.

---

## ⚠️ Known Ambiguities / TODOs
- **Marking items as Sold**: Currently no dedicated backend endpoint exists to mark a listing as `"status": "sold"` other than manually doing a full `PATCH` request with updated status (if status was added to the update validation schema). 
- **User Avatar Updates**: The `UpdateProfileInput` currently only supports `bio`. Avatar updating logic needs to be integrated if users wish to change their Google default profile picture.
- **Refresh Tokens**: Backend relies purely on a JWT expiration. Refresh Token rotation is absent. Frontend must redirect user back to Google Login on token expiration (`401 Unauthorized`).
