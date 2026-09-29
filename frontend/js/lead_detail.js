// Lead Detail Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initActivityTabs();
});

function initActivityTabs() {
    const tabs = document.querySelectorAll('.activity-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tabName = this.dataset.tab;
            // TODO: Load different content based on tab
            console.log('Switched to tab:', tabName);
        });
    });
}

function editLead() {
    Toast.info('Opening edit form...');
    // TODO: Navigate to edit page or open edit modal
}

function deleteLead() {
    Modal.confirm({
        title: 'Delete Lead?',
        content: '<p>Are you sure you want to permanently delete <strong>Ali Rahimov</strong>? This action cannot be undone.</p>',
        confirmText: 'Delete Lead',
        cancelText: 'Cancel'
    }).then(confirmed => {
        if (confirmed) {
            Toast.success('Lead deleted successfully');
            // TODO: Call API to delete lead
            window.location.href = 'leads_list.html';
        }
    });
}

function changeStatus() {
    const statusSelect = document.getElementById('status-select');
    const newStatus = statusSelect.value;
    
    Toast.success(`Status changed to ${newStatus}`);
    // TODO: Call API to update status
}

function callLead() {
    Toast.info('Initiating call...');
    // TODO: Implement call functionality
}

function sendEmail() {
    Toast.info('Opening email composer...');
    // TODO: Implement email functionality
}

function addNote() {
    Modal.show({
        title: 'Add Note',
        content: `
            <div class="form-group">
                <label for="note-content">Note</label>
                <textarea id="note-content" rows="4" placeholder="Enter your note..." style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; font-family: inherit; resize: vertical;"></textarea>
            </div>
        `,
        confirmText: 'Save Note',
        onConfirm: () => {
            const noteContent = document.getElementById('note-content').value;
            if (noteContent.trim()) {
                Toast.success('Note added successfully');
                // TODO: Call API to add note
            } else {
                Toast.error('Please enter a note');
            }
        }
    });
}

function markAsLost() {
    Modal.confirm({
        title: 'Mark as Lost?',
        content: '<p>Are you sure you want to mark this lead as lost?</p>',
        confirmText: 'Mark as Lost',
        cancelText: 'Cancel'
    }).then(confirmed => {
        if (confirmed) {
            Toast.success('Lead marked as lost');
            // TODO: Call API to update status
            const statusSelect = document.getElementById('status-select');
            statusSelect.value = 'lost';
        }
    });
}
