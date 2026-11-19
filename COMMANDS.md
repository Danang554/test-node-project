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
* **Arsitektur:** Controller $\rightarrow$ Service (Use Case) $\rightarrow$ Repository $\rightarrow$ Domain Entity

---

## ⚡ Daftar Perintah NPM Script

### 1. Menjalankan Server Aplikasi
```bash
# Menjalankan server dalam mode development dengan auto-reload (watch mode)
npm run dev

# Menjalankan server dalam mode production standar
npm start
```

### 2. Database Migration (Knex)
```bash
# Menjalankan seluruh file migration yang belum dieksekusi
npm run migrate

# Melihat status riwayat migrasi (apakah sudah Up atau Pending)
npm run migrate:status

# Rollback 1 batch migrasi terakhir
npm run migrate:rollback

# Membuat file skema migrasi baru (otomatis ada timestamp)
npm run migrate:make <nama_migrasi>
# Contoh: npm run migrate:make create_products_table
```

### 3. Database Seeder
```bash
# Menjalankan seluruh seeder (users, categories, todos)
npm run seed

# Membuat file seeder baru
npm run seed:make <nama_seeder>
# Contoh: npm run seed:make 04_products_seed
```

### 4. Testing & Code Quality
```bash
# Menjalankan seluruh unit test dan integration test
npm test

# Menjalankan test dalam mode watch (otomatis re-run saat file diedit)
npm run test:watch

# Menjalankan test sekaligus generate laporan code coverage
npm run test:coverage
```

---

## 💻 Contoh Eksekusi Manual (PowerShell)

Jika Anda ingin menjalankan perintah manual via PowerShell di Windows:

```powershell
# Jalankan test
npm.cmd test

# Jalankan migrasi
npm.cmd run migrate

# Jalankan seeder
npm.cmd run seed

# Jalankan server
npm.cmd run dev
```
