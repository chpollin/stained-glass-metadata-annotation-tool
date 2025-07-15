# Implementation Instructions - Vanilla JS MVP

## Vanilla Tech Stack (Simplified)

### Pure Web Technologies
```
- HTML5 (semantic structure)
- CSS3 (Grid/Flexbox, CSS Variables)
- Vanilla JavaScript (ES6+)
- localStorage (no external dependencies)
- Single-page application pattern
```

### Simplified Project Structure
```
stained-glass-app/
├── index.html              // Main application shell
├── css/
│   ├── main.css           // Base styles and layout
│   ├── components.css     // Component-specific styles
│   └── forms.css          // Form styling
├── js/
│   ├── app.js            // Main application controller
│   ├── storage.js        // localStorage utilities
│   ├── validation.js     // Form validation
│   ├── export.js         // JSON-LD export
│   └── components/
│       ├── WindowForm.js  // Form management
│       ├── WindowList.js  // List view logic
│       └── Router.js      // Simple routing
├── data/
│   └── constants.js      // Materials, countries lists
└── README.md
```

## Implementation Steps (1-2 days)

### Day 1: Core Application Shell

#### Morning: HTML Structure & Basic Routing
```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stained Glass Window Documentation</title>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/forms.css">
</head>
<body>
    <div id="app">
        <header class="app-header">
            <h1>Stained Glass Documentation</h1>
            <nav id="main-nav">
                <button id="nav-list" class="nav-btn active">Windows</button>
                <button id="nav-new" class="nav-btn">New Window</button>
                <button id="export-all" class="nav-btn">Export All</button>
            </nav>
        </header>
        
        <main id="main-content">
            <!-- Dynamic content injected here -->
        </main>
        
        <div id="notifications" class="notifications"></div>
    </div>

    <!-- Templates -->
    <template id="window-list-template">
        <div class="window-list-view">
            <div class="list-controls">
                <input type="text" id="search-input" placeholder="Search windows..." class="search-input">
                <div class="list-stats">
                    <span id="window-count">0 windows</span>
                </div>
            </div>
            <div id="windows-container" class="windows-grid">
                <!-- Window cards dynamically inserted -->
            </div>
            <div id="empty-state" class="empty-state" style="display: none;">
                <h3>No windows documented yet</h3>
                <p>Create your first stained glass window record</p>
                <button id="create-first" class="btn btn-primary">Create First Window</button>
            </div>
        </div>
    </template>

    <template id="window-card-template">
        <div class="window-card" data-id="">
            <div class="card-header">
                <h3 class="card-title"></h3>
                <div class="card-actions">
                    <button class="btn-edit" title="Edit">✏️</button>
                    <button class="btn-delete" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="card-body">
                <p class="card-location"></p>
                <p class="card-date"></p>
                <div class="card-materials"></div>
            </div>
        </div>
    </template>

    <template id="window-form-template">
        <div class="window-form-view">
            <div class="form-header">
                <button id="back-to-list" class="btn btn-secondary">← Back to List</button>
                <h2 id="form-title">New Window</h2>
                <div class="save-status" id="save-status"></div>
            </div>
            
            <form id="window-form" class="window-form">
                <!-- Form fields dynamically generated -->
            </form>
        </div>
    </template>

    <!-- JavaScript -->
    <script src="data/constants.js"></script>
    <script src="js/storage.js"></script>
    <script src="js/validation.js"></script>
    <script src="js/export.js"></script>
    <script src="js/components/Router.js"></script>
    <script src="js/components/WindowForm.js"></script>
    <script src="js/components/WindowList.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

#### Afternoon: Storage & Data Layer
```javascript
// js/storage.js
class WindowStorage {
    constructor() {
        this.storageKey = 'stainedGlassWindows';
        this.version = 1;
    }

    save(window) {
        const data = this.getAllData();
        const now = new Date().toISOString();
        
        if (!window.id) {
            window.id = this.generateId();
            window.created = now;
        }
        window.modified = now;
        
        data.windows[window.id] = window;
        data.lastModified = now;
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return { success: true, window };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    get(id) {
        const data = this.getAllData();
        return data.windows[id] || null;
    }

    getAll() {
        const data = this.getAllData();
        return Object.values(data.windows);
    }

    delete(id) {
        const data = this.getAllData();
        delete data.windows[id];
        data.lastModified = new Date().toISOString();
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getAllData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : this.getEmptyStorage();
        } catch (error) {
            console.error('Storage corrupted, resetting:', error);
            return this.getEmptyStorage();
        }
    }

    getEmptyStorage() {
        return {
            version: this.version,
            windows: {},
            lastModified: new Date().toISOString()
        };
    }

