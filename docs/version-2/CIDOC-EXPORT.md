# CIDOC CRM Export Planning Document

## Executive Summary

This document outlines the plan to enhance the JSON export functionality of the CVMA Stained Glass Metadata Annotation Tool to accurately represent data using the CIDOC Conceptual Reference Model (CRM). The implementation will enable semantic interoperability with other cultural heritage systems while maintaining compatibility with existing functionality.

## 1. CIDOC CRM Overview

CIDOC CRM is an ISO standard (ISO 21127:2023) ontology for cultural heritage information. It provides:
- A formal structure for describing concepts and relationships in cultural heritage
- Semantic interoperability between diverse metadata schemas
- Support for RDF/JSON-LD serialization formats
- Extensions for specialized domains (e.g., FRBRoo for bibliographic data, CRMdig for digital provenance)

## 2. Current Data Model Analysis

### Existing Data Structure
The current CVMA data contains:
- **Item Metadata**: ID, URI, label, image URL, license
- **Temporal Information**: Period, creation period (normalized to centuries)
- **Spatial Information**: Location (GeoNames references)
- **Classification**: Element type (AAT references), subject (Iconclass codes)
- **Relationships**: elementOf (parent object references)
- **Annotations**: User-generated notes with timestamps and types

### Annotation Structure
```json
{
  "id": "timestamp_random",
  "type": "annotation_type",
  "content": "text",
  "timestamp": 1234567890,
  "author": "User"
}
```

## 3. CIDOC CRM Mapping

### Core Classes for Stained Glass Windows

#### E22 Human-Made Object
- The stained glass window/panel itself
- Properties: identifier, title, description, dimensions

#### E12 Production
- The creation event of the stained glass
- Links creator (E39 Actor) to object (E22)
- Includes time-span (E52) and place (E53)

#### E39 Actor
- Artists, workshops, commissioners
- Can be E21 Person or E74 Group

#### E65 Creation
- Conceptual/design creation (distinct from physical production)
- Links to iconographic content

#### E73 Information Object
- Iconographic programs, subjects depicted
- Links via P138 represents to E1 CRM Entity

#### E53 Place
- Current and historical locations
- Churches, museums, storage locations

#### E52 Time-Span
- Dating information (creation, installation, restoration)
- Supports fuzzy dates and ranges

### Property Mappings

| Current Field | CIDOC CRM Mapping |
|--------------|-------------------|
| id | E22.P1 is identified by (E42 Identifier) |
| label | E22.P102 has title (E35 Title) |
| period | E12.P4 has time-span (E52 Time-Span) |
| location | E22.P55 has current location (E53 Place) |
| elementOf | E22.P46 is composed of / P46i forms part of |
| subject | E73.P138 represents (E1 CRM Entity) |
| elementType | E22.P2 has type (E55 Type) |
| image | E22.P138i has representation (E38 Image) |

## 4. Enhanced Export Format Design

### 4.1 JSON-LD Context
```json
{
  "@context": {
    "crm": "http://www.cidoc-crm.org/cidoc-crm/",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "dcterms": "http://purl.org/dc/terms/",
    "aat": "http://vocab.getty.edu/aat/",
    "geonames": "http://sws.geonames.org/",
    "iconclass": "https://iconclass.org/",
    
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
    "represents": "crm:P138_represents",
    "has_time_span": "crm:P4_has_time_span",
    "carried_out_by": "crm:P14_carried_out_by",
    "has_note": "crm:P3_has_note",
    "has_dimension": "crm:P43_has_dimension",
    "has_representation": "crm:P138i_has_representation"
  }
}
```

### 4.2 Example CIDOC CRM Export

