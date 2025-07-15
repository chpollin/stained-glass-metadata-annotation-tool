# Implementation Instructions - Stained Glass Documentation Tool

## Architecture Overview

### Technology Stack
- **HTML5**: Semantic structure with accessibility features
- **CSS3**: Modern Grid/Flexbox with CSS custom properties
- **Vanilla JavaScript**: Zero external dependencies, ES6+ features
- **localStorage**: Client-side persistence with compression
- **Schema.org JSON-LD**: Standards-compliant export format

### Project Structure
```
stained-glass-metadata-annotation-tool/
├── index.html              # Complete application interface (44 KB)
├── style.css               # Unified styling system (32 KB)
├── app.js                  # Core application logic (34 KB)
├── import-export.js        # Data processing module (24 KB)
├── table.js                # Table view & bulk operations (35 KB)
├── README.md               # Project overview and quick start (14 KB)
├── DESIGN.md               # UI/UX patterns and design system (10 KB)
├── REQUIREMENTS.md         # Feature specifications and status (12 KB)
├── DATA.md                 # Data structures and schemas (8 KB)
└── data/                   # Sample data storage
    └── wikidata-export.json
```

**Total Size**: ~213 KB (optimized for fast loading)

### Core Architecture Principles

#### Single-Page Application Pattern
- **View Management**: CSS class toggling for section visibility
- **State Management**: Global variables with functional updates
- **Event Handling**: Direct DOM listeners with event delegation
- **No Framework**: Pure JavaScript with modern browser APIs

#### Functional Programming Approach
```javascript
// Pure functions for data transformation
const transformWindowData = (formData) => ({
  ...processRequiredFields(formData),
  ...processOptionalFields(formData),
  ...generateMetadata()
});

// Immutable state updates
const updateWindows = (windows, updatedWindow) => 
  windows.map(w => w.id === updatedWindow.id ? updatedWindow : w);
```

#### Progressive Enhancement Strategy
- **Accessibility First**: WCAG 2.1 AA compliance from the ground up
- **Mobile First**: Responsive design with mobile-optimized interactions
- **Graceful Degradation**: Fallbacks for unsupported browser features

## Implementation Guide

### HTML Foundation (`index.html`)

#### Semantic Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stained Glass Documentation Tool</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Skip link for screen readers -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <div class="container">
        <header role="banner">
            <h1>Stained Glass Documentation Tool</h1>
            <div id="save-status" aria-live="polite" role="status"></div>
        </header>
        
        <!-- Main navigation -->
        <nav role="navigation" aria-label="Main navigation">
            <button type="button" onclick="showView('list')" 
                    aria-label="View documented windows">View Windows</button>
            <button type="button" onclick="showView('form')" 
                    aria-label="Add new window">Add Window</button>
            <button type="button" onclick="showImportDialog()" 
                    aria-label="Import data">Import</button>
            <button type="button" onclick="showExportDialog()" 
                    aria-label="Export data">Export</button>
        </nav>
        
        <!-- Status messages -->
        <div id="status-message" aria-live="polite" role="status"></div>
        
        <!-- Main content area -->
        <main id="main-content">
            <!-- Multiple views: list-view, form-view, about-view -->
        </main>
    </div>
    
    <!-- Modal containers -->
    <div id="modal-overlay" class="modal-overlay" style="display: none;">
        <!-- Dynamic modal content -->
    </div>
    
    <!-- Script loading -->
    <script src="app.js"></script>
    <script src="import-export.js"></script>
    <script src="table.js"></script>
</body>
</html>
```

#### Accessibility Features
- **Semantic landmarks**: `header`, `nav`, `main` with ARIA roles
- **Skip links**: Direct navigation to main content
- **Live regions**: Status updates announced to screen readers
- **Proper labeling**: All interactive elements have descriptive labels
- **Keyboard navigation**: Complete keyboard accessibility

### CSS Architecture (`style.css`)

#### Design System Foundation
```css
:root {
    /* Color palette (WCAG AA compliant) */
    --primary: #2563eb;
    --success: #16a34a;
    --warning: #d97706;
    --error: #dc2626;
    --neutral-900: #111827;
    --neutral-700: #374151;
    --neutral-500: #6b7280;
    --neutral-300: #d1d5db;
    --neutral-100: #f3f4f6;
    --neutral-50: #f9fafb;
    
    /* Typography scale */
    --text-xl: 1.5rem;
    --text-lg: 1.25rem;
    --text-base: 1rem;
    --text-sm: 0.875rem;
    --text-xs: 0.75rem;
    
    /* Spacing system */
    --s1: 0.25rem;
    --s2: 0.5rem;
    --s3: 0.75rem;
    --s4: 1rem;
    --s5: 1.25rem;
    --s6: 1.5rem;
    
    /* Layout */
    --radius: 0.375rem;
    --container-max: 1440px;
}

