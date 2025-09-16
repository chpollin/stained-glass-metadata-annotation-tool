/**
 * CIDOC CRM Mapper for CVMA Stained Glass Metadata
 * Converts CVMA data and annotations to CIDOC CRM JSON-LD format
 */

class CIDOCMapper {
    constructor() {
        this.context = this.buildContext();
    }
    
    /**
     * Build JSON-LD context for CIDOC CRM
     */
    buildContext() {
        return {
            "crm": "http://www.cidoc-crm.org/cidoc-crm/",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "dcterms": "http://purl.org/dc/terms/",
            "aat": "http://vocab.getty.edu/aat/",
            "geonames": "http://sws.geonames.org/",
            "iconclass": "https://iconclass.org/",
            "cvma": "https://corpusvitrearum.de/id/",
            
            "id": "@id",
            "type": "@type",
            "label": "rdfs:label",
            
            "identified_by": "crm:P1_is_identified_by",
            "has_title": "crm:P102_has_title",
            "has_type": "crm:P2_has_type",
            "produced_by": "crm:P108i_was_produced_by",
            "has_current_location": "crm:P55_has_current_location",
            "has_former_location": "crm:P53_has_former_or_current_location",
            "forms_part_of": "crm:P46i_forms_part_of",
            "is_composed_of": "crm:P46_is_composed_of",
            "represents": "crm:P138_represents",
            "has_time_span": "crm:P4_has_time_span",
            "carried_out_by": "crm:P14_carried_out_by",
            "has_note": "crm:P3_has_note",
            "has_dimension": "crm:P43_has_dimension",
            "has_representation": "crm:P138i_has_representation",
            "has_annotation": "crm:P140i_was_attributed_by",
            "assigned": "crm:P141_assigned",
            "assigned_attribute_to": "crm:P140_assigned_attribute_to",
            "took_place_at": "crm:P7_took_place_at",
            "begin_of_the_begin": "crm:P82a_begin_of_the_begin",
            "end_of_the_end": "crm:P82b_end_of_the_end",
            "content": "crm:P190_has_symbolic_content",
            "format": "dcterms:format",
            "license": "dcterms:license",
            "publisher": "dcterms:publisher",
            "source": "dcterms:source"
        };
    }
    
    /**
     * Map a CVMA item to CIDOC CRM structure
     */
    mapItem(cvmaItem, itemAnnotations = []) {
        const cidocItem = {
            "@id": cvmaItem.uri || `cvma:${cvmaItem.id}`,
            "@type": "crm:E22_Human-Made_Object",
            "label": cvmaItem.label
        };
        
        // Add identifier
        cidocItem.identified_by = {
            "@type": "crm:E42_Identifier",
            "content": cvmaItem.id,
            "has_type": {
                "@id": "http://vocab.getty.edu/aat/300404620",
                "label": "catalog number"
            }
        };
        
        // Add type (stained glass)
        if (cvmaItem.elementType) {
            cidocItem.has_type = this.mapElementType(cvmaItem.elementType);
        }
        
        // Add production event with time span
        if (cvmaItem.period || cvmaItem.creationPeriod) {
            cidocItem.produced_by = this.mapProduction(cvmaItem);
        }
        
        // Add current location
        if (cvmaItem.location) {
            cidocItem.has_current_location = this.mapLocation(cvmaItem.location);
        }
        
        // Add part-of relationship
        if (cvmaItem.elementOf) {
            cidocItem.forms_part_of = {
                "@id": cvmaItem.elementOf,
                "@type": "crm:E22_Human-Made_Object"
            };
        }
        
        // Add iconographic subjects
        if (cvmaItem.subject && cvmaItem.subject.length > 0) {
            cidocItem.represents = this.mapSubjects(cvmaItem.subject);
        }
        
        // Add image representation
        if (cvmaItem.image) {
            cidocItem.has_representation = {
                "@type": "crm:E38_Image",
                "@id": cvmaItem.image,
                "format": "image/jpeg"
            };
        }
        
        // Add license information
        if (cvmaItem.license) {
            cidocItem.license = Array.isArray(cvmaItem.license) 
                ? cvmaItem.license 
                : [cvmaItem.license];
        }
        
        // Add publisher
        if (cvmaItem.publisher) {
            cidocItem.publisher = cvmaItem.publisher;
        }
        
        // Add annotations
        if (itemAnnotations && itemAnnotations.length > 0) {
            cidocItem.has_annotation = this.mapAnnotations(itemAnnotations, cvmaItem.uri || `cvma:${cvmaItem.id}`);
        }
        
        return cidocItem;
    }
    
    /**
     * Map element type to CIDOC CRM
     */
    mapElementType(elementType) {
        if (typeof elementType === 'object' && elementType.uri) {
            return {
                "@id": elementType.uri,
                "label": elementType.label || "stained glass element",
                "aat": elementType.aat
            };
        }
        return {
            "@id": "http://vocab.getty.edu/aat/300263722",
            "label": "stained glass (visual works)"
        };
    }
    
    /**
     * Map production event
     */
    mapProduction(cvmaItem) {
        const production = {
            "@type": "crm:E12_Production",
            "@id": `_:production_${cvmaItem.id}`
        };
        
        // Add time span
        const periodString = cvmaItem.creationPeriod || cvmaItem.period;
        if (periodString) {
            production.has_time_span = this.mapTimeSpan(periodString, cvmaItem);
        }
        
        // Add location if available
        if (cvmaItem.location) {
            production.took_place_at = this.mapLocation(cvmaItem.location);
        }
        
        return production;
    }
    
