# Lead Management System (Mini CRM)

Men ushbu loyihani kompaniyalar va jamoalar uchun mijozlar oqimini (`leads`) boshqarish, ularning statuslarini kuzatish (`New`, `Contacted`, `Qualified`, `Won`, `Lost`), faoliyatlar (`activities`) tarixini yuritish va dashboard statistikalarini ko'rish uchun kichik CRM tizimi sifatida yaratdim.

---

## 🏗️ Loyiha Arxitekturasi va Qanday Ishladim?

### Backend Qismi (Django + DRF)
- **Framework sifatida:** Django va Django REST Framework (DRF) ishlatdim.
- **Autentifikatsiya uchun:** SimpleJWT orqali xavfsiz JWT token (`access` va `refresh`) tizimini qurdum (`/api/v1/auth/token/`).
- **Ma'lumotlar bazasi:** SQLite yordamida relational (`User`, `Lead`, `LeadActivity`) modellarni bog'ladim.
- **API Hujjatlari:** DRF Spectacular orqali Swagger UI va Redoc hujjatlarini tayyorladim.

### Frontend Qismi (Vanilla HTML, CSS, JS + Component Loader)
- **Arxitektura:** Django template inheritance (`{% extends %}`) ishlatmasdan, mutlaqo mustaqil statik HTML sahifalar qilib tuzdim. Kod takrorlanmasligi (DRY) uchun `frontend/components/` ostida sidebar, header, modal va toastlarni ajratib, ularni `component_loader.js` orqali dinamik ravishda yuklayman (`explanation_1.md` ga qarang).
- **API va Token Boshqaruvi:** `main_base.js` dagi `apiFetch` orqali so'rovlar yuboraman. Token eskirganda 401 xatosini tutib, avtomatik ravishda yangi token olaman (`refresh-token`) yoki `logout()` qilib `login.html`ga yo'naltiraman.

---

## 🚀 Loyihani Qanday Ishga Tushiraman? (Step-by-Step)

O'z kompyuterimda (`/home/manas/PycharmProjects/lead_management_system`) loyihani quyidagi aniq qadamlar bilan ishga tushiraman:

### 1-Qadam: Backend Serverni Ishga Tushirish
Terminalda quyidagi buyruqlarni bajaraman:
```bash
cd /home/manas/PycharmProjects/lead_management_system
source .venv/bin/activate
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```
* **Backend manzili:** `http://127.0.0.1:8000/`
* **Swagger Docs:** `http://127.0.0.1:8000/api/schema/swagger-ui/`

### 2-Qadam: Frontend Serverni Ishga Tushirish
Boshqa terminal oynasida quyidagi buyruqni ishlataman:
```bash
cd /home/manas/PycharmProjects/lead_management_system
python -m http.server 5500 --directory frontend
```
* **Frontend manzili:** `http://localhost:5500/login.html`

---

## 🔑 Tizimda Kirish va Chiqish (Login & Logout Flow)
- **Login:** `login.html` orqali ma'lumotlarimni kiritib token olaman va uni `localStorage`da saqlab, `dashboard.html`ga o'taman.
- **Logout:** Menyu orqali "Logout" tugmasini bosganimda, `localStorage.clear()` ishlaydi va meni darhol `login.html` sahifasiga qaytaradi.