/* CSS Reset and base styles */
*, *::before, *::after {
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: var(--neutral-700);
    margin: 0;
}

/* Layout system */
.container {
    max-width: var(--container-max);
    margin: 0 auto;
    padding: var(--s4);
}

/* Component patterns - see DESIGN.md for complete patterns */
.view {
    display: none;
}

.view.active {
    display: block;
}

/* Responsive design */
@media (max-width: 768px) {
    .container {
        padding: var(--s2);
    }
    
    /* Mobile-specific adaptations */
}
```

#### Performance Optimizations
- **CSS custom properties**: Efficient theme system
- **Minimal specificity**: Avoids CSS specificity wars
- **Mobile-first**: Reduces CSS payload on mobile devices
- **Critical CSS**: Essential styles inline, enhanced styles external

### Core Application Logic (`app.js`)

#### Global State Management
```javascript
// Application state
let windows = [];
let currentEditId = null;
let filteredWindows = [];
let currentView = 'list';
let searchTimeout = null;
let autoSaveTimeout = null;

// Configuration
const CONFIG = {
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    SEARCH_DEBOUNCE: 300,      // 300ms
    MAX_STORAGE_SIZE: 5000000, // 5MB
    IMAGE_PLACEHOLDER: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
};
```

#### Initialization Pattern
```javascript
// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    try {
        loadData();
        updateDisplay();
        setupEventListeners();
        setupKeyboardShortcuts();
        setupImageLazyLoading();
        showView('list');
        
        // Auto-save setup
        setInterval(performAutoSave, CONFIG.AUTO_SAVE_INTERVAL);
        
        console.log('Application initialized successfully');
    } catch (error) {
        handleError(error, 'initialization');
    }
});

// Event listener setup
function setupEventListeners() {
    // Form submission
    const windowForm = document.getElementById('window-form');
    if (windowForm) {
        windowForm.addEventListener('submit', saveWindow);
    }
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keydown', handleSearchKeydown);
    }
    
    // View switching
    document.addEventListener('click', handleViewSwitching);
    
    // Before unload warning
    window.addEventListener('beforeunload', handleBeforeUnload);
}
```

#### CRUD Operations
```javascript
// Create new window
function createWindow(windowData) {
    const newWindow = {
        ...windowData,
        id: generateUUID(),
        created: new Date().toISOString(),
        modified: new Date().toISOString()
    };
    
    windows.push(newWindow);
    return newWindow;
}

// Read/retrieve windows
function getWindow(id) {
    return windows.find(w => w.id === id);
}

function getAllWindows() {
    return [...windows]; // Return copy to prevent mutations
}

// Update existing window
function updateWindow(id, updates) {
    const index = windows.findIndex(w => w.id === id);
    if (index === -1) {
        throw new Error(`Window with id ${id} not found`);
    }
    
    windows[index] = {
        ...windows[index],
        ...updates,
        modified: new Date().toISOString()
    };
    
    return windows[index];
}

// Delete window
function deleteWindow(id) {
    const index = windows.findIndex(w => w.id === id);
    if (index === -1) {
        throw new Error(`Window with id ${id} not found`);
    }
    
    const deleted = windows.splice(index, 1)[0];
    return deleted;
}
```

#### Error Handling Strategy
```javascript
// Centralized error handling
function handleError(error, context = 'unknown') {
    console.error(`Error in ${context}:`, error);
    
    // User-friendly error messages
    const userMessage = getUserFriendlyErrorMessage(error, context);
    showStatus(userMessage, 'error');
    
    // Log for debugging
    logError(error, context);
    
    // Recovery actions
    if (context === 'save') {
        showDataRecoveryOptions();
    }
}

