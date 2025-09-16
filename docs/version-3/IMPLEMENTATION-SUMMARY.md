# CIDOC CRM Export Implementation Summary

## Overview
Successfully implemented CIDOC CRM (Conceptual Reference Model) export functionality for the CVMA Stained Glass Metadata Annotation Tool. The implementation enables semantic interoperability with other cultural heritage systems while maintaining backward compatibility.

## Components Implemented

### 1. **cidoc-mapper.js** - Core Mapping Module
- Maps CVMA stained glass data to CIDOC CRM classes and properties
- Converts annotations to E13 Attribute Assignments
- Handles temporal data with fuzzy dating support
- Generates JSON-LD with proper @context

Key mappings:
- Stained glass items → E22 Human-Made Object
- Creation events → E12 Production  
- Time periods → E52 Time-Span
- Locations → E53 Place
- Iconographic subjects → E73 Information Object
- User annotations → E13 Attribute Assignment

### 2. **cidoc-validator.js** - Validation Module
- Validates CIDOC CRM JSON-LD structure
- Checks required properties for each entity type
- Validates date formats and temporal consistency
- Provides detailed error and warning messages

### 3. **Updated app.js** - Export Functions
New functions added:
- `exportAnnotationsCIDOC()` - CIDOC format export
- `exportAnnotationsSimple()` - Legacy format (backward compatible)
- `exportAnnotationsCombined()` - Both formats in one file
- `exportWithFormat()` - Format selector handler
- `importCIDOCAnnotations()` - Import CIDOC formatted data

### 4. **UI Enhancements** - index.html
- Added export format selector (Simple/CIDOC/Both)
- Radio button group for format selection
- Maintains clean, intuitive interface

### 5. **Test Suite** - test-cidoc.html
- Comprehensive test page for CIDOC functionality
- Tests mapper, validator, and export generation
- Visual test results with pass/fail indicators

## Export Format Features

### JSON-LD Context
Includes full namespace declarations:
- CIDOC CRM (crm)
- RDF Schema (rdfs)
- Getty AAT vocabulary
- GeoNames
- Iconclass

### Sample CIDOC Export Structure
```json
{
  "@context": { /* namespace declarations */ },
  "@graph": [
    {
      "@id": "https://corpusvitrearum.de/id/F14120",
      "@type": "crm:E22_Human-Made_Object",
      "label": "Grablegung Christi (Detail)",
      "produced_by": {
        "@type": "crm:E12_Production",
        "has_time_span": {
          "@type": "crm:E52_Time-Span",
          "label": "um 1379",
          "begin_of_the_begin": "1374-01-01",
          "end_of_the_end": "1384-12-31"
        }
      },
      "has_annotation": [ /* user annotations */ ]
    }
  ]
}
```

## Key Capabilities

### Temporal Handling
- Parses "um YYYY" (circa) with ±5 year range
- Handles date ranges (YYYY-YYYY)
- Century notation support
- ISO date format output

### Backward Compatibility
- Original simple JSON export remains default
- Import function handles both formats
- No breaking changes to existing functionality

### Validation
- Pre-export validation with user warnings
- Structural completeness checks
- Date format validation
- Property name validation

## Usage

### Exporting
1. Select export format: Simple (legacy), CIDOC, or Both
2. Click Export button
3. File downloads with appropriate naming:
   - Simple: `cvma-annotations-YYYY-MM-DD.json`
   - CIDOC: `cvma-cidoc-YYYY-MM-DD.json`
   - Combined: `cvma-combined-YYYY-MM-DD.json`

### Importing
- Automatically detects format (simple, CIDOC, or combined)
- Merges annotations with existing data
- Preserves all metadata

## Benefits Achieved

1. **Standards Compliance**: ISO 21127:2023 CIDOC CRM
2. **Semantic Interoperability**: Compatible with museum/heritage systems
3. **Rich Contextual Data**: Explicit temporal and spatial relationships
4. **Future-Proof**: Ready for Linked Open Data initiatives
5. **Research Enabled**: Supports complex queries about provenance
6. **Grant Ready**: Meets semantic data requirements

## Testing
Access test suite at: http://localhost:8000/test-cidoc.html
- All mapper tests passing
- All validator tests passing
- Sample exports generating correctly

## Files Modified/Created
- Created: `cidoc-mapper.js` (294 lines)
- Created: `cidoc-validator.js` (421 lines)
- Created: `test-cidoc.html` (test suite)
- Created: `CIDOC-EXPORT.md` (planning document)
- Modified: `app.js` (added export functions)
- Modified: `index.html` (added format selector)

## Next Steps (Future Enhancements)
1. Add CRMdig for digital provenance tracking
2. Implement FRBRoo for bibliographic references
3. Add SPARQL endpoint support
4. Enable URI dereferencing
5. Implement WebAnnotation model