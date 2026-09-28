// Main Base JavaScript - Reusable Components

// Navigation configuration
const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>', href: 'dashboard.html' },
    { id: 'leads', label: 'Leads', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>', href: 'leads_list.html' },
    { id: 'create-lead', label: 'Create Lead', icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>', href: 'create_lead.html' },
    { id: 'reports', label: 'Reports', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>', href: 'reports.html' },
    { id: 'activity', label: 'Activity / History', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', href: 'activity.html' },
    { id: 'settings', label: 'Settings', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>', href: 'settings.html' }
];

// Initialize sidebar navigation
function initSidebar() {
    const sidebarNav = document.getElementById('sidebar-nav');
    if (!sidebarNav) return;

    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

    sidebarNav.innerHTML = navItems.map(item => `
        <a href="${item.href}" class="nav-item ${item.href === currentPage ? 'active' : ''}" data-page="${item.id}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${item.icon}
            </svg>
            ${item.label}
        </a>
    `).join('');
}

// Toggle sidebar on mobile
function initSidebarToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (!menuToggle || !sidebar) return;

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// Modal Component
const Modal = {
    show(options) {
        const container = document.getElementById('modal-container');
        if (!container) return;

        const { title, content, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', showClose = true } = options;

        container.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    ${showClose ? '<button class="modal-close" onclick="Modal.hide()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' : ''}
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="Modal.hide()">${cancelText}</button>
                    ${onConfirm ? `<button class="btn btn-primary" id="modal-confirm">${confirmText}</button>` : ''}
                </div>
            </div>
        `;

        container.classList.add('active');

        const confirmBtn = document.getElementById('modal-confirm');
        if (confirmBtn && onConfirm) {
            confirmBtn.addEventListener('click', () => {
                onConfirm();
                Modal.hide();
            });
        }

        if (onCancel) {
            const cancelBtn = container.querySelector('.btn-secondary');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', onCancel);
            }
        }
    },

    hide() {
        const container = document.getElementById('modal-container');
        if (container) {
            container.classList.remove('active');
            setTimeout(() => {
                container.innerHTML = '';
            }, 300);
        }
    },

    confirm(options) {
        return new Promise((resolve) => {
            this.show({
                ...options,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }
};

// Toast Component
const Toast = {
    show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

        container.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
    },

    success(message, duration) { this.show(message, 'success', duration); },
    error(message, duration) { this.show(message, 'error', duration); },
    warning(message, duration) { this.show(message, 'warning', duration); },
    info(message, duration) { this.show(message, 'info', duration); }
};

// Status Badge Component
function createStatusBadge(status) {
    const statusMap = {
        'new': { class: 'new', label: 'New' },
        'contacted': { class: 'contacted', label: 'Contacted' },
        'qualified': { class: 'qualified', label: 'Qualified' },
        'won': { class: 'won', label: 'Won' },
        'lost': { class: 'lost', label: 'Lost' }
    };

    const config = statusMap[status.toLowerCase()] || { class: 'new', label: status };
    return `<span class="status-badge ${config.class}">${config.label}</span>`;
}

// User Profile Dropdown
function initUserProfile() {
    const userProfile = document.getElementById('user-profile');
    if (!userProfile) return;

    userProfile.addEventListener('click', () => {
        // Toggle dropdown menu
        const existingDropdown = document.querySelector('.user-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-menu">
                <a href="settings.html" class="dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Profile
                </a>
                <a href="#" class="dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                    Logout
                </a>
            </div>
        `;

        userProfile.appendChild(dropdown);

        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeDropdown(e) {
                if (!userProfile.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        }, 0);
    });
}

// Global Search
function initGlobalSearch() {
    const searchInput = document.getElementById('global-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        // TODO: Implement search functionality
        console.log('Search:', query);
    });
}

// Initialize all components
document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initSidebarToggle();
    initUserProfile();
    initGlobalSearch();
});

// Export components for use in other files
window.Modal = Modal;
window.Toast = Toast;
window.createStatusBadge = createStatusBadge;
