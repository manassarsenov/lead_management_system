# Lead Management System (Mini CRM)

Bu loyiha kompaniyalar va jamoalar uchun mo'ljallangan kichik CRM (Lead Management System) tizimi bo'lib, mijozlar (leads) oqimini qabul qilish, boshqarish, statuslarini o'zgartirish (`New`, `Contacted`, `Qualified`, `Won`, `Lost`), faoliyatlar (`activities`) tarixini yuritish va dashboard statistikalarini ko'rish imkonini beradi.

---

## 🏗️ 1. Loyiha Arxitekturasi va Qanday Ishlaydi?

### Backend (Django + DRF)
- **Framework:** Django & Django REST Framework (DRF)
- **Autentifikatsiya:** SimpleJWT (`/api/v1/auth/token/`, `/api/v1/auth/refresh-token/`). Tokenlar `access` va `refresh` ko'rinishida ishlaydi.
- **Ma'lumotlar bazasi (Database):** SQLite (`db.sqlite3`), relational models (`User`, `Lead`, `LeadActivity`).
- **API Hujjatlari:** DRF Spectacular orqali avtomatik generatsiya qilingan Swagger UI va Redoc.

### Frontend (Vanilla HTML, CSS, JS + Component Loader)
- **Arxitektura:** Django template inheritance o'rniga **JavaScript Component Loader** (`frontend/js/component_loader.js`) ishlatilgan. Bu orqali `components/` papkasidagi umumiy qismlar (`sidebar.html`, `header.html`, `modals.html`, `toasts.html`) barcha sahifalarga (`dashboard.html`, `leads_list.html` va h.k.) dinamik ravishda yuklanadi. DRY (Don't Repeat Yourself) tamoyiliga to'liq amal qilingan.
- **API Aloqasi:** `frontend/js/main_base.js` ichidagi `apiFetch` va `apiJson` funksiyalari orqali backend API bilan `Authorization: Bearer <access_token>` sarlavhasi yordamida muloqot qilinadi. Agar token eskirsa (401 error), avtomatik ravishda `/api/v1/auth/refresh-token/` orqali yangilanadi yoki `logout()` ishga tushib `login.html`ga yo'naltiriladi.

---

## 🚀 2. Loyihani To'liq Ishga tushirish Qo'llanmasi (Step-by-Step)

Sizning ishchi muhitingiz (`/home/manas/PycharmProjects/lead_management_system`) bo'yicha aniq buyruqlar quyidagicha:

### 1-Qadam: Backend Serverni Ishga tushirish

Terminalni ochib, loyiha ildiz papkasiga o'ting va quyidagi buyruqlarni bajaring:

```bash
# 1. Loyiha papkasiga o'tish
cd /home/manas/PycharmProjects/lead_management_system

# 2. Virtual muhitni (venv) faollashtirish
source .venv/bin/activate

# 3. Ma'lumotlar bazasi migratsiyalarini bajarish
python manage.py migrate

# 4. Test ma'lumotlarini (user va leadlar) bazaga kiritish (ixtiyoriy)
python manage.py seed_data

# 5. Django backend serverini 8000-portda ishga tushirish
python manage.py runserver
```
* **Backend ishga tushgan manzil:** `http://127.0.0.1:8000/`
* **API Endpoints bazasi:** `http://127.0.0.1:8000/api/v1/`
* **Swagger UI Docs:** `http://127.0.0.1:8000/api/schema/swagger-ui/`
* **Django Admin:** `http://127.0.0.1:8000/admin/`

---

### 2-Qadam: Frontend Serverni Ishga tushirish

Yangi terminal oynasini ochib, statik HTML/JS fayllarni (`frontend` papkasi) Pythonning o'rnatilgan http serveri orqali maxsus portda (masalan, **5500**) ishga tushirasiz:

```bash
# 1. Loyiha papkasiga o'tish
cd /home/manas/PycharmProjects/lead_management_system

# 2. Frontend papkasini 5500-portda serve qilish
python -m http.server 5500 --directory frontend
```

* **Frontend ishga tushgan manzil:** `http://localhost:5500/login.html`
* Brauzeringizda ushbu havolani oching va `seed_data` orqali yaratilgan yoki o'zingiz ro'yxatdan o'tgan foydalanuvchi ma'lumotlari bilan tizimga kiring.

---

## 🔑 3. Tizimda Ishlash va Navigatsiya (Login / Logout / Flow)

1. **Login Sahifasi (`login.html`):**
   - Email va parol kiritilib `POST /api/v1/auth/token/` ga so'rov yuboriladi.
   - Olingan `access` va `refresh` tokenlar brauzerning `localStorage` xotirasiga saqlanadi va foydalanuvchi avtomatik ravishda `dashboard.html` ga o'tkaziladi.
2. **Dashboard (`dashboard.html`) & Leadlar (`leads_list.html`):**
   - Barcha leadlarni ko'rish, status bo'yicha filtrlash (`New`, `Contacted`, `Qualified`, `Won`, `Lost`), qidirish va yangi lead qo'shish mumkin.
   - Har bir leadning tafsilotlari (`lead_detail.html`) sahifasida uning ma'lumotlarini tahrirlash va faoliyatlar (`activities`) qo'shish mumkin.
3. **Logout:**
   - Yuqori o'ng burchakdagi foydalanuvchi menyusidan **Logout** tugmasi bosilganda `localStorage.clear()` ishlaydi va foydalanuvchi darhol `login.html` sahifasiga qaytariladi.
