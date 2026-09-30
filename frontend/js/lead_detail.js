// Lead Detail Page JavaScript - Dynamic Backend Integration
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('access_token')) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('id');

    if (!leadId) {
        Toast.error('Lead ID topilmadi');
        setTimeout(() => window.location.href = 'leads_list.html', 1000);
        return;
    }

    loadLeadDetail(leadId);
    initActivityTabs(leadId);
});

let currentLead = null;

async function loadLeadDetail(leadId) {
    try {
        currentLead = await apiJson(`/leads/${leadId}/`);
        renderLeadDetail(currentLead);
        loadLeadActivities(leadId);
    } catch (error) {
        console.error('Error loading lead detail:', error);
        Toast.error('Lead ma‘lumotlarini yuklashda xatolik yuz berdi.');
    }
}

function renderLeadDetail(lead) {
    const initials = lead.name ? lead.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'LD';
    const dateStr = lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : '-';
    const lastContactedStr = lead.last_contacted ? new Date(lead.last_contacted).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : '-';

    document.getElementById('lead-avatar').textContent = initials;
    document.getElementById('lead-name').textContent = lead.name || '-';
    
    const badgeContainer = document.getElementById('lead-status-badge-container');
    if (badgeContainer) {
        badgeContainer.innerHTML = createStatusBadge ? createStatusBadge(lead.status) : `<span class="status-badge ${lead.status}">${lead.status}</span>`;
    }

    document.getElementById('lead-phone').textContent = lead.phone || '-';
    document.getElementById('lead-email').textContent = lead.email || '-';
    document.getElementById('lead-source').textContent = lead.source || '-';
    document.getElementById('lead-status').textContent = lead.status || '-';
    document.getElementById('lead-created').textContent = dateStr;
    document.getElementById('lead-last-contacted').textContent = lastContactedStr;
    
    const assignedName = lead.assigned_to_details ? `${lead.assigned_to_details.first_name || ''} ${lead.assigned_to_details.last_name || ''} (${lead.assigned_to_details.email})` : 'Unassigned';
    document.getElementById('lead-assigned').textContent = assignedName;

    const statusSelect = document.getElementById('status-select');
    if (statusSelect) {
        statusSelect.value = lead.status;
    }
}

async function loadLeadActivities(leadId) {
    try {
        const activities = await apiJson(`/activities/?lead=${leadId}`);
        const activityList = Array.isArray(activities) ? activities : (activities.results || []);
        
        const timeline = document.getElementById('activity-timeline');
        const countSpan = document.getElementById('activity-count');
        if (countSpan) countSpan.textContent = `${activityList.length} activities`;

        if (!timeline) return;

        if (activityList.length === 0) {
            timeline.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">Hozircha faolliklar mavjud emas</p>`;
            return;
        }

        timeline.innerHTML = activityList.map(act => {
            const dateStr = act.created_at ? new Date(act.created_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : '';
            const timeStr = act.created_at ? new Date(act.created_at).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}) : '';
            const userName = act.user_details ? `${act.user_details.first_name || ''} ${act.user_details.last_name || ''}` : 'System';

            return `
                <div class="timeline-item">
                    <div class="timeline-icon ${act.activity_type || 'note'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                        </svg>
                    </div>
                    <div class="timeline-content">
                        <p class="timeline-title">${act.title}</p>
                        <p class="timeline-description">${act.description || ''}</p>
                        <div class="timeline-meta">
                            <span class="timeline-date">${dateStr}</span>
                            <span class="timeline-time">${timeStr}</span>
                            <span class="timeline-user">by ${userName}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

function initActivityTabs(leadId) {
    const tabs = document.querySelectorAll('.activity-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tabName = this.dataset.tab;
            // Can filter activities based on tabName if needed
        });
    });
}

function editLead() {
    if (!currentLead) return;
    window.location.href = `create_lead.html?id=${currentLead.id}&edit=true`;
}

async function deleteLead() {
    if (!currentLead) return;
    const confirmed = await Modal.confirm({
        title: 'Delete Lead?',
        content: `<p>Are you sure you want to permanently delete <strong>${currentLead.name}</strong>? This action cannot be undone.</p>`,
        confirmText: 'Delete Lead',
        cancelText: 'Cancel'
    });

    if (confirmed) {
        try {
            await apiFetch(`/leads/${currentLead.id}/`, { method: 'DELETE' });
            Toast.success('Lead deleted successfully');
            window.location.href = 'leads_list.html';
        } catch (error) {
            console.error('Delete error:', error);
            Toast.error('Leadni o‘chirishda xatolik yuz berdi.');
        }
    }
}

async function changeStatus() {
    if (!currentLead) return;
    const statusSelect = document.getElementById('status-select');
    const newStatus = statusSelect.value;
    
    try {
        await apiJson(`/leads/${currentLead.id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        Toast.success(`Status changed to ${newStatus}`);
        loadLeadDetail(currentLead.id);
    } catch (error) {
        console.error('Status change error:', error);
        Toast.error('Statusni o‘zgartirishda xatolik yuz berdi.');
    }
}

function callLead() {
    if (!currentLead) return;
    Toast.info(`Initiating call to ${currentLead.phone || 'lead'}...`);
    createActivity('call', 'Phone Call', `Initiated call to ${currentLead.phone}`);
}

function sendEmail() {
    if (!currentLead) return;
    Toast.info(`Opening email composer for ${currentLead.email || 'lead'}...`);
    createActivity('email', 'Email Sent', `Sent email to ${currentLead.email}`);
}

function addNote() {
    if (!currentLead) return;
    Modal.show({
        title: 'Add Note',
        content: `
            <div class="form-group">
                <label for="note-content">Note</label>
                <textarea id="note-content" rows="4" placeholder="Enter your note..." style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; font-family: inherit; resize: vertical;"></textarea>
            </div>
        `,
        confirmText: 'Save Note',
        onConfirm: async () => {
            const noteContent = document.getElementById('note-content').value;
            if (noteContent.trim()) {
                try {
                    await apiJson('/activities/', {
                        method: 'POST',
                        body: JSON.stringify({
                            lead: currentLead.id,
                            activity_type: 'note',
                            title: 'Note Added',
                            description: noteContent.trim()
                        })
                    });
                    Toast.success('Note added successfully');
                    loadLeadActivities(currentLead.id);
                } catch (error) {
                    console.error('Add note error:', error);
                    Toast.error('Eslatma qo‘shishda xatolik yuz berdi.');
                }
            } else {
                Toast.error('Please enter a note');
            }
        }
    });
}

async function createActivity(type, title, description) {
    if (!currentLead) return;
    try {
        await apiJson('/activities/', {
            method: 'POST',
            body: JSON.stringify({
                lead: currentLead.id,
                activity_type: type,
                title: title,
                description: description
            })
        });
        loadLeadActivities(currentLead.id);
    } catch (error) {
        console.error('Activity creation error:', error);
    }
}

async function markAsLost() {
    if (!currentLead) return;
    const confirmed = await Modal.confirm({
        title: 'Mark as Lost?',
        content: '<p>Are you sure you want to mark this lead as lost?</p>',
        confirmText: 'Mark as Lost',
        cancelText: 'Cancel'
    });

    if (confirmed) {
        try {
            await apiJson(`/leads/${currentLead.id}/`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'lost' })
            });
            Toast.success('Lead marked as lost');
            loadLeadDetail(currentLead.id);
        } catch (error) {
            console.error('Mark as lost error:', error);
            Toast.error('Xatolik yuz berdi.');
        }
    }
}
