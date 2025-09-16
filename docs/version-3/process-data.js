#!/usr/bin/env node

/**
 * CVMA Data Processor
 * Transforms JSON-LD triples into item-centric format
 */

const fs = require('fs');
const path = require('path');

class DataProcessor {
    constructor() {
        this.items = {};
        this.propertyMap = {
            'http://www.w3.org/2000/01/rdf-schema#label': 'label',
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'type',
            'http://schema.org/image': 'image',
            'http://schema.org/license': 'license',
            'http://schema.org/publisher': 'publisher',
            'http://schema.org/url': 'url',
            'https://nfdi4culture.de/ontology#approximatePeriod': 'period',
            'https://nfdi4culture.de/ontology#creationPeriod': 'creationPeriod',
            'https://nfdi4culture.de/ontology#elementOf': 'elementOf',
            'https://nfdi4culture.de/ontology#elementType': 'elementType',
            'https://nfdi4culture.de/ontology#relatedLocation': 'location',
            'https://nfdi4culture.de/ontology#sourceFile': 'sourceFile',
            'https://nfdi4culture.de/ontology#subjectConcept': 'subject'
        };
    }

    extractId(uri) {
        // Extract ID from URI like "https://corpusvitrearum.de/id/F14120"
        const match = uri.match(/\/id\/([^\/]+)$/);
        return match ? match[1] : uri;
    }

    getPropertyName(uri) {
        return this.propertyMap[uri] || uri.split(/[#\/]/).pop();
    }

    parseValue(valueObj) {
        if (!valueObj) return null;
        
        const value = valueObj.value;
        const type = valueObj.type;
        
        // Handle different value types
        if (type === 'uri') {
            // For certain properties, extract meaningful parts
            if (value.includes('iconclass.org')) {
                return {
                    uri: value,
                    code: value.split('/').pop()
                };
            } else if (value.includes('geonames.org')) {
                return {
                    uri: value,
                    geonameId: value.split('/').pop()
                };
            } else if (value.includes('getty.edu')) {
                return {
                    uri: value,
                    aat: value.split('/').pop()
                };
            }
            return value;
        }
        
        return value;
    }

    parsePeriod(periodStr) {
        if (!periodStr) return null;
        
        // Handle ISO date ranges like "1378-01-01T00:00:00/1380-12-31T23:59:59"
        if (periodStr.includes('/')) {
            const [start, end] = periodStr.split('/');
            return {
                start: parseInt(start.substring(0, 4)),
                end: parseInt(end.substring(0, 4))
            };
        }
        
        // Handle German period descriptions like "um 1379"
        const match = periodStr.match(/(\d{4})/);
        if (match) {
            const year = parseInt(match[1]);
            return {
                display: periodStr,
                year: year
            };
        }
        
        return periodStr;
    }

    processTriples(data) {
        console.log('Processing triples...');
        const bindings = data.results.bindings;
        
        // Group triples by item
        for (const binding of bindings) {
            if (!binding.item) continue;
            
            const itemUri = binding.item.value;
            const itemId = this.extractId(itemUri);
            
            // Initialize item if needed
            if (!this.items[itemId]) {
                this.items[itemId] = {
                    id: itemId,
                    uri: itemUri,
                    properties: {}
                };
            }
            
            // Add property value
            if (binding.property && binding.value) {
                const propName = this.getPropertyName(binding.property.value);
                const value = this.parseValue(binding.value);
                
                // Handle multiple values for same property
                if (this.items[itemId][propName]) {
                    // Convert to array if needed
                    if (!Array.isArray(this.items[itemId][propName])) {
                        this.items[itemId][propName] = [this.items[itemId][propName]];
                    }
                    this.items[itemId][propName].push(value);
                } else {
                    this.items[itemId][propName] = value;
                }
            }
        }
        
        console.log(`Processed ${Object.keys(this.items).length} items`);
    }

    enhanceItems() {
        console.log('Enhancing items with normalized data...');
        
        for (const item of Object.values(this.items)) {
            // Normalize period data
            if (item.period) {
                item.periodNormalized = this.parsePeriod(item.period);
            }
            if (item.creationPeriod) {
                item.creationPeriodNormalized = this.parsePeriod(item.creationPeriod);
            }
            
            // Extract image filename
            if (item.image) {
                const match = item.image.match(/\/([^\/]+\.jpg)$/);
                item.imageId = match ? match[1] : null;
            }
            
            // Simplify type
            if (Array.isArray(item.type)) {
                item.types = item.type;
                item.type = item.type.find(t => t.includes('DataFeedElement')) || item.type[0];
            }
            
            // Ensure single values for key fields
            if (Array.isArray(item.label)) {
                item.label = item.label[0];
            }
            if (Array.isArray(item.image)) {
                item.image = item.image[0];
            }
        }
    }

    generateStats() {
        const stats = {
            totalItems: Object.keys(this.items).length,
            properties: {},
            periods: {},
            locations: new Set(),
            subjects: new Set()
        };
        
        for (const item of Object.values(this.items)) {
            // Count properties
            for (const prop of Object.keys(item)) {
                stats.properties[prop] = (stats.properties[prop] || 0) + 1;
            }
            
            // Count periods
            if (item.periodNormalized?.year) {
                const century = Math.floor(item.periodNormalized.year / 100) * 100;
                stats.periods[century] = (stats.periods[century] || 0) + 1;
            }
            
            // Collect locations
            if (item.location) {
                stats.locations.add(JSON.stringify(item.location));
            }
            
            // Collect subjects
            if (item.subject) {
                if (Array.isArray(item.subject)) {
                    item.subject.forEach(s => stats.subjects.add(JSON.stringify(s)));
                } else {
                    stats.subjects.add(JSON.stringify(item.subject));
                }
            }
        }
        
        stats.locations = stats.locations.size;
        stats.subjects = stats.subjects.size;
        
        return stats;
    }

    async process(inputFile, outputFile) {
        console.log(`Loading ${inputFile}...`);
        const rawData = fs.readFileSync(inputFile, 'utf8');
        const data = JSON.parse(rawData);
        
        this.processTriples(data);
        this.enhanceItems();
        
        const stats = this.generateStats();
        
        const output = {
            metadata: {
                processed: new Date().toISOString(),
                source: inputFile,
                stats: stats
            },
            items: this.items
        };
        
        console.log(`Writing to ${outputFile}...`);
        fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
        
        console.log('\nProcessing complete!');
        console.log(`Total items: ${stats.totalItems}`);
        console.log(`Unique locations: ${stats.locations}`);
        console.log(`Unique subjects: ${stats.subjects}`);
        console.log(`Output size: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB`);
    }
}

// Main execution
async function main() {
    const processor = new DataProcessor();
    
    const inputFile = path.join(__dirname, 'data', 'cvma_complete_data_20250826_160400.json');
    const outputFile = path.join(__dirname, 'data', 'cvma-processed.json');
    
    if (!fs.existsSync(inputFile)) {
        console.error(`Input file not found: ${inputFile}`);
        process.exit(1);
    }
    
    await processor.process(inputFile, outputFile);
}

if (require.main === module) {
    main().catch(console.error);
}