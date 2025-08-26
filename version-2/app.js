/**
 * CVMA Annotation Tool - MVP
 * Main application logic
 */

// Global state
let allItems = {};
let filteredItems = [];
let currentView = 'grid';
let currentPage = 1;
let itemsPerPage = 50;

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Close modal on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Load and process data
async function loadData() {
    try {
        showLoading(true);
        
        const response = await fetch('data/cvma-processed.json');
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.status}`);
        }
        
        const data = await response.json();
        allItems = data.items;
        
        // Convert to array for easier manipulation
        filteredItems = Object.values(allItems);
        
        // Update stats
        updateStats();
        
        // Initial render
        renderItems();
        
        showLoading(false);
    } catch (error) {
        showError(`Error loading data: ${error.message}`);
        showLoading(false);
    }
}

// Show/hide loading state
function showLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
}

// Show error message
function showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    setTimeout(() => {
        errorEl.classList.add('hidden');
    }, 5000);
}

// Update statistics
function updateStats() {
    document.getElementById('totalItems').textContent = Object.keys(allItems).length.toLocaleString();
    document.getElementById('filteredItems').textContent = filteredItems.length.toLocaleString();
    document.getElementById('currentPage').textContent = `${currentPage} / ${Math.ceil(filteredItems.length / itemsPerPage)}`;
}

// Perform search
function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!query) {
        clearSearch();
        return;
    }
    
    filteredItems = Object.values(allItems).filter(item => {
        // Search in multiple fields
        const searchFields = [
            item.id,
            item.label,
            item.period,
            item.creationPeriod
        ].filter(Boolean).map(f => String(f).toLowerCase());
        
        return searchFields.some(field => field.includes(query));
    });
    
    currentPage = 1;
    updateStats();
    renderItems();
}

// Clear search
function clearSearch() {
    document.getElementById('searchInput').value = '';
    filteredItems = Object.values(allItems);
    currentPage = 1;
    updateStats();
    renderItems();
}

// Set view mode
function setView(view) {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(view));
    });
    
    renderItems();
}

// Render items based on current view
function renderItems() {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageItems = filteredItems.slice(startIdx, endIdx);
    
    if (currentView === 'grid') {
        renderGridView(pageItems);
    } else {
        renderListView(pageItems);
    }
    
    renderPagination();
}

// Render grid view
function renderGridView(items) {
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    
    gridView.classList.remove('hidden');
    listView.classList.add('hidden');
    
    gridView.innerHTML = items.map(item => `
        <div class="item-card" onclick="showItemDetail('${item.id}')">
            ${item.image ? 
                `<img class="item-image" src="${item.image}" alt="${item.label}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 200%22%3E%3Crect fill=%22%23ecf0f1%22 width=%22300%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">` :
                `<div class="item-image" style="display:flex;align-items:center;justify-content:center;color:#999;">No Image</div>`
            }
            <div class="item-content">
                <div class="item-id">ID: ${item.id}</div>
                <div class="item-label">${item.label || 'Untitled'}</div>
                <div class="item-meta">
                    ${item.period ? `<span class="meta-badge">${item.period}</span>` : ''}
                    ${item.location?.geonameId ? `<span class="meta-badge">Location: ${item.location.geonameId}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Render list view
function renderListView(items) {
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    
    gridView.classList.add('hidden');
    listView.classList.remove('hidden');
    
    listView.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>ID</th>
                    <th>Label</th>
                    <th>Period</th>
                    <th>Location</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>
                            ${item.image ? 
                                `<img class="thumbnail" src="${item.image}" alt="${item.label}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22%3E%3Crect fill=%22%23ecf0f1%22 width=%2260%22 height=%2260%22/%3E%3C/svg%3E'">` :
                                `<div class="thumbnail" style="background:#ecf0f1;"></div>`
                            }
                        </td>
                        <td>${item.id}</td>
                        <td>${item.label || 'Untitled'}</td>
                        <td>${item.period || '-'}</td>
                        <td>${item.location?.geonameId || '-'}</td>
                        <td>
                            <button onclick="showItemDetail('${item.id}')">View</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Render pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.classList.add('hidden');
        return;
    }
    
    pagination.classList.remove('hidden');
    
    let html = '';
    
    // Previous button
    html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
    
    // Page numbers
    const maxButtons = 7;
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    if (startPage > 1) {
        html += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            html += `<span>...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span>...</span>`;
        }
        html += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    
    pagination.innerHTML = html;
}

// Go to specific page
function goToPage(page) {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    updateStats();
    renderItems();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show item detail modal
function showItemDetail(itemId) {
    const item = allItems[itemId];
    if (!item) return;
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = item.label || `Item ${itemId}`;
    
    // Build property list
    const properties = [];
    
    // Core properties
    properties.push(['ID', item.id]);
    properties.push(['Label', item.label || 'N/A']);
    properties.push(['Period', item.period || 'N/A']);
    
    if (item.creationPeriod) {
        properties.push(['Creation Period', item.creationPeriod]);
    }
    
    if (item.location) {
        const locText = typeof item.location === 'object' ? 
            `Geonames: ${item.location.geonameId}` : item.location;
        properties.push(['Location', locText]);
    }
    
    if (item.subject) {
        const subjectText = Array.isArray(item.subject) ? 
            item.subject.map(s => typeof s === 'object' ? s.code : s).join(', ') :
            (typeof item.subject === 'object' ? item.subject.code : item.subject);
        properties.push(['Subject', subjectText]);
    }
    
    if (item.license) {
        const licenseText = item.license.split('/').pop();
        properties.push(['License', licenseText]);
    }
    
    if (item.url) {
        properties.push(['Source URL', `<a href="${item.url}" target="_blank" style="color:#3498db;">${item.url}</a>`]);
    }
    
    // Build modal content
    modalBody.innerHTML = `
        ${item.image ? `<img class="detail-image" src="${item.image}" alt="${item.label}">` : ''}
        <div class="detail-properties">
            ${properties.map(([label, value]) => `
                <div class="property-row">
                    <div class="property-label">${label}:</div>
                    <div class="property-value">${value}</div>
                </div>
            `).join('')}
        </div>
        <div style="margin-top:20px;padding-top:20px;border-top:1px solid #dee2e6;">
            <h3 style="margin-bottom:10px;">Annotations</h3>
            <p style="color:#666;">Annotation features will be added in the next iteration.</p>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}