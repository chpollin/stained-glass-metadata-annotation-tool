// ============================================================================
// STAINED GLASS DOCUMENTATION TOOL - CORE APPLICATION
// ============================================================================

// Global state
let windows = [];
let currentEditId = null;
let deleteId = null;
let currentSearchTerm = '';
let filteredWindows = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateDisplay();
    setupEventListeners();
    loadDraftIfExists();
});

// ============================================================================
// EVENT LISTENERS AND INITIALIZATION
// ============================================================================

function setupEventListeners() {
    // Form submission
    document.getElementById('window-form').addEventListener('submit', saveWindow);
    
    // Other materials checkbox
    document.getElementById('mat-other').addEventListener('change', function() {
        const otherInput = document.getElementById('materials-other');
        otherInput.style.display = this.checked ? 'block' : 'none';
        if (!this.checked) {
            otherInput.value = '';
        }
    });

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Escape') {
                clearSearch();
            }
        });
    }

    // Auto-save every 30 seconds when form is being edited
    setInterval(autoSave, 30000);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(e) {
    // Ctrl+S or Cmd+S to save form
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (document.getElementById('form-view').classList.contains('active')) {
            document.getElementById('save-btn').click();
        }
    }
    
    // Escape to close modal or clear search
    if (e.key === 'Escape') {
        const modal = document.getElementById('delete-modal');
        if (modal.style.display === 'block') {
            closeModal();
        }
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value) {
            clearSearch();
        }
    }
}

// ============================================================================
// DATA PERSISTENCE
// ============================================================================

function loadData() {
    const stored = localStorage.getItem('stainedGlassWindows');
    if (stored) {
        try {
            windows = JSON.parse(stored);
            filteredWindows = [...windows];
        } catch (e) {
            console.error('Error loading data:', e);
            showStatus('Error loading saved data. Starting fresh.', 'error');
            windows = [];
            filteredWindows = [];
        }
    }
}

function saveData() {
    try {
        localStorage.setItem('stainedGlassWindows', JSON.stringify(windows));
        return true;
    } catch (e) {
        console.error('Error saving data:', e);
        showStatus('Error saving data. Please try again.', 'error');
        return false;
    }
}

function loadDraftIfExists() {
    const draft = localStorage.getItem('stainedGlassDraft');
    if (draft) {
        try {
            const draftData = JSON.parse(draft);
            if (draftData.title || draftData.building) {
                showStatus('Draft recovered from previous session.', 'success');
                // Could auto-populate form here if desired
            }
        } catch (e) {
            localStorage.removeItem('stainedGlassDraft');
        }
    }
}

function autoSave() {
    const form = document.getElementById('window-form');
    if (!form || !document.getElementById('form-view').classList.contains('active')) {
        return;
    }
    
    const formData = new FormData(form);
    
    // Only auto-save if form has meaningful content
    if (formData.get('title') || formData.get('building')) {
        const draft = {
            title: formData.get('title'),
            building: formData.get('building'),
            city: formData.get('city'),
            country: formData.get('country'),
            date: formData.get('date'),
            timestamp: new Date().toISOString(),
            formData: Object.fromEntries(formData.entries())
        };
        localStorage.setItem('stainedGlassDraft', JSON.stringify(draft));
        
        // Show subtle save indicator
        showSaveStatus('Draft saved', 'auto-save');
    }
}

