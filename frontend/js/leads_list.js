// Leads Page JavaScript - Dynamic Backend Integration
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('access_token')) {
        window.location.href = 'login.html';
        return;
    }

    loadLeads();
    initFilters();
    initSelectAll();
});

async function loadLeads() {
    const sourceFilter = document.getElementById('source-filter');
    const statusFilter = document.getElementById('status-filter');

    let url = '/leads/?';
    if (sourceFilter && sourceFilter.value) {
        url += `source=${encodeURIComponent(sourceFilter.value)}&`;
    }
    if (statusFilter && statusFilter.value) {
        url += `status=${encodeURIComponent(statusFilter.value)}&`;
    }

    try {
        const data = await apiJson(url);
        // DRF Pagination (PageNumberPagination) natijasini tekshiramiz: data.results yoki array
        const leads = Array.isArray(data) ? data : (data.results || []);
        const totalCount = data.count !== undefined ? data.count : leads.length;

        renderLeads(leads);
        updatePaginationInfo(totalCount);
    } catch (error) {
        console.error('Error loading leads:', error);
        Toast.error('Leadlarni yuklashda xatolik yuz berdi.');
    }
}

function renderLeads(leads) {
    const tbody = document.getElementById('leads-table-body');
    if (!tbody) return;

    if (!leads || leads.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state" style="padding: 40px; text-align: center;">
                        <div class="empty-icon" style="margin-bottom: 12px;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>
                        <p class="empty-title" style="font-weight: 600; font-size: 16px; color: var(--text-primary);">No leads found</p>
                        <p class="empty-message" style="color: var(--text-muted); font-size: 14px;">Try adjusting your filters or create a new lead</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = leads.map(lead => {
        const initials = lead.name ? lead.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'LD';
        const dateStr = lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : '';
        const statusBadge = createStatusBadge ? createStatusBadge(lead.status) : `<span class="status-badge ${lead.status}">${lead.status}</span>`;

        return `
            <tr>
                <td>
                    <input type="checkbox" class="checkbox lead-checkbox" data-id="${lead.id}">
                </td>
                <td>
                    <div class="lead-name">
                        <div class="lead-avatar">${initials}</div>
                        <span>${lead.name}</span>
                    </div>
                </td>
                <td>
                    <div class="contact-info">
                        <span>${lead.phone || '-'}</span>
                        <span>${lead.email || '-'}</span>
                    </div>
                </td>
                <td>${lead.source || '-'}</td>
                <td>${statusBadge}</td>
                <td>${dateStr}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" title="View" onclick="viewLead(${lead.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <button class="action-btn" title="Edit" onclick="editLead(${lead.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn danger" title="Delete" onclick="deleteLead(${lead.id}, '${lead.name.replace(/'/g, "\\'")}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function initFilters() {
    const sourceFilter = document.getElementById('source-filter');
    const statusFilter = document.getElementById('status-filter');

    if (sourceFilter) {
        sourceFilter.addEventListener('change', loadLeads);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', loadLeads);
    }
}

function updatePaginationInfo(totalCount) {
    const infoSpan = document.querySelector('.pagination-info span');
    if (infoSpan) {
        infoSpan.textContent = `Showing 1-${totalCount} of ${totalCount} leads`;
    }
}

function viewLead(id) {
    window.location.href = `lead_detail.html?id=${id}`;
}

function editLead(id) {
    window.location.href = `lead_detail.html?id=${id}&edit=true`;
}

async function deleteLead(id, name) {
    const confirmed = await Modal.confirm({
        title: 'Delete Lead?',
        content: `<p>Are you sure you want to permanently delete <strong>${name}</strong>? This action cannot be undone.</p>`,
        confirmText: 'Delete Lead',
        cancelText: 'Cancel'
    });

    if (confirmed) {
        try {
            await apiFetch(`/leads/${id}/`, { method: 'DELETE' });
            Toast.success('Lead deleted successfully');
            loadLeads();
        } catch (error) {
            console.error('Delete error:', error);
            Toast.error('Leadni o‘chirishda xatolik yuz berdi.');
        }
    }
}

function initSelectAll() {
    const selectAllCheckbox = document.getElementById('select-all');
    if (!selectAllCheckbox) return;

    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.lead-checkbox');
        checkboxes.forEach(cb => cb.checked = this.checked);
    });
}
