// Login Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginAlert = document.getElementById('login-alert');
    const registerAlert = document.getElementById('register-alert');

    function showError(formType, message) {
        const alertBox = formType === 'login' ? loginAlert : registerAlert;
        if (alertBox) {
            alertBox.textContent = message;
            alertBox.className = 'auth-alert error';
            alertBox.style.display = 'block';
        }
    }

    function hideAlerts() {
        if (loginAlert) { loginAlert.style.display = 'none'; loginAlert.textContent = ''; }
        if (registerAlert) { registerAlert.style.display = 'none'; registerAlert.textContent = ''; }
    }

    function parseApiError(data, defaultMsg = 'Xatolik yuz berdi.') {
        if (!data) return defaultMsg;
        if (typeof data === 'string') return data;
        if (data.detail) return data.detail;

        let messages = [];
        for (let key in data) {
            let val = data[key];
            if (Array.isArray(val)) {
                messages.push(`${key}: ${val.join(', ')}`);
            } else if (typeof val === 'string') {
                messages.push(`${key}: ${val}`);
            } else if (typeof val === 'object') {
                messages.push(`${key}: ${JSON.stringify(val)}`);
            }
        }
        return messages.length > 0 ? messages.join('\n') : defaultMsg;
    }

    // 1. Agar foydalanuvchi allaqachon tizimga kirgan bo'lsa, uni to'g'ridan-to'g'ri Dashboardga yo'naltiramiz
    if (localStorage.getItem('access_token')) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tab = this.dataset.tab;
            hideAlerts();

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
        hideAlerts();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Tizimga kirilmoqda...';

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

                Toast.success('Tizimga muvaffaqiyatli kirdingiz! Dashboardga yo‘naltirilmoqda...');
                
                // 1 soniya kutib keyin Dashboardga o'tish (foydalanuvchi xabarni ko'rishi uchun)
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showError('login', parseApiError(data, 'Email yoki parol noto‘g‘ri kiritildi!'));
                submitBtn.disabled = false;
                submitBtn.innerText = 'Login';
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('login', 'Server bilan bog‘lanishda xatolik yuz berdi. Backend ishlab turganini tekshiring.');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Login';
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideAlerts();
        const firstName = document.getElementById('register-first-name').value.trim();
        const lastName = document.getElementById('register-last-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone-number')?.value.trim() || '';
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        const submitBtn = registerForm.querySelector('button[type="submit"]');

        if (password !== passwordConfirm) {
            showError('register', 'Parollar bir-biriga mos kelmadi!');
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
                submitBtn.disabled = false;
                submitBtn.innerText = 'Create Account';
            } else {
                showError('register', parseApiError(data, 'Ro‘yxatdan o‘tishda xatolik yuz berdi.'));
                submitBtn.disabled = false;
                submitBtn.innerText = 'Create Account';
            }
        } catch (error) {
            console.error('Register error:', error);
            showError('register', 'Server bilan bog‘lanishda xatolik yuz berdi.');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Create Account';
        }
    });
});
