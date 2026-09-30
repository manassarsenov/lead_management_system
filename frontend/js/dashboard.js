// Dashboard Page JavaScript - Dynamic Backend Integration
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!localStorage.getItem('access_token')) {
        window.location.href = 'login.html';
        return;
    }

    // Load dynamic data
    loadDashboardData();

    // Initialize charts placeholders
    initLeadsTrendChart();
    initLeadSourcesChart();
});

async function loadDashboardData() {
    try {
        // 1. Fetch dashboard statistics from API (/api/v1/dashboard/stats/)
        const stats = await apiJson('/dashboard/stats/');
        
        document.getElementById('stat-total-leads').textContent = stats.total_leads ?? 0;
        document.getElementById('stat-new-leads').textContent = stats.status_breakdown?.new ?? 0;
        document.getElementById('stat-contacted-leads').textContent = stats.status_breakdown?.contacted ?? 0;
        document.getElementById('stat-qualified-leads').textContent = stats.status_breakdown?.qualified ?? 0;
        document.getElementById('stat-won-leads').textContent = stats.won_leads ?? 0;
        document.getElementById('stat-lost-leads').textContent = stats.status_breakdown?.lost ?? 0;

        // Update growth percentages dynamically
        function updateGrowthElement(elemId, value) {
            const elem = document.getElementById(elemId);
            if (!elem) return;
            const sign = value >= 0 ? '+' : '';
            elem.textContent = `${sign}${value}% vs last week`;
            elem.className = `stat-change ${value >= 0 ? 'positive' : 'negative'}`;
        }

        if (stats.growth) {
            updateGrowthElement('growth-total', stats.growth.total);
            updateGrowthElement('growth-new', stats.growth.new);
            updateGrowthElement('growth-contacted', stats.growth.contacted);
            updateGrowthElement('growth-qualified', stats.growth.qualified);
            updateGrowthElement('growth-won', stats.growth.won);
            updateGrowthElement('growth-lost', stats.growth.lost);
        }

        // 2. Fetch leads for recent leads table (/api/v1/leads/)
        const leads = await apiJson('/leads/');
        renderRecent_leads = leads.slice(0, 5);
        renderRecentLeads(leads.slice(0, 5)); // Show top 5 recent leads
    } catch (error) {
        console.error('Dashboard data load error:', error);
        Toast.error('Dashboard ma‘lumotlarini yuklashda xatolik yuz berdi.');
    }
}

function renderRecentLeads(leads) {
    const tbody = document.getElementById('recent-leads-tbody');
    if (!tbody) return;

    if (!leads || leads.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">Hozircha leadlar mavjud emas</td></tr>`;
        return;
    }

    tbody.innerHTML = leads.map(lead => {
        const initials = lead.name ? lead.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'LD';
        const dateStr = lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : '';
        const statusBadge = createStatusBadge ? createStatusBadge(lead.status) : `<span class="status-badge ${lead.status}">${lead.status}</span>`;

        return `
            <tr>
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
            loadDashboardData(); // Refresh dashboard stats and table
        } catch (error) {
            console.error('Delete error:', error);
            Toast.error('Leadni o‘chirishda xatolik yuz berdi.');
        }
    }
}

function initLeadsTrendChart() {
    const canvas = document.getElementById('leadsTrendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = 300;
    
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Leads Trend Chart (Dynamic)', canvas.width / 2, canvas.height / 2);
}

function initLeadSourcesChart() {
    const canvas = document.getElementById('leadSourcesChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = 300;
    
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Lead Sources Chart (Dynamic)', canvas.width / 2, canvas.height / 2);
}
