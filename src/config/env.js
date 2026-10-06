const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

module.exports = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  port: process.env.PORT || 5000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'job',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key_job_management_prod_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
};
