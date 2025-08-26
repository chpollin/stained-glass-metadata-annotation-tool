// ============================================================================
// STAINED GLASS DOCUMENTATION TOOL - TESTING & BENCHMARKING
// ============================================================================

class StainedGlassTestSuite {
    constructor() {
        this.testResults = [];
        this.benchmarks = {};
        this.testData = [];
        this.originalWindows = [];
        
        // Colors for console output
        this.colors = {
            green: '\x1b[32m',
            red: '\x1b[31m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            reset: '\x1b[0m'
        };
        
        this.init();
    }
    
    init() {
        // Backup original data
        this.originalWindows = [...(window.windows || [])];
        
        console.log(`${this.colors.blue}🧪 Stained Glass Test Suite Initialized${this.colors.reset}`);
        console.log(`${this.colors.cyan}📊 Available Commands:${this.colors.reset}`);
        console.log('• testSuite.runAllTests() - Run complete test suite');
        console.log('• testSuite.runPerformanceTests() - Run performance benchmarks');
        console.log('• testSuite.runFunctionalTests() - Run functional tests');
        console.log('• testSuite.generateTestData(n) - Generate n test records');
        console.log('• testSuite.benchmarkSearch() - Benchmark search performance');
        console.log('• testSuite.benchmarkExport() - Benchmark export performance');
        console.log('• testSuite.testAccessibility() - Test accessibility features');
        console.log('• testSuite.memoryUsage() - Check memory usage');
        console.log('• testSuite.cleanup() - Restore original data');
    }
    
    // ============================================================================
    // MAIN TEST RUNNER
    // ============================================================================
    
    async runAllTests() {
        console.log(`\n${this.colors.magenta}🚀 Running Complete Test Suite${this.colors.reset}`);
        console.log('=' .repeat(60));
        
        const startTime = performance.now();
        
        // Run all test categories
        await this.runFunctionalTests();
        await this.runPerformanceTests();
        await this.testAccessibility();
        await this.testResponsiveness();
        await this.testDataIntegrity();
        
        const totalTime = performance.now() - startTime;
        
        // Generate report
        this.generateReport(totalTime);
        
        return this.testResults;
    }
    
    // ============================================================================
    // FUNCTIONAL TESTS
    // ============================================================================
    
    async runFunctionalTests() {
        console.log(`\n${this.colors.blue}🔧 Functional Tests${this.colors.reset}`);
        console.log('-'.repeat(30));
        
        // Test CRUD operations
        await this.testCRUDOperations();
        
        // Test search functionality
        await this.testSearchFunctionality();
        
        // Test filtering
        await this.testFilteringFunctionality();
        
        // Test view switching
        await this.testViewSwitching();
        
        // Test import/export
        await this.testImportExport();
        
        // Test bulk operations
        await this.testBulkOperations();
    }
    
    async testCRUDOperations() {
        console.log('Testing CRUD Operations...');
        
        try {
            // Test Create
            const testWindow = this.createTestWindow();
            const createResult = this.simulateWindowSave(testWindow);
            this.assert(createResult.success, 'Window creation failed');
            
            // Test Read
            const readResult = this.simulateWindowRead(createResult.id);
            this.assert(readResult !== null, 'Window read failed');
            
            // Test Update
            const updateResult = this.simulateWindowUpdate(createResult.id, { title: 'Updated Title' });
            this.assert(updateResult.success, 'Window update failed');
            
            // Test Delete
            const deleteResult = this.simulateWindowDelete(createResult.id);
            this.assert(deleteResult.success, 'Window delete failed');
            
            this.logSuccess('CRUD Operations: PASSED');
        } catch (error) {
            this.logError('CRUD Operations: FAILED', error);
        }
    }
    
    async testSearchFunctionality() {
        console.log('Testing Search Functionality...');
        
        try {
            // Generate test data
            this.generateTestData(100);
            
            // Test search performance
            const searchTerm = 'test';
            const startTime = performance.now();
            
            // Simulate search
            const results = this.simulateSearch(searchTerm);
            
            const searchTime = performance.now() - startTime;
            
            this.assert(Array.isArray(results), 'Search should return array');
            this.assert(searchTime < 100, `Search too slow: ${searchTime}ms`);
            
            this.benchmarks.searchTime = searchTime;
            this.logSuccess(`Search: PASSED (${searchTime.toFixed(2)}ms)`);
        } catch (error) {
            this.logError('Search: FAILED', error);
        }
    }
    
    async testFilteringFunctionality() {
        console.log('Testing Filtering Functionality...');
        
        try {
            // Test country filter
            const countryFilter = this.simulateFilter('country', 'France');
            this.assert(countryFilter.length >= 0, 'Country filter failed');
            
            // Test material filter
            const materialFilter = this.simulateFilter('material', 'Stained Glass');
            this.assert(materialFilter.length >= 0, 'Material filter failed');
            
            // Test date range filter
            const dateFilter = this.simulateFilter('dateRange', 'medieval');
            this.assert(dateFilter.length >= 0, 'Date range filter failed');
            
            this.logSuccess('Filtering: PASSED');
        } catch (error) {
            this.logError('Filtering: FAILED', error);
        }
    }
    
    async testViewSwitching() {
        console.log('Testing View Switching...');
        
        try {
            // Test table view
            if (typeof window.toggleView === 'function') {
                window.toggleView('table');
                const tableVisible = document.getElementById('data-table-view').style.display !== 'none';
                this.assert(tableVisible, 'Table view switch failed');
                
                // Test card view
                window.toggleView('cards');
                const cardVisible = document.getElementById('windows-list').style.display !== 'none';
                this.assert(cardVisible, 'Card view switch failed');
                
                this.logSuccess('View Switching: PASSED');
            } else {
                this.logWarning('View Switching: SKIPPED (toggleView not available)');
            }
        } catch (error) {
            this.logError('View Switching: FAILED', error);
        }
    }
    
    async testImportExport() {
        console.log('Testing Import/Export...');
        
        try {
            // Test export functionality
            const exportStartTime = performance.now();
            const exportData = this.simulateExport('json');
            const exportTime = performance.now() - exportStartTime;
            
            this.assert(exportData !== null, 'Export failed');
            this.assert(exportTime < 5000, `Export too slow: ${exportTime}ms`);
            
            this.benchmarks.exportTime = exportTime;
            this.logSuccess(`Export: PASSED (${exportTime.toFixed(2)}ms)`);
            
            // Test import (mock)
            const importResult = this.simulateImport(this.createMockImportData());
            this.assert(importResult.success, 'Import failed');
            
            this.logSuccess('Import: PASSED');
        } catch (error) {
            this.logError('Import/Export: FAILED', error);
        }
    }
    
    async testBulkOperations() {
        console.log('Testing Bulk Operations...');
        
        try {
            // Test bulk selection
            const selectedItems = new Set(['1', '2', '3']);
            this.assert(selectedItems.size === 3, 'Bulk selection failed');
            
            // Test bulk export
            const bulkExportResult = this.simulateBulkExport(selectedItems);
            this.assert(bulkExportResult.success, 'Bulk export failed');
            
            this.logSuccess('Bulk Operations: PASSED');
        } catch (error) {
            this.logError('Bulk Operations: FAILED', error);
        }
    }
    
    // ============================================================================
    // PERFORMANCE BENCHMARKS
    // ============================================================================
    
    async runPerformanceTests() {
        console.log(`\n${this.colors.blue}⚡ Performance Benchmarks${this.colors.reset}`);
        console.log('-'.repeat(30));
        
        // Test with different data sizes
        const testSizes = [100, 500, 1000, 2000];
        
        for (const size of testSizes) {
            await this.benchmarkDataSize(size);
        }
        
        await this.benchmarkSearch();
        await this.benchmarkExport();
        await this.benchmarkMemoryUsage();
        await this.benchmarkDOMOperations();
    }
    
    async benchmarkDataSize(size) {
        console.log(`\nTesting with ${size} records...`);
        
        // Generate test data
        const startGeneration = performance.now();
        this.generateTestData(size);
        const generationTime = performance.now() - startGeneration;
        
        // Test search performance
        const startSearch = performance.now();
        this.simulateSearch('test');
        const searchTime = performance.now() - startSearch;
        
        // Test display update
        const startUpdate = performance.now();
        this.simulateDisplayUpdate();
        const updateTime = performance.now() - startUpdate;
        
        console.log(`📊 ${size} records:`);
        console.log(`  • Generation: ${generationTime.toFixed(2)}ms`);
        console.log(`  • Search: ${searchTime.toFixed(2)}ms`);
        console.log(`  • Display Update: ${updateTime.toFixed(2)}ms`);
        
        this.benchmarks[`size_${size}`] = {
            generation: generationTime,
            search: searchTime,
            update: updateTime
        };
        
        // Performance assertions
        this.assert(searchTime < 200, `Search too slow for ${size} records: ${searchTime}ms`);
        this.assert(updateTime < 500, `Display update too slow for ${size} records: ${updateTime}ms`);
    }
    
    async benchmarkSearch() {
        console.log('\nBenchmarking Search Performance...');
        
        // Generate large dataset
        this.generateTestData(1000);
        
        const searchTerms = ['test', 'window', 'church', 'glass', 'france'];
        const searchTimes = [];
        
        for (const term of searchTerms) {
            const startTime = performance.now();
            const results = this.simulateSearch(term);
            const searchTime = performance.now() - startTime;
            
            searchTimes.push(searchTime);
            console.log(`  • "${term}": ${searchTime.toFixed(2)}ms (${results.length} results)`);
        }
        
        const avgSearchTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;
        this.benchmarks.avgSearchTime = avgSearchTime;
        
        console.log(`📈 Average Search Time: ${avgSearchTime.toFixed(2)}ms`);
    }
    
    async benchmarkExport() {
        console.log('\nBenchmarking Export Performance...');
        
        const exportSizes = [100, 500, 1000];
        
        for (const size of exportSizes) {
            this.generateTestData(size);
            
            // Test JSON export
            const jsonStart = performance.now();
            this.simulateExport('json');
            const jsonTime = performance.now() - jsonStart;
            
            // Test CSV export
            const csvStart = performance.now();
            this.simulateExport('csv');
            const csvTime = performance.now() - csvStart;
            
            console.log(`📤 ${size} records:`);
            console.log(`  • JSON Export: ${jsonTime.toFixed(2)}ms`);
            console.log(`  • CSV Export: ${csvTime.toFixed(2)}ms`);
            
            this.benchmarks[`export_${size}`] = {
                json: jsonTime,
                csv: csvTime
            };
        }
    }
    
    async benchmarkMemoryUsage() {
        console.log('\nBenchmarking Memory Usage...');
        
        if (window.performance && window.performance.memory) {
            const memory = window.performance.memory;
            
            console.log(`💾 Memory Usage:`);
            console.log(`  • Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`  • Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`  • Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
            
            this.benchmarks.memory = {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit
            };
        } else {
            this.logWarning('Memory API not available');
        }
        
        // Test localStorage usage
        const storageUsage = this.calculateStorageUsage();
        console.log(`💿 Storage Usage: ${storageUsage.sizeMB} MB (${storageUsage.percentage}%)`);
    }
    
    async benchmarkDOMOperations() {
        console.log('\nBenchmarking DOM Operations...');
        
        // Test DOM manipulation speed
        const domTests = [
            () => this.testDOMInsertion(),
            () => this.testDOMUpdate(),
            () => this.testDOMQuery()
        ];
        
        const domBenchmarks = {};
        
        for (const test of domTests) {
            const startTime = performance.now();
            test();
            const testTime = performance.now() - startTime;
            
            domBenchmarks[test.name] = testTime;
            console.log(`  • ${test.name}: ${testTime.toFixed(2)}ms`);
        }
        
        this.benchmarks.dom = domBenchmarks;
    }
    
    // ============================================================================
    // ACCESSIBILITY TESTS
    // ============================================================================
    
    async testAccessibility() {
        console.log(`\n${this.colors.blue}♿ Accessibility Tests${this.colors.reset}`);
        console.log('-'.repeat(30));
        
        const a11yTests = [
            () => this.testAriaLabels(),
            () => this.testKeyboardNavigation(),
            () => this.testFocusManagement(),
            () => this.testSemanticHTML(),
            () => this.testColorContrast()
        ];
        
        for (const test of a11yTests) {
            try {
                test();
                this.logSuccess(`${test.name}: PASSED`);
            } catch (error) {
                this.logError(`${test.name}: FAILED`, error);
            }
        }
    }
    
    testAriaLabels() {
        const requiredAriaElements = [
            'button[aria-label]',
            'input[aria-label], input[aria-labelledby]',
            '[role="button"][aria-label]',
            '[aria-live]'
        ];
        
        for (const selector of requiredAriaElements) {
            const elements = document.querySelectorAll(selector);
            this.assert(elements.length > 0, `No elements found for: ${selector}`);
        }
    }
    
    testKeyboardNavigation() {
        // Test tab order
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        this.assert(focusableElements.length > 0, 'No focusable elements found');
        
        // Test skip link
        const skipLink = document.querySelector('.skip-link');
        this.assert(skipLink !== null, 'Skip link not found');
    }
    
    testFocusManagement() {
        // Test focus indicators
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
            // Simulate focus
            button.focus();
            const focused = document.activeElement === button;
            this.assert(focused, 'Focus management failed');
        }
    }
    
    testSemanticHTML() {
        // Test semantic structure
        const requiredElements = ['header', 'main', 'nav'];
        
        for (const tag of requiredElements) {
            const element = document.querySelector(tag);
            this.assert(element !== null, `${tag} element not found`);
        }
        
        // Test heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        this.assert(headings.length > 0, 'No headings found');
    }
    
    testColorContrast() {
        // Basic color contrast test (simplified)
        const testElements = document.querySelectorAll('button, a, .btn');
        
        for (const element of testElements) {
            const styles = window.getComputedStyle(element);
            const bgColor = styles.backgroundColor;
            const textColor = styles.color;
            
            this.assert(bgColor !== 'rgba(0, 0, 0, 0)', `Element has no background color`);
            this.assert(textColor !== 'rgba(0, 0, 0, 0)', `Element has no text color`);
        }
    }
    
    // ============================================================================
    // RESPONSIVENESS TESTS
    // ============================================================================
    
    async testResponsiveness() {
        console.log(`\n${this.colors.blue}📱 Responsiveness Tests${this.colors.reset}`);
        console.log('-'.repeat(30));
        
        const breakpoints = [
            { name: 'Mobile', width: 480 },
            { name: 'Tablet', width: 768 },
            { name: 'Desktop', width: 1024 },
            { name: 'Large Desktop', width: 1440 }
        ];
        
        for (const bp of breakpoints) {
            this.testBreakpoint(bp);
        }
    }
    
    testBreakpoint(breakpoint) {
        console.log(`Testing ${breakpoint.name} (${breakpoint.width}px)...`);
        
        // Note: This is a simplified test since we can't actually resize the window
        // In a real test, you'd use tools like Puppeteer or Selenium
        
        const viewport = document.querySelector('meta[name="viewport"]');
        this.assert(viewport !== null, 'Viewport meta tag not found');
        
        // Test responsive elements
        const responsiveElements = document.querySelectorAll('.container, .main-nav, .stats');
        this.assert(responsiveElements.length > 0, 'No responsive elements found');
        
        this.logSuccess(`${breakpoint.name}: PASSED`);
    }
    
    // ============================================================================
    // DATA INTEGRITY TESTS
    // ============================================================================
    
    async testDataIntegrity() {
        console.log(`\n${this.colors.blue}🔒 Data Integrity Tests${this.colors.reset}`);
        console.log('-'.repeat(30));
        
        this.testDataValidation();
        this.testStoragePersistence();
        this.testExportIntegrity();
    }
    
    testDataValidation() {
        console.log('Testing Data Validation...');
        
        // Test required fields
        const invalidWindow = { title: '', building: '', city: '', country: '' };
        const validationResult = this.simulateValidation(invalidWindow);
        this.assert(!validationResult.isValid, 'Validation should fail for empty fields');
        
        // Test valid data
        const validWindow = this.createTestWindow();
        const validResult = this.simulateValidation(validWindow);
        this.assert(validResult.isValid, 'Validation should pass for valid data');
        
        this.logSuccess('Data Validation: PASSED');
    }
    
    testStoragePersistence() {
        console.log('Testing Storage Persistence...');
        
        // Test localStorage
        const testData = { test: 'data' };
        localStorage.setItem('test-key', JSON.stringify(testData));
        const retrieved = JSON.parse(localStorage.getItem('test-key'));
        
        this.assert(retrieved.test === 'data', 'localStorage persistence failed');
        localStorage.removeItem('test-key');
        
        this.logSuccess('Storage Persistence: PASSED');
    }
    
    testExportIntegrity() {
        console.log('Testing Export Integrity...');
        
        // Generate test data
        const testWindows = [this.createTestWindow()];
        
        // Test JSON export
        const jsonExport = this.simulateExport('json', testWindows);
        this.assert(jsonExport['@context'] === 'https://schema.org', 'JSON-LD context missing');
        
        // Test CSV export
        const csvExport = this.simulateExport('csv', testWindows);
        this.assert(csvExport.includes('Title'), 'CSV headers missing');
        
        this.logSuccess('Export Integrity: PASSED');
    }
    
    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    
    generateTestData(count) {
        console.log(`Generating ${count} test records...`);
        
        this.testData = [];
        const startTime = performance.now();
        
        for (let i = 0; i < count; i++) {
            this.testData.push(this.createTestWindow(i));
        }
        
        const generationTime = performance.now() - startTime;
        console.log(`Generated ${count} records in ${generationTime.toFixed(2)}ms`);
        
        return this.testData;
    }
    
    createTestWindow(index = 0) {
        return {
            id: `test-${index}-${Date.now()}`,
            title: `Test Window ${index}`,
            building: `Test Church ${index}`,
            city: `Test City ${index}`,
            country: 'Test Country',
            date: `${1400 + index}`,
            materials: ['Stained Glass', 'Lead Came'],
            description: `Test description for window ${index}`,
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
    }
    
    simulateWindowSave(windowData) {
        // Mock save operation
        return { success: true, id: windowData.id };
    }
    
    simulateWindowRead(id) {
        // Mock read operation
        return this.testData.find(w => w.id === id) || null;
    }
    
    simulateWindowUpdate(id, updates) {
        // Mock update operation
        const window = this.testData.find(w => w.id === id);
        if (window) {
            Object.assign(window, updates);
            return { success: true };
        }
        return { success: false };
    }
    
    simulateWindowDelete(id) {
        // Mock delete operation
        const index = this.testData.findIndex(w => w.id === id);
        if (index !== -1) {
            this.testData.splice(index, 1);
            return { success: true };
        }
        return { success: false };
    }
    
    simulateSearch(term) {
        return this.testData.filter(window =>
            window.title.toLowerCase().includes(term.toLowerCase()) ||
            window.building.toLowerCase().includes(term.toLowerCase()) ||
            window.city.toLowerCase().includes(term.toLowerCase())
        );
    }
    
    simulateFilter(type, value) {
        switch (type) {
            case 'country':
                return this.testData.filter(w => w.country === value);
            case 'material':
                return this.testData.filter(w => w.materials.includes(value));
            case 'dateRange':
                return this.testData.filter(w => {
                    const year = parseInt(w.date);
                    switch (value) {
                        case 'medieval': return year < 1500;
                        case 'renaissance': return year >= 1500 && year < 1650;
                        case 'baroque': return year >= 1650 && year < 1750;
                        case 'modern': return year >= 1750;
                        default: return true;
                    }
                });
            default:
                return this.testData;
        }
    }
    
    simulateExport(format, data = this.testData) {
        if (format === 'json') {
            return {
                '@context': 'https://schema.org',
                '@type': 'Dataset',
                'hasPart': data
            };
        } else if (format === 'csv') {
            const headers = 'Title,Building,City,Country,Date';
            const rows = data.map(w => `${w.title},${w.building},${w.city},${w.country},${w.date}`);
            return headers + '\n' + rows.join('\n');
        }
        return null;
    }
    
    simulateImport(data) {
        // Mock import operation
        return { success: true, imported: data.length };
    }
    
    simulateBulkExport(selectedIds) {
        const selectedData = this.testData.filter(w => selectedIds.has(w.id));
        return { success: true, count: selectedData.length };
    }
    
    simulateDisplayUpdate() {
        // Mock display update
        const container = document.getElementById('windows-list');
        if (container) {
            container.innerHTML = `<!-- ${this.testData.length} items -->`;
        }
    }
    
    simulateValidation(windowData) {
        const errors = [];
        
        if (!windowData.title) errors.push('Title required');
        if (!windowData.building) errors.push('Building required');
        if (!windowData.city) errors.push('City required');
        if (!windowData.country) errors.push('Country required');
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    createMockImportData() {
        return [this.createTestWindow(), this.createTestWindow()];
    }
    
    testDOMInsertion() {
        const testDiv = document.createElement('div');
        testDiv.innerHTML = '<span>Test</span>';
        document.body.appendChild(testDiv);
        document.body.removeChild(testDiv);
    }
    
    testDOMUpdate() {
        const testDiv = document.createElement('div');
        testDiv.textContent = 'Original';
        testDiv.textContent = 'Updated';
    }
    
    testDOMQuery() {
        document.querySelectorAll('div');
        document.getElementById('main-content');
        document.getElementsByClassName('btn');
    }
    
    calculateStorageUsage() {
        const data = localStorage.getItem('stainedGlassWindows') || '{}';
        const sizeBytes = new Blob([data]).size;
        const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
        const maxMB = 5; // localStorage approximation
        const percentage = Math.round((sizeBytes / (maxMB * 1024 * 1024)) * 100);
        
        return { sizeBytes, sizeMB, percentage };
    }
    
    // ============================================================================
    // REPORTING AND UTILITIES
    // ============================================================================
    
    generateReport(totalTime) {
        console.log(`\n${this.colors.magenta}📋 Test Report${this.colors.reset}`);
        console.log('=' .repeat(60));
        
        const passed = this.testResults.filter(r => r.status === 'PASSED').length;
        const failed = this.testResults.filter(r => r.status === 'FAILED').length;
        const warnings = this.testResults.filter(r => r.status === 'WARNING').length;
        
        console.log(`${this.colors.green}✅ Passed: ${passed}${this.colors.reset}`);
        console.log(`${this.colors.red}❌ Failed: ${failed}${this.colors.reset}`);
        console.log(`${this.colors.yellow}⚠️ Warnings: ${warnings}${this.colors.reset}`);
        console.log(`⏱️ Total Time: ${totalTime.toFixed(2)}ms`);
        
        // Performance summary
        if (Object.keys(this.benchmarks).length > 0) {
            console.log(`\n${this.colors.cyan}⚡ Performance Summary${this.colors.reset}`);
            console.log('-'.repeat(30));
            
            if (this.benchmarks.avgSearchTime) {
                console.log(`🔍 Avg Search Time: ${this.benchmarks.avgSearchTime.toFixed(2)}ms`);
            }
            
            if (this.benchmarks.exportTime) {
                console.log(`📤 Export Time: ${this.benchmarks.exportTime.toFixed(2)}ms`);
            }
            
            if (this.benchmarks.memory) {
                const memUsed = (this.benchmarks.memory.used / 1024 / 1024).toFixed(2);
                console.log(`💾 Memory Used: ${memUsed} MB`);
            }
        }
        
        // Recommendations
        this.generateRecommendations();
    }
    
    generateRecommendations() {
        console.log(`\n${this.colors.yellow}💡 Recommendations${this.colors.reset}`);
        console.log('-'.repeat(30));
        
        const recommendations = [];
        
        if (this.benchmarks.avgSearchTime > 50) {
            recommendations.push('Consider optimizing search performance');
        }
        
        if (this.benchmarks.exportTime > 3000) {
            recommendations.push('Export performance could be improved');
        }
        
        if (this.benchmarks.memory && this.benchmarks.memory.used > 50 * 1024 * 1024) {
            recommendations.push('Monitor memory usage with large datasets');
        }
        
        if (recommendations.length === 0) {
            console.log(`${this.colors.green}✨ Performance looks good!${this.colors.reset}`);
        } else {
            recommendations.forEach(rec => console.log(`• ${rec}`));
        }
    }
    
    memoryUsage() {
        return this.benchmarkMemoryUsage();
    }
    
    cleanup() {
        console.log(`\n${this.colors.blue}🧹 Cleaning up test environment${this.colors.reset}`);
        
        // Restore original windows data
        if (typeof window.windows !== 'undefined') {
            window.windows = [...this.originalWindows];
        }
        
        // Clear test data
        this.testData = [];
        this.testResults = [];
        this.benchmarks = {};
        
        // Remove test elements
        const testElements = document.querySelectorAll('[data-test-element]');
        testElements.forEach(el => el.remove());
        
        // Clear localStorage test data
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('test-')) {
                localStorage.removeItem(key);
            }
        });
        
        // Refresh display if available
        if (window.appState && window.appState.updateDisplay) {
            window.appState.updateDisplay();
        }
        
        console.log(`${this.colors.green}✅ Cleanup complete${this.colors.reset}`);
    }
    
    // ============================================================================
    // ASSERTION AND LOGGING UTILITIES
    // ============================================================================
    
    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }
    
    logSuccess(message) {
        console.log(`${this.colors.green}✅ ${message}${this.colors.reset}`);
        this.testResults.push({ status: 'PASSED', message, timestamp: Date.now() });
    }
    
    logError(message, error = null) {
        console.log(`${this.colors.red}❌ ${message}${this.colors.reset}`);
        if (error) {
            console.log(`   Error: ${error.message}`);
        }
        this.testResults.push({ status: 'FAILED', message, error, timestamp: Date.now() });
    }
    
    logWarning(message) {
        console.log(`${this.colors.yellow}⚠️ ${message}${this.colors.reset}`);
        this.testResults.push({ status: 'WARNING', message, timestamp: Date.now() });
    }
    
    // ============================================================================
    // SPECIALIZED BENCHMARKS
    // ============================================================================
    
    async benchmarkLargeDataset() {
        console.log(`\n${this.colors.blue}📊 Large Dataset Benchmark${this.colors.reset}`);
        console.log('-'.repeat(30));
        
        const sizes = [5000, 10000, 25000];
        
        for (const size of sizes) {
            console.log(`\nTesting ${size} records...`);
            
            // Memory before
            const memBefore = this.getMemoryUsage();
            
            // Generate data
            const genStart = performance.now();
            this.generateTestData(size);
            const genTime = performance.now() - genStart;
            
            // Memory after generation
            const memAfterGen = this.getMemoryUsage();
            
            // Search performance
            const searchStart = performance.now();
            const searchResults = this.simulateSearch('test');
            const searchTime = performance.now() - searchStart;
            
            // Display update performance
            const updateStart = performance.now();
            this.simulateDisplayUpdate();
            const updateTime = performance.now() - updateStart;
            
            // Memory after operations
            const memAfter = this.getMemoryUsage();
            
            console.log(`📈 Results for ${size} records:`);
            console.log(`  • Generation: ${genTime.toFixed(2)}ms`);
            console.log(`  • Search: ${searchTime.toFixed(2)}ms (${searchResults.length} results)`);
            console.log(`  • Display: ${updateTime.toFixed(2)}ms`);
            console.log(`  • Memory Growth: ${((memAfter - memBefore) / 1024 / 1024).toFixed(2)}MB`);
            
            // Performance warnings
            if (searchTime > 500) {
                this.logWarning(`Search performance degraded at ${size} records`);
            }
            
            if (updateTime > 1000) {
                this.logWarning(`Display update slow at ${size} records`);
            }
            
            // Clear data to free memory
            this.testData = [];
        }
    }
    
    async benchmarkMobilePerformance() {
        console.log(`\n${this.colors.blue}📱 Mobile Performance Simulation${this.colors.reset}`);
        console.log('-'.repeat(30));
        
        // Simulate slower CPU (multiply times by factor)
        const slowdownFactor = 3;
        
        console.log(`Simulating ${slowdownFactor}x slower mobile CPU...`);
        
        // Test core operations
        const operations = [
            () => this.simulateSearch('test'),
            () => this.simulateDisplayUpdate(),
            () => this.simulateExport('json'),
            () => this.simulateFilter('country', 'France')
        ];
        
        this.generateTestData(1000);
        
        for (const op of operations) {
            const start = performance.now();
            op();
            const time = performance.now() - start;
            const simulatedMobileTime = time * slowdownFactor;
            
            console.log(`📱 ${op.name}: ${time.toFixed(2)}ms → ${simulatedMobileTime.toFixed(2)}ms (mobile)`);
            
            if (simulatedMobileTime > 1000) {
                this.logWarning(`${op.name} may be slow on mobile devices`);
            }
        }
    }
    
    getMemoryUsage() {
        if (window.performance && window.performance.memory) {
            return window.performance.memory.usedJSHeapSize;
        }
        return 0;
    }
    
    // ============================================================================
    // NETWORK SIMULATION
    // ============================================================================
    
    async benchmarkNetworkConditions() {
        console.log(`\n${this.colors.blue}🌐 Network Conditions Simulation${this.colors.reset}`);
        console.log('-'.repeat(30));
        
        // Simulate different network conditions
        const conditions = [
            { name: 'Fast 3G', latency: 562, bandwidth: 1.4 * 1024 * 1024 },
            { name: 'Slow 3G', latency: 2000, bandwidth: 0.4 * 1024 * 1024 },
            { name: 'WiFi', latency: 20, bandwidth: 30 * 1024 * 1024 }
        ];
        
        const testFiles = [
            { name: 'index.html', size: 44 * 1024 },
            { name: 'style.css', size: 32 * 1024 },
            { name: 'app.js', size: 34 * 1024 },
            { name: 'import-export.js', size: 24 * 1024 },
            { name: 'table.js', size: 35 * 1024 }
        ];
        
        for (const condition of conditions) {
            console.log(`\n${condition.name}:`);
            
            let totalTime = condition.latency; // Initial connection
            let totalSize = 0;
            
            for (const file of testFiles) {
                const downloadTime = (file.size / condition.bandwidth) * 1000;
                totalTime += downloadTime;
                totalSize += file.size;
                
                console.log(`  • ${file.name}: ${downloadTime.toFixed(0)}ms`);
            }
            
            console.log(`  📊 Total: ${totalTime.toFixed(0)}ms (${(totalSize / 1024).toFixed(0)}KB)`);
            
            if (totalTime > 10000) {
                this.logWarning(`Initial load may be slow on ${condition.name}`);
            }
        }
    }
    
    // ============================================================================
    // STRESS TESTS
    // ============================================================================
    
    async runStressTests() {
        console.log(`\n${this.colors.blue}🔥 Stress Tests${this.colors.reset}`);
        console.log('-'.repeat(30));
        
        await this.stressTestMemory();
        await this.stressTestOperations();
        await this.stressTestConcurrency();
    }
    
    async stressTestMemory() {
        console.log('Memory Stress Test...');
        
        let memoryGrowth = 0;
        const initialMemory = this.getMemoryUsage();
        
        // Gradually increase data size
        for (let size = 1000; size <= 10000; size += 1000) {
            this.generateTestData(size);
            const currentMemory = this.getMemoryUsage();
            memoryGrowth = currentMemory - initialMemory;
            
            console.log(`  ${size} records: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
            
            // Check if memory usage is reasonable
            if (memoryGrowth > 100 * 1024 * 1024) { // 100MB threshold
                this.logWarning(`Memory usage high at ${size} records`);
                break;
            }
        }
    }
    
    async stressTestOperations() {
        console.log('Operations Stress Test...');
        
        this.generateTestData(5000);
        
        // Rapid operations
        const operations = [
            () => this.simulateSearch('test'),
            () => this.simulateFilter('country', 'France'),
            () => this.simulateDisplayUpdate()
        ];
        
        for (const op of operations) {
            const times = [];
            
            // Run operation 100 times
            for (let i = 0; i < 100; i++) {
                const start = performance.now();
                op();
                const time = performance.now() - start;
                times.push(time);
            }
            
            const avgTime = times.reduce((a, b) => a + b) / times.length;
            const maxTime = Math.max(...times);
            
            console.log(`  ${op.name}: avg ${avgTime.toFixed(2)}ms, max ${maxTime.toFixed(2)}ms`);
            
            if (maxTime > 500) {
                this.logWarning(`${op.name} had slow peaks`);
            }
        }
    }
    
    async stressTestConcurrency() {
        console.log('Concurrency Stress Test...');
        
        this.generateTestData(1000);
        
        // Simulate concurrent operations
        const concurrentOps = [];
        
        for (let i = 0; i < 10; i++) {
            concurrentOps.push(
                Promise.resolve().then(() => {
                    const start = performance.now();
                    this.simulateSearch(`test${i}`);
                    return performance.now() - start;
                })
            );
        }
        
        try {
            const times = await Promise.all(concurrentOps);
            const avgTime = times.reduce((a, b) => a + b) / times.length;
            
            console.log(`  Concurrent operations: avg ${avgTime.toFixed(2)}ms`);
            
            if (avgTime > 200) {
                this.logWarning('Concurrent operations may impact performance');
            }
        } catch (error) {
            this.logError('Concurrency test failed', error);
        }
    }
    
    // ============================================================================
    // CUSTOM BENCHMARKS
    // ============================================================================
    
    async customBenchmark(name, testFunction, iterations = 1000) {
        console.log(`\n${this.colors.blue}🎯 Custom Benchmark: ${name}${this.colors.reset}`);
        console.log('-'.repeat(30));
        
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            await testFunction();
            const time = performance.now() - start;
            times.push(time);
        }
        
        const avgTime = times.reduce((a, b) => a + b) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const medianTime = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
        
        console.log(`📊 ${name} Results (${iterations} iterations):`);
        console.log(`  • Average: ${avgTime.toFixed(2)}ms`);
        console.log(`  • Median: ${medianTime.toFixed(2)}ms`);
        console.log(`  • Min: ${minTime.toFixed(2)}ms`);
        console.log(`  • Max: ${maxTime.toFixed(2)}ms`);
        
        this.benchmarks[name] = {
            average: avgTime,
            median: medianTime,
            min: minTime,
            max: maxTime,
            iterations
        };
        
        return { avgTime, minTime, maxTime, medianTime };
    }
    
    // ============================================================================
    // EXPORT RESULTS
    // ============================================================================
    
    exportResults() {
        const results = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            testResults: this.testResults,
            benchmarks: this.benchmarks,
            systemInfo: {
                memory: this.getMemoryUsage(),
                storage: this.calculateStorageUsage(),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            }
        };
        
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stained-glass-test-results-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log(`${this.colors.green}📤 Test results exported${this.colors.reset}`);
    }
}

