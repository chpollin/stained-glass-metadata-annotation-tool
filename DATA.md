# Data Structures - Simplified for MVP

## Core Window Record

```typescript
interface StainedGlassWindow {
  // Identification
  id: string;                      // Auto-generated UUID
  title: string;                   // Required
  alternativeTitles?: string[];    // Optional
  
  // Location
  currentLocation: {
    buildingName: string;          // Required
    city: string;                  // Required
    country: string;               // Required
    specificLocation?: string;     // e.g., "North transept, window 3"
  };
  
  // Dating
  dateCreated: {
    value: string;                 // Required (can be "circa 1450" or "1523")
    startYear?: number;            // For search/sort
    endYear?: number;              // For date ranges
  };
  
  // Physical Description
  materials: string[];             // Required, at least one
  dimensions?: {
    height: number;
    width: number;
    unit: 'cm' | 'm';
  };
  
  // Basic Description
  description?: string;            // Free text
  subjects?: string[];             // Simple tags
  
  // Metadata
  created: string;                 // ISO timestamp
  modified: string;                // ISO timestamp
}
```

## Controlled Vocabularies (Simplified)

```typescript
const MATERIALS = [
  'Stained glass',
  'Painted glass', 
  'Clear glass',
  'Lead came',
  'Copper foil',
  'Steel frame',
  'Stone frame',
  'Wood frame',
  'Other'
];

const COUNTRIES = [
  'Austria',
  'Belgium', 
  'Czech Republic',
  'France',
  'Germany',
  'Italy',
  'Netherlands',
  'Spain',
  'Switzerland',
  'United Kingdom',
  'United States',
  'Other'
];

const DATE_PREFIXES = [
  'circa',
  'before',
  'after',
  'early',
  'mid',
  'late'
];
```

## Export Format (JSON-LD)

```json
{
  "@context": {
    "@vocab": "http://schema.org/",
    "title": "name",
    "created": "dateCreated",
    "modified": "dateModified",
    "materials": "material",
    "subjects": "about"
  },
  "@id": "urn:uuid:123e4567-e89b-12d3-a456-426614174000",
  "@type": "VisualArtwork",
  "title": "Rose Window, North Transept",
  "currentLocation": {
    "@type": "Place",
    "name": "Notre-Dame Cathedral",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Paris",
      "addressCountry": "France"
    }
  },
  "dateCreated": "circa 1250",
  "materials": ["Stained glass", "Lead came"],
  "description": "Large rose window depicting scenes from the Old Testament",
  "subjects": ["Old Testament", "Biblical scenes"],
  "created": "2024-01-15T10:30:00Z",
  "modified": "2024-01-15T14:45:00Z"
}
```

## Local Storage Schema

```typescript
interface StorageSchema {
  version: 1;
  windows: {
    [id: string]: StainedGlassWindow;
  };
  lastModified: string;
}
```

## Validation Rules (Simple)

### Required Fields
- Title (non-empty string)
- Building name
- City
- Country  
- At least one material
- Date created (any format)

### Auto-generated Fields
- ID (UUID v4)
- Created timestamp
- Modified timestamp

### Format Validation
- Dimensions: positive numbers only
- Years: 4-digit numbers (if provided)