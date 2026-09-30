// Create Lead Page JavaScript - Dynamic Backend Integration
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('access_token')) {
        window.location.href = 'login.html';
        return;
    }

    initForm();
    initCharacterCount();
    loadAssignees();
});

async function loadAssignees() {
    try {
        const users = await apiJson('/users/');
        const select = document.getElementById('assigned-to');
        if (!select) return;

        const userList = Array.isArray(users) ? users : (users.results || []);
        select.innerHTML = '<option value="">Select assignee</option>' + userList.map(user => `
            <option value="${user.id}">${user.first_name || ''} ${user.last_name || ''} (${user.email})</option>
        `).join('');
    } catch (error) {
        console.error('Error loading assignees:', error);
    }
}

function initForm() {
    const form = document.getElementById('create-lead-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });
}

function initCharacterCount() {
    const noteTextarea = document.getElementById('note');
    const noteCount = document.getElementById('note-count');
    
    if (!noteTextarea || !noteCount) return;

    noteTextarea.addEventListener('input', function() {
        const count = this.value.length;
        noteCount.textContent = count;
        
        if (count > 500) {
            noteCount.style.color = 'var(--danger)';
        } else {
            noteCount.style.color = 'var(--text-muted)';
        }
    });
}

function validateForm() {
    let isValid = true;
    const errors = {};

    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('visible');
        el.textContent = '';
    });
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(el => {
        el.classList.remove('error');
    });

    // Validate Name
    const name = document.getElementById('name');
    if (!name.value.trim()) {
        errors.name = 'Name is required';
        name.classList.add('error');
        isValid = false;
    }

    // Validate Phone
    const phone = document.getElementById('phone');
    if (!phone.value.trim()) {
        errors.phone = 'Phone is required';
        phone.classList.add('error');
        isValid = false;
    }

    // Validate Email
    const email = document.getElementById('email');
    if (!email.value.trim()) {
        errors.email = 'Email is required';
        email.classList.add('error');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        errors.email = 'Please enter a valid email address';
        email.classList.add('error');
        isValid = false;
    }

    // Display errors
    Object.keys(errors).forEach(field => {
        const errorEl = document.getElementById(`${field}-error`);
        if (errorEl) {
            errorEl.textContent = errors[field];
            errorEl.classList.add('visible');
        }
    });

    if (!isValid) {
        showFormErrorBanner();
    }

    return isValid;
}

function showFormErrorBanner() {
    let banner = document.querySelector('.form-error-banner');
    
    if (!banner) {
        banner = document.createElement('div');
        banner.className = 'form-error-banner';
        banner.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Please fix the errors in the form</span>
        `;
        
        const form = document.getElementById('create-lead-form');
        form.insertBefore(banner, form.firstChild);
    }
    
    banner.classList.add('visible');
}

async function submitForm() {
    const assignedToVal = document.getElementById('assigned-to').value;
    const payload = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        source: document.getElementById('source').value || 'other',
        status: document.getElementById('status').value || 'new',
        assigned_to: assignedToVal ? parseInt(assignedToVal) : null,
        note: document.getElementById('note').value.trim(),
        company: document.getElementById('company').value.trim(),
        website: document.getElementById('website').value.trim(),
        priority: document.getElementById('priority').value || 'medium',
        estimated_value: document.getElementById('estimated-value').value ? parseFloat(document.getElementById('estimated-value').value) : 0
    };

    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    try {
        await apiJson('/leads/', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        Toast.success('Lead created successfully!');
        
        setTimeout(() => {
            window.location.href = 'leads_list.html';
        }, 1000);
    } catch (error) {
        console.error('Create lead error:', error);
        let errorMsg = 'Lead yaratishda xatolik yuz berdi: ';
        if (error && typeof error === 'object') {
            for (let key in error) {
                errorMsg += `\n${key}: ${Array.isArray(error[key]) ? error[key].join(', ') : error[key]}`;
            }
        }
        Toast.error(errorMsg);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Lead';
    }
}

function cancelForm() {
    Modal.confirm({
        title: 'Cancel?',
        content: '<p>Are you sure you want to cancel? Any unsaved changes will be lost.</p>',
        confirmText: 'Yes, Cancel',
        cancelText: 'Continue Editing'
    }).then(confirmed => {
        if (confirmed) {
            window.location.href = 'leads_list.html';
        }
    });
}