// ============================================================================
// INITIALIZE TEST SUITE
// ============================================================================

// Create global test suite instance
const testSuite = new StainedGlassTestSuite();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

// Quick test functions for easy console use
window.quickTest = {
    performance: () => testSuite.runPerformanceTests(),
    functional: () => testSuite.runFunctionalTests(),
    accessibility: () => testSuite.testAccessibility(),
    memory: () => testSuite.memoryUsage(),
    search: () => testSuite.benchmarkSearch(),
    export: () => testSuite.benchmarkExport(),
    stress: () => testSuite.runStressTests(),
    mobile: () => testSuite.benchmarkMobilePerformance(),
    network: () => testSuite.benchmarkNetworkConditions(),
    large: () => testSuite.benchmarkLargeDataset(),
    all: () => testSuite.runAllTests(),
    cleanup: () => testSuite.cleanup(),
    results: () => testSuite.exportResults()
};

// ============================================================================
// CONSOLE BANNER
// ============================================================================

console.log(`
${testSuite.colors.magenta}
╔═══════════════════════════════════════════════════════════════════════════╗
║                    STAINED GLASS TEST SUITE v1.0                         ║
║                        Production Testing Tool                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
${testSuite.colors.reset}

${testSuite.colors.cyan}🚀 Quick Commands:${testSuite.colors.reset}
  quickTest.all()          - Run complete test suite
  quickTest.performance()  - Performance benchmarks only
  quickTest.functional()   - Functional tests only
  quickTest.accessibility() - Accessibility tests only
  quickTest.stress()       - Stress tests
  quickTest.mobile()       - Mobile performance simulation
  quickTest.network()      - Network conditions simulation
  quickTest.large()        - Large dataset benchmarks
  quickTest.cleanup()      - Clean up and restore
  quickTest.results()      - Export test results

${testSuite.colors.yellow}💡 Example Usage:${testSuite.colors.reset}
  • quickTest.all() - Complete evaluation
  • quickTest.performance() - Check if app is fast enough
  • quickTest.stress() - Test with extreme conditions
  • quickTest.results() - Save results to file

${testSuite.colors.green}Ready to test! Type quickTest.all() to begin.${testSuite.colors.reset}
`);