function showSaveStatus(message, type = 'success') {
    // Create or update save status indicator
    let indicator = document.getElementById('save-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'save-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f0fff4;
            color: #22543d;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-size: 0.9rem;
            border: 1px solid #c6f6d5;
            z-index: 1000;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.textContent = message;
    indicator.style.opacity = '1';
    
    // Auto-hide after 2 seconds
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

// ============================================================================
// SEARCH AND FILTERING
// ============================================================================

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    currentSearchTerm = searchTerm;
    
    if (searchTerm === '') {
        filteredWindows = [...windows];
    } else {
        filteredWindows = windows.filter(window => 
            window.title.toLowerCase().includes(searchTerm) ||
            window.building.toLowerCase().includes(searchTerm) ||
            window.city.toLowerCase().includes(searchTerm) ||
            window.country.toLowerCase().includes(searchTerm) ||
            (window.description && window.description.toLowerCase().includes(searchTerm)) ||
            (window.subjectTags && window.subjectTags.toLowerCase().includes(searchTerm)) ||
            (window.specificLocation && window.specificLocation.toLowerCase().includes(searchTerm))
        );
    }
    
    updateWindowsList();
    updateSearchStatus();
}

function clearSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
        currentSearchTerm = '';
        filteredWindows = [...windows];
        updateWindowsList();
        updateSearchStatus();
        searchInput.focus();
    }
}

function updateSearchStatus() {
    const statusElement = document.getElementById('search-status');
    if (!statusElement) return;
    
    if (currentSearchTerm) {
        const resultCount = filteredWindows.length;
        statusElement.textContent = `${resultCount} result${resultCount !== 1 ? 's' : ''} for "${currentSearchTerm}"`;
        statusElement.style.display = 'block';
    } else {
        statusElement.style.display = 'none';
    }
}

// ============================================================================
// WINDOW MANAGEMENT (CRUD OPERATIONS)
// ============================================================================

function saveWindow(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const windowData = {
        id: currentEditId || Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: formData.get('title'),
        building: formData.get('building'),
        city: formData.get('city'),
        country: formData.get('country'),
        date: formData.get('date'),
        materials: formData.getAll('materials'),
        materialsOther: formData.get('materialsOther'),
        alternativeTitles: formData.get('alternativeTitles'),
        specificLocation: formData.get('specificLocation'),
        width: formData.get('width'),
        height: formData.get('height'),
        dimensionUnit: formData.get('dimensionUnit'),
        description: formData.get('description'),
        subjectTags: formData.get('subjectTags'),
        lastModified: new Date().toISOString(),
        created: currentEditId ? windows.find(w => w.id === currentEditId)?.created || new Date().toISOString() : new Date().toISOString()
    };

    // Enhanced validation
    const validationErrors = validateWindowData(windowData);
    if (validationErrors.length > 0) {
        showStatus(validationErrors.join(' '), 'error');
        return;
    }

    // Add other materials to the array
    if (windowData.materials.includes('Other') && windowData.materialsOther) {
        windowData.materials = windowData.materials.filter(m => m !== 'Other');
        windowData.materials.push(windowData.materialsOther);
    }

    // Save or update
    if (currentEditId) {
        const index = windows.findIndex(w => w.id === currentEditId);
        windows[index] = windowData;
        showStatus('Window updated successfully!', 'success');
    } else {
        windows.push(windowData);
        showStatus('Window saved successfully!', 'success');
    }

    if (saveData()) {
        resetForm();
        updateDisplay();
        showView('list');
    }
}

function validateWindowData(windowData) {
    const errors = [];
    
    // Required field validation
    if (!windowData.title?.trim()) errors.push('Window title is required.');
    if (!windowData.building?.trim()) errors.push('Building/Institution is required.');
    if (!windowData.city?.trim()) errors.push('City is required.');
    if (!windowData.country?.trim()) errors.push('Country is required.');
    if (!windowData.date?.trim()) errors.push('Creation date is required.');
    
    if (windowData.materials.length === 0) {
        errors.push('At least one material must be selected.');
    }

    // Check for duplicate titles (excluding current edit)
    const duplicate = windows.find(w => 
        w.title.toLowerCase() === windowData.title.toLowerCase() && 
        w.id !== windowData.id
    );
    if (duplicate) {
        errors.push('A window with this title already exists.');
    }

    // Validate dimensions if provided
    if (windowData.width && isNaN(parseFloat(windowData.width))) {
        errors.push('Width must be a valid number.');
    }
    if (windowData.height && isNaN(parseFloat(windowData.height))) {
        errors.push('Height must be a valid number.');
    }

    return errors;
}

