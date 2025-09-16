/**
 * CVMA Annotation Tool - MVP
 * Main application logic
 */

// Global state
let allItems = {};
let filteredItems = [];
let annotations = {}; // itemId -> array of annotations
let activeFilters = {
    periodFrom: '',
    periodTo: '',
    locations: [],
    subjects: [],
    elementTypes: []
}; // Active filter criteria
let availableFilters = {
    locations: new Set(),
    subjects: new Set(),
    elementTypes: new Set()
}; // Available filter options
let currentView = 'grid';
let currentPage = 1;
let itemsPerPage = 50;

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadAnnotations();
    loadFilters();
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
        
        // Build filter options
        buildFilterOptions();
        
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
                    ${getAnnotationCount(item.id) > 0 ? `<span class="meta-badge" style="background:#28a745;color:white;">${getAnnotationCount(item.id)} annotations</span>` : ''}
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
                            ${getAnnotationCount(item.id) > 0 ? `<span style="margin-left:8px;background:#28a745;color:white;padding:2px 6px;border-radius:3px;font-size:11px;">${getAnnotationCount(item.id)}</span>` : ''}
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
        const licenseText = typeof item.license === 'string' ? 
            item.license.split('/').pop() : item.license;
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
            <h3 style="margin-bottom:15px;">Annotations (${getAnnotationCount(itemId)})</h3>
            
            <!-- Annotation Form -->
            <div style="background:#f8f9fa;padding:15px;border-radius:6px;margin-bottom:15px;">
                <select id="annotationType" style="width:100%;padding:8px;margin-bottom:10px;border:1px solid #ddd;border-radius:4px;">
                    <option value="note">Note</option>
                    <option value="iconography">Iconography</option>
                    <option value="dating">Dating</option>
                    <option value="attribution">Attribution</option>
                    <option value="condition">Condition</option>
                    <option value="correction">Correction</option>
                </select>
                <textarea id="annotationContent" placeholder="Add your annotation..." 
                    style="width:100%;min-height:80px;padding:8px;border:1px solid #ddd;border-radius:4px;resize:vertical;font-family:inherit;"></textarea>
                <div style="margin-top:10px;">
                    <button onclick="submitAnnotation('${itemId}')" 
                        style="background:#28a745;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;margin-right:10px;">
                        Add Annotation
                    </button>
                    <button onclick="exportAnnotations()" 
                        style="background:#6c757d;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;">
                        Export All
                    </button>
                </div>
            </div>
            
            <!-- Annotation List -->
            <div id="annotationsList">
                ${renderAnnotationsList(itemId)}
            </div>
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

// === ANNOTATION SYSTEM ===

