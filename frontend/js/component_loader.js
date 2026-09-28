// Component Loader - JavaScript orqali componentlarni yuklash
// Bu fayl barcha umumiy qismlarni (sidebar, header, modal, toast) yuklab beradi

document.addEventListener("DOMContentLoaded", function() {
    loadComponents();
});

async function loadComponents() {
    // Sidebar yuklash
    await loadComponent('sidebar-placeholder', 'components/sidebar.html');
    
    // Header yuklash
    await loadComponent('header-placeholder', 'components/header.html');
    
    // Modals yuklash
    await loadComponent('modals-placeholder', 'components/modals.html');
    
    // Toasts yuklash
    await loadComponent('toasts-placeholder', 'components/toasts.html');
    
    // Componentlar yuklangandan keyin main_base.js ni ishga tushirish
    if (typeof initMainBase === 'function') {
        initMainBase();
    }
}

function loadComponent(placeholderId, componentPath) {
    const placeholder = document.getElementById(placeholderId);
    
    if (!placeholder) {
        console.log(`Placeholder ${placeholderId} topilmadi, o'tkazib yuboriladi`);
        return Promise.resolve();
    }
    
    return fetch(componentPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            placeholder.innerHTML = data;
            console.log(`${componentPath} muvaffaqiyatli yuklandi`);
        })
        .catch(error => {
            console.error(`${componentPath} yuklashda xato:`, error);
            placeholder.innerHTML = `<div class="error">Component yuklashda xato: ${error.message}</div>`;
        });
}
