// ============================================================================
// STAINED GLASS DOCUMENTATION TOOL - IMPORT/EXPORT MODULE
// ============================================================================

// Wait for app.js to load and expose appState
document.addEventListener('DOMContentLoaded', function() {
    // Verify appState is available
    if (typeof window.appState === 'undefined') {
        console.error('appState not found - make sure app.js loads before import-export.js');
        return;
    }
    
    // Initialize import/export functionality
    initializeImportExport();
});

function initializeImportExport() {
    // Add event listeners for import/export functionality
    console.log('Import/Export module initialized');
}

// ============================================================================
// JSON-LD EXPORT (SCHEMA.ORG COMPLIANT)
// ============================================================================

function exportData() {
    const windows = window.appState.getWindows();
    
    if (windows.length === 0) {
        window.appState.showStatus('No windows to export.', 'error');
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
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "keywords": ["stained glass", "cultural heritage", "art history", "documentation"],
        "hasPart": windows.map(window => transformWindowToSchemaOrg(window))
    };

    // Remove undefined values for cleaner output
    const cleanedJsonLD = removeUndefinedValues(jsonLD);
    
    downloadFile(
        JSON.stringify(cleanedJsonLD, null, 2),
        `stained-glass-windows-${new Date().toISOString().split('T')[0]}.json`,
        'application/ld+json'
    );
    
    window.appState.showStatus('Data exported successfully as JSON-LD!', 'success');
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
// CSV EXPORT
// ============================================================================

function exportCSV() {
    const windows = window.appState.getWindows();
    
    if (windows.length === 0) {
        window.appState.showStatus('No windows to export.', 'error');
        return;
    }

    const csvHeaders = [
        'Title',
        'Alternative Titles',
        'Building',
        'City',
        'Country',
        'Specific Location',
        'Date',
        'Materials',
        'Width',
        'Height',
        'Dimension Unit',
        'Description',
        'Subject Tags',
        'Image URL',
        'Created',
        'Last Modified',
        'Palissy ID',
        'Wikidata ID'
    ];

    const csvRows = windows.map(window => [
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
        `stained-glass-windows-${new Date().toISOString().split('T')[0]}.csv`,
        'text/csv'
    );
    
    window.appState.showStatus('Data exported successfully as CSV!', 'success');
}

function escapeCSVField(value) {
    if (!value) return '';
    const stringValue = String(value);
    
    // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    
    return stringValue;
}

// ============================================================================
// WIKIDATA IMPORT
// ============================================================================

function importWikidataFile() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            window.appState.showStatus('Processing Wikidata file...', 'info');
            
            const text = await file.text();
            const wikidataExport = JSON.parse(text);
            
            // Validate file structure
            if (!Array.isArray(wikidataExport)) {
                throw new Error('Invalid file format: expected array of triples');
            }
            
            const importedWindows = transformWikidataToApp(wikidataExport);
            
            if (importedWindows.length === 0) {
                window.appState.showStatus('No valid windows found in the file.', 'error');
                return;
            }
            
            // Check for duplicates
            const existingWindows = window.appState.getWindows();
            const existingTitles = new Set(existingWindows.map(w => w.title.toLowerCase()));
            
            const newWindows = importedWindows.filter(w => 
                !existingTitles.has(w.title.toLowerCase())
            );
            
            const duplicateCount = importedWindows.length - newWindows.length;
            
            if (newWindows.length > 0) {
                window.appState.addWindows(newWindows);
                
                if (window.appState.saveData()) {
                    window.appState.updateDisplay();
                    
                    let message = `Successfully imported ${newWindows.length} window${newWindows.length !== 1 ? 's' : ''} from Wikidata!`;
                    if (duplicateCount > 0) {
                        message += ` (${duplicateCount} duplicate${duplicateCount !== 1 ? 's' : ''} skipped)`;
                    }
                    
                    window.appState.showStatus(message, 'success');
                    window.appState.showView('list');
                }
            } else {
                window.appState.showStatus('All windows in the file already exist.', 'error');
            }
            
        } catch (error) {
            console.error('Import error:', error);
            window.appState.showStatus(`Error importing Wikidata file: ${error.message}`, 'error');
        }
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

function transformWikidataToApp(wikidataExport) {
    // Group triples by item (window)
    const itemsMap = new Map();
    
    wikidataExport.forEach(triple => {
        if (!triple.item || !triple.property) return;
        
        const itemId = triple.item;
        if (!itemsMap.has(itemId)) {
            itemsMap.set(itemId, {
                wikidataId: itemId,
                properties: new Map()
            });
        }
        
        const item = itemsMap.get(itemId);
        const propertyId = triple.property;
        
        if (!item.properties.has(propertyId)) {
            item.properties.set(propertyId, {
                label: triple.propertyLabel,
                values: []
            });
        }
        
        item.properties.get(propertyId).values.push({
            value: triple.value,
            label: triple.valueLabel
        });
    });
    
    // Convert to our app format
    const appWindows = [];
    
    itemsMap.forEach((item, itemId) => {
        const windowData = {
            id: generateUniqueId(),
            wikidataId: itemId,
            
            // Required fields - extract from Wikidata
            title: extractTitle(item),
            building: extractBuilding(item),
            city: extractCity(item),
            country: extractCountry(item),
            date: extractDate(item),
            materials: extractMaterials(item),
            
            // Optional fields
            alternativeTitles: extractAlternativeTitles(item),
            specificLocation: extractSpecificLocation(item),
            description: extractDescription(item),
            subjectTags: extractSubjectTags(item),
            imageUrl: extractImageUrl(item),
            
            // Metadata
            palissy_id: extractPalissyId(item),
            created: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            importSource: 'wikidata'
        };
        
        // Only add if we have minimum required data
        if (windowData.title && windowData.building && windowData.city && 
            windowData.country && windowData.materials.length > 0) {
            appWindows.push(windowData);
        }
    });
    
    return appWindows;
}

// ============================================================================
// WIKIDATA PROPERTY EXTRACTION FUNCTIONS
// ============================================================================

function extractTitle(item) {
    // Try to get proper title from various title properties
    const titleProperties = [
        'http://www.wikidata.org/prop/direct/P1476', // title
        'http://www.wikidata.org/prop/direct/P373',  // Commons category
        'http://www.wikidata.org/prop/direct/P1810'  // subject named as
    ];
    
    for (const prop of titleProperties) {
        const titleProp = item.properties.get(prop);
        if (titleProp && titleProp.values.length > 0) {
            return titleProp.values[0].label;
        }
    }
    
    // Fallback to Wikidata ID
    return item.wikidataId.split('/').pop();
}

function extractBuilding(item) {
    // P276 = location
    const location = item.properties.get('http://www.wikidata.org/prop/direct/P276');
    if (location && location.values.length > 0) {
        return location.values[0].label;
    }
    
    // P131 = administrative territorial entity (might include building)
    const adminUnit = item.properties.get('http://www.wikidata.org/prop/direct/P131');
    if (adminUnit && adminUnit.values.length > 0) {
        return adminUnit.values[0].label;
    }
    
    return 'Unknown Building';
}

function extractCity(item) {
    // P131 = administrative territorial entity
    const adminUnits = item.properties.get('http://www.wikidata.org/prop/direct/P131');
    if (adminUnits && adminUnits.values.length > 0) {
        // Take the first administrative unit as city
        return adminUnits.values[0].label;
    }
    return 'Unknown City';
}

function extractCountry(item) {
    // P131 = administrative territorial entity
    const adminUnits = item.properties.get('http://www.wikidata.org/prop/direct/P131');
    if (adminUnits && adminUnits.values.length > 0) {
        // For French data (based on Palissy IDs in example), default to France
        // Could be enhanced to actually traverse the administrative hierarchy
        return 'France';
    }
    
    // P17 = country
    const country = item.properties.get('http://www.wikidata.org/prop/direct/P17');
    if (country && country.values.length > 0) {
        return country.values[0].label;
    }
    
    return 'Unknown Country';
}

function extractDate(item) {
    // P571 = inception date
    const inception = item.properties.get('http://www.wikidata.org/prop/direct/P571');
    if (inception && inception.values.length > 0) {
        return inception.values[0].label;
    }
    
    // P580 = start time
    const startTime = item.properties.get('http://www.wikidata.org/prop/direct/P580');
    if (startTime && startTime.values.length > 0) {
        return startTime.values[0].label;
    }
    
    return 'Unknown Date';
}

function extractMaterials(item) {
    // P186 = material
    const materials = item.properties.get('http://www.wikidata.org/prop/direct/P186');
    if (materials && materials.values.length > 0) {
        return materials.values.map(m => {
            const label = m.label;
            
            // Map common Wikidata materials to our app materials
            const materialMap = {
                'Blei': 'Lead Came',
                'Klarglas': 'Clear Glass',
                'Buntglas': 'Stained Glass',
                'Glasmalerei': 'Painted Glass',
                'Silberlot': 'Silver Stain',
                'Vitreous paint': 'Vitreous Paint',
                'Lead': 'Lead Came',
                'Clear glass': 'Clear Glass',
                'Stained glass': 'Stained Glass',
                'Painted glass': 'Painted Glass'
            };
            
            return materialMap[label] || label;
        });
    }
    
    // Default materials for stained glass
    return ['Stained Glass'];
}

function extractAlternativeTitles(item) {
    // P1476 = title (if multiple)
    const titles = item.properties.get('http://www.wikidata.org/prop/direct/P1476');
    if (titles && titles.values.length > 1) {
        return titles.values.slice(1).map(t => t.label).join(', ');
    }
    return null;
}

function extractSpecificLocation(item) {
    // Could be extracted from more specific location properties
    // For now, return null - user can add manually
    return null;
}

function extractDescription(item) {
    const descriptions = [];
    
    // P136 = genre
    const genre = item.properties.get('http://www.wikidata.org/prop/direct/P136');
    if (genre && genre.values.length > 0) {
        descriptions.push(`Genre: ${genre.values[0].label}`);
    }
    
    // P140 = religion
    const religion = item.properties.get('http://www.wikidata.org/prop/direct/P140');
    if (religion && religion.values.length > 0) {
        descriptions.push(`Religion: ${religion.values[0].label}`);
    }
    
    // P1435 = heritage designation
    const heritage = item.properties.get('http://www.wikidata.org/prop/direct/P1435');
    if (heritage && heritage.values.length > 0) {
        descriptions.push(`Heritage: ${heritage.values[0].label}`);
    }
    
    return descriptions.length > 0 ? descriptions.join('. ') : null;
}

function extractSubjectTags(item) {
    const tags = [];
    
    // P140 = religion
    const religion = item.properties.get('http://www.wikidata.org/prop/direct/P140');
    if (religion && religion.values.length > 0) {
        tags.push(...religion.values.map(v => v.label));
    }
    
    // P136 = genre
    const genre = item.properties.get('http://www.wikidata.org/prop/direct/P136');
    if (genre && genre.values.length > 0) {
        tags.push(...genre.values.map(v => v.label));
    }
    
    // P180 = depicts
    const depicts = item.properties.get('http://www.wikidata.org/prop/direct/P180');
    if (depicts && depicts.values.length > 0) {
        tags.push(...depicts.values.map(v => v.label));
    }
    
    return tags.length > 0 ? tags.join(', ') : null;
}

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

function extractPalissyId(item) {
    // P481 = Palissy ID
    const palissyId = item.properties.get('http://www.wikidata.org/prop/direct/P481');
    if (palissyId && palissyId.values.length > 0) {
        return palissyId.values[0].label;
    }
    return null;
}

// ============================================================================
// GENERIC CSV IMPORT
// ============================================================================

function importCSVFile() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            window.appState.showStatus('Processing CSV file...', 'info');
            
            const text = await file.text();
            const csvData = parseCSV(text);
            
            if (csvData.length === 0) {
                window.appState.showStatus('No data found in CSV file.', 'error');
                return;
            }
            
            // Show import preview/mapping interface
            showCSVImportPreview(csvData);
            
        } catch (error) {
            console.error('CSV import error:', error);
            window.appState.showStatus(`Error importing CSV file: ${error.message}`, 'error');
        }
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        return row;
    });
    
    return rows;
}