```json
{
  "@context": { /* as above */ },
  "@graph": [
    {
      "@id": "https://corpusvitrearum.de/id/F14120",
      "@type": "crm:E22_Human-Made_Object",
      "label": "Grablegung Christi (Detail)",
      
      "identified_by": {
        "@type": "crm:E42_Identifier",
        "content": "F14120",
        "has_type": {
          "@id": "http://vocab.getty.edu/aat/300404620",
          "label": "catalog number"
        }
      },
      
      "has_type": {
        "@id": "http://vocab.getty.edu/aat/300263722",
        "label": "stained glass window"
      },
      
      "produced_by": {
        "@type": "crm:E12_Production",
        "@id": "_:production_F14120",
        "has_time_span": {
          "@type": "crm:E52_Time-Span",
          "label": "um 1379",
          "begin_of_the_begin": "1374-01-01",
          "end_of_the_end": "1384-12-31",
          "has_note": "circa dating with 5-year uncertainty"
        },
        "took_place_at": {
          "@type": "crm:E53_Place",
          "@id": "http://sws.geonames.org/8349587",
          "label": "Workshop location"
        }
      },
      
      "has_current_location": {
        "@type": "crm:E53_Place",
        "@id": "http://sws.geonames.org/8349587",
        "label": "Current location"
      },
      
      "forms_part_of": {
        "@id": "https://nfdi4culture.de/id/E5308",
        "@type": "crm:E22_Human-Made_Object",
        "label": "Parent window or ensemble"
      },
      
      "represents": [
        {
          "@type": "crm:E73_Information_Object",
          "@id": "https://iconclass.org/73D761",
          "label": "Entombment of Christ",
          "has_type": "iconographic subject"
        }
      ],
      
      "has_representation": {
        "@type": "crm:E38_Image",
        "@id": "https://corpusvitrearum.de/typo3temp/cvma/_processed_/pics/original/14120.jpg",
        "format": "image/jpeg"
      },
      
      "has_annotation": [
        {
          "@type": "crm:E13_Attribute_Assignment",
          "@id": "_:annotation_123",
          "carried_out_by": {
            "@type": "crm:E21_Person",
            "label": "User"
          },
          "has_time_span": {
            "@type": "crm:E52_Time-Span",
            "begin_of_the_begin": "2024-01-15T10:30:00Z"
          },
          "assigned": {
            "@type": "crm:E62_String",
            "content": "Notable use of silver stain in the hair details"
          },
          "assigned_attribute_to": {
            "@id": "https://corpusvitrearum.de/id/F14120"
          },
          "has_type": "technical observation"
        }
      ]
    }
  ]
}
```

## 5. Implementation Plan

### Phase 1: Core Export Functionality (Week 1-2)

#### 5.1 Create CIDOC CRM Mapper Module
```javascript
// cidoc-mapper.js
class CIDOCMapper {
  constructor() {
    this.context = this.buildContext();
  }
  
  buildContext() {
    return {
      "crm": "http://www.cidoc-crm.org/cidoc-crm/",
      // ... full context
    };
  }
  
  mapItem(cvmaItem, annotations) {
    return {
      "@id": cvmaItem.uri,
      "@type": "crm:E22_Human-Made_Object",
      "label": cvmaItem.label,
      // ... mapping logic
    };
  }
  
  mapProduction(cvmaItem) {
    if (!cvmaItem.period) return null;
    return {
      "@type": "crm:E12_Production",
      "has_time_span": this.mapTimeSpan(cvmaItem.period)
    };
  }
  
  mapTimeSpan(periodString) {
    // Parse "um 1379" or "1300-1350" formats
    const normalized = this.normalizePeriod(periodString);
    return {
      "@type": "crm:E52_Time-Span",
      "label": periodString,
      "begin_of_the_begin": normalized.earliest,
      "end_of_the_end": normalized.latest
    };
  }
  
  mapAnnotations(annotations) {
    return annotations.map(ann => ({
      "@type": "crm:E13_Attribute_Assignment",
      "@id": `_:annotation_${ann.id}`,
      "carried_out_by": {
        "@type": "crm:E21_Person",
        "label": ann.author
      },
      "has_time_span": {
        "@type": "crm:E52_Time-Span",
        "begin_of_the_begin": new Date(ann.timestamp).toISOString()
      },
      "assigned": {
        "@type": "crm:E62_String",
        "content": ann.content
      },
      "has_type": ann.type
    }));
  }
}
```

