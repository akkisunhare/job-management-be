# Service & Job Management Backend

Backend REST API for managing field service jobs, worker assignments, parts, image uploads, and invoicing.

## Tech Stack

- Node.js & Express.js
- MySQL & Sequelize ORM
- JWT Authentication & bcrypt
- Multer (File uploads)
- Joi (Request validation)

## Setup & Running

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Update your database credentials in `.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=job
   JWT_SECRET=your_jwt_secret
   ```

3. **Start Server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

> Tables are created automatically on server startup via Sequelize sync.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user (`ADMIN` or `WORKER`)
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get logged-in user profile

### Users
- `GET /api/users/workers` - Get list of workers (Admin only)

### Jobs
- `POST /api/jobs` - Create a new job (Admin only)
- `GET /api/jobs` - Get jobs list (supports filtering, sorting & pagination)
- `GET /api/jobs/completed` - Get completed jobs with invoice status (Admin only)
- `GET /api/jobs/:id` - Get job details with parts, images & invoice
- `PATCH /api/jobs/:id` - Update job (workers can only update status)
- `DELETE /api/jobs/:id` - Delete job (Admin only)
- `POST /api/jobs/:jobId/assign` - Assign a worker to a job (Admin only)

### Parts
- `POST /api/jobs/:jobId/parts` - Add part to job
- `GET /api/jobs/:jobId/parts` - Get all parts for a job
- `PATCH /api/jobs/:jobId/parts/:partId` - Update part quantity/price
- `DELETE /api/jobs/:jobId/parts/:partId` - Delete part from job

### Images
- `POST /api/jobs/:jobId/images` - Upload images (multipart/form-data, max 5)
- `GET /api/jobs/:jobId/images` - Get images for a job
- `DELETE /api/jobs/:jobId/images/:imageId` - Delete an image

### Invoices
- `POST /api/invoices` - Generate invoice for completed job (Admin only)
