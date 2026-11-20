# Node.js REST API Starter Project (Clean Architecture)

Project REST API Node.js modular berbasis JavaScript (CommonJS) dengan prinsip **Clean Architecture (Controller - Service - Repository - Domain)**.

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
│   ├── helpers/
│   │   └── test-helper.js              # Mock router & token generator
│   ├── unit/                           # Controller Unit Tests (Menyertakan seluruh Endpoint)
│   │   ├── auth.controller.test.js     # /api/auth/* & /api/profile
│   │   ├── user.controller.test.js     # /api/user/* (Admin CRUD, soft delete, restore, force)
│   │   ├── category.controller.test.js # /api/category/* (Owner CRUD, soft delete, restore, force)
│   │   ├── todo.controller.test.js     # /api/todo/* (Owner CRUD, soft delete, restore, force)
│   │   └── health.controller.test.js   # /health (DB connected & disconnected status)
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
Salin `.env.example` ke `.env`:
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
Menjalankan seluruh unit test controller dan integration test:
```bash
npm test
```
Menjalankan test dengan laporan code coverage:
```bash
npm run test:coverage
```

### 6. Menjalankan Menggunakan Docker
Build dan jalankan container dengan Docker Compose:
```bash
# Build dan start container
docker compose up -d --build

# Melihat log
docker compose logs -f api

# Hentikan container
docker compose down
```

---

## 📡 Cakupan Endpoint & Controller Unit Test

| Controller | Method | Endpoint | Auth | Role | Skenario Pengujian Unit Test |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Auth** | `POST` | `/api/auth/register` | No | Public | 201 Sukses, 400 Validasi (body kosong/invalid), 409 Duplikasi Email |
| **Auth** | `POST` | `/api/auth/login` | No | Public | 200 Sukses (JWT), 400 Validasi, 401 Kredensial Salah |
| **Auth** | `POST` | `/api/auth/logout` | Yes | All | 200 Sukses, 401 Header Kosong, 401 Token Blacklist/Revoked |
| **User (Profile)** | `GET` | `/api/profile` | Yes | All | 200 Sukses Profil, 401 Tanpa Token, 404 User Not Found |
| **User (Profile)** | `PATCH` | `/api/profile` | Yes | All | 200 Sukses Update, 400 Validasi, 409 Email Sudah Dipakai |
| **User (Admin)** | `GET` | `/api/user` | Yes | **Admin** | 200 Paginasi & Search, 401 Tanpa Token, 403 Non-Admin Guard |
| **User (Admin)** | `POST` | `/api/user` | Yes | **Admin** | 201 Sukses Buat User, 400 Validasi, 409 Duplikasi Email |
| **User (Admin)** | `GET` | `/api/user/deleted`| Yes | **Admin** | 200 Daftar Soft-Deleted Users, 403 Non-Admin Guard |
| **User (Admin)** | `GET` | `/api/user/:id` | Yes | **Admin** | 200 Detail User, 404 User Tidak Ditemukan |
| **User (Admin)** | `PATCH` | `/api/user/:id` | Yes | **Admin** | 200 Update User, 404 User Not Found |
| **User (Admin)** | `DELETE`| `/api/user/:id` | Yes | **Admin** | 200 Soft Delete User, 404 User Not Found |
| **User (Admin)** | `PATCH` | `/api/user/:id/restore` | Yes | **Admin** | 200 Restore User, 404 Not Found |
| **User (Admin)** | `DELETE`| `/api/user/:id/permanent` | Yes | **Admin** | 200 Hapus Permanen User, 404 Not Found |
| **Category** | `GET` | `/api/category` | Yes | Owner | 200 Paginasi & Search, 401 Tanpa Token |
| **Category** | `POST` | `/api/category` | Yes | Owner | 201 Buat Kategori, 400 Validasi (nama kosong) |
| **Category** | `GET` | `/api/category/deleted` | Yes | Owner | 200 Daftar Soft-Deleted Categories |
| **Category** | `GET` | `/api/category/:id` | Yes | Owner | 200 Detail Kategori, 404 Kategori Not Found |
| **Category** | `PATCH` | `/api/category/:id` | Yes | Owner | 200 Update Kategori, 404 Not Found |
| **Category** | `DELETE`| `/api/category/:id` | Yes | Owner | 200 Soft Delete Kategori, 404 Not Found |
| **Category** | `PATCH` | `/api/category/:id/restore` | Yes | Owner | 200 Restore Kategori, 404 Not Found |
| **Category** | `DELETE`| `/api/category/:id/permanent` | Yes | Owner | 200 Hapus Permanen Kategori, 404 Not Found |
| **Todo** | `GET` | `/api/todo` | Yes | Owner | 200 Paginasi & Filter (category, is_completed, search), 401 Tanpa Token |
| **Todo** | `POST` | `/api/todo` | Yes | Owner | 201 Buat Todo, 400 Validasi, 400 Kategori Bukan Milik User |
| **Todo** | `GET` | `/api/todo/deleted` | Yes | Owner | 200 Daftar Soft-Deleted Todos |
| **Todo** | `GET` | `/api/todo/:id` | Yes | Owner | 200 Detail Todo, 404 Not Found |
| **Todo** | `PATCH` | `/api/todo/:id` | Yes | Owner | 200 Update Todo, 404 Not Found |
| **Todo** | `DELETE`| `/api/todo/:id` | Yes | Owner | 200 Soft Delete Todo, 404 Not Found |
| **Todo** | `PATCH` | `/api/todo/:id/restore` | Yes | Owner | 200 Restore Todo, 404 Not Found |
| **Todo** | `DELETE`| `/api/todo/:id/permanent` | Yes | Owner | 200 Hapus Permanen Todo, 404 Not Found |
| **Health** | `GET` | `/health` | No | Public | 200 Database Connected, 200 Database Disconnected |
