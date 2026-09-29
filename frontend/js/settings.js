// Settings Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initSettingsNav();
    initPasswordForm();
    initCharacterCount();
});

function initSettingsNav() {
    const navItems = document.querySelectorAll('.settings-nav-item');
    const sections = document.querySelectorAll('.settings-section');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
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

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validation
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

        // TODO: Call API to update password
        Toast.success('Password updated successfully');
        form.reset();
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

function saveAbout() {
    const about = document.getElementById('about').value;
    
    if (about.length > 500) {
        Toast.error('Bio must be less than 500 characters');
        return;
    }

    // TODO: Call API to save bio
    Toast.success('Bio saved successfully');
}

function saveNotifications() {
    // TODO: Call API to save notification preferences
    Toast.success('Notification preferences saved');
}

function savePreferences() {
    const language = document.getElementById('language').value;
    const timezone = document.getElementById('timezone').value;
    const dateFormat = document.getElementById('date-format').value;

    console.log('Preferences:', { language, timezone, dateFormat });

    // TODO: Call API to save preferences
    Toast.success('Preferences saved successfully');
}

function checkUpdates() {
    Toast.info('Checking for updates...');
    // TODO: Implement update check
    setTimeout(() => {
        Toast.info('You are using the latest version');
    }, 2000);
}

function clearCache() {
    Modal.confirm({
        title: 'Clear Cache?',
        content: '<p>Are you sure you want to clear the cache? This may temporarily slow down the application.</p>',
        confirmText: 'Clear Cache',
        cancelText: 'Cancel'
    }).then(confirmed => {
        if (confirmed) {
            // TODO: Implement cache clearing
            Toast.success('Cache cleared successfully');
        }
    });
}