function getUserFriendlyErrorMessage(error, context) {
    const messages = {
        'save': 'Unable to save your work. Please try again.',
        'load': 'Unable to load your data. Please refresh the page.',
        'export': 'Export failed. Please check your data and try again.',
        'import': 'Import failed. Please check your file format.',
        'search': 'Search encountered an error. Please try different terms.'
    };
    
    return messages[context] || 'An unexpected error occurred. Please try again.';
}
```

## Key Implementation Patterns

### 1. Data Flow Pattern
```javascript
// Unidirectional data flow
User Input → Validation → State Update → Storage → UI Update

// Example implementation
function saveWindow(event) {
    event.preventDefault();
    
    try {
        // 1. Extract and validate data
        const formData = new FormData(event.target);
        const windowData = processFormData(formData);
        const errors = validateWindowData(windowData);
        
        if (errors.length > 0) {
            showValidationErrors(errors);
            return;
        }
        
        // 2. Update state
        if (currentEditId) {
            updateWindow(currentEditId, windowData);
        } else {
            createWindow(windowData);
        }
        
        // 3. Persist to storage
        saveData();
        
        // 4. Update UI
        updateDisplay();
        showView('list');
        showStatus('Window saved successfully', 'success');
        
    } catch (error) {
        handleError(error, 'save');
    }
}
```

### 2. Event-Driven Architecture
```javascript
// Custom events for loose coupling
function dispatchWindowEvent(type, windowData) {
    const event = new CustomEvent(`window${type}`, {
        detail: { window: windowData, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
}

// Event listeners in modules
window.addEventListener('windowSaved', (event) => {
    updateTableView(event.detail.window);
    updateStatistics();
});

window.addEventListener('windowDeleted', (event) => {
    removeFromTableView(event.detail.window.id);
    updateStatistics();
});
```

### 3. Performance Optimization Patterns
```javascript
// Lazy loading for images
function setupImageLazyLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Debounced search
function handleSearch(event) {
    clearTimeout(searchTimeout);
    const query = event.target.value;
    
    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, CONFIG.SEARCH_DEBOUNCE);
}

// Virtual scrolling for large lists (if needed)
function renderVirtualList(items, container, itemHeight = 100) {
    const viewportHeight = container.clientHeight;
    const totalHeight = items.length * itemHeight;
    const visibleCount = Math.ceil(viewportHeight / itemHeight) + 2;
    
    // Implementation details...
}
```

### 4. Security Considerations
```javascript
// XSS prevention
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Safe URL validation
function isValidImageURL(url) {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol) &&
               parsed.hostname.includes('wikimedia.org');
    } catch {
        return false;
    }
}

// Content Security Policy recommendations
/*
Content-Security-Policy: 
    default-src 'self'; 
    img-src 'self' https://upload.wikimedia.org https://commons.wikimedia.org data:; 
    style-src 'self' 'unsafe-inline';
    script-src 'self';
*/
```

## Development Workflow

### Local Development Setup
```bash
# No build process required - direct file editing
1. Clone or download project files
2. Open index.html in modern browser
3. Use browser dev tools for debugging
4. Edit files directly and refresh browser

# Recommended development tools
- Browser: Chrome/Firefox with dev tools
- Editor: VS Code with Live Server extension
- Testing: Manual testing + browser dev tools
- Debugging: Console logging + breakpoints
```

### Testing Procedures

#### Manual Testing Checklist
```javascript
// Core functionality tests
const MANUAL_TESTS = [
    // CRUD Operations
    'Create new window with all required fields',
    'Edit existing window and verify changes persist',
    'Delete window with confirmation dialog',
    'Search windows by title, location, description',
    
    // Data integrity
    'Auto-save works during form editing',
    'Draft recovery after browser refresh',
    'Export/import maintains data integrity',
    'Bulk operations work correctly',
    
    // UI/UX
    'Responsive design on mobile devices',
    'Keyboard navigation throughout app',
    'Screen reader announces status changes',
    'Error states display helpful messages',
    
    // Performance
    'Large datasets (1000+ windows) perform well',
    'Image lazy loading works correctly',
    'Search responds quickly (<50ms)',
    'Export completes for large datasets'
];
```

#### Browser Compatibility Testing
```javascript
// Supported browsers and features
const BROWSER_SUPPORT = {
    chrome: { min: 90, features: ['full'] },
    firefox: { min: 88, features: ['full'] },
    safari: { min: 14, features: ['full'] },
    edge: { min: 90, features: ['full'] }
};