    generateId() {
        return 'window_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getStorageInfo() {
        const data = localStorage.getItem(this.storageKey) || '{}';
        const sizeBytes = new Blob([data]).size;
        const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
        const maxMB = 5; // localStorage limit approximation
        const percentage = (sizeBytes / (maxMB * 1024 * 1024)) * 100;
        
        return {
            sizeBytes,
            sizeMB,
            percentage: Math.round(percentage),
            isNearLimit: percentage > 80
        };
    }

    clear() {
        localStorage.removeItem(this.storageKey);
    }
}

// Global storage instance
const storage = new WindowStorage();
```

### Day 2: Components & Validation

#### Morning: Form Component
```javascript
// js/components/WindowForm.js
class WindowForm {
    constructor(container) {
        this.container = container;
        this.currentWindow = null;
        this.isDirty = false;
        this.autoSaveTimeout = null;
        
        this.render();
        this.bindEvents();
    }

    render() {
        const template = document.getElementById('window-form-template');
        this.container.innerHTML = template.innerHTML;
        
        this.form = this.container.querySelector('#window-form');
        this.renderFormFields();
    }

    renderFormFields() {
        const fieldsHTML = `
            <div class="form-section">
                <h3>Basic Information</h3>
                
                <div class="form-field required">
                    <label for="title">Window Title *</label>
                    <input type="text" id="title" name="title" required 
                           placeholder="e.g., Rose Window, North Transept" maxlength="200">
                    <div class="field-error" id="title-error"></div>
                </div>

                <div class="form-field">
                    <label for="alternativeTitles">Alternative Titles</label>
                    <input type="text" id="alternativeTitles" name="alternativeTitles" 
                           placeholder="Separate multiple titles with commas">
                </div>
            </div>

            <div class="form-section">
                <h3>Location *</h3>
                
                <div class="form-row">
                    <div class="form-field required">
                        <label for="buildingName">Building Name *</label>
                        <input type="text" id="buildingName" name="buildingName" required 
                               placeholder="e.g., Notre-Dame Cathedral" maxlength="100">
                        <div class="field-error" id="buildingName-error"></div>
                    </div>
                    
                    <div class="form-field required">
                        <label for="city">City *</label>
                        <input type="text" id="city" name="city" required 
                               placeholder="e.g., Paris" maxlength="50">
                        <div class="field-error" id="city-error"></div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-field required">
                        <label for="country">Country *</label>
                        <select id="country" name="country" required>
                            <option value="">Select country...</option>
                            ${COUNTRIES.map(country => 
                                `<option value="${country}">${country}</option>`
                            ).join('')}
                        </select>
                        <div class="field-error" id="country-error"></div>
                    </div>
                    
                    <div class="form-field">
                        <label for="specificLocation">Specific Location</label>
                        <input type="text" id="specificLocation" name="specificLocation" 
                               placeholder="e.g., North transept, window 3" maxlength="200">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h3>Dating & Materials</h3>
                
                <div class="form-field required">
                    <label for="dateCreated">Date Created *</label>
                    <input type="text" id="dateCreated" name="dateCreated" required 
                           placeholder="e.g., 1450, circa 1300, early 15th century" maxlength="50">
                    <div class="field-help">Examples: "1450", "circa 1300", "early 15th century", "before 1500"</div>
                    <div class="field-error" id="dateCreated-error"></div>
                </div>

                <div class="form-field required">
                    <label>Materials Used *</label>
                    <div class="materials-selector" id="materials-selector">
                        ${MATERIALS.map(material => `
                            <label class="material-option">
                                <input type="checkbox" name="materials" value="${material}">
                                <span>${material}</span>
                            </label>
                        `).join('')}
                    </div>
                    <div class="field-error" id="materials-error"></div>
                </div>
            </div>

            <div class="form-section collapsible">
                <h3>
                    <button type="button" class="section-toggle" data-target="optional-fields">
                        Optional Details <span class="toggle-icon">▼</span>
                    </button>
                </h3>
                
                <div id="optional-fields" class="collapsible-content">
                    <div class="form-row">
                        <div class="form-field">
                            <label for="height">Height</label>
                            <input type="number" id="height" name="height" min="0" step="0.1">
                        </div>
                        
                        <div class="form-field">
                            <label for="width">Width</label>
                            <input type="number" id="width" name="width" min="0" step="0.1">
                        </div>
                        
                        <div class="form-field">
                            <label for="dimensionUnit">Unit</label>
                            <select id="dimensionUnit" name="dimensionUnit">
                                <option value="cm">Centimeters</option>
                                <option value="m">Meters</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-field">
                        <label for="description">Description</label>
                        <textarea id="description" name="description" rows="4" 
                                  placeholder="Describe the window's iconography, style, condition, etc."></textarea>
                    </div>

                    <div class="form-field">
                        <label for="subjects">Subject Tags</label>
                        <input type="text" id="subjects" name="subjects" 
                               placeholder="e.g., Biblical scenes, Saints, Heraldry (separate with commas)">
                        <div class="field-help">Separate multiple subjects with commas</div>
                    </div>
                </div>
            </div>

            <div class="form-actions">
                <button type="button" id="cancel-btn" class="btn btn-secondary">Cancel</button>
                <button type="submit" id="save-btn" class="btn btn-primary">Save Window</button>
            </div>
        `;
        
        this.form.innerHTML = fieldsHTML;
    }

