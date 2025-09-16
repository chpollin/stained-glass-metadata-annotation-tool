/**
 * CIDOC CRM Validator
 * Validates CIDOC CRM JSON-LD exports for correctness and completeness
 */

class CIDOCValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        
        // Required CIDOC CRM classes
        this.requiredClasses = {
            'crm:E22_Human-Made_Object': ['label'],
            'crm:E12_Production': ['has_time_span'],
            'crm:E52_Time-Span': [],
            'crm:E53_Place': [],
            'crm:E21_Person': ['label'],
            'crm:E13_Attribute_Assignment': ['assigned', 'assigned_attribute_to']
        };
        
        // Valid CIDOC CRM properties
        this.validProperties = new Set([
            '@id', '@type', '@context', '@graph',
            'label', 'identified_by', 'has_title', 'has_type',
            'produced_by', 'has_current_location', 'has_former_location',
            'forms_part_of', 'is_composed_of', 'represents',
            'has_time_span', 'carried_out_by', 'has_note',
            'has_dimension', 'has_representation', 'has_annotation',
            'assigned', 'assigned_attribute_to', 'took_place_at',
            'begin_of_the_begin', 'end_of_the_end', 'content',
            'format', 'license', 'publisher', 'source',
            'aat', 'geonameId', 'iconclass_code', 'metadata'
        ]);
    }
    
    /**
     * Validate a CIDOC CRM export
     */
    validate(data) {
        this.errors = [];
        this.warnings = [];
        
        // Check for required top-level structure
        if (!data['@context']) {
            this.errors.push('Missing @context declaration');
        } else {
            this.validateContext(data['@context']);
        }
        
        if (!data['@graph'] && !data['@type']) {
            this.errors.push('Missing @graph or single entity structure');
        }
        
        // Validate entities
        if (data['@graph']) {
            if (!Array.isArray(data['@graph'])) {
                this.errors.push('@graph must be an array');
            } else {
                data['@graph'].forEach((entity, index) => {
                    this.validateEntity(entity, `@graph[${index}]`);
                });
            }
        } else if (data['@type']) {
            // Single entity export
            this.validateEntity(data, 'root');
        }
        
        // Check metadata if present
        if (data.metadata) {
            this.validateMetadata(data.metadata);
        }
        
        return {
            valid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings,
            summary: this.generateSummary(data)
        };
    }
    
    /**
     * Validate @context
     */
    validateContext(context) {
        if (typeof context === 'string') {
            // URL reference is valid
            return;
        }
        
        if (typeof context !== 'object') {
            this.errors.push('@context must be an object or URL string');
            return;
        }
        
        // Check for essential namespace declarations
        const requiredNamespaces = ['crm', 'rdfs'];
        requiredNamespaces.forEach(ns => {
            if (!context[ns]) {
                this.warnings.push(`Missing recommended namespace: ${ns}`);
            }
        });
    }
    
    /**
     * Validate individual entity
     */
    validateEntity(entity, path) {
        // Check for @id
        if (!entity['@id']) {
            this.warnings.push(`${path}: Entity missing @id`);
        }
        
        // Check for @type
        if (!entity['@type']) {
            this.errors.push(`${path}: Entity missing @type`);
            return;
        }
        
        const entityType = entity['@type'];
        const isReference = this.isReference(entity);
        
        // Only validate required properties for full entities, not references
        if (!isReference && this.requiredClasses[entityType]) {
            this.requiredClasses[entityType].forEach(prop => {
                if (!entity[prop]) {
                    this.warnings.push(`${path}: ${entityType} missing recommended property: ${prop}`);
                }
            });
        }
        
        // Validate property names
        Object.keys(entity).forEach(prop => {
            if (!this.validProperties.has(prop) && !prop.startsWith('@')) {
                this.warnings.push(`${path}: Unknown property: ${prop}`);
            }
        });
        
        // Type-specific validations
        switch(entityType) {
            case 'crm:E22_Human-Made_Object':
                this.validateHumanMadeObject(entity, path);
                break;
            case 'crm:E12_Production':
                this.validateProduction(entity, path);
                break;
            case 'crm:E52_Time-Span':
                this.validateTimeSpan(entity, path);
                break;
            case 'crm:E13_Attribute_Assignment':
                this.validateAnnotation(entity, path);
                break;
        }
        
        // Recursively validate nested entities
        this.validateNestedEntities(entity, path);
    }
    
    /**
     * Validate E22 Human-Made Object
     */
    validateHumanMadeObject(entity, path) {
        // Only require label for main entities, not references
        // A reference is an entity that only has @id and @type (and maybe a few other properties)
        const isReference = this.isReference(entity);
        
        if (!isReference) {
            // Check for basic descriptive properties on main entities
            if (!entity.label && !entity.has_title) {
                this.errors.push(`${path}: Human-Made Object must have label or has_title`);
            }
        }
        
        // Validate identifier if present
        if (entity.identified_by) {
            if (typeof entity.identified_by === 'object') {
                if (!entity.identified_by.content) {
                    this.warnings.push(`${path}.identified_by: Missing content`);
                }
            }
        }
        
        // Validate type reference
        if (entity.has_type) {
            this.validateTypeReference(entity.has_type, `${path}.has_type`);
        }
    }
    
    /**
     * Check if an entity is just a reference (has only @id, @type and maybe a label)
     */
    isReference(entity) {
        const keys = Object.keys(entity);
        // A reference typically has 2-3 properties: @id, @type, and optionally label
        return keys.length <= 3 && entity['@id'] && entity['@type'] && !entity.identified_by;
    }
    
    /**
     * Validate E12 Production
     */
    validateProduction(entity, path) {
        if (entity.has_time_span) {
            this.validateTimeSpanReference(entity.has_time_span, `${path}.has_time_span`);
        }
        
        if (entity.took_place_at) {
            this.validatePlaceReference(entity.took_place_at, `${path}.took_place_at`);
        }
        
        if (entity.carried_out_by) {
            this.validateActorReference(entity.carried_out_by, `${path}.carried_out_by`);
        }
    }
    
    /**
     * Validate E52 Time-Span
     */
    validateTimeSpan(entity, path) {
        // Check for temporal bounds
        if (!entity.begin_of_the_begin && !entity.end_of_the_end && !entity.label) {
            this.warnings.push(`${path}: Time-Span should have temporal bounds or label`);
        }
        
        // Validate date formats if present
        if (entity.begin_of_the_begin) {
            if (!this.isValidDate(entity.begin_of_the_begin)) {
                this.errors.push(`${path}.begin_of_the_begin: Invalid date format`);
            }
        }
        
        if (entity.end_of_the_end) {
            if (!this.isValidDate(entity.end_of_the_end)) {
                this.errors.push(`${path}.end_of_the_end: Invalid date format`);
            }
        }
        
        // Check logical consistency
        if (entity.begin_of_the_begin && entity.end_of_the_end) {
            const begin = new Date(entity.begin_of_the_begin);
            const end = new Date(entity.end_of_the_end);
            if (begin > end) {
                this.errors.push(`${path}: begin_of_the_begin is after end_of_the_end`);
            }
        }
    }
    
    /**
     * Validate E13 Attribute Assignment (Annotation)
     */
    validateAnnotation(entity, path) {
        if (!entity.assigned) {
            this.errors.push(`${path}: Attribute Assignment must have 'assigned' property`);
        } else if (typeof entity.assigned === 'object' && !entity.assigned.content) {
            this.warnings.push(`${path}.assigned: Missing content`);
        }
        
        if (!entity.assigned_attribute_to) {
            this.errors.push(`${path}: Attribute Assignment must have 'assigned_attribute_to' property`);
        }
        
        if (entity.carried_out_by) {
            this.validateActorReference(entity.carried_out_by, `${path}.carried_out_by`);
        }
    }
    
    /**
     * Validate type reference
     */
    validateTypeReference(type, path) {
        if (typeof type === 'object') {
            if (!type['@id'] && !type.label) {
                this.warnings.push(`${path}: Type reference should have @id or label`);
            }
        }
    }
    
    /**
     * Validate place reference
     */
    validatePlaceReference(place, path) {
        if (typeof place === 'object') {
            if (!place['@type']) {
                this.warnings.push(`${path}: Place reference should have @type`);
            }
            if (!place['@id'] && !place.label) {
                this.warnings.push(`${path}: Place reference should have @id or label`);
            }
        }
    }
    
    /**
     * Validate actor reference
     */
    validateActorReference(actor, path) {
        if (typeof actor === 'object') {
            if (!actor['@type']) {
                this.warnings.push(`${path}: Actor reference should have @type`);
            }
            if (!actor.label) {
                this.warnings.push(`${path}: Actor reference should have label`);
            }
        }
    }
    
    /**
     * Validate time span reference
     */
    validateTimeSpanReference(timeSpan, path) {
        if (typeof timeSpan === 'object') {
            if (!timeSpan['@type']) {
                this.warnings.push(`${path}: Time-Span reference should have @type`);
            }
            this.validateTimeSpan(timeSpan, path);
        }
    }
    
    /**
     * Recursively validate nested entities
     */
    validateNestedEntities(entity, path) {
        const nestedProperties = [
            'produced_by', 'has_annotation', 'represents',
            'forms_part_of', 'is_composed_of'
        ];
        
        nestedProperties.forEach(prop => {
            if (entity[prop]) {
                if (Array.isArray(entity[prop])) {
                    entity[prop].forEach((nested, index) => {
                        if (typeof nested === 'object' && nested['@type']) {
                            this.validateEntity(nested, `${path}.${prop}[${index}]`);
                        }
                    });
                } else if (typeof entity[prop] === 'object' && entity[prop]['@type']) {
                    this.validateEntity(entity[prop], `${path}.${prop}`);
                }
            }
        });
    }
    
    /**
     * Validate metadata section
     */
    validateMetadata(metadata) {
        if (!metadata.exported) {
            this.warnings.push('Metadata missing exported timestamp');
        }
        
        if (!metadata.version) {
            this.warnings.push('Metadata missing version');
        }
        
        if (!metadata.standard) {
            this.warnings.push('Metadata missing CIDOC CRM standard version');
        }
    }
    
    /**
     * Check if string is valid ISO date
     */
    isValidDate(dateString) {
        if (typeof dateString !== 'string') return false;
        
        // Check common date formats
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
        if (!isoDateRegex.test(dateString)) {
            return false;
        }
        
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
    
    /**
     * Generate validation summary
     */
    generateSummary(data) {
        const summary = {
            totalEntities: 0,
            entityTypes: {},
            hasContext: !!data['@context'],
            hasGraph: !!data['@graph'],
            hasMetadata: !!data.metadata
        };
        
        if (data['@graph']) {
            summary.totalEntities = data['@graph'].length;
            data['@graph'].forEach(entity => {
                const type = entity['@type'] || 'unknown';
                summary.entityTypes[type] = (summary.entityTypes[type] || 0) + 1;
            });
        } else if (data['@type']) {
            summary.totalEntities = 1;
            summary.entityTypes[data['@type']] = 1;
        }
        
        return summary;
    }
    
    /**
     * Format validation results for display
     */
    formatResults() {
        let output = 'CIDOC CRM Validation Results\n';
        output += '============================\n\n';
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            output += '✓ Valid CIDOC CRM document\n';
        } else {
            if (this.errors.length > 0) {
                output += `Errors (${this.errors.length}):\n`;
                this.errors.forEach(error => {
                    output += `  ✗ ${error}\n`;
                });
                output += '\n';
            }
            
            if (this.warnings.length > 0) {
                output += `Warnings (${this.warnings.length}):\n`;
                this.warnings.forEach(warning => {
                    output += `  ⚠ ${warning}\n`;
                });
            }
        }
        
        return output;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CIDOCValidator;
}