function showCSVImportPreview(csvData) {
    // This would show a modal for field mapping
    // For now, show a simple confirmation
    const confirmed = confirm(`Found ${csvData.length} records in CSV. Import all?`);
    if (confirmed) {
        importCSVData(csvData);
    }
}

function importCSVData(csvData) {
    const importedWindows = csvData.map(row => ({
        id: generateUniqueId(),
        title: row.Title || row.title || 'Untitled',
        building: row.Building || row.building || 'Unknown Building',
        city: row.City || row.city || 'Unknown City',
        country: row.Country || row.country || 'Unknown Country',
        date: row.Date || row.date || 'Unknown Date',
        materials: row.Materials ? row.Materials.split(';').map(m => m.trim()) : ['Unknown Material'],
        alternativeTitles: row['Alternative Titles'] || row.alternativeTitles || null,
        specificLocation: row['Specific Location'] || row.specificLocation || null,
        width: row.Width || row.width || null,
        height: row.Height || row.height || null,
        dimensionUnit: row['Dimension Unit'] || row.dimensionUnit || 'cm',
        description: row.Description || row.description || null,
        subjectTags: row['Subject Tags'] || row.subjectTags || null,
        imageUrl: row['Image URL'] || row.imageUrl || null,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        importSource: 'csv'
    }));
    
    window.appState.addWindows(importedWindows);
    
    if (window.appState.saveData()) {
        window.appState.updateDisplay();
        window.appState.showStatus(`Successfully imported ${importedWindows.length} windows from CSV!`, 'success');
        window.appState.showView('list');
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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

function generateUniqueId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
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



// ============================================================================
// GLOBAL FUNCTIONS (called from HTML)
// ============================================================================

// Export functions that are called from HTML onclick handlers
window.exportData = exportData;
window.exportCSV = exportCSV;
window.importWikidataFile = importWikidataFile;
window.importCSVFile = importCSVFile;