    bindEvents() {
        // Auto-save on input
        this.form.addEventListener('input', (e) => {
            this.markDirty();
            this.scheduleAutoSave();
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveWindow();
        });

        // Navigation
        this.container.querySelector('#back-to-list').addEventListener('click', () => {
            if (this.isDirty) {
                if (confirm('You have unsaved changes. Save before leaving?')) {
                    this.saveWindow().then(() => router.navigate('list'));
                } else {
                    router.navigate('list');
                }
            } else {
                router.navigate('list');
            }
        });

        // Collapsible sections
        this.form.addEventListener('click', (e) => {
            if (e.target.classList.contains('section-toggle')) {
                this.toggleSection(e.target);
            }
        });

        // Real-time validation
        this.form.addEventListener('blur', (e) => {
            if (e.target.matches('input[required], select[required]')) {
                this.validateField(e.target);
            }
        }, true);
    }

    loadWindow(id) {
        if (id) {
            this.currentWindow = storage.get(id);
            if (this.currentWindow) {
                this.populateForm(this.currentWindow);
                this.container.querySelector('#form-title').textContent = 'Edit Window';
            }
        } else {
            this.currentWindow = null;
            this.resetForm();
            this.container.querySelector('#form-title').textContent = 'New Window';
        }
        this.isDirty = false;
    }

