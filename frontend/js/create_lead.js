// Create Lead Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initForm();
    initCharacterCount();
});

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
    } else if (!/^\+?\d{9,15}$/.test(phone.value.replace(/\s/g, ''))) {
        errors.phone = 'Phone must be 9-15 digits';
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

    // Show error banner if there are errors
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

function submitForm() {
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        source: document.getElementById('source').value,
        status: document.getElementById('status').value,
        assignedTo: document.getElementById('assigned-to').value,
        note: document.getElementById('note').value,
        company: document.getElementById('company').value,
        website: document.getElementById('website').value,
        priority: document.getElementById('priority').value,
        estimatedValue: document.getElementById('estimated-value').value
    };

    console.log('Form data:', formData);

    // TODO: Call API to create lead
    Toast.success('Lead created successfully!');
    
    // Redirect to leads page after a short delay
    setTimeout(() => {
        window.location.href = 'leads_list.html';
    }, 1500);
}

function cancelForm() {
    Modal.confirm({
        title: 'Cancel?',
        content: '<p>Are you sure you want to cancel? Any unsaved changes will be lost.</p>',
        confirmText: 'Yes, Cancel',
        cancelText: 'No, Continue'
    }).then(confirmed => {
        if (confirmed) {
            window.location.href = 'leads_list.html';
        }
    });
}
