// Dashboard Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts (using Chart.js or similar library)
    // For now, we'll create placeholder charts
    initLeadsTrendChart();
    initLeadSourcesChart();
    
    // Handle action buttons
    initActionButtons();
});

function initLeadsTrendChart() {
    const canvas = document.getElementById('leadsTrendChart');
    if (!canvas) return;
    
    // TODO: Initialize Chart.js or similar library
    // For now, just show a placeholder
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = 300;
    
    // Draw placeholder chart
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Leads Trend Chart', canvas.width / 2, canvas.height / 2);
}

function initLeadSourcesChart() {
    const canvas = document.getElementById('leadSourcesChart');
    if (!canvas) return;
    
    // TODO: Initialize Chart.js or similar library
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = 300;
    
    // Draw placeholder chart
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Lead Sources Chart', canvas.width / 2, canvas.height / 2);
}

function initActionButtons() {
    // View button
    document.querySelectorAll('.action-btn[title="View"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const leadName = row.querySelector('.lead-name span').textContent;
            Toast.info(`Viewing ${leadName}`);
            // TODO: Navigate to lead detail page
        });
    });
    
    // Edit button
    document.querySelectorAll('.action-btn[title="Edit"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const leadName = row.querySelector('.lead-name span').textContent;
            Toast.info(`Editing ${leadName}`);
            // TODO: Open edit modal or navigate to edit page
        });
    });
    
    // Delete button
    document.querySelectorAll('.action-btn.danger').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const leadName = row.querySelector('.lead-name span').textContent;
            
            Modal.confirm({
                title: 'Delete Lead?',
                content: `<p>Are you sure you want to permanently delete <strong>${leadName}</strong>? This action cannot be undone.</p>`,
                confirmText: 'Delete Lead',
                cancelText: 'Cancel'
            }).then(confirmed => {
                if (confirmed) {
                    Toast.success('Lead deleted successfully');
                    // TODO: Call API to delete lead
                    row.remove();
                }
            });
        });
    });
}