    populateForm(window) {
        // Populate basic fields
        this.setFieldValue('title', window.title);
        this.setFieldValue('alternativeTitles', window.alternativeTitles?.join(', ') || '');
        
        // Location
        this.setFieldValue('buildingName', window.currentLocation?.buildingName || '');
        this.setFieldValue('city', window.currentLocation?.city || '');
        this.setFieldValue('country', window.currentLocation?.country || '');
        this.setFieldValue('specificLocation', window.currentLocation?.specificLocation || '');
        
        // Dating and materials
        this.setFieldValue('dateCreated', window.dateCreated?.value || '');
        
        // Materials checkboxes
        const materials = window.materials || [];
        materials.forEach(material => {
            const checkbox = this.form.querySelector(`input[name="materials"][value="${material}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Optional fields
        if (window.dimensions) {
            this.setFieldValue('height', window.dimensions.height);
            this.setFieldValue('width', window.dimensions.width);
            this.setFieldValue('dimensionUnit', window.dimensions.unit);
        }
        
        this.setFieldValue('description', window.description || '');
        this.setFieldValue('subjects', window.subjects?.join(', ') || '');
    }

    setFieldValue(name, value) {
        const field = this.form.querySelector(`[name="${name}"]`);
        if (field && value !== undefined && value !== null) {
            field.value = value;
        }
    }

    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        // Basic fields
        data.title = formData.get('title')?.trim() || '';
        data.alternativeTitles = formData.get('alternativeTitles')
            ?.split(',')
            .map(s => s.trim())
            .filter(s => s) || [];
        
        // Location
        data.currentLocation = {
            buildingName: formData.get('buildingName')?.trim() || '',
            city: formData.get('city')?.trim() || '',
            country: formData.get('country') || '',
            specificLocation: formData.get('specificLocation')?.trim() || ''
        };
        
        // Dating
        data.dateCreated = {
            value: formData.get('dateCreated')?.trim() || ''
        };
        
        // Materials
        data.materials = formData.getAll('materials');
        
        // Dimensions
        const height = parseFloat(formData.get('height'));
        const width = parseFloat(formData.get('width'));
        if (!isNaN(height) && !isNaN(width)) {
            data.dimensions = {
                height,
                width,
                unit: formData.get('dimensionUnit') || 'cm'
            };
        }
        
        // Optional fields
        data.description = formData.get('description')?.trim() || '';
        data.subjects = formData.get('subjects')
            ?.split(',')
            .map(s => s.trim())
            .filter(s => s) || [];
        
        // Preserve existing metadata
        if (this.currentWindow) {
            data.id = this.currentWindow.id;
            data.created = this.currentWindow.created;
        }
        
        return data;
    }

    async saveWindow() {
        const data = this.getFormData();
        const validation = validator.validateWindow(data);
        
        if (!validation.isValid) {
            this.showValidationErrors(validation.errors);
            return Promise.reject(validation.errors);
        }
        
        this.clearValidationErrors();
        this.showSaveStatus('saving');
        
        const result = storage.save(data);
        
        if (result.success) {
            this.currentWindow = result.window;
            this.isDirty = false;
            this.showSaveStatus('saved');
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('windowSaved', { 
                detail: result.window 
            }));
            
            return Promise.resolve(result.window);
        } else {
            this.showSaveStatus('error', result.error);
            return Promise.reject(result.error);
        }
    }

    markDirty() {
        this.isDirty = true;
        this.showSaveStatus('unsaved');
    }

    scheduleAutoSave() {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            if (this.isDirty) {
                this.saveWindow().catch(() => {
                    // Auto-save failed, user will see error status
                });
            }
        }, 2000);
    }

    showSaveStatus(status, message = '') {
        const statusEl = this.container.querySelector('#save-status');
        statusEl.className = `save-status ${status}`;
        
        switch (status) {
            case 'unsaved':
                statusEl.textContent = '● Unsaved changes';
                break;
            case 'saving':
                statusEl.textContent = '● Saving...';
                break;
            case 'saved':
                statusEl.textContent = '✓ Saved';
                setTimeout(() => {
                    if (statusEl.classList.contains('saved')) {
                        statusEl.textContent = '';
                        statusEl.className = 'save-status';
                    }
                }, 3000);
                break;
            case 'error':
                statusEl.textContent = `⚠ Save failed: ${message}`;
                break;
        }
    }

    validateField(field) {
        const errors = validator.validateField(field.name, field.value, this.getFormData());
        const errorEl = this.form.querySelector(`#${field.name}-error`);
        
        if (errors.length > 0) {
            field.classList.add('error');
            if (errorEl) errorEl.textContent = errors[0];
        } else {
            field.classList.remove('error');
            if (errorEl) errorEl.textContent = '';
        }
    }

    showValidationErrors(errors) {
        Object.entries(errors).forEach(([fieldName, messages]) => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            const errorEl = this.form.querySelector(`#${fieldName}-error`);
            
            if (field) field.classList.add('error');
            if (errorEl) errorEl.textContent = messages[0];
        });
        
        // Scroll to first error
        const firstError = this.form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }

    clearValidationErrors() {
        this.form.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
        
        this.form.querySelectorAll('.field-error').forEach(el => {
            el.textContent = '';
        });
    }

    toggleSection(button) {
        const target = button.dataset.target;
        const content = this.form.querySelector(`#${target}`);
        const icon = button.querySelector('.toggle-icon');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.textContent = '▲';
        } else {
            content.style.display = 'none';
            icon.textContent = '▼';
        }
    }

    resetForm() {
        this.form.reset();
        this.clearValidationErrors();
        this.isDirty = false;
        this.showSaveStatus('');
    }
}
```

## Advantages of Vanilla JS Approach

### Significant Benefits
1. **Zero Dependencies**: No build process, no package.json, no node_modules
2. **Instant Loading**: No framework overhead, direct browser execution
3. **Easier Debugging**: Plain JavaScript, no transpilation layers
4. **Future-Proof**: Will work in browsers for decades
5. **Smaller Bundle**: Likely 50-70% smaller than React equivalent
6. **Simpler Deployment**: Just copy files to any web server

### Performance Improvements
- **First Load**: ~200-500ms faster (no framework parsing)
- **Memory Usage**: ~20-40% less RAM usage
- **File Size**: Estimated 50-150KB total vs 500KB+ for React

### Development Benefits
- **No Build Step**: Edit and refresh, immediate feedback
- **Standard APIs**: localStorage, fetch, DOM manipulation
- **Easier Onboarding**: Any developer can contribute
- **No Version Conflicts**: No dependency management

## Quick Migration Checklist

### Convert React Concepts to Vanilla JS
- **Components** → Classes with render() methods
- **useState** → Class properties + manual DOM updates  
- **useEffect** → Event listeners + lifecycle methods
- **Props** → Constructor parameters + method arguments
- **JSX** → Template literals + innerHTML
- **React Router** → Simple hash-based routing

### Estimated Timeline Adjustment
- **React Version**: 2-3 days
- **Vanilla JS Version**: 1-2 days (simpler, less abstraction)

The vanilla JS approach is definitely the better choice for this MVP - simpler, faster, and more maintainable!