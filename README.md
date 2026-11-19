# Node.js REST API Starter Project (Clean Architecture)

Project REST API Node.js modular berbasis JavaScript (CommonJS) dengan prinsip **Clean Architecture (Controller - Service - Repository - Domain)**, dibuat dengan konsep, skema database, dan fitur yang setara dengan project Golang (`test-golang-project`).

---

## 📁 Struktur Folder

```text
test-node-project/
├── src/
│   ├── config/
│   │   └── index.js                    # Konfigurasi aplikasi & parsing .env
│   ├── database/
│   │   ├── knexfile.js                 # Konfigurasi migration & seeder Knex
│   │   ├── migrations/                 # Skema tabel database (Users, RevokedTokens, Categories, Todos)
│   │   │   ├── 20261119000001_create_users_table.js
│   │   │   ├── 20261119000002_create_revoked_tokens_table.js
│   │   │   ├── 20261119000003_create_categories_table.js
│   │   │   └── 20261119000004_create_todos_table.js
│   │   └── seeds/                      # Data awal (Users, Categories, Todos)
│   │       ├── 01_users_seed.js
│   │       ├── 02_categories_seed.js
│   │       └── 03_todos_seed.js
│   ├── domain/                         # Enterprise Business Rules
│   │   └── entities/                   # Plain Domain Entities
│   │       ├── User.js
│   │       ├── RevokedToken.js
│   │       ├── Category.js
│   │       └── Todo.js
│   ├── application/                    # Application Business Rules
│   │   ├── services/                   # Business Logic Layer (Use Cases)
│   │   │   ├── AuthService.js
│   │   │   ├── UserService.js
│   │   │   ├── CategoryService.js
│   │   │   └── TodoService.js
│   │   └── validations/                # Validasi schema payload & query (Zod)
│   │       ├── auth.validation.js
│   │       ├── user.validation.js
│   │       ├── category.validation.js
│   │       └── todo.validation.js
│   ├── infrastructure/                 # Frameworks & Drivers
│   │   ├── database/
│   │   │   └── mysql.js                # Inisialisasi koneksi Knex + connection pool MySQL
│   │   ├── logger/
│   │   │   └── logger.js               # Winston + Daily Rotate File (app-YYYY-MM-DD.log)
│   │   ├── repositories/               # Implementasi akses database MySQL
│   │   │   ├── MySQLUserRepository.js
│   │   │   ├── MySQLRevokedTokenRepository.js
│   │   │   ├── MySQLCategoryRepository.js
│   │   │   └── MySQLTodoRepository.js
│   │   └── security/
│   │       ├── hash.js                 # Bcrypt & SHA-256 token hashing
│   │       └── jwt.js                  # JWT Sign, Verify & Decode
│   ├── interfaces/                     # Interface Adapters (HTTP Delivery)
│   │   └── http/
│   │       ├── controllers/            # HTTP Controllers (Express)
│   │       │   ├── AuthController.js
│   │       │   ├── UserController.js
│   │       │   ├── CategoryController.js
│   │       │   └── TodoController.js
│   │       ├── middlewares/            # Middlewares (Auth, Admin, Validate, Error, Logger)
│   │       │   ├── auth.middleware.js
│   │       │   ├── admin.middleware.js
│   │       │   ├── validate.middleware.js
│   │       │   ├── request-logger.middleware.js
│   │       │   └── error.middleware.js
│   │       ├── routes/                 # Router grouping & endpoint binding
│   │       │   └── index.js
│   │       ├── utils/
│   │       │   ├── ApiResponse.js      # Standard JSON response helper
│   │       │   └── AppError.js         # Custom AppError hierarchy
│   │       └── app.js                  # Express app setup (Helmet, CORS, Middlewares)
│   └── index.js                        # Bootstrap server & Dependency Injection assembly
├── storage/
│   └── logs/                           # File log harian (app-YYYY-MM-DD.log)
├── tests/                              # Unit & Integration Tests (Jest + Supertest)
│   ├── unit/
│   │   ├── auth.service.test.js
│   │   ├── user.service.test.js
│   │   ├── category.service.test.js
│   │   └── todo.service.test.js
│   └── integration/
│       ├── health.test.js
│       └── auth.test.js
├── .env.example
├── .env
├── .gitignore
├── jest.config.js
├── package.json
└── COMMANDS.md
```

---

## 🚀 Cara Menjalankan