function editWindow(id) {
    const window = windows.find(w => w.id === id);
    if (!window) {
        showStatus('Window not found.', 'error');
        return;
    }

    currentEditId = id;
    
    // Populate form fields
    document.getElementById('title').value = window.title || '';
    document.getElementById('building').value = window.building || '';
    document.getElementById('city').value = window.city || '';
    document.getElementById('country').value = window.country || '';
    document.getElementById('date').value = window.date || '';
    
    // Materials checkboxes
    document.querySelectorAll('input[name="materials"]').forEach(input => {
        input.checked = window.materials.includes(input.value);
    });
    
    // Handle custom materials
    const standardMaterials = ['Stained Glass', 'Painted Glass', 'Clear Glass', 'Lead Came', 'Silver Stain', 'Vitreous Paint'];
    const customMaterials = window.materials.filter(m => !standardMaterials.includes(m));
    if (customMaterials.length > 0) {
        document.getElementById('mat-other').checked = true;
        document.getElementById('materials-other').style.display = 'block';
        document.getElementById('materials-other').value = customMaterials.join(', ');
    }

    // Optional fields
    document.getElementById('alternative-titles').value = window.alternativeTitles || '';
    document.getElementById('specific-location').value = window.specificLocation || '';
    document.getElementById('width').value = window.width || '';
    document.getElementById('height').value = window.height || '';
    document.getElementById('dimension-unit').value = window.dimensionUnit || 'cm';
    document.getElementById('description').value = window.description || '';
    document.getElementById('subject-tags').value = window.subjectTags || '';

    // Show optional fields if any are filled
    const hasOptionalData = window.alternativeTitles || window.specificLocation || 
                           window.width || window.height || window.description || window.subjectTags;
    if (hasOptionalData) {
        document.getElementById('optional-fields').classList.add('open');
        document.getElementById('optional-toggle-text').textContent = 'Hide Optional Fields';
    }

    // Update form UI
    document.getElementById('form-title').textContent = 'Edit Window';
    document.getElementById('save-btn').textContent = 'Update Window';
    showView('form');
}

function deleteWindow(id) {
    const window = windows.find(w => w.id === id);
    if (!window) {
        showStatus('Window not found.', 'error');
        return;
    }
    
    deleteId = id;
    
    // Update modal content with window info
    const modalContent = document.querySelector('#delete-modal .modal-content');
    modalContent.innerHTML = `
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete "<strong>${escapeHtml(window.title)}</strong>"?</p>
        <p>This action cannot be undone.</p>
        <div class="modal-actions">
            <button class="btn-danger" onclick="confirmDelete()">Delete</button>
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
        </div>
    `;
    
    document.getElementById('delete-modal').style.display = 'block';
}

function confirmDelete() {
    if (deleteId) {
        const deletedWindow = windows.find(w => w.id === deleteId);
        windows = windows.filter(w => w.id !== deleteId);
        filteredWindows = filteredWindows.filter(w => w.id !== deleteId);
        
        if (saveData()) {
            updateDisplay();
            showStatus(`"${deletedWindow.title}" deleted successfully.`, 'success');
        }
        
        deleteId = null;
    }
    closeModal();
}

function closeModal() {
    document.getElementById('delete-modal').style.display = 'none';
    deleteId = null;
}

// ============================================================================
// FORM MANAGEMENT
// ============================================================================

function resetForm() {
    document.getElementById('window-form').reset();
    document.getElementById('form-title').textContent = 'Add New Window';
    document.getElementById('save-btn').textContent = 'Save Window';
    document.getElementById('materials-other').style.display = 'none';
    document.getElementById('optional-fields').classList.remove('open');
    document.getElementById('optional-toggle-text').textContent = 'Show Optional Fields';
    currentEditId = null;
    localStorage.removeItem('stainedGlassDraft');
    
    // Clear any validation errors
    document.querySelectorAll('.error-message').forEach(el => el.remove());
}

