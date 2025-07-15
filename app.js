// Global state
let windows = [];
let currentEditId = null;
let deleteId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateDisplay();
    setupEventListeners();
});

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

    // Auto-save every 30 seconds when form is being edited
    setInterval(autoSave, 30000);
}

function loadData() {
    const stored = localStorage.getItem('stainedGlassWindows');
    if (stored) {
        try {
            windows = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading data:', e);
            showStatus('Error loading saved data. Starting fresh.', 'error');
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

function saveWindow(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const windowData = {
        id: currentEditId || Date.now().toString(),
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
        lastModified: new Date().toISOString()
    };

    // Validation
    if (!windowData.title || !windowData.building || !windowData.city || !windowData.country || !windowData.date) {
        showStatus('Please fill in all required fields.', 'error');
        return;
    }

    if (windowData.materials.length === 0) {
        showStatus('Please select at least one material.', 'error');
        return;
    }

    // Check for duplicate titles (excluding current edit)
    const duplicate = windows.find(w => w.title === windowData.title && w.id !== windowData.id);
    if (duplicate) {
        showStatus('A window with this title already exists.', 'error');
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

function autoSave() {
    const form = document.getElementById('window-form');
    const formData = new FormData(form);
    
    // Only auto-save if form has content
    if (formData.get('title') || formData.get('building')) {
        const draft = {
            title: formData.get('title'),
            building: formData.get('building'),
            city: formData.get('city'),
            country: formData.get('country'),
            date: formData.get('date'),
            // Save all form data for recovery
            formData: Object.fromEntries(formData.entries())
        };
        localStorage.setItem('stainedGlassDraft', JSON.stringify(draft));
    }
}

function resetForm() {
    document.getElementById('window-form').reset();
    document.getElementById('form-title').textContent = 'Add New Window';
    document.getElementById('save-btn').textContent = 'Save Window';
    document.getElementById('materials-other').style.display = 'none';
    document.getElementById('optional-fields').classList.remove('open');
    document.getElementById('optional-toggle-text').textContent = 'Show Optional Fields';
    currentEditId = null;
    localStorage.removeItem('stainedGlassDraft');
}

function editWindow(id) {
    const window = windows.find(w => w.id === id);
    if (!window) return;

    currentEditId = id;
    
    // Populate form
    document.getElementById('title').value = window.title || '';
    document.getElementById('building').value = window.building || '';
    document.getElementById('city').value = window.city || '';
    document.getElementById('country').value = window.country || '';
    document.getElementById('date').value = window.date || '';
    
    // Materials
    document.querySelectorAll('input[name="materials"]').forEach(input => {
        input.checked = window.materials.includes(input.value);
    });
    
    // Check for custom materials
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
    const hasOptionalData = window.alternativeTitles || window.specificLocation || window.width || window.height || window.description || window.subjectTags;
    if (hasOptionalData) {
        document.getElementById('optional-fields').classList.add('open');
        document.getElementById('optional-toggle-text').textContent = 'Hide Optional Fields';
    }

    document.getElementById('form-title').textContent = 'Edit Window';
    document.getElementById('save-btn').textContent = 'Update Window';
    showView('form');
}

function deleteWindow(id) {
    deleteId = id;
    document.getElementById('delete-modal').style.display = 'block';
}

function confirmDelete() {
    if (deleteId) {
        windows = windows.filter(w => w.id !== deleteId);
        saveData();
        updateDisplay();
        showStatus('Window deleted successfully.', 'success');
        deleteId = null;
    }
    closeModal();
}

function closeModal() {
    document.getElementById('delete-modal').style.display = 'none';
    deleteId = null;
}

function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    document.getElementById(viewName + '-view').classList.add('active');
    
    // Clear status message when switching views
    showStatus('');
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

function updateDisplay() {
    updateStats();
    updateWindowsList();
}

function updateStats() {
    const totalWindows = windows.length;
    const countries = new Set(windows.map(w => w.country)).size;
    
    // Calculate date range
    let dateRange = '-';
    if (windows.length > 0) {
        const dates = windows.map(w => w.date).filter(d => d);
        if (dates.length > 0) {
            // Simple approach - just show count if we have dates
            dateRange = `${dates.length} dated`;
        }
    }

    document.getElementById('total-windows').textContent = totalWindows;
    document.getElementById('countries-count').textContent = countries;
    document.getElementById('date-range').textContent = dateRange;
}

function updateWindowsList() {
    const container = document.getElementById('windows-list');
    
    if (windows.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No windows documented yet</h3>
                <p>Click "Add Window" to create your first record</p>
            </div>
        `;
        return;
    }

    container.innerHTML = windows.map(window => `
        <div class="window-card">
            <h3>${escapeHtml(window.title)}</h3>
            <div class="window-meta">
                <strong>Location:</strong> ${escapeHtml(window.building)}, ${escapeHtml(window.city)}, ${escapeHtml(window.country)}<br>
                <strong>Date:</strong> ${escapeHtml(window.date)}<br>
                <strong>Materials:</strong> ${window.materials.map(m => escapeHtml(m)).join(', ')}
                ${window.description ? `<br><strong>Description:</strong> ${escapeHtml(window.description.substring(0, 150))}${window.description.length > 150 ? '...' : ''}` : ''}
            </div>
            <div class="window-actions">
                <button onclick="editWindow('${window.id}')">Edit</button>
                <button class="btn-danger" onclick="deleteWindow('${window.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function exportData() {
    if (windows.length === 0) {
        showStatus('No windows to export.', 'error');
        return;
    }

    const jsonLD = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": "Stained Glass Windows Documentation",
        "description": "Documentation of stained glass windows created with the Stained Glass Documentation Tool",
        "dateCreated": new Date().toISOString(),
        "creator": {
            "@type": "SoftwareApplication",
            "name": "Stained Glass Documentation Tool",
            "version": "1.0"
        },
        "hasPart": windows.map(window => ({
            "@type": "VisualArtwork",
            "name": window.title,
            "alternateName": window.alternativeTitles ? window.alternativeTitles.split(',').map(t => t.trim()) : undefined,
            "artform": "Stained Glass Window",
            "dateCreated": window.date,
            "material": window.materials,
            "description": window.description,
            "keywords": window.subjectTags ? window.subjectTags.split(',').map(t => t.trim()) : undefined,
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
                "value": window.width,
                "unitText": window.dimensionUnit
            } : undefined,
            "height": window.height ? {
                "@type": "QuantitativeValue",
                "value": window.height,
                "unitText": window.dimensionUnit
            } : undefined,
            "dateModified": window.lastModified
        }))
    };

    const blob = new Blob([JSON.stringify(jsonLD, null, 2)], { type: 'application/ld+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stained-glass-windows-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('Data exported successfully!', 'success');
}

function showStatus(message, type = '') {
    const statusDiv = document.getElementById('status-message');
    
    if (!message) {
        statusDiv.innerHTML = '';
        return;
    }
    
    statusDiv.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 3000);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}