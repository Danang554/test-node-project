# 🛠️ Node.js REST API - Command Reference & Cheatsheet

Dokumentasi daftar perintah command line (*CLI*) untuk project Node.js REST API berbasis JavaScript murni (Clean Architecture).

---

## 📌 Ringkasan Konfigurasi Project

* **Direktori:** `C:\Test Project\Node\test-node-project`
* **Runtime & Bahasa:** Node.js (v26+) & JavaScript (CommonJS)
* **Framework:** Express.js (`express`)
* **Security:** Helmet & CORS
* **Database Driver & Migration:** MySQL2 (`mysql2`) & Knex (`knex`)
* **Database Name:** `test_node_project` (`127.0.0.1:3306`, user: `root`)
* **Validation:** Zod (`zod`)
* **Testing:** Jest (`jest`) & Supertest (`supertest`)
* **Logging:** Winston (`winston`) & Winston Daily Rotate File
* **Containerization:** Docker (`Dockerfile` multi-stage & `compose.yaml`)
* **Arsitektur:** Controller $\rightarrow$ Service (Use Case) $\rightarrow$ Repository $\rightarrow$ Domain Entity

---

## ⚡ 1. Menjalankan Server Lokal (NPM Scripts)

```bash
# Mode development dengan auto-reload (watch mode)
npm run dev

# Mode production standar
npm start
```

---

## 🗄️ 2. Database Migration & Seeder (Knex)

```bash
# Menjalankan seluruh file migration yang belum diaplikasikan
npm run migrate

# Melihat status riwayat migrasi (apakah sudah Up atau Pending)
npm run migrate:status

# Rollback 1 batch migrasi terakhir
npm run migrate:rollback

# Membuat file skema migrasi baru (otomatis dengan timestamp)
npm run migrate:make <nama_migrasi>
# Contoh: npm run migrate:make create_orders_table

# Menjalankan database seeder
npm run seed

# Membuat file seeder baru
npm run seed:make <nama_seeder>
# Contoh: npm run seed:make 04_orders_seed
```

---

## 🧪 3. Unit & Integration Testing (Jest)

```bash
# Menjalankan seluruh test suite (70 tests)
npm test

# Menjalankan test dalam mode watch (otomatis re-run saat file disimpan)
npm run test:watch

# Menjalankan test beserta laporan code coverage
npm run test:coverage
```

---

## 🐳 4. Docker & Docker Compose

### A. Menggunakan Docker Compose (Direkomendasikan)
```bash
# Build dan jalankan container di latar belakang
docker compose up -d --build

# Melihat log container secara real-time
docker compose logs -f api

# Menghentikan container
docker compose down

# Menjalankan migrasi database di dalam container
docker compose exec api npm run migrate

# Menjalankan seeder database di dalam container
docker compose exec api npm run seed

# Menjalankan test di dalam container
docker compose exec api npm test
```

### B. Menggunakan Docker CLI Manual
```bash
# 1. Build image Docker
docker build -t test-node-api:latest .

# 2. Jalankan container
docker run -d \
  --name test-node-api \
  -p 5000:5000 \
  --add-host host.docker.internal:host-gateway \
  -e APP_HOST=0.0.0.0 \
  -e APP_PORT=5000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD= \
  -e DB_NAME=test_node_project \
  --network test-project-network \
  test-node-api:latest

# 3. Cek log container
docker logs -f test-node-api

# 4. Hentikan container
docker stop test-node-api
docker rm test-node-api
```
