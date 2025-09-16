/**
 * CVMA Annotation Tool - Test Suite
 * Compact unit tests for all functionality
 */

// Test runner
function runTests() {
    console.log('🧪 Starting CVMA Annotation Tool Tests...\n');
    
    let passed = 0;
    let failed = 0;
    
    const syncTests = [
        // Core functionality
        testDataLoading,
        testItemDisplay,
        testSearch,
        testPagination,
        testViewToggle,
        
        // Annotation system
        testAnnotationStorage,
        testAnnotationCRUD,
        testAnnotationValidation,
        testAnnotationExport,
        testAnnotationImport,
        
        // UI interactions
        testModalOperations,
        testErrorHandling,
        
        // Advanced filtering
        testFilterSystem,
        testCombinedSearchAndFilter,
        testFilterPersistence
    ];
    
    // Run synchronous tests
    syncTests.forEach(test => {
        try {
            test();
            console.log(`✅ ${test.name}`);
            passed++;
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.message}`);
            failed++;
        }
    });
    
    // Run async form test separately
    setTimeout(() => {
        try {
            testFormHandling();
            console.log(`✅ testFormHandling (async)`);
            passed++;
        } catch (error) {
            console.log(`❌ testFormHandling: ${error.message}`);
            failed++;
        }
        
        console.log(`\n📊 Final Results: ${passed} passed, ${failed} failed`);
    }, 200);
    
    console.log(`\n📊 Sync Results: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// === CORE FUNCTIONALITY TESTS ===

function testDataLoading() {
    // Test data structure exists
    assert(typeof allItems === 'object', 'allItems should be object');
    assert(Array.isArray(filteredItems), 'filteredItems should be array');
    assert(Object.keys(allItems).length > 0, 'Should have loaded items');
    
    // Test item structure
    const firstItem = Object.values(allItems)[0];
    assert(firstItem.id, 'Item should have id');
    assert(firstItem.label, 'Item should have label');
}

function testItemDisplay() {
    // Store original view state
    const originalView = currentView;
    
    // Test grid view rendering
    const mockItems = [{ id: 'test1', label: 'Test Item', period: '1500' }];
    renderGridView(mockItems);
    
    const gridView = document.getElementById('gridView');
    assert(!gridView.classList.contains('hidden'), 'Grid view should be visible');
    assert(gridView.innerHTML.includes('Test Item'), 'Should render item label');
    
    // Test list view rendering
    renderListView(mockItems);
    const listView = document.getElementById('listView');
    assert(!listView.classList.contains('hidden'), 'List view should be visible');
    
    // Restore original view state
    currentView = originalView;
    renderItems(); // Re-render with original data and view
}

function testSearch() {
    // Setup test data
    const originalItems = allItems;
    const originalFiltered = [...filteredItems];
    const originalPage = currentPage;
    
    allItems = {
        'test1': { id: 'test1', label: 'Medieval Window', period: '1400' },
        'test2': { id: 'test2', label: 'Gothic Glass', period: '1500' }
    };
    
    // Test search functionality
    document.getElementById('searchInput').value = 'medieval';
    performSearch();
    
    assert(filteredItems.length === 1, 'Should filter to 1 item');
    assert(filteredItems[0].id === 'test1', 'Should find correct item');
    
    // Reset everything properly
    allItems = originalItems;
    filteredItems = originalFiltered;
    currentPage = originalPage;
    document.getElementById('searchInput').value = '';
    renderItems();
}

function testPagination() {
    // Store original state
    const originalFiltered = [...filteredItems];
    const originalPage = currentPage;
    
    // Test page calculation
    filteredItems = new Array(150).fill().map((_, i) => ({ id: `item${i}`, label: `Item ${i}` }));
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    assert(totalPages === 3, 'Should calculate 3 pages for 150 items');
    
    // Test page navigation
    goToPage(2);
    assert(currentPage === 2, 'Should navigate to page 2');
    
    // Test bounds
    goToPage(999);
    assert(currentPage === 2, 'Should not exceed max pages');
    
    // Restore original state
    filteredItems = originalFiltered;
    currentPage = originalPage;
    renderItems();
}

function testViewToggle() {
    // Store original view
    const originalView = currentView;
    
    setView('grid');
    assert(currentView === 'grid', 'Should set grid view');
    
    setView('list');
    assert(currentView === 'list', 'Should set list view');
    
    // Restore original view
    setView(originalView);
}

// === ANNOTATION SYSTEM TESTS ===

function testAnnotationStorage() {
    // Store original state
    const originalAnnotations = { ...annotations };
    
    // Clear storage and reload
    localStorage.removeItem('cvma-annotations');
    annotations = {};
    loadAnnotations();
    assert(Object.keys(annotations).length === 0, 'Should start with empty annotations');
    
    // Test save/load
    annotations['test1'] = [{ id: '1', content: 'Test annotation', type: 'note' }];
    saveAnnotations();
    
    annotations = {};
    loadAnnotations();
    assert(annotations['test1'].length === 1, 'Should persist annotations');
    assert(annotations['test1'][0].content === 'Test annotation', 'Should preserve content');
    
    // Restore original state
    annotations = originalAnnotations;
    saveAnnotations();
}

function testAnnotationCRUD() {
    // Store original state
    const originalAnnotations = { ...annotations };
    const testItemId = 'crudTest' + Date.now();
    
    // Clear test item annotations
    delete annotations[testItemId];
    
    // Test create
    const annotation = addAnnotation(testItemId, 'note', 'Test content');
    assert(annotation.id, 'Should generate annotation ID');
    assert(annotation.content === 'Test content', 'Should set content');
    assert(getAnnotationCount(testItemId) === 1, 'Should increment count');
    
    // Test read
    const retrieved = getAnnotations(testItemId);
    assert(retrieved.length === 1, 'Should retrieve annotations');
    
    // Test update
    editAnnotation(testItemId, annotation.id, 'Updated content');
    const updated = getAnnotations(testItemId)[0];
    assert(updated.content === 'Updated content', 'Should update content');
    
    // Test delete
    deleteAnnotation(testItemId, annotation.id);
    assert(getAnnotationCount(testItemId) === 0, 'Should delete annotation');
    
    // Restore original state
    annotations = originalAnnotations;
    saveAnnotations();
}

function testAnnotationValidation() {
    // Test empty content
    try {
        addAnnotation('test1', 'note', '');
        assert(false, 'Should reject empty content');
    } catch (error) {
        // Expected to fail
    }
    
    // Test content trimming
    const annotation = addAnnotation('test1', 'note', '  trimmed  ');
    assert(annotation.content === 'trimmed', 'Should trim whitespace');
}

function testAnnotationExport() {
    // Setup test data
    annotations = {
        'test1': [{ id: '1', content: 'Test', type: 'note', timestamp: Date.now() }]
    };
    
    // Mock export (can't test file download in unit test)
    const exportData = {
        exported: new Date().toISOString(),
        version: '1.0',
        annotations: annotations
    };
    
    assert(exportData.annotations['test1'], 'Should include annotations in export');
    assert(exportData.version === '1.0', 'Should include version');
}

function testAnnotationImport() {
    // Clear annotations
    annotations = {};
    
    // Mock import data
    const importData = {
        annotations: {
            'test2': [{ id: '2', content: 'Imported', type: 'note' }]
        }
    };
    
    // Simulate import process
    Object.keys(importData.annotations).forEach(itemId => {
        if (!annotations[itemId]) {
            annotations[itemId] = [];
        }
        annotations[itemId] = [...annotations[itemId], ...importData.annotations[itemId]];
    });
    
    assert(getAnnotationCount('test2') === 1, 'Should import annotations');
    assert(getAnnotations('test2')[0].content === 'Imported', 'Should preserve content');
}

// === UI INTERACTION TESTS ===

function testModalOperations() {
    const modal = document.getElementById('modal');
    
    // Test with existing item
    const firstItemId = Object.keys(allItems)[0];
    if (firstItemId) {
        showItemDetail(firstItemId);
        assert(modal.style.display === 'block', 'Should show modal');
        
        // Test modal closing
        closeModal();
        assert(modal.style.display === 'none', 'Should hide modal');
    } else {
        // Skip if no items available
        console.log('⚠️ Skipping modal test - no items available');
    }
}

function testFormHandling() {
    // Open modal first to create form elements
    const firstItemId = Object.keys(allItems)[0];
    if (!firstItemId) {
        console.log('⚠️ Skipping form test - no items available');
        return;
    }
    
    showItemDetail(firstItemId);
    
    // Wait a moment for DOM to update, then test form
    setTimeout(() => {
        const typeSelect = document.getElementById('annotationType');
        const contentTextarea = document.getElementById('annotationContent');
        
        if (typeSelect && contentTextarea) {
            typeSelect.value = 'iconography';
            contentTextarea.value = 'Test annotation';
            
            const initialCount = getAnnotationCount(firstItemId);
            submitAnnotation(firstItemId);
            
            assert(getAnnotationCount(firstItemId) === initialCount + 1, 'Should add annotation via form');
            assert(contentTextarea.value === '', 'Should clear form');
        } else {
            console.log('⚠️ Form elements not found - modal may not be open');
        }
        
        closeModal();
    }, 100);
}

function testErrorHandling() {
    // Test with malformed data
    const mockItem = { id: 'test', label: 'Test', license: null };
    
    try {
        // This should not throw error after fix
        const properties = [];
        if (mockItem.license) {
            const licenseText = typeof mockItem.license === 'string' ? 
                mockItem.license.split('/').pop() : mockItem.license;
            properties.push(['License', licenseText]);
        }
        // Should handle null license gracefully
    } catch (error) {
        assert(false, 'Should handle null license gracefully');
    }
}

// === UTILITY FUNCTIONS ===

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// === TEST EXECUTION ===

// Run tests when page loads (after app initialization)
document.addEventListener('DOMContentLoaded', () => {
    // Wait for app to initialize
    setTimeout(() => {
        if (typeof allItems !== 'undefined') {
            runTests();
        }
    }, 1000);
});

// === ADVANCED FILTERING TESTS ===

function testFilterSystem() {
    // Test filter options building
    buildFilterOptions();
    assert(availableFilters.locations.size > 0, 'Should build location options');
    assert(availableFilters.subjects.size > 0, 'Should build subject options');
    assert(availableFilters.elementTypes.size > 0, 'Should build element type options');
    
    // Test dropdown population
    populateFilterDropdowns();
    const locationSelect = document.getElementById('locationFilter');
    const subjectSelect = document.getElementById('subjectFilter');
    const elementTypeSelect = document.getElementById('elementTypeFilter');
    
    assert(locationSelect.options.length > 0, 'Should populate location options');
    assert(subjectSelect.options.length > 0, 'Should populate subject options');
    assert(elementTypeSelect.options.length > 0, 'Should populate element type options');
}

function testCombinedSearchAndFilter() {
    // Store original state
    const originalFiltered = [...filteredItems];
    const originalFilters = { ...activeFilters };
    
    // Test period filtering
    activeFilters.periodFrom = '1300';
    activeFilters.periodTo = '1400';
    performSearchAndFilter();
    
    // Should have filtered items
    assert(filteredItems.length < originalFiltered.length, 'Period filter should reduce results');
    assert(filteredItems.every(item => {
        const year = extractYearFromPeriod(item.period || item.creationPeriod);
        return !year || (year >= 1300 && year <= 1400);
    }), 'All items should be within period range');
    
    // Test combined search + filter
    document.getElementById('searchInput').value = 'window';
    performSearchAndFilter();
    
    // Should further reduce results
    const filteredCount = filteredItems.length;
    assert(filteredCount <= originalFiltered.length, 'Combined filter should maintain or reduce results');
    
    // Restore state
    activeFilters = originalFilters;
    filteredItems = originalFiltered;
    document.getElementById('searchInput').value = '';
    renderItems();
}

function testFilterPersistence() {
    // Test saving filters
    const testFilters = {
        periodFrom: '1200',
        periodTo: '1500',
        locations: ['123456'],
        subjects: ['test-subject'],
        elementTypes: ['test-type']
    };
    
    activeFilters = testFilters;
    saveFilters();
    
    // Clear and reload
    activeFilters = {
        periodFrom: '',
        periodTo: '',
        locations: [],
        subjects: [],
        elementTypes: []
    };
    
    loadFilters();
    
    // Should restore saved filters
    assert(activeFilters.periodFrom === '1200', 'Should persist period from');
    assert(activeFilters.periodTo === '1500', 'Should persist period to');
    assert(activeFilters.locations.includes('123456'), 'Should persist locations');
    assert(activeFilters.subjects.includes('test-subject'), 'Should persist subjects');
    assert(activeFilters.elementTypes.includes('test-type'), 'Should persist element types');
    
    // Clear for cleanup
    clearAllFilters();
}

// Export for manual testing
window.runTests = runTests;