### 1. Konfigurasi Environment (`.env`)
Salin `.env.example` ke `.env` (sudah disiapkan secara otomatis):
```env
APP_NAME=test-node-project
APP_HOST=127.0.0.1
APP_PORT=5000
APP_ENV=development

# MySQL Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=test_node_project

# JWT Configuration
JWT_SECRET=super-secret-jwt-key-replace-this-in-production
JWT_EXPIRES_IN=24h

# Logging Configuration (Daily Rotating Log)
LOG_DIR=storage/logs
LOG_LEVEL=info
LOG_MAX_SIZE=10m
LOG_MAX_DAYS=14d
```

### 2. Jalankan Migrasi Database
Jalankan perintah migrasi skema tabel ke database MySQL:
```bash
npm run migrate
```
Untuk melihat status migrasi:
```bash
npm run migrate:status
```
Untuk rollback migrasi terakhir:
```bash
npm run migrate:rollback
```

### 3. Jalankan Database Seeder
Mengisi data awal pengguna (`admin@example.com`, `user@example.com`), kategori, dan contoh todo:
```bash
npm run seed
```
> **Default Password User & Admin:** `password`

### 4. Menjalankan Server
Mode development (dengan Node native `--watch` auto reload):
```bash
npm run dev
```

Mode production:
```bash
npm start
```

### 5. Menjalankan Unit & Integration Test
Menjalankan seluruh unit test dan integration test:
```bash
npm test
```
Menjalankan test dengan laporan code coverage:
```bash
npm run test:coverage
```

---

## 📡 Daftar Endpoint REST API

| Method | Endpoint | Auth | Role | Keterangan |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/health` | No | Public | Health check server & koneksi database |
| `POST` | `/api/auth/register` | No | Public | Registrasi akun user baru |
| `POST` | `/api/auth/login` | No | Public | Login akun & mendapatkan Bearer Token JWT |
| `POST` | `/api/auth/logout` | Yes | All | Logout & blacklist token ke revoked_tokens |
| `GET` | `/api/profile` | Yes | All | Melihat profil user yang sedang login |
| `PATCH` | `/api/profile` | Yes | All | Mengubah profil (nama/email/password) sendiri |
| `GET` | `/api/user` | Yes | **Admin** | Daftar semua user aktif (Pagination & Search) |
| `POST` | `/api/user` | Yes | **Admin** | Menambahkan user baru via admin |
| `GET` | `/api/user/deleted` | Yes | **Admin** | Daftar user yang di-soft-delete |
| `GET` | `/api/user/:id` | Yes | **Admin** | Detail user berdasarkan ID |
| `PATCH` | `/api/user/:id` | Yes | **Admin** | Update data user |
| `DELETE` | `/api/user/:id` | Yes | **Admin** | Soft delete user |
| `PATCH` | `/api/user/:id/restore` | Yes | **Admin** | Restore user yang telah di-soft-delete |
| `DELETE` | `/api/user/:id/permanent` | Yes | **Admin** | Hapus permanen user dari database |
| `GET` | `/api/category` | Yes | Owner | Daftar kategori milik user (Pagination & Search) |
| `POST` | `/api/category` | Yes | Owner | Membuat kategori baru |
| `GET` | `/api/category/deleted` | Yes | Owner | Daftar kategori yang di-soft-delete |
| `GET` | `/api/category/:id` | Yes | Owner | Detail kategori |
| `PATCH` | `/api/category/:id` | Yes | Owner | Update kategori |
| `DELETE` | `/api/category/:id` | Yes | Owner | Soft delete kategori |
| `PATCH` | `/api/category/:id/restore`| Yes | Owner | Restore kategori |
| `DELETE` | `/api/category/:id/permanent`| Yes | Owner | Hapus permanen kategori |
| `GET` | `/api/todo` | Yes | Owner | Daftar todo (Filter category_id, is_completed, search) |
| `POST` | `/api/todo` | Yes | Owner | Membuat todo baru |
| `GET` | `/api/todo/deleted` | Yes | Owner | Daftar todo yang di-soft-delete |
| `GET` | `/api/todo/:id` | Yes | Owner | Detail todo |
| `PATCH` | `/api/todo/:id` | Yes | Owner | Update todo |
| `DELETE` | `/api/todo/:id` | Yes | Owner | Soft delete todo |
| `PATCH` | `/api/todo/:id/restore` | Yes | Owner | Restore todo |
| `DELETE` | `/api/todo/:id/permanent` | Yes | Owner | Hapus permanen todo |

---

## 🛡️ Format Standar Response API

### Response Sukses:
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "Administrator",
    "email": "admin@example.com",
    "is_admin": true
  }
}
```

### Response Sukses dengan Paginasi:
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_items": 3,
    "total_pages": 1
  }
}
```

### Response Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email must be a valid email address",
    "password": "Password must be at least 6 characters"
  }
}
```