    /**
     * Map time span from period string
     */
    mapTimeSpan(periodString, cvmaItem) {
        const timeSpan = {
            "@type": "crm:E52_Time-Span",
            "label": periodString
        };
        
        // Try to parse normalized period data
        if (cvmaItem.periodNormalized || cvmaItem.creationPeriodNormalized) {
            const normalized = cvmaItem.creationPeriodNormalized || cvmaItem.periodNormalized;
            
            if (typeof normalized === 'number') {
                // Century dating (e.g., 1300 = 14th century)
                const century = Math.floor(normalized / 100);
                timeSpan.begin_of_the_begin = `${normalized}-01-01`;
                timeSpan.end_of_the_end = `${normalized + 99}-12-31`;
                timeSpan.has_note = `${century}th century`;
            } else if (typeof normalized === 'object') {
                if (normalized.earliest) {
                    timeSpan.begin_of_the_begin = this.formatDate(normalized.earliest);
                }
                if (normalized.latest) {
                    timeSpan.end_of_the_end = this.formatDate(normalized.latest);
                }
            }
        } else {
            // Parse period string patterns
            const parsed = this.parsePeriodString(periodString);
            if (parsed) {
                timeSpan.begin_of_the_begin = parsed.begin;
                timeSpan.end_of_the_end = parsed.end;
                if (parsed.note) {
                    timeSpan.has_note = parsed.note;
                }
            }
        }
        
        return timeSpan;
    }
    
    /**
     * Parse period string like "um 1379" or "1300-1350"
     */
    parsePeriodString(periodString) {
        // Handle "um YYYY" (circa)
        const circaMatch = periodString.match(/um\s+(\d{4})/i);
        if (circaMatch) {
            const year = parseInt(circaMatch[1]);
            return {
                begin: `${year - 5}-01-01`,
                end: `${year + 5}-12-31`,
                note: `circa ${year} (±5 years)`
            };
        }
        
        // Handle "YYYY-YYYY" range
        const rangeMatch = periodString.match(/(\d{4})\s*[-–]\s*(\d{4})/);
        if (rangeMatch) {
            return {
                begin: `${rangeMatch[1]}-01-01`,
                end: `${rangeMatch[2]}-12-31`
            };
        }
        
        // Handle single year
        const yearMatch = periodString.match(/(\d{4})/);
        if (yearMatch) {
            const year = yearMatch[1];
            return {
                begin: `${year}-01-01`,
                end: `${year}-12-31`
            };
        }
        
        // Handle century notation (e.g., "14. Jahrhundert")
        const centuryMatch = periodString.match(/(\d{1,2})\.\s*Jahrhundert/i);
        if (centuryMatch) {
            const century = parseInt(centuryMatch[1]);
            const startYear = (century - 1) * 100;
            return {
                begin: `${startYear}-01-01`,
                end: `${startYear + 99}-12-31`,
                note: `${century}th century`
            };
        }
        
        return null;
    }
    
    /**
     * Format date to ISO format
     */
    formatDate(date) {
        if (typeof date === 'string') {
            return date;
        }
        if (typeof date === 'number') {
            // Assume it's a year
            return `${date}-01-01`;
        }
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }
        return null;
    }
    
    /**
     * Map location
     */
    mapLocation(location) {
        if (typeof location === 'object' && location.uri) {
            return {
                "@type": "crm:E53_Place",
                "@id": location.uri,
                "geonameId": location.geonameId || location.geonameid
            };
        }
        if (typeof location === 'string') {
            return {
                "@type": "crm:E53_Place",
                "label": location
            };
        }
        return null;
    }
    
    /**
     * Map iconographic subjects
     */
    mapSubjects(subjects) {
        if (!Array.isArray(subjects)) {
            subjects = [subjects];
        }
        
        return subjects.map(subject => {
            if (typeof subject === 'object' && subject.uri) {
                return {
                    "@type": "crm:E73_Information_Object",
                    "@id": subject.uri,
                    "has_type": "iconographic subject",
                    "iconclass_code": subject.code
                };
            }
            if (typeof subject === 'string') {
                return {
                    "@type": "crm:E73_Information_Object",
                    "label": subject,
                    "has_type": "iconographic subject"
                };
            }
            return null;
        }).filter(s => s !== null);
    }
    
    /**
     * Map annotations to CIDOC CRM attribute assignments
     */
    mapAnnotations(annotations, targetUri) {
        return annotations.map(ann => ({
            "@type": "crm:E13_Attribute_Assignment",
            "@id": `_:annotation_${ann.id}`,
            "carried_out_by": {
                "@type": "crm:E21_Person",
                "label": ann.author || "User"
            },
            "has_time_span": {
                "@type": "crm:E52_Time-Span",
                "begin_of_the_begin": new Date(ann.timestamp).toISOString()
            },
            "assigned": {
                "@type": "crm:E62_String",
                "content": ann.content
            },
            "assigned_attribute_to": {
                "@id": targetUri
            },
            "has_type": ann.type || "annotation"
        }));
    }
    
    /**
     * Create full CIDOC CRM export
     */
    createExport(items, annotations) {
        const graph = [];
        
        // Process each item
        Object.keys(items).forEach(itemId => {
            const item = items[itemId];
            const itemAnnotations = annotations[itemId] || [];
            const cidocItem = this.mapItem(item, itemAnnotations);
            graph.push(cidocItem);
        });
        
        return {
            "@context": this.context,
            "@graph": graph,
            "metadata": {
                "exported": new Date().toISOString(),
                "version": "2.0-cidoc",
                "standard": "CIDOC CRM v7.1.3",
                "itemCount": graph.length,
                "annotationCount": Object.values(annotations).reduce((sum, arr) => sum + arr.length, 0)
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CIDOCMapper;
}