// Load annotations from localStorage
function loadAnnotations() {
    try {
        const saved = localStorage.getItem('cvma-annotations');
        if (saved) {
            annotations = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading annotations:', error);
        annotations = {};
    }
}

// Save annotations to localStorage
function saveAnnotations() {
    try {
        localStorage.setItem('cvma-annotations', JSON.stringify(annotations));
    } catch (error) {
        console.error('Error saving annotations:', error);
    }
}

// Add new annotation
function addAnnotation(itemId, type, content) {
    if (!annotations[itemId]) {
        annotations[itemId] = [];
    }
    
    const annotation = {
        id: generateId(),
        type: type,
        content: content.trim(),
        timestamp: Date.now(),
        author: 'User' // Can be enhanced later
    };
    
    annotations[itemId].push(annotation);
    saveAnnotations();
    return annotation;
}

// Delete annotation
function deleteAnnotation(itemId, annotationId) {
    if (!annotations[itemId]) return;
    
    annotations[itemId] = annotations[itemId].filter(ann => ann.id !== annotationId);
    if (annotations[itemId].length === 0) {
        delete annotations[itemId];
    }
    saveAnnotations();
}

// Edit annotation
function editAnnotation(itemId, annotationId, newContent) {
    if (!annotations[itemId]) return;
    
    const annotation = annotations[itemId].find(ann => ann.id === annotationId);
    if (annotation) {
        annotation.content = newContent.trim();
        annotation.timestamp = Date.now(); // Update timestamp
        saveAnnotations();
    }
}

// Get annotations for item
function getAnnotations(itemId) {
    return annotations[itemId] || [];
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get annotation count for item
function getAnnotationCount(itemId) {
    return annotations[itemId] ? annotations[itemId].length : 0;
}

// Export all annotations (legacy format)
function exportAnnotations() {
    // Default to simple format for backward compatibility
    exportAnnotationsSimple();
}

// Export in simple/legacy format
function exportAnnotationsSimple() {
    const exportData = {
        exported: new Date().toISOString(),
        version: '1.0',
        annotations: annotations
    };
    
    downloadJSON(exportData, `cvma-annotations-${new Date().toISOString().split('T')[0]}.json`);
}

// Export in CIDOC CRM format
function exportAnnotationsCIDOC() {
    const mapper = new CIDOCMapper();
    const validator = new CIDOCValidator();
    
    // Get only annotated items or all items based on user preference
    const itemsToExport = {};
    Object.keys(filteredItems).forEach(idx => {
        const item = filteredItems[idx];
        if (item && item.id) {
            itemsToExport[item.id] = item;
        }
    });
    
    const exportData = mapper.createExport(itemsToExport, annotations);
    
    // Validate the export
    const validationResult = validator.validate(exportData);
    if (!validationResult.valid) {
        console.warn('CIDOC CRM validation warnings:', validationResult);
        if (validationResult.errors.length > 0) {
            const proceed = confirm(
                `The CIDOC export has validation errors:\n\n${validationResult.errors.slice(0, 3).join('\n')}\n\nDo you want to export anyway?`
            );
            if (!proceed) return;
        }
    }
    
    downloadJSON(exportData, `cvma-cidoc-${new Date().toISOString().split('T')[0]}.json`);
}

// Export in combined format (both simple and CIDOC)
function exportAnnotationsCombined() {
    const mapper = new CIDOCMapper();
    
    // Get items to export
    const itemsToExport = {};
    Object.keys(filteredItems).forEach(idx => {
        const item = filteredItems[idx];
        if (item && item.id) {
            itemsToExport[item.id] = item;
        }
    });
    
    const exportData = {
        simple: {
            exported: new Date().toISOString(),
            version: '1.0',
            annotations: annotations
        },
        cidoc: mapper.createExport(itemsToExport, annotations)
    };
    
    downloadJSON(exportData, `cvma-combined-${new Date().toISOString().split('T')[0]}.json`);
}

// Helper function to download JSON
function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], 
        { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export with format selection
function exportWithFormat() {
    const formatSelect = document.querySelector('input[name="exportFormat"]:checked');
    const format = formatSelect ? formatSelect.value : 'simple';
    
    switch(format) {
        case 'cidoc':
            exportAnnotationsCIDOC();
            break;
        case 'combined':
            exportAnnotationsCombined();
            break;
        case 'simple':
        default:
            exportAnnotationsSimple();
            break;
    }
}

// Import annotations (handles both simple and CIDOC formats)
function importAnnotations(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Check if it's a combined format
            if (data.simple && data.simple.annotations) {
                importSimpleAnnotations(data.simple.annotations);
            }
            // Check if it's simple format
            else if (data.annotations) {
                importSimpleAnnotations(data.annotations);
            }
            // Check if it's CIDOC format
            else if (data['@context'] && data['@graph']) {
                importCIDOCAnnotations(data);
            }
            else {
                throw new Error('Unrecognized annotation format');
            }
            
            saveAnnotations();
            alert('Annotations imported successfully!');
            
            // Refresh the main view to show annotation counts
            renderItems();
            
            // Refresh current modal if open
            const modal = document.getElementById('modal');
            if (modal.style.display === 'block') {
                const currentItemId = getCurrentModalItemId();
                if (currentItemId) {
                    showItemDetail(currentItemId);
                }
            }
        } catch (error) {
            alert('Error importing annotations: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Import simple format annotations
function importSimpleAnnotations(importedAnnotations) {
    Object.keys(importedAnnotations).forEach(itemId => {
        if (!annotations[itemId]) {
            annotations[itemId] = [];
        }
        annotations[itemId] = [...annotations[itemId], ...importedAnnotations[itemId]];
    });
}

// Import CIDOC format annotations
function importCIDOCAnnotations(cidocData) {
    if (!cidocData['@graph']) return;
    
    cidocData['@graph'].forEach(item => {
        if (item['@type'] === 'crm:E22_Human-Made_Object' && item.has_annotation) {
            // Extract item ID from URI
            const itemId = item.identified_by?.content || item['@id'].split('/').pop();
            
            if (!annotations[itemId]) {
                annotations[itemId] = [];
            }
            
            // Convert CIDOC annotations back to simple format
            item.has_annotation.forEach(cidocAnn => {
                const simpleAnn = {
                    id: cidocAnn['@id']?.replace('_:annotation_', '') || generateId(),
                    type: cidocAnn.has_type || 'annotation',
                    content: cidocAnn.assigned?.content || '',
                    timestamp: cidocAnn.has_time_span?.begin_of_the_begin ? 
                        new Date(cidocAnn.has_time_span.begin_of_the_begin).getTime() : 
                        Date.now(),
                    author: cidocAnn.carried_out_by?.label || 'User'
                };
                
                // Check if annotation already exists
                const exists = annotations[itemId].some(a => a.id === simpleAnn.id);
                if (!exists && simpleAnn.content) {
                    annotations[itemId].push(simpleAnn);
                }
            });
        }
    });
}

// Get current modal item ID (helper function)
function getCurrentModalItemId() {
    const modalTitle = document.getElementById('modalTitle');
    const titleText = modalTitle.textContent;
    // Extract item ID from title if it follows pattern "Item XXXXX"
    const match = titleText.match(/Item (\w+)/);
    return match ? match[1] : null;
}

// Submit new annotation
function submitAnnotation(itemId) {
    const typeSelect = document.getElementById('annotationType');
    const contentTextarea = document.getElementById('annotationContent');
    
    const type = typeSelect.value;
    const content = contentTextarea.value.trim();
    
    if (!content) {
        alert('Please enter annotation content');
        return;
    }
    
    addAnnotation(itemId, type, content);
    
    // Clear form
    contentTextarea.value = '';
    
    // Refresh annotations list
    document.getElementById('annotationsList').innerHTML = renderAnnotationsList(itemId);
    
    // Update annotation count in header
    const header = document.querySelector('h3');
    if (header && header.textContent.includes('Annotations')) {
        header.textContent = `Annotations (${getAnnotationCount(itemId)})`;
    }
}

// Render annotations list
function renderAnnotationsList(itemId) {
    const itemAnnotations = getAnnotations(itemId);
    
    if (itemAnnotations.length === 0) {
        return '<p style="color:#666;font-style:italic;">No annotations yet. Add one above!</p>';
    }
    
    return itemAnnotations.map(annotation => `
        <div style="background:white;border:1px solid #dee2e6;border-radius:6px;padding:12px;margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="background:#e9ecef;padding:2px 8px;border-radius:12px;font-size:12px;color:#495057;">
                    ${annotation.type.toUpperCase()}
                </span>
                <div style="display:flex;gap:8px;">
                    <button onclick="editAnnotationInline('${itemId}', '${annotation.id}')" 
                        style="background:none;border:none;color:#007bff;cursor:pointer;font-size:12px;">
                        Edit
                    </button>
                    <button onclick="confirmDeleteAnnotation('${itemId}', '${annotation.id}')" 
                        style="background:none;border:none;color:#dc3545;cursor:pointer;font-size:12px;">
                        Delete
                    </button>
                </div>
            </div>
            <div id="annotation-content-${annotation.id}" style="color:#333;line-height:1.4;">
                ${escapeHtml(annotation.content)}
            </div>
            <div style="font-size:11px;color:#666;margin-top:8px;">
                ${annotation.author} • ${formatDate(annotation.timestamp)}
            </div>
        </div>
    `).join('');
}

// Edit annotation inline
function editAnnotationInline(itemId, annotationId) {
    const contentDiv = document.getElementById(`annotation-content-${annotationId}`);
    const annotation = getAnnotations(itemId).find(ann => ann.id === annotationId);
    
    if (!annotation || !contentDiv) return;
    
    // Replace content with textarea
    contentDiv.innerHTML = `
        <textarea id="edit-${annotationId}" style="width:100%;min-height:60px;padding:4px;border:1px solid #ddd;border-radius:4px;">
            ${annotation.content}
        </textarea>
        <div style="margin-top:8px;">
            <button onclick="saveAnnotationEdit('${itemId}', '${annotationId}')" 
                style="background:#28a745;color:white;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;margin-right:8px;">
                Save
            </button>
            <button onclick="cancelAnnotationEdit('${itemId}', '${annotationId}', '${escapeHtml(annotation.content)}')" 
                style="background:#6c757d;color:white;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;">
                Cancel
            </button>
        </div>
    `;
}

// Save annotation edit
function saveAnnotationEdit(itemId, annotationId) {
    const textarea = document.getElementById(`edit-${annotationId}`);
    const newContent = textarea.value.trim();
    
    if (!newContent) {
        alert('Content cannot be empty');
        return;
    }
    
    editAnnotation(itemId, annotationId, newContent);
    
    // Refresh the annotations list
    document.getElementById('annotationsList').innerHTML = renderAnnotationsList(itemId);
}

// Cancel annotation edit
function cancelAnnotationEdit(itemId, annotationId, originalContent) {
    const contentDiv = document.getElementById(`annotation-content-${annotationId}`);
    contentDiv.innerHTML = escapeHtml(originalContent);
}

// Confirm delete annotation
function confirmDeleteAnnotation(itemId, annotationId) {
    if (confirm('Are you sure you want to delete this annotation?')) {
        deleteAnnotation(itemId, annotationId);
        
        // Refresh annotations list
        document.getElementById('annotationsList').innerHTML = renderAnnotationsList(itemId);
        
        // Update annotation count in header
        const header = document.querySelector('h3');
        if (header && header.textContent.includes('Annotations')) {
            header.textContent = `Annotations (${getAnnotationCount(itemId)})`;
        }
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Handle file import from main interface
function handleFileImport(event) {
    const file = event.target.files[0];
    if (file) {
        importAnnotations(file);
        // Clear the input so the same file can be imported again
        event.target.value = '';
    }
}

// === ADVANCED FILTERING SYSTEM ===

// Build filter options from loaded data
function buildFilterOptions() {
    console.log('Building filter options...');
    
    // Clear existing options
    availableFilters.locations.clear();
    availableFilters.subjects.clear();
    availableFilters.elementTypes.clear();
    
    // Process all items to collect unique filter values
    Object.values(allItems).forEach(item => {
        // Collect locations
        if (item.location?.geonameId) {
            availableFilters.locations.add(item.location.geonameId);
        }
        
        // Collect subjects
        if (item.subject) {
            if (Array.isArray(item.subject)) {
                item.subject.forEach(subj => {
                    const subjText = typeof subj === 'object' ? subj.code || subj.label : subj;
                    if (subjText) availableFilters.subjects.add(subjText);
                });
            } else {
                const subjText = typeof item.subject === 'object' ? item.subject.code || item.subject.label : item.subject;
                if (subjText) availableFilters.subjects.add(subjText);
            }
        }
        
        // Collect element types
        if (item.elementType?.aat) {
            availableFilters.elementTypes.add(item.elementType.aat);
        }
    });
    
    // Populate filter dropdowns
    populateFilterDropdowns();
    
    // Restore saved filter UI state
    restoreFilterUI();
    
    // Apply any existing filters
    if (activeFilters.periodFrom || activeFilters.periodTo || 
        activeFilters.locations.length > 0 || activeFilters.subjects.length > 0 || 
        activeFilters.elementTypes.length > 0) {
        performSearchAndFilter();
    }
    
    console.log('Filter options built:', {
        locations: availableFilters.locations.size,
        subjects: availableFilters.subjects.size,
        elementTypes: availableFilters.elementTypes.size
    });
}

// Populate filter dropdown options
function populateFilterDropdowns() {
    // Populate locations
    const locationSelect = document.getElementById('locationFilter');
    locationSelect.innerHTML = '';
    Array.from(availableFilters.locations).sort().forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = `Geonames: ${location}`;
        locationSelect.appendChild(option);
    });
    
    // Populate subjects (limit to top 100 most common for performance)
    const subjectSelect = document.getElementById('subjectFilter');
    subjectSelect.innerHTML = '';
    Array.from(availableFilters.subjects).sort().slice(0, 100).forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
    
    // Populate element types
    const elementTypeSelect = document.getElementById('elementTypeFilter');
    elementTypeSelect.innerHTML = '';
    Array.from(availableFilters.elementTypes).sort().forEach(elementType => {
        const option = document.createElement('option');
        option.value = elementType;
        option.textContent = `AAT: ${elementType}`;
        elementTypeSelect.appendChild(option);
    });
}

// Toggle filter panel visibility
function toggleFilters() {
    const panel = document.getElementById('filtersPanel');
    const button = document.getElementById('filterToggle');
    
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        button.textContent = 'Hide Filters';
        button.style.background = '#dc3545';
    } else {
        panel.style.display = 'none';
        button.textContent = 'Show Filters';
        button.style.background = '#28a745';
    }
}

// Apply active filters
function applyFilters() {
    // Get filter values
    activeFilters.periodFrom = document.getElementById('periodFrom').value;
    activeFilters.periodTo = document.getElementById('periodTo').value;
    activeFilters.locations = Array.from(document.getElementById('locationFilter').selectedOptions)
        .map(opt => opt.value);
    activeFilters.subjects = Array.from(document.getElementById('subjectFilter').selectedOptions)
        .map(opt => opt.value);
    activeFilters.elementTypes = Array.from(document.getElementById('elementTypeFilter').selectedOptions)
        .map(opt => opt.value);
    
    // Apply combined search and filters
    performSearchAndFilter();
    
    // Save filters for persistence
    saveFilters();
    
    console.log('Filters applied:', activeFilters);
}

// Clear all filters
function clearAllFilters() {
    // Reset filter UI
    document.getElementById('periodFrom').value = '';
    document.getElementById('periodTo').value = '';
    document.getElementById('locationFilter').selectedIndex = -1;
    document.getElementById('subjectFilter').selectedIndex = -1;
    document.getElementById('elementTypeFilter').selectedIndex = -1;
    
    // Reset filter state
    activeFilters = {
        periodFrom: '',
        periodTo: '',
        locations: [],
        subjects: [],
        elementTypes: []
    };
    
    // Clear search and reapply
    document.getElementById('searchInput').value = '';
    performSearchAndFilter();
    
    // Save cleared filters
    saveFilters();
    
    console.log('All filters cleared');
}

// Combined search and filter functionality
function performSearchAndFilter() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    filteredItems = Object.values(allItems).filter(item => {
        // Text search filter
        if (query) {
            const searchFields = [
                item.id,
                item.label,
                item.period,
                item.creationPeriod
            ].filter(Boolean).map(f => String(f).toLowerCase());
            
            const matchesSearch = searchFields.some(field => field.includes(query));
            if (!matchesSearch) return false;
        }
        
        // Period range filter
        if (activeFilters.periodFrom || activeFilters.periodTo) {
            const itemPeriod = extractYearFromPeriod(item.period || item.creationPeriod);
            if (itemPeriod) {
                if (activeFilters.periodFrom && itemPeriod < parseInt(activeFilters.periodFrom)) return false;
                if (activeFilters.periodTo && itemPeriod > parseInt(activeFilters.periodTo)) return false;
            } else if (activeFilters.periodFrom || activeFilters.periodTo) {
                // If period filters are set but item has no period, exclude it
                return false;
            }
        }
        
        // Location filter
        if (activeFilters.locations.length > 0) {
            const itemLocation = item.location?.geonameId;
            if (!itemLocation || !activeFilters.locations.includes(itemLocation)) return false;
        }
        
        // Subject filter
        if (activeFilters.subjects.length > 0) {
            let hasMatchingSubject = false;
            if (item.subject) {
                const subjects = Array.isArray(item.subject) ? item.subject : [item.subject];
                hasMatchingSubject = subjects.some(subj => {
                    const subjText = typeof subj === 'object' ? subj.code || subj.label : subj;
                    return subjText && activeFilters.subjects.includes(subjText);
                });
            }
            if (!hasMatchingSubject) return false;
        }
        
        // Element type filter
        if (activeFilters.elementTypes.length > 0) {
            const itemElementType = item.elementType?.aat;
            if (!itemElementType || !activeFilters.elementTypes.includes(itemElementType)) return false;
        }
        
        return true;
    });
    
    // Reset to first page and update display
    currentPage = 1;
    updateStats();
    renderItems();
    
    console.log(`Filtered to ${filteredItems.length} items from ${Object.keys(allItems).length} total`);
}

// Extract year from period string (e.g., "um 1379" -> 1379)
function extractYearFromPeriod(period) {
    if (!period) return null;
    const match = period.match(/(\d{4})/);
    return match ? parseInt(match[1]) : null;
}

// Update the existing search functions to use new combined approach
function performSearch() {
    performSearchAndFilter();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    performSearchAndFilter();
}

// === FILTER PERSISTENCE ===

// Load saved filters from localStorage
function loadFilters() {
    try {
        const saved = localStorage.getItem('cvma-filters');
        if (saved) {
            const savedFilters = JSON.parse(saved);
            activeFilters = { ...activeFilters, ...savedFilters };
            console.log('Loaded saved filters:', activeFilters);
        }
    } catch (error) {
        console.error('Error loading filters:', error);
    }
}

// Save current filters to localStorage
function saveFilters() {
    try {
        localStorage.setItem('cvma-filters', JSON.stringify(activeFilters));
    } catch (error) {
        console.error('Error saving filters:', error);
    }
}

// Restore filter UI from saved state
function restoreFilterUI() {
    // Restore period range
    document.getElementById('periodFrom').value = activeFilters.periodFrom || '';
    document.getElementById('periodTo').value = activeFilters.periodTo || '';
    
    // Restore location selections
    const locationSelect = document.getElementById('locationFilter');
    Array.from(locationSelect.options).forEach(option => {
        option.selected = activeFilters.locations.includes(option.value);
    });
    
    // Restore subject selections
    const subjectSelect = document.getElementById('subjectFilter');
    Array.from(subjectSelect.options).forEach(option => {
        option.selected = activeFilters.subjects.includes(option.value);
    });
    
    // Restore element type selections
    const elementTypeSelect = document.getElementById('elementTypeFilter');
    Array.from(elementTypeSelect.options).forEach(option => {
        option.selected = activeFilters.elementTypes.includes(option.value);
    });
}