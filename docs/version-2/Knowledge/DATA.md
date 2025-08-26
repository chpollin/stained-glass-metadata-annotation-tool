# CVMA Data Documentation

Generated: 2025-08-26 18:09:29

Source File: `cvma_complete_data_20250826_160400.json`
File Size: 55.35 MB

## Metadata

```json
{
  "description": "Complete CVMA data from NFDI4Culture Knowledge Graph",
  "source": "https://nfdi4culture.de/sparql",
  "timestamp": "2025-08-26T16:05:23.379612",
  "total_triples": 143615,
  "unique_objects": 8730,
  "unique_properties": 13,
  "complete": true
}
```

## Overview Statistics

- **Total Triples**: 143,615
- **Unique Items**: 8,730
- **Unique Properties**: 13
- **Average Properties per Item**: 12.85
- **Property Range**: 9 - 13

## Data Structure

### JSON-LD Format

The file follows the W3C JSON-LD specification with two main sections:

1. **meta**: Contains metadata about the dataset
2. **results.bindings**: Contains the actual RDF triples

### Triple Structure

Each triple in `results.bindings` has the following structure:

```json
{
  "item": {
    "type": "uri",
    "value": "https://nfdi4culture.de/id/E..."
  },
  "property": {
    "type": "uri", 
    "value": "http://..."
  },
  "value": {
    "type": "literal" | "uri",
    "value": "...",
    "datatype": "..." (optional),
    "xml:lang": "..." (optional)
  }
}
```

## Properties Analysis

### Most Common Properties

| Property | Frequency | Percentage |
|----------|-----------|------------|
| `type` | 26,190 | 18.24% |
| `license` | 17,460 | 12.16% |
| `subjectConcept` | 13,587 | 9.46% |
| `label` | 8,730 | 6.08% |
| `image` | 8,730 | 6.08% |
| `publisher` | 8,730 | 6.08% |
| `elementOf` | 8,730 | 6.08% |
| `elementType` | 8,730 | 6.08% |
| `sourceFile` | 8,730 | 6.08% |
| `url` | 8,730 | 6.08% |
| `approximatePeriod` | 8,646 | 6.02% |
| `creationPeriod` | 8,464 | 5.89% |
| `relatedLocation` | 8,158 | 5.68% |

### Property Value Types

| Property | Value Types |
|----------|-------------|
| `image` | typed-literal |
| `url` | typed-literal |
| `type` | uri |
| `label` | literal |
| `license` | uri |
| `publisher` | uri |
| `approximatePeriod` | literal |
| `creationPeriod` | typed-literal |
| `elementOf` | uri |
| `elementType` | uri |
| `relatedLocation` | uri |
| `sourceFile` | typed-literal |
| `subjectConcept` | uri |

## Namespaces Used

- `http://schema.org/`

- `http://sws.geonames.org/`

- `http://vocab.getty.edu/aat/`

- `http://www.w3.org/1999/02/22-rdf-syntax-ns#`

- `http://www.w3.org/2000/01/rdf-schema#`

- `https://corpusvitrearum.de/cvma-digital/`

- `https://corpusvitrearum.de/id/`

- `https://corpusvitrearum.de/typo3temp/cvma/_processed_/pics/original/`

- `https://creativecommons.org/licenses/by-nc/`

- `https://creativecommons.org/publicdomain/zero/`

- `https://iconclass.org/`

- `https://nfdi.fiz-karlsruhe.de/ontology/`

- `https://nfdi4culture.de/id/`

- `https://nfdi4culture.de/ontology#`

- `https://www.deutsche-digitale-bibliothek.de/content/lizenzen/`

## Data Quality Report

- **Missing Values**: 0
- **Empty Values**: 0
- **Duplicate Triples**: 0
- **Unique Triples**: 143,615

## Sample Item Structure

**URI**: `https://corpusvitrearum.de/id/F14120`

**Properties**:

```json
{
  "type": "https://nfdi4culture.de/ontology#DataFeedElement",
  "label": "Grablegung Christi (Detail)",
  "image": "https://corpusvitrearum.de/typo3temp/cvma/_processed_/pics/original/14120.jpg",
  "license": "https://creativecommons.org/licenses/by-nc/4.0",
  "publisher": "https://nfdi4culture.de/id/E1834",
  "approximatePeriod": "um 1379",
  "elementOf": "https://nfdi4culture.de/id/E5308",
  "elementType": "http://vocab.getty.edu/aat/300263722",
  "relatedLocation": "http://sws.geonames.org/8349587",
  "sourceFile": "https://corpusvitrearum.de/cvma-digital/bildarchiv.html?tx_cvma_archive%5B%40widget_0%5D%5BcurrentPage%5D=109&cHash=bcce73f06d4365e75c7ffbfbafdd716a",
  "subjectConcept": "https://iconclass.org/48A98312",
  "url": "https://corpusvitrearum.de/id/F14120",
  "creationPeriod": "1378-01-01T00:00:00/1380-12-31T23:59:59"
}
```

## Common Property Combinations

The most common sets of properties that items have:

**Pattern 1** (7866 items):
- Properties: creationPeriod, subjectConcept, url, type, license, image, publisher, label, approximatePeriod, elementType

**Pattern 2** (349 items):
- Properties: creationPeriod, subjectConcept, url, type, license, image, publisher, label, approximatePeriod, elementType

**Pattern 3** (214 items):
- Properties: creationPeriod, url, type, license, image, publisher, label, approximatePeriod, elementType, elementOf

**Pattern 4** (109 items):
- Properties: subjectConcept, url, type, license, image, publisher, label, approximatePeriod, elementType, elementOf

**Pattern 5** (61 items):
- Properties: url, type, license, image, publisher, label, approximatePeriod, elementType, elementOf, sourceFile

## Processing Recommendations

### Memory Considerations
- File size: 55.35 MB
- Estimated memory usage: ~111 MB when loaded
- Recommendation: Use streaming or batch processing for large-scale operations

### Data Access Patterns

1. **By Item**: Group triples by item URI for entity-centric processing
2. **By Property**: Filter by property for specific data extraction
3. **By Type**: Use type properties to categorize items

### Key Properties for Filtering

Based on frequency analysis, these properties are most useful for filtering:
- `type`
- `license`
- `subjectConcept`
- `label`
- `image`
- `publisher`
- `elementOf`
- `elementType`
- `sourceFile`
- `url`

## Technical Details

### RDF/JSON-LD Compliance
- Format: W3C JSON-LD 1.1
- Triple Structure: Subject-Predicate-Object
- Value Types: URI references and literals
- Language Tags: Present for multilingual literals
- Datatypes: XSD datatypes for typed literals