function toggleOptionalFields() {
    const optionalFields = document.getElementById('optional-fields');
    const toggleText = document.getElementById('optional-toggle-text');
    
    if (optionalFields.classList.contains('open')) {
        optionalFields.classList.remove('open');
        toggleText.textContent = 'Show Optional Fields';
    } else {
        optionalFields.classList.add('open');
        toggleText.textContent = 'Hide Optional Fields';
    }
}

// ============================================================================
// VIEW MANAGEMENT
// ============================================================================

function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    const targetView = document.getElementById(viewName + '-view');
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Clear status message when switching views
    showStatus('');
    
    // Update filtered windows when showing list
    if (viewName === 'list') {
        applyCurrentFilter();
    }
}

function applyCurrentFilter() {
    if (currentSearchTerm) {
        handleSearch({ target: { value: currentSearchTerm } });
    } else {
        filteredWindows = [...windows];
    }
}

// ============================================================================
// DISPLAY UPDATES
// ============================================================================

function updateDisplay() {
    updateStats();
    updateWindowsList();
    updateSearchStatus();
}

function updateStats() {
    const totalWindows = windows.length;
    const countries = new Set(windows.map(w => w.country)).size;
    
    // Calculate date range
    let dateRange = '-';
    if (windows.length > 0) {
        const datedWindows = windows.filter(w => w.date && w.date !== 'Unknown Date');
        if (datedWindows.length > 0) {
            dateRange = `${datedWindows.length} dated`;
        }
    }

    // Update stats display
    document.getElementById('total-windows').textContent = totalWindows;
    document.getElementById('countries-count').textContent = countries;
    document.getElementById('date-range').textContent = dateRange;
}

function updateWindowsList() {
    const container = document.getElementById('windows-list');
    const windowsToShow = filteredWindows.length > 0 || currentSearchTerm ? filteredWindows : windows;
    
    if (windowsToShow.length === 0) {
        const emptyMessage = currentSearchTerm ? 
            `<div class="empty-state">
                <h3>No windows found</h3>
                <p>Try a different search term or <button onclick="clearSearch()" class="btn-secondary">clear search</button></p>
            </div>` :
            `<div class="empty-state">
                <h3>No windows documented yet</h3>
                <p>Click "Add Window" to create your first record</p>
            </div>`;
        
        container.innerHTML = emptyMessage;
        return;
    }

    // Sort windows by last modified (newest first)
    const sortedWindows = [...windowsToShow].sort((a, b) => 
        new Date(b.lastModified) - new Date(a.lastModified)
    );

    container.innerHTML = sortedWindows.map(window => `
        <div class="window-card" data-id="${window.id}">
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
    `).join('');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function showStatus(message, type = '') {
    const statusDiv = document.getElementById('status-message');
    
    if (!message) {
        statusDiv.innerHTML = '';
        return;
    }
    
    statusDiv.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 5000);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// SHARED INTERFACE FOR IMPORT-EXPORT MODULE
// ============================================================================

// Expose functions needed by import-export.js
window.appState = {
    getWindows: () => windows,
    addWindows: (newWindows) => {
        windows.push(...newWindows);
        filteredWindows = [...windows];
    },
    saveData: saveData,
    updateDisplay: updateDisplay,
    showStatus: showStatus,
    showView: showView,
    escapeHtml: escapeHtml
};

// ============================================================================
// IMAGE FUNCTIONALITY - Add to app.js
// ============================================================================

// Image handling configuration
const IMAGE_CONFIG = {
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjdmYWZjIi8+CjxwYXRoIGQ9Ik04NS4zMzMzIDYyLjVMMTAwIDQ1TDEyNSA3NS4wMDA3TDE0MS42NjcgNTUuMDAwN0wxNjYuNjY3IDg3LjVINTBMODUuMzMzMyA2Mi41WiIgZmlsbD0iI2NiZDVlMCIvPgo8Y2lyY2xlIGN4PSI3NSIgY3k9IjU1IiByPSI4LjMzMzMzIiBmaWxsPSIjY2JkNWUwIi8+CjwvZz4KPC9zdmc+',
    errorPlaceholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZmVkN2Q3Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVMMTEwIDY1TDEzMCA4NUwxMTAgMTA1TDEwMCA5NUw5MCA4NUwxMDAgNzVaIiBmaWxsPSIjZTUzZTNlIi8+CjwvZz4KPC9zdmc+',
    loadingClass: 'image-loading',
    errorClass: 'image-error',
    loadedClass: 'image-loaded'
};

// Initialize intersection observer for lazy loading
let imageObserver = null;

function initializeImageObserver() {
    if ('IntersectionObserver' in window) {
        imageObserver = new IntersectionObserver(handleImageIntersection, {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        });
    }
}

function handleImageIntersection(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            loadImage(img);
            imageObserver.unobserve(img);
        }
    });
}

function loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    img.classList.add(IMAGE_CONFIG.loadingClass);
    
    const tempImg = new Image();
    
    tempImg.onload = function() {
        img.src = src;
        img.classList.remove(IMAGE_CONFIG.loadingClass);
        img.classList.add(IMAGE_CONFIG.loadedClass);
        
        // Add click handler for modal view
        img.addEventListener('click', () => showImageModal(src, img.alt));
    };
    
    tempImg.onerror = function() {
        img.src = IMAGE_CONFIG.errorPlaceholder;
        img.classList.remove(IMAGE_CONFIG.loadingClass);
        img.classList.add(IMAGE_CONFIG.errorClass);
        img.alt = 'Image failed to load';
    };
    
    tempImg.src = src;
}

function setupLazyImage(img, src, alt) {
    img.src = IMAGE_CONFIG.placeholder;
    img.dataset.src = src;
    img.alt = alt;
    img.classList.add('lazy-image');
    
    if (imageObserver) {
        imageObserver.observe(img);
    } else {
        // Fallback for browsers without IntersectionObserver
        loadImage(img);
    }
}

// ============================================================================
// WIKIMEDIA COMMONS URL HANDLING
// ============================================================================

function processWikimediaUrl(url) {
    if (!url) return null;
    
    // Handle different Wikimedia URL formats
    if (url.includes('commons.wikimedia.org/wiki/Special:FilePath/')) {
        // Direct file path URL - use as is
        return url;
    } else if (url.includes('commons.wikimedia.org/wiki/File:')) {
        // Convert wiki file page to direct image URL
        const filename = url.split('File:')[1];
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}`;
    } else if (url.includes('upload.wikimedia.org')) {
        // Direct upload URL - use as is
        return url;
    }
    
    // Return null for non-Wikimedia URLs or invalid formats
    return null;
}

function generateThumbnailUrl(originalUrl, width = 300) {
    if (!originalUrl) return null;
    
    // For Wikimedia Commons, we can generate thumbnail URLs
    if (originalUrl.includes('commons.wikimedia.org/wiki/Special:FilePath/')) {
        return `${originalUrl}?width=${width}`;
    }
    
    return originalUrl;
}

// ============================================================================
// IMAGE MODAL FUNCTIONALITY
// ============================================================================

function showImageModal(src, alt) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');
    
    modalImg.src = src;
    modalImg.alt = alt;
    modalCaption.textContent = alt;
    
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus trap
    modalImg.focus();
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

// ============================================================================
// UPDATE WINDOW DISPLAY WITH IMAGES
// ============================================================================

function updateWindowsListWithImages() {
    const container = document.getElementById('windows-list');
    const windowsToShow = filteredWindows.length > 0 || currentSearchTerm ? filteredWindows : windows;
    
    if (windowsToShow.length === 0) {
        const emptyMessage = currentSearchTerm ? 
            `<div class="empty-state">
                <h3>No windows found</h3>
                <p>Try a different search term or <button onclick="clearSearch()" class="btn-secondary">clear search</button></p>
            </div>` :
            `<div class="empty-state">
                <h3>No windows documented yet</h3>
                <p>Click "Add Window" to create your first record</p>
            </div>`;
        
        container.innerHTML = emptyMessage;
        return;
    }

    // Initialize image observer if not already done
    if (!imageObserver) {
        initializeImageObserver();
    }

    // Sort windows by last modified (newest first)
    const sortedWindows = [...windowsToShow].sort((a, b) => 
        new Date(b.lastModified) - new Date(a.lastModified)
    );

    container.innerHTML = sortedWindows.map(window => {
        const imageUrl = processWikimediaUrl(window.imageUrl);
        const thumbnailUrl = generateThumbnailUrl(imageUrl, 300);
        
        return `
            <div class="window-card" data-id="${window.id}">
                ${imageUrl ? `
                    <div class="window-image-container">
                        <img class="window-image lazy-image" 
                             src="${IMAGE_CONFIG.placeholder}"
                             data-src="${thumbnailUrl}"
                             alt="${escapeHtml(window.title)} - Stained glass window"
                             loading="lazy"
                             width="300"
                             height="200">
                        <div class="image-overlay">
                            <span class="image-zoom-hint">Click to enlarge</span>
                        </div>
                    </div>
                ` : ''}
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
        `;
    }).join('');

    // Set up lazy loading for all images
    const lazyImages = container.querySelectorAll('.lazy-image');
    lazyImages.forEach(img => {
        const src = img.dataset.src;
        const alt = img.alt;
        setupLazyImage(img, src, alt);
    });
}

// ============================================================================
// FORM ENHANCEMENT FOR IMAGE URL
// ============================================================================

function addImageUrlToForm() {
    // This would be added to the optional fields section in the form
    const imageFieldHTML = `
        <div class="form-group">
            <label for="image-url">Image URL</label>
            <input 
                type="url" 
                id="image-url" 
                name="imageUrl" 
                placeholder="https://commons.wikimedia.org/wiki/Special:FilePath/..."
                aria-describedby="image-help"
                autocomplete="off"
            >
            <small id="image-help" class="help-text">
                Wikimedia Commons image URL (will be displayed as thumbnail)
            </small>
            <div id="image-preview" class="image-preview"></div>
        </div>
    `;
    
    // Add event listener for image URL preview
    document.getElementById('image-url').addEventListener('input', function() {
        const url = this.value;
        const preview = document.getElementById('image-preview');
        
        if (url && processWikimediaUrl(url)) {
            const thumbnailUrl = generateThumbnailUrl(processWikimediaUrl(url), 200);
            preview.innerHTML = `
                <img src="${thumbnailUrl}" 
                     alt="Preview" 
                     class="form-image-preview"
                     onerror="this.style.display='none'">
            `;
        } else {
            preview.innerHTML = '';
        }
    });
}

// ============================================================================
// WIKIDATA IMPORT ENHANCEMENT
// ============================================================================

function extractImageUrl(item) {
    // P18 = image
    const image = item.properties.get('http://www.wikidata.org/prop/direct/P18');
    if (image && image.values.length > 0) {
        const imageValue = image.values[0].value;
        
        // Convert Wikidata image URL to Commons FilePath URL
        if (imageValue.includes('commons.wikimedia.org/wiki/File:')) {
            const filename = imageValue.split('File:')[1];
            return `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}`;
        }
        
        return imageValue;
    }
    
    return null;
}

// ============================================================================
// INITIALIZE ON DOM READY
// ============================================================================

// Add to existing DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', function() {
    initializeImageObserver();
    
    // Update the existing updateWindowsList function
    window.updateWindowsList = updateWindowsListWithImages;
});