#### 5.2 Enhanced Export Functions
```javascript
// Export formats
function exportCIDOC() {
  const mapper = new CIDOCMapper();
  const graph = [];
  
  // Map all items with annotations
  Object.keys(filteredItems).forEach(itemId => {
    const item = allItems[itemId];
    const itemAnnotations = annotations[itemId] || [];
    const cidocItem = mapper.mapItem(item, itemAnnotations);
    graph.push(cidocItem);
  });
  
  const exportData = {
    "@context": mapper.context,
    "@graph": graph,
    "metadata": {
      "exported": new Date().toISOString(),
      "version": "2.0-cidoc",
      "standard": "CIDOC CRM v7.1.3"
    }
  };
  
  downloadJSON(exportData, 'cvma-cidoc-export');
}

function exportCombined() {
  // Maintains backward compatibility
  return {
    "simple": getCurrentExportFormat(),
    "cidoc": getCIDOCExportFormat()
  };
}
```

### Phase 2: UI Integration (Week 2)

#### 5.3 Update Export UI
```html
<!-- Add to export modal -->
<div class="export-format-selector">
  <h3>Export Format</h3>
  <label>
    <input type="radio" name="format" value="simple" checked>
    Simple JSON (Legacy)
  </label>
  <label>
    <input type="radio" name="format" value="cidoc">
    CIDOC CRM JSON-LD
  </label>
  <label>
    <input type="radio" name="format" value="combined">
    Combined (Both formats)
  </label>
</div>

<button onclick="exportWithFormat()">Export Annotations</button>
```

### Phase 3: Validation & Testing (Week 3)

#### 5.4 Validation Module
```javascript
class CIDOCValidator {
  validateExport(data) {
    const errors = [];
    
    // Check required CIDOC properties
    if (!data['@context']) {
      errors.push('Missing @context');
    }
    
    // Validate each entity
    if (data['@graph']) {
      data['@graph'].forEach(entity => {
        this.validateEntity(entity, errors);
      });
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
  
  validateEntity(entity, errors) {
    // E22 Human-Made Object validation
    if (entity['@type'] === 'crm:E22_Human-Made_Object') {
      if (!entity.label) {
        errors.push(`Entity ${entity['@id']} missing label`);
      }
    }
    // Additional validations...
  }
}
```

### Phase 4: Advanced Features (Week 4)

#### 5.5 Relationship Mapping
- Implement hierarchical relationships (part-whole)
- Map workshop attributions
- Connect related panels in series

#### 5.6 External Vocabulary Integration
- AAT type mappings
- Iconclass subject mappings  
- GeoNames place resolution

## 6. Testing Strategy

### 6.1 Unit Tests
```javascript
function testCIDOCMapping() {
  const mapper = new CIDOCMapper();
  
  // Test time span parsing
  const period = mapper.mapTimeSpan("um 1379");
  assert(period.begin_of_the_begin === "1374-01-01");
  assert(period.end_of_the_end === "1384-12-31");
  
  // Test annotation mapping
  const ann = {
    id: "test123",
    type: "observation",
    content: "Test note",
    timestamp: Date.now(),
    author: "Tester"
  };
  const cidocAnn = mapper.mapAnnotations([ann])[0];
  assert(cidocAnn['@type'] === 'crm:E13_Attribute_Assignment');
}
```

### 6.2 Integration Tests
- Export sample dataset
- Validate against CIDOC CRM schema
- Import into external CIDOC-compatible system
- Verify round-trip compatibility

## 7. Benefits & Outcomes

### Immediate Benefits
1. **Semantic Interoperability**: Data can be integrated with other CIDOC CRM systems
2. **Richer Context**: Temporal and spatial relationships explicitly modeled
3. **Standard Compliance**: Follows ISO 21127:2023 standard
4. **Preservation**: Future-proof export format

### Long-term Advantages
1. **Linked Open Data**: Ready for RDF triple stores and SPARQL queries
2. **Cross-Collection Discovery**: Enable federated searches across institutions
3. **Research Applications**: Support complex queries about provenance, workshop attribution
4. **Grant Compliance**: Meets requirements for semantic data in heritage grants

## 8. Backward Compatibility

The system will maintain full backward compatibility:
- Original simple JSON export remains available
- Import function handles both formats
- Combined export option provides both formats
- No changes to existing annotation structure

## 9. Documentation Requirements

### User Documentation
- Export format selection guide
- CIDOC CRM basics for end users
- Example use cases

### Technical Documentation  
- Mapping specifications
- API documentation for mapper module
- Integration guide for external systems

## 10. Future Enhancements

### Phase 5: Extended Functionality
- CRMdig for digital provenance
- FRBRoo for bibliographic references  
- CRMsci for scientific analysis data
- CRMarchaeo for archaeological context

### Phase 6: Linked Data Features
- URI dereferencing
- Content negotiation
- SPARQL endpoint
- WebAnnotation model integration

## Appendix A: CIDOC CRM Quick Reference

### Essential Classes
- **E1 CRM Entity**: Top-level class
- **E2 Temporal Entity**: Events, activities
- **E5 Event**: Specific occurrences
- **E7 Activity**: Intentional actions
- **E12 Production**: Creation of physical things
- **E21 Person**: Individual people
- **E22 Human-Made Object**: Physical artifacts
- **E39 Actor**: Agents (persons or groups)
- **E52 Time-Span**: Temporal extents
- **E53 Place**: Spatial locations
- **E55 Type**: Categories and classifications
- **E73 Information Object**: Conceptual objects

### Key Properties
- **P1 is identified by**: Links to identifiers
- **P2 has type**: Classification
- **P4 has time-span**: Temporal extent
- **P14 carried out by**: Agent responsibility
- **P46 is composed of**: Part-whole relationships
- **P53 has former or current location**: Place associations
- **P102 has title**: Names and titles
- **P108 has produced**: Production relationship
- **P138 represents**: Depiction/representation

## Appendix B: Sample Exports

### B.1 Simple Window Panel
```json
{
  "@id": "cvma:panel_001",
  "@type": "crm:E22_Human-Made_Object",
  "label": "Angel with Trumpet",
  "produced_by": {
    "@type": "crm:E12_Production",
    "has_time_span": {
      "label": "circa 1340",
      "begin_of_the_begin": "1335-01-01",
      "end_of_the_end": "1345-12-31"
    }
  }
}
```

### B.2 Complex Window with Restoration
```json
{
  "@id": "cvma:window_002",
  "@type": "crm:E22_Human-Made_Object",
  "label": "Life of St. Nicholas Window",
  "produced_by": {
    "@type": "crm:E12_Production",
    "carried_out_by": {
      "@type": "crm:E74_Group",
      "label": "Workshop of Master Heinrich"
    },
    "has_time_span": {
      "label": "1325-1330"
    }
  },
  "modified_by": [
    {
      "@type": "crm:E11_Modification",
      "label": "Victorian restoration",
      "has_time_span": {
        "label": "1875"
      }
    }
  ]
}
```

## Implementation Timeline

| Week | Tasks | Deliverables |
|------|-------|--------------|
| 1-2 | Core CIDOC mapper implementation | cidoc-mapper.js module |
| 2 | UI integration | Updated export interface |
| 3 | Testing and validation | Test suite, validation module |
| 4 | Advanced features | Relationship mapping, vocabulary integration |
| 5 | Documentation | User and technical guides |
| 6 | Deployment | Production release |

## Conclusion

This implementation plan provides a robust pathway to enhance the CVMA annotation tool with CIDOC CRM compliance while maintaining simplicity for end users and backward compatibility with existing data. The phased approach ensures manageable development milestones with clear testing and validation at each stage.