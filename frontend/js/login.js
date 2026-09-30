const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
// Login Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // 1. Agar foydalanuvchi allaqachon tizimga kirgan bo'lsa, uni to'g'ridan-to'g'ri Dashboardga yo'naltiramiz
    if (localStorage.getItem('access_token')) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tab = this.dataset.tab;

            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Show/hide forms
            if (tab === 'login') {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            } else {
                loginForm.classList.remove('active');
                registerForm.classList.add('active');
            }
        });
    });

    // Login form submission
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Loading in...';

        try {
            const response = await fetch(`${API_BASE_URL}/auth/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email, password})
            });

            const data = await response.json();

            if (response.ok) {
                // Token va User ma'lumotlarini brauzerda saqlaymiz
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                if (data.data) {
                    localStorage.setItem('user', JSON.stringify(data.data));
                }

                // Asosiy sahifaga o'tamiz
                window.location.href = 'dashboard.html';
            } else {
                Toast.error(data.detail || 'Email yoki parol noto‘g‘ri kiritildi!');
            }
        } catch (error) {
            console.error('Login error:', error);
            Toast.error('Server bilan bog‘lanishda xatolik yuz berdi. Backend ishlab turganini tekshiring.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Login';
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const firstName = document.getElementById('register-first-name').value.trim();
        const lastName = document.getElementById('register-last-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone-number')?.value.trim() || '';
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        const submitBtn = registerForm.querySelector('button[type="submit"]');

        if (password !== passwordConfirm) {
            Toast.error('Parollar bir-biriga mos kelmadi!');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = 'Creating account...';

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    phone_number: phone,
                    password: password,
                    password_confirm: passwordConfirm
                })
            });

            const data = await response.json();

            if (response.ok) {
                Toast.success('Ro‘yxatdan muvaffaqiyatli o‘tdingiz! Endi login qilishingiz mumkin.');
                // Login tabiga o'tkazish
                document.querySelector('.tab-btn[data-tab="login"]').click();
                document.getElementById('login-email').value = email;
            } else {
                let errorMsg = 'Xatolik yuz berdi: ';
                for (let key in data) {
                    errorMsg += `\n${key}: ${data[key]}`;
                }
                Toast.error(errorMsg);
            }
        } catch (error) {
            console.error('Register error:', error);
            Toast.error('Server bilan bog‘lanishda xatolik yuz berdi.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Create Account';
        }


    });
});
