// Leads Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadLeads();
    initFilters();
    initSelectAll();
});

// Sample leads data
const leadsData = [
    { id: 1, name: 'Ali Rahimov', initials: 'AR', phone: '+998 90 123 45 67', email: 'ali@example.com', source: 'Website', status: 'qualified', created: 'Apr 25, 2025' },
    { id: 2, name: 'Sarah Karimova', initials: 'SK', phone: '+998 91 234 56 78', email: 'sarah@example.com', source: 'Social Media', status: 'new', created: 'Apr 26, 2025' },
    { id: 3, name: 'John Toshmatov', initials: 'JT', phone: '+998 93 456 78 90', email: 'john@example.com', source: 'Referral', status: 'contacted', created: 'Apr 27, 2025' },
    { id: 4, name: 'Maryam Ahmedova', initials: 'MA', phone: '+998 94 567 89 01', email: 'maryam@example.com', source: 'Cold Call', status: 'won', created: 'Apr 24, 2025' },
    { id: 5, name: 'Bobur Nazarov', initials: 'BN', phone: '+998 95 678 90 12', email: 'bobur@example.com', source: 'Website', status: 'lost', created: 'Apr 23, 2025' },
    { id: 6, name: 'Nilufar Rahimova', initials: 'NR', phone: '+998 97 890 12 34', email: 'nilufar@example.com', source: 'Social Media', status: 'qualified', created: 'Apr 22, 2025' },
    { id: 7, name: 'Jamshid Ismailov', initials: 'JI', phone: '+998 98 901 23 45', email: 'jamshid@example.com', source: 'Other', status: 'new', created: 'Apr 21, 2025' },
    { id: 8, name: 'Zarina Karimova', initials: 'ZK', phone: '+998 99 012 34 56', email: 'zarina@example.com', source: 'Referral', status: 'contacted', created: 'Apr 20, 2025' },
];

function loadLeads() {
    const tbody = document.getElementById('leads-table-body');
    if (!tbody) return;

    tbody.innerHTML = leadsData.map(lead => `
        <tr>
            <td>
                <input type="checkbox" class="checkbox lead-checkbox" data-id="${lead.id}">
            </td>
            <td>
                <div class="lead-name">
                    <div class="lead-avatar">${lead.initials}</div>
                    <span>${lead.name}</span>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <span>${lead.phone}</span>
                    <span>${lead.email}</span>
                </div>
            </td>
            <td>${lead.source}</td>
            <td>${createStatusBadge(lead.status)}</td>
            <td>${lead.created}</td>
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
                    <button class="action-btn danger" title="Delete" onclick="deleteLead(${lead.id}, '${lead.name}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function initFilters() {
    const sourceFilter = document.getElementById('source-filter');
    const statusFilter = document.getElementById('status-filter');

    if (sourceFilter) {
        sourceFilter.addEventListener('change', filterLeads);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', filterLeads);
    }
}

function filterLeads() {
    const sourceFilter = document.getElementById('source-filter');
    const statusFilter = document.getElementById('status-filter');

    const sourceValue = sourceFilter ? sourceFilter.value.toLowerCase() : '';
    const statusValue = statusFilter ? statusFilter.value.toLowerCase() : '';

    const filteredLeads = leadsData.filter(lead => {
        const matchSource = !sourceValue || lead.source.toLowerCase().includes(sourceValue);
        const matchStatus = !statusValue || lead.status.toLowerCase() === statusValue;
        return matchSource && matchStatus;
    });

    const tbody = document.getElementById('leads-table-body');
    if (filteredLeads.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>
                        <p class="empty-title">No leads found</p>
                        <p class="empty-message">Try adjusting your filters</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = filteredLeads.map(lead => `
            <tr>
                <td>
                    <input type="checkbox" class="checkbox lead-checkbox" data-id="${lead.id}">
                </td>
                <td>
                    <div class="lead-name">
                        <div class="lead-avatar">${lead.initials}</div>
                        <span>${lead.name}</span>
                    </div>
                </td>
                <td>
                    <div class="contact-info">
                        <span>${lead.phone}</span>
                        <span>${lead.email}</span>
                    </div>
                </td>
                <td>${lead.source}</td>
                <td>${createStatusBadge(lead.status)}</td>
                <td>${lead.created}</td>
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
                        <button class="action-btn danger" title="Delete" onclick="deleteLead(${lead.id}, '${lead.name}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function initSelectAll() {
    const selectAll = document.getElementById('select-all');
    if (!selectAll) return;

    selectAll.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.lead-checkbox');
        checkboxes.forEach(cb => cb.checked = this.checked);
    });
}

function viewLead(id) {
    const lead = leadsData.find(l => l.id === id);
    if (lead) {
        Toast.info(`Viewing ${lead.name}`);
        // TODO: Navigate to lead detail page
        window.location.href = `lead-detail.html?id=${id}`;
    }
}

function editLead(id) {
    const lead = leadsData.find(l => l.id === id);
    if (lead) {
        Toast.info(`Editing ${lead.name}`);
        // TODO: Navigate to edit page or open modal
    }
}

function deleteLead(id, name) {
    Modal.confirm({
        title: 'Delete Lead?',
        content: `<p>Are you sure you want to permanently delete <strong>${name}</strong>? This action cannot be undone.</p>`,
        confirmText: 'Delete Lead',
        cancelText: 'Cancel'
    }).then(confirmed => {
        if (confirmed) {
            Toast.success('Lead deleted successfully');
            // TODO: Call API to delete lead
            const index = leadsData.findIndex(l => l.id === id);
            if (index > -1) {
                leadsData.splice(index, 1);
                loadLeads();
            }
        }
    });
}
