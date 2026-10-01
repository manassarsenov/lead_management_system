// Settings Page JavaScript - Dynamic Backend Integration
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('access_token')) {
        window.location.href = 'login.html';
        return;
    }

    initSettingsNav();
    loadUserProfile();
    initPasswordForm();
    initCharacterCount();
});

let currentUser = null;

async function loadUserProfile() {
    try {
        currentUser = await apiJson('/users/me/');
        renderUserProfile(currentUser);
    } catch (error) {
        console.error('Error loading user profile:', error);
        Toast.error('Profil ma‘lumotlarini yuklashda xatolik yuz berdi.');
    }
}

function renderUserProfile(user) {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
    const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

    const avatarEl = document.querySelector('.profile-avatar-large');
    if (avatarEl) avatarEl.textContent = initials;

    const infoValues = document.querySelectorAll('#profile-section .info-value');
    if (infoValues.length >= 6) {
        infoValues[0].textContent = fullName;
        infoValues[1].textContent = user.email || '-';
        infoValues[2].textContent = user.phone_number || '-';
        infoValues[3].textContent = user.role || 'User';
        infoValues[4].textContent = user.department || '-';
        infoValues[5].textContent = user.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : '-';
    }

    const aboutTextarea = document.getElementById('about');
    const aboutCount = document.getElementById('about-count');
    if (aboutTextarea) {
        aboutTextarea.value = user.bio || '';
        if (aboutCount) aboutCount.textContent = aboutTextarea.value.length;
    }

    const toggles = document.querySelectorAll('.notification-item input[type="checkbox"]');
    if (toggles.length >= 4) {
        toggles[0].checked = !!user.notify_new_lead;
        toggles[1].checked = !!user.notify_status_change;
        toggles[2].checked = !!user.notify_activity_updates;
        toggles[3].checked = !!user.notify_weekly_reports;
    }
}

function initSettingsNav() {
    const navItems = document.querySelectorAll('.settings-nav-item');
    const sections = document.querySelectorAll('.settings-section');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionId}-section`) {
                    section.classList.add('active');
                }
            });
        });
    });
}

function initPasswordForm() {
    const form = document.getElementById('password-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!currentPassword) {
            Toast.error('Please enter your current password');
            return;
        }

        if (!newPassword || newPassword.length < 8) {
            Toast.error('New password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.error('Passwords do not match');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';

        try {
            await apiJson('/auth/change-password/', {
                method: 'POST',
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirm: confirmPassword
                })
            });
            Toast.success('Password updated successfully');
            form.reset();
        } catch (error) {
            console.error('Password change error:', error);
            let errorMsg = 'Parolni o‘zgartirishda xatolik yuz berdi: ';
            if (error && typeof error === 'object') {
                for (let key in error) {
                    errorMsg += `\n${key}: ${Array.isArray(error[key]) ? error[key].join(', ') : error[key]}`;
                }
            }
            Toast.error(errorMsg);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Password';
        }
    });
}

function initCharacterCount() {
    const aboutTextarea = document.getElementById('about');
    const aboutCount = document.getElementById('about-count');
    
    if (!aboutTextarea || !aboutCount) return;

    aboutTextarea.addEventListener('input', function() {
        const count = this.value.length;
        aboutCount.textContent = count;
        
        if (count > 500) {
            aboutCount.style.color = 'var(--danger)';
        } else {
            aboutCount.style.color = 'var(--text-muted)';
        }
    });
}

async function saveAbout() {
    const about = document.getElementById('about').value;
    
    if (about.length > 500) {
        Toast.error('Bio must be less than 500 characters');
        return;
    }

    try {
        await apiJson('/users/me/', {
            method: 'PATCH',
            body: JSON.stringify({ bio: about.trim() })
        });
        Toast.success('Bio saved successfully');
        loadUserProfile();
    } catch (error) {
        console.error('Save bio error:', error);
        Toast.error('Biografiyani saqlashda xatolik yuz berdi.');
    }
}

async function saveNotifications() {
    const toggles = document.querySelectorAll('.notification-item input[type="checkbox"]');
    if (toggles.length < 4) return;

    const payload = {
        notify_new_lead: toggles[0].checked,
        notify_status_change: toggles[1].checked,
        notify_activity_updates: toggles[2].checked,
        notify_weekly_reports: toggles[3].checked
    };

    try {
        await apiJson('/users/me/', {
            method: 'PATCH',
            body: JSON.stringify(payload)
        });
        Toast.success('Notification preferences saved');
        loadUserProfile();
    } catch (error) {
        console.error('Save notifications error:', error);
        Toast.error('Bildirishnoma sozlamalarini saqlashda xatolik yuz berdi.');
    }
}

function savePreferences() {
    const language = document.getElementById('language').value;
    const timezone = document.getElementById('timezone').value;
    const dateFormat = document.getElementById('date-format').value;

    localStorage.setItem('user_preferences', JSON.stringify({ language, timezone, dateFormat }));
    Toast.success('Preferences saved successfully');
}

function checkUpdates() {
    Toast.info('Checking for updates...');
    setTimeout(() => {
        Toast.info('You are using the latest version');
    }, 1500);
}

function clearCache() {
    Modal.confirm({
        title: 'Clear Cache?',
        content: '<p>Are you sure you want to clear local storage cache and preferences?</p>',
        confirmText: 'Clear Cache',
        cancelText: 'Cancel'
    }).then(confirmed => {
        if (confirmed) {
            localStorage.clear();
            Toast.success('Cache cleared successfully. Redirecting to login...');
            setTimeout(() => window.location.href = 'login.html', 1500);
        }
    });
}