// Required browser APIs
const REQUIRED_APIS = [
    'localStorage',
    'IntersectionObserver',
    'URL',
    'CustomEvent',
    'FormData',
    'JSON'
];
```

### Performance Monitoring

#### Key Metrics to Track
```javascript
// Performance benchmarks
const PERFORMANCE_TARGETS = {
    initialLoad: 2000,      // ms - first meaningful paint
    searchResponse: 50,     // ms - search result display
    exportGeneration: 5000, // ms - for 4000+ records
    memoryUsage: 50000000,  // bytes - max memory footprint
    storageEfficiency: 0.7  // ratio - compressed vs raw size
};

// Monitoring implementation
function trackPerformance(operation, startTime) {
    const duration = performance.now() - startTime;
    console.log(`${operation} completed in ${duration.toFixed(2)}ms`);
    
    // Log slow operations
    if (duration > PERFORMANCE_TARGETS[operation]) {
        console.warn(`${operation} exceeded target time`);
    }
}
```

### Deployment Guide

#### Static File Hosting
```bash
# Simple deployment - any web server
1. Copy all files to web server document root
2. Ensure HTTPS is enabled (required for localStorage)
3. Set appropriate MIME types:
   - .js files: application/javascript
   - .css files: text/css
   - .json files: application/json

# No server-side processing required
# No database setup needed
# No environment configuration necessary
```

#### Security Headers (Recommended)
```nginx
# Nginx configuration example
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy strict-origin-when-cross-origin;

# CSP header
add_header Content-Security-Policy "default-src 'self'; img-src 'self' https://*.wikimedia.org data:; style-src 'self' 'unsafe-inline'";
```

## Module Integration

### Inter-module Communication
```javascript
// Global API for module integration
window.appState = {
    // Data access
    getWindows: () => [...windows],
    getWindow: (id) => getWindow(id),
    
    // Data modification
    addWindow: (windowData) => createWindow(windowData),
    updateWindow: (id, updates) => updateWindow(id, updates),
    removeWindow: (id) => deleteWindow(id),
    
    // Persistence
    saveData: () => saveData(),
    loadData: () => loadData(),
    
    // UI updates
    updateDisplay: () => updateDisplay(),
    showView: (view) => showView(view),
    showStatus: (message, type) => showStatus(message, type)
};
```

### Extension Points
```javascript
// Plugin system for future enhancements
const plugins = new Map();

function registerPlugin(name, plugin) {
    if (typeof plugin.init === 'function') {
        plugins.set(name, plugin);
        plugin.init(window.appState);
    }
}

// Example plugin structure
const samplePlugin = {
    name: 'Advanced Search',
    version: '1.0.0',
    
    init(appState) {
        // Plugin initialization
    },
    
    onWindowSaved(windowData) {
        // React to window saves
    },
    
    getExportFormat() {
        return {
            name: 'Custom Format',
            extension: '.custom',
            generate: (windows) => { /* custom export logic */ }
        };
    }
};
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Storage Issues
```javascript
// Storage quota exceeded
if (error.name === 'QuotaExceededError') {
    showStorageWarning();
    offerDataCleanup();
}

// Storage corruption
function validateStorageData(data) {
    try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed.windows);
    } catch {
        return false;
    }
}
```

#### Performance Issues
```javascript
// Large dataset optimization
function optimizeForLargeDataset() {
    // Implement pagination
    if (windows.length > 1000) {
        enablePagination();
    }
    
    // Use virtual scrolling
    if (windows.length > 5000) {
        enableVirtualScrolling();
    }
}
```

#### Browser Compatibility
```javascript
// Feature detection and fallbacks
function checkBrowserSupport() {
    const missing = [];
    
    if (!window.localStorage) missing.push('localStorage');
    if (!window.IntersectionObserver) missing.push('IntersectionObserver');
    if (!window.URL) missing.push('URL API');
    
    if (missing.length > 0) {
        showUnsupportedBrowserWarning(missing);
    }
}
```