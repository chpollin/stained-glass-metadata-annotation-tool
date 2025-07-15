// ============================================================================
// STAINED GLASS DOCUMENTATION TOOL - TABLE VIEW MODULE
// ============================================================================

// Table state management
let currentTableSort = { column: null, direction: 'asc' };
let selectedWindows = new Set();
let currentTablePage = 1;
let itemsPerPage = 20;
let tableFilters = {
    country: '',
    material: '',
    dateRange: ''
};

// Initialize table functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeTableView();
});

function initializeTableView() {
    // Initialize filter dropdowns
    populateFilterDropdowns();
    
    // Add event listeners for filters
    document.getElementById('country-filter').addEventListener('change', applyFilters);
    document.getElementById('material-filter').addEventListener('change', applyFilters);
    document.getElementById('date-filter').addEventListener('change', applyFilters);
    
    console.log('Table view module initialized');
}

// ============================================================================
// FILTER MANAGEMENT
// ============================================================================

function populateFilterDropdowns() {
    const windows = window.appState.getWindows();
    
    // Populate country filter
    const countries = [...new Set(windows.map(w => w.country))].sort();
    const countrySelect = document.getElementById('country-filter');
    const currentCountry = countrySelect.value;
    
    // Clear existing options except "All Countries"
    countrySelect.innerHTML = '<option value="">All Countries</option>';
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        if (country === currentCountry) option.selected = true;
        countrySelect.appendChild(option);
    });
}

function applyFilters() {
    // Get current filter values
    tableFilters.country = document.getElementById('country-filter').value;
    tableFilters.material = document.getElementById('material-filter').value;
    tableFilters.dateRange = document.getElementById('date-filter').value;
    
    // Reset to first page when filters change
    currentTablePage = 1;
    
    // Update both table and card views
    loadTableData();
    updateCardViewWithFilters();
}

function updateCardViewWithFilters() {
    // Get filtered windows using the same logic as table view
    const filteredWindows = getFilteredWindows();
    
    // Update the global filteredWindows array so card view uses it
    if (typeof window.filteredWindows !== 'undefined') {
        window.filteredWindows = filteredWindows;
    }
    
    // Update the card view display
    updateCardViewDisplay(filteredWindows);
    
    // Update search status to reflect filters
    updateSearchStatusWithFilters();
}

function updateCardViewDisplay(filteredWindows) {
    const container = document.getElementById('windows-list');
    
    if (filteredWindows.length === 0) {
        const hasActiveFilters = tableFilters.country || tableFilters.material || tableFilters.dateRange;
        const searchInput = document.getElementById('search-input');
        const hasSearch = searchInput && searchInput.value.trim();
        
        let emptyMessage;
        if (hasActiveFilters || hasSearch) {
            emptyMessage = `<div class="empty-state">
                <h3>No windows found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button onclick="clearAllFilters()" class="btn-secondary">Clear All Filters</button>
            </div>`;
        } else {
            emptyMessage = `<div class="empty-state">
                <h3>No windows documented yet</h3>
                <p>Click "Add Window" to create your first record</p>
            </div>`;
        }
        
        container.innerHTML = emptyMessage;
        return;
    }

    // Sort windows by last modified (newest first)
    const sortedWindows = [...filteredWindows].sort((a, b) => 
        new Date(b.lastModified) - new Date(a.lastModified)
    );

    // Use the image-enabled card display if available
    if (typeof updateWindowsListWithImages === 'function') {
        // Temporarily set the global filteredWindows for the image function
        const originalFiltered = window.filteredWindows;
        window.filteredWindows = sortedWindows;
        updateWindowsListWithImages();
        window.filteredWindows = originalFiltered;
    } else {
        // Fallback to basic card display
        container.innerHTML = sortedWindows.map(window => `
            <div class="window-card" data-id="${window.id}">
                <div class="window-content">
                    <h3>${escapeHtml(window.title)}</h3>
                    <div class="window-meta">
                        <strong>Location:</strong> ${escapeHtml(window.building)}, ${escapeHtml(window.city)}, ${escapeHtml(window.country)}
                        ${window.specificLocation ? `<br><strong>Specific Location:</strong> ${escapeHtml(window.specificLocation)}` : ''}
                        <br><strong>Date:</strong> ${escapeHtml(window.date)}
                        <br><strong>Materials:</strong> ${window.materials.map(m => escapeHtml(m)).join(', ')}
                        ${window.width && window.height ? `<br><strong>Dimensions:</strong> ${window.width} × ${window.height} ${window.dimensionUnit}` : ''}
                        ${window.description ? `<br><strong>Description:</strong> ${escapeHtml(window.description.substring(0, 150))}${window.description.length > 150 ? '...' : ''}` : ''}
                        ${window.subjectTags ? `<br><strong>Tags:</strong> ${escapeHtml(window.subjectTags)}` : ''}
                    </div>
                    <div class="window-actions">
                        <button onclick="editWindow('${window.id}')">Edit</button>
                        <button class="btn-danger" onclick="deleteWindow('${window.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function updateSearchStatusWithFilters() {
    const statusElement = document.getElementById('search-status');
    if (!statusElement) return;
    
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    const filteredWindows = getFilteredWindows();
    
    // Build status message
    let statusParts = [];
    
    if (searchTerm) {
        statusParts.push(`"${searchTerm}"`);
    }
    
    if (tableFilters.country) {
        statusParts.push(`Country: ${tableFilters.country}`);
    }
    
    if (tableFilters.material) {
        statusParts.push(`Material: ${tableFilters.material}`);
    }
    
    if (tableFilters.dateRange) {
        const dateRangeLabels = {
            'medieval': 'Medieval (pre-1500)',
            'renaissance': 'Renaissance (1500-1650)',
            'baroque': 'Baroque (1650-1750)',
            'modern': 'Modern (1750+)'
        };
        statusParts.push(`Period: ${dateRangeLabels[tableFilters.dateRange] || tableFilters.dateRange}`);
    }
    
    if (statusParts.length > 0) {
        const resultCount = filteredWindows.length;
        statusElement.textContent = `${resultCount} result${resultCount !== 1 ? 's' : ''} for ${statusParts.join(', ')}`;
        statusElement.style.display = 'block';
    } else {
        statusElement.style.display = 'none';
    }
}

function clearAllFilters() {
    // Clear all filter dropdowns
    document.getElementById('country-filter').value = '';
    document.getElementById('material-filter').value = '';
    document.getElementById('date-filter').value = '';
    
    // Clear search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
        // Hide search clear button
        const clearButton = document.querySelector('.search-clear');
        if (clearButton) {
            clearButton.style.display = 'none';
        }
    }
    
    // Reset filter state
    tableFilters.country = '';
    tableFilters.material = '';
    tableFilters.dateRange = '';
    currentTablePage = 1;
    
    // Update both views
    loadTableData();
    updateCardViewWithFilters();
}

function getFilteredWindows() {
    let windows = window.appState.getWindows();
    
    // Get current search term from the search input
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Apply search filter first (if active)
    if (searchTerm) {
        windows = windows.filter(window => 
            window.title.toLowerCase().includes(searchTerm) ||
            window.building.toLowerCase().includes(searchTerm) ||
            window.city.toLowerCase().includes(searchTerm) ||
            window.country.toLowerCase().includes(searchTerm) ||
            (window.description && window.description.toLowerCase().includes(searchTerm)) ||
            (window.subjectTags && window.subjectTags.toLowerCase().includes(searchTerm)) ||
            (window.specificLocation && window.specificLocation.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply country filter
    if (tableFilters.country) {
        windows = windows.filter(w => w.country === tableFilters.country);
    }
    
    // Apply material filter
    if (tableFilters.material) {
        windows = windows.filter(w => w.materials.includes(tableFilters.material));
    }
    
    // Apply date range filter
    if (tableFilters.dateRange) {
        windows = windows.filter(w => {
            const date = w.date.toLowerCase();
            switch (tableFilters.dateRange) {
                case 'medieval':
                    return date.includes('medieval') || 
                           date.includes('12th') || date.includes('13th') || date.includes('14th') || date.includes('15th') ||
                           (date.match(/\d{4}/) && parseInt(date.match(/\d{4}/)[0]) < 1500);
                case 'renaissance':
                    return date.includes('renaissance') || 
                           date.includes('16th') || date.includes('17th') ||
                           (date.match(/\d{4}/) && parseInt(date.match(/\d{4}/)[0]) >= 1500 && parseInt(date.match(/\d{4}/)[0]) < 1650);
                case 'baroque':
                    return date.includes('baroque') || 
                           date.includes('17th') || date.includes('18th') ||
                           (date.match(/\d{4}/) && parseInt(date.match(/\d{4}/)[0]) >= 1650 && parseInt(date.match(/\d{4}/)[0]) < 1750);
                case 'modern':
                    return date.includes('modern') || 
                           date.includes('19th') || date.includes('20th') || date.includes('21st') ||
                           (date.match(/\d{4}/) && parseInt(date.match(/\d{4}/)[0]) >= 1750);
                default:
                    return true;
            }
        });
    }
    
    return windows;
}

// ============================================================================
// TABLE DATA LOADING
// ============================================================================

function loadTableData(sortConfig = null, page = null) {
    // Update sort configuration
    if (sortConfig) {
        currentTableSort = sortConfig;
    }
    
    // Update page
    if (page) {
        currentTablePage = page;
    }
    
    // Get filtered windows
    let windows = getFilteredWindows();
    
    // Apply sorting
    if (currentTableSort.column) {
        windows = sortWindowsArray(windows, currentTableSort.column, currentTableSort.direction);
    }
    
    // Calculate pagination
    const totalWindows = windows.length;
    const totalPages = Math.ceil(totalWindows / itemsPerPage);
    const startIndex = (currentTablePage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalWindows);
    const pageWindows = windows.slice(startIndex, endIndex);
    
    // Update table body
    populateTableBody(pageWindows);
    
    // Update pagination controls
    updatePaginationControls(currentTablePage, totalPages, totalWindows);
    
    // Update filter dropdowns (in case data changed)
    populateFilterDropdowns();
    
    // Clear selection when data changes
    selectedWindows.clear();
    updateBulkActionsVisibility();
}

function sortWindowsArray(windows, column, direction) {
    return windows.sort((a, b) => {
        let aValue, bValue;
        
        switch (column) {
            case 'title':
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
            case 'location':
                aValue = `${a.building}, ${a.city}, ${a.country}`.toLowerCase();
                bValue = `${b.building}, ${b.city}, ${b.country}`.toLowerCase();
                break;
            case 'date':
                // Try to extract year for better sorting
                const aYear = extractYear(a.date);
                const bYear = extractYear(b.date);
                if (aYear && bYear) {
                    aValue = aYear;
                    bValue = bYear;
                } else {
                    aValue = a.date.toLowerCase();
                    bValue = b.date.toLowerCase();
                }
                break;
            case 'materials':
                aValue = a.materials.join(', ').toLowerCase();
                bValue = b.materials.join(', ').toLowerCase();
                break;
            case 'modified':
                aValue = new Date(a.lastModified);
                bValue = new Date(b.lastModified);
                break;
            default:
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
        }
        
        if (direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });
}

function extractYear(dateString) {
    const yearMatch = dateString.match(/\d{4}/);
    return yearMatch ? parseInt(yearMatch[0]) : null;
}

function populateTableBody(windows) {
    const tbody = document.getElementById('table-body');
    
    if (windows.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    <div class="empty-state">
                        <h3>No windows found</h3>
                        <p>Try adjusting your filters or search terms</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = windows.map(window => `
        <tr data-window-id="${window.id}">
            <td class="col-select">
                <input type="checkbox" 
                       class="bulk-select" 
                       data-window-id="${window.id}"
                       onchange="toggleRowSelection('${window.id}', this.checked)"
                       aria-label="Select ${escapeHtml(window.title)}">
            </td>
            <td class="col-title">
                <div class="table-title">${escapeHtml(window.title)}</div>
                ${window.alternativeTitles ? `<div class="table-subtitle">${escapeHtml(window.alternativeTitles)}</div>` : ''}
            </td>
            <td class="col-location">
                <div class="table-location">${escapeHtml(window.building)}</div>
                <div class="table-address">${escapeHtml(window.city)}, ${escapeHtml(window.country)}</div>
                ${window.specificLocation ? `<div class="table-specific">${escapeHtml(window.specificLocation)}</div>` : ''}
            </td>
            <td class="col-date">
                <div class="table-date">${escapeHtml(window.date)}</div>
                <div class="table-modified">Modified: ${formatDate(window.lastModified)}</div>
            </td>
            <td class="col-materials">
                <div class="table-materials">${window.materials.map(m => `<span class="material-tag">${escapeHtml(m)}</span>`).join('')}</div>
            </td>
            <td class="col-actions">
                <div class="btn-group">
                    <button onclick="editWindow('${window.id}')" class="btn-sm" title="Edit window">
                        <span aria-hidden="true">✏️</span>
                    </button>
                    <button onclick="deleteWindow('${window.id}')" class="btn-danger btn-sm" title="Delete window">
                        <span aria-hidden="true">🗑️</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

// ============================================================================
// PAGINATION CONTROLS
// ============================================================================

function updatePaginationControls(currentPage, totalPages, totalItems) {
    // Update pagination info
    const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    
    document.getElementById('pagination-info').textContent = 
        `Showing ${start}-${end} of ${totalItems} windows`;
    
    // Update previous/next buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    
    // Update page numbers
    const pageNumbers = document.getElementById('page-numbers');
    pageNumbers.innerHTML = generatePageNumbers(currentPage, totalPages);
}

function generatePageNumbers(currentPage, totalPages) {
    if (totalPages <= 1) return '';
    
    const pages = [];
    const maxPagesToShow = 7;
    
    if (totalPages <= maxPagesToShow) {
        // Show all pages
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        // Show smart pagination
        if (currentPage <= 4) {
            // Show first 5 pages + ... + last page
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
            // Show first page + ... + last 5 pages
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            // Show first + ... + current-1, current, current+1 + ... + last
            pages.push(1);
            pages.push('...');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        }
    }
    
    return pages.map(page => {
        if (page === '...') {
            return '<span class="page-ellipsis">...</span>';
        } else if (page === currentPage) {
            return `<button class="btn-sm active" disabled>${page}</button>`;
        } else {
            return `<button class="btn-sm" onclick="goToPage(${page})">${page}</button>`;
        }
    }).join('');
}

function previousPage() {
    if (currentTablePage > 1) {
        currentTablePage--;
        loadTableData();
    }
}

function nextPage() {
    const totalWindows = getFilteredWindows().length;
    const totalPages = Math.ceil(totalWindows / itemsPerPage);
    
    if (currentTablePage < totalPages) {
        currentTablePage++;
        loadTableData();
    }
}

function goToPage(page) {
    currentTablePage = page;
    loadTableData();
}

// ============================================================================
// SELECTION MANAGEMENT
// ============================================================================

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('select-all');
    const rowCheckboxes = document.querySelectorAll('#table-body .bulk-select');
    
    selectedWindows.clear();
    
    if (selectAllCheckbox.checked) {
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
            selectedWindows.add(checkbox.dataset.windowId);
        });
    } else {
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    updateBulkActionsVisibility();
}

function toggleRowSelection(windowId, checked) {
    if (checked) {
        selectedWindows.add(windowId);
    } else {
        selectedWindows.delete(windowId);
    }
    
    updateBulkActionsVisibility();
    updateSelectAllState();
}

function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('select-all');
    const rowCheckboxes = document.querySelectorAll('#table-body .bulk-select');
    const checkedCount = Array.from(rowCheckboxes).filter(cb => cb.checked).length;
    
    if (checkedCount === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (checkedCount === rowCheckboxes.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.checked = false;
    }
}

function updateBulkActionsVisibility() {
    const bulkActions = document.getElementById('bulk-actions');
    const selectedCount = document.getElementById('selected-count');
    
    if (selectedWindows.size > 0) {
        bulkActions.style.display = 'flex';
        selectedCount.textContent = selectedWindows.size;
    } else {
        bulkActions.style.display = 'none';
    }
}

function clearSelection() {
    selectedWindows.clear();
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    updateBulkActionsVisibility();
}

// ============================================================================
// SORTING FUNCTIONALITY
// ============================================================================

function sortTable(column) {
    if (currentTableSort.column === column) {
        currentTableSort.direction = currentTableSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentTableSort.column = column;
        currentTableSort.direction = 'asc';
    }
    
    // Update header styling
    document.querySelectorAll('.data-table th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    const targetHeader = document.querySelector(`[onclick="sortTable('${column}')"]`);
    if (targetHeader) {
        targetHeader.classList.add(`sort-${currentTableSort.direction}`);
    }
    
    // Reset to first page when sorting changes
    currentTablePage = 1;
    
    // Reload table data with new sort
    loadTableData();
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

function exportSelected() {
    if (selectedWindows.size === 0) {
        window.appState.showStatus('No windows selected for export.', 'error');
        return;
    }
    
    document.getElementById('export-count').textContent = selectedWindows.size;
    const modal = document.getElementById('export-modal');
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
}

function deleteSelected() {
    if (selectedWindows.size === 0) {
        window.appState.showStatus('No windows selected for deletion.', 'error');
        return;
    }
    
    document.getElementById('bulk-delete-count').textContent = selectedWindows.size;
    const modal = document.getElementById('bulk-delete-modal');
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
}

function exportSelectedAs(format) {
    const allWindows = window.appState.getWindows();
    const selectedWindowsData = allWindows.filter(w => selectedWindows.has(w.id));
    
    if (selectedWindowsData.length === 0) {
        window.appState.showStatus('No windows found for export.', 'error');
        closeModal();
        return;
    }
    
    // Create temporary export data
    const originalWindows = window.appState.getWindows();
    
    // Temporarily replace windows with selected ones
    window.appState.addWindows = (windows) => {
        // Override the function temporarily
        return selectedWindowsData;
    };
    
    if (format === 'json') {
        exportSelectedJSON(selectedWindowsData);
    } else if (format === 'csv') {
        exportSelectedCSV(selectedWindowsData);
    }
    
    closeModal();
    window.appState.showStatus(`Successfully exported ${selectedWindowsData.length} selected windows!`, 'success');
}

function exportSelectedJSON(windowsData) {
    const jsonLD = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": "Selected Stained Glass Windows",
        "description": `Selected stained glass windows exported from the Stained Glass Documentation Tool`,
        "dateCreated": new Date().toISOString(),
        "creator": {
            "@type": "SoftwareApplication",
            "name": "Stained Glass Documentation Tool",
            "version": "2.0"
        },
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "keywords": ["stained glass", "cultural heritage", "art history", "documentation"],
        "hasPart": windowsData.map(window => transformWindowToSchemaOrg(window))
    };
    
    // Use the same transform function from import-export.js
    const cleanedJsonLD = removeUndefinedValues(jsonLD);
    
    downloadFile(
        JSON.stringify(cleanedJsonLD, null, 2),
        `selected-stained-glass-windows-${new Date().toISOString().split('T')[0]}.json`,
        'application/ld+json'
    );
}

function exportSelectedCSV(windowsData) {
    const csvHeaders = [
        'Title', 'Alternative Titles', 'Building', 'City', 'Country',
        'Specific Location', 'Date', 'Materials', 'Width', 'Height',
        'Dimension Unit', 'Description', 'Subject Tags', 'Image URL',
        'Created', 'Last Modified', 'Palissy ID', 'Wikidata ID'
    ];

    const csvRows = windowsData.map(window => [
        escapeCSVField(window.title),
        escapeCSVField(window.alternativeTitles),
        escapeCSVField(window.building),
        escapeCSVField(window.city),
        escapeCSVField(window.country),
        escapeCSVField(window.specificLocation),
        escapeCSVField(window.date),
        escapeCSVField(window.materials ? window.materials.join('; ') : ''),
        escapeCSVField(window.width),
        escapeCSVField(window.height),
        escapeCSVField(window.dimensionUnit),
        escapeCSVField(window.description),
        escapeCSVField(window.subjectTags),
        escapeCSVField(window.imageUrl),
        escapeCSVField(window.created),
        escapeCSVField(window.lastModified),
        escapeCSVField(window.palissy_id),
        escapeCSVField(window.wikidataId)
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    
    downloadFile(
        csvContent,
        `selected-stained-glass-windows-${new Date().toISOString().split('T')[0]}.csv`,
        'text/csv'
    );
}

function deleteWindowsSubset(windowIds) {
    // Get current windows
    const currentWindows = window.appState.getWindows();
    
    // Filter out deleted windows
    const remainingWindows = currentWindows.filter(w => !windowIds.includes(w.id));
    
    // Update the global windows array (need to access from app.js)
    if (typeof window.windows !== 'undefined') {
        window.windows = remainingWindows;
        window.filteredWindows = remainingWindows;
    }
    
    // Save to localStorage
    window.appState.saveData();
    
    // Update displays
    window.appState.updateDisplay();
}

// Fix the bulk delete function
function confirmBulkDelete() {
    const windowIds = Array.from(selectedWindows);
    
    // Call the delete function
    deleteWindowsSubset(windowIds);
    
    clearSelection();
    closeModal();
    
    // Refresh table view
    loadTableData();
    
    window.appState.showStatus(`Successfully deleted ${windowIds.length} windows.`, 'success');
}

// ============================================================================
// VIEW INTEGRATION
// ============================================================================

function loadCardData() {
    // Refresh the card view by applying current filters
    updateCardViewWithFilters();
}

function toggleView(viewType) {
    const tableView = document.getElementById('data-table-view');
    const cardView = document.getElementById('windows-list');
    const tableBtn = document.getElementById('table-view-btn');
    const cardBtn = document.getElementById('card-view-btn');
    
    if (viewType === 'table') {
        tableView.style.display = 'block';
        cardView.style.display = 'none';
        tableBtn.classList.add('active');
        cardBtn.classList.remove('active');
        
        // Load table data with current filters
        loadTableData();
    } else {
        tableView.style.display = 'none';
        cardView.style.display = 'grid';
        cardBtn.classList.add('active');
        tableBtn.classList.remove('active');
        
        // Refresh card view with current filters
        loadCardData();
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function escapeCSVField(value) {
    if (!value) return '';
    const stringValue = String(value);
    
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    
    return stringValue;
}

function removeUndefinedValues(obj) {
    if (Array.isArray(obj)) {
        return obj.map(removeUndefinedValues);
    } else if (obj !== null && typeof obj === 'object') {
        const result = {};
        for (const key in obj) {
            if (obj[key] !== undefined) {
                result[key] = removeUndefinedValues(obj[key]);
            }
        }
        return result;
    }
    return obj;
}

function transformWindowToSchemaOrg(window) {
    const schemaWindow = {
        "@type": "VisualArtwork",
        "name": window.title,
        "alternateName": window.alternativeTitles ? 
            window.alternativeTitles.split(',').map(t => t.trim()).filter(t => t) : undefined,
        "artform": "Stained Glass Window",
        "dateCreated": window.date,
        "material": window.materials,
        "description": window.description,
        "keywords": window.subjectTags ? 
            window.subjectTags.split(',').map(t => t.trim()).filter(t => t) : undefined,
        "locationCreated": {
            "@type": "Place",
            "name": window.building,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": window.city,
                "addressCountry": window.country
            }
        },
        "contentLocation": window.specificLocation,
        "width": window.width ? {
            "@type": "QuantitativeValue",
            "value": parseFloat(window.width),
            "unitText": window.dimensionUnit
        } : undefined,
        "height": window.height ? {
            "@type": "QuantitativeValue",
            "value": parseFloat(window.height),
            "unitText": window.dimensionUnit
        } : undefined,
        "image": window.imageUrl ? {
            "@type": "ImageObject",
            "url": window.imageUrl,
            "contentUrl": window.imageUrl
        } : undefined,
        "dateModified": window.lastModified,
        "dateCreated": window.created,
        "identifier": window.id
    };

    // Add Wikidata properties if available
    if (window.wikidataId) {
        schemaWindow.sameAs = window.wikidataId;
    }
    
    if (window.palissy_id) {
        schemaWindow.identifier = [
            { "@type": "PropertyValue", "name": "Internal ID", "value": window.id },
            { "@type": "PropertyValue", "name": "Palissy ID", "value": window.palissy_id }
        ];
    }

    return schemaWindow;
}

// ============================================================================
// GLOBAL EXPORTS
// ============================================================================

// Export functions for global access
window.loadTableData = loadTableData;
window.loadCardData = loadCardData;
window.toggleView = toggleView;
window.applyFilters = applyFilters;
window.clearAllFilters = clearAllFilters;
window.updateCardViewWithFilters = updateCardViewWithFilters;
window.sortTable = sortTable;
window.previousPage = previousPage;
window.nextPage = nextPage;
window.goToPage = goToPage;
window.toggleSelectAll = toggleSelectAll;
window.toggleRowSelection = toggleRowSelection;
window.clearSelection = clearSelection;
window.exportSelected = exportSelected;
window.deleteSelected = deleteSelected;
window.exportSelectedAs = exportSelectedAs;
window.confirmBulkDelete = confirmBulkDelete;
window.deleteWindowsSubset = deleteWindowsSubset;