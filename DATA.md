# Data Structures and Schemas - Stained Glass Documentation Tool

## Overview

This document defines all data structures, schemas, validation rules, and format specifications for the Stained Glass Documentation Tool. It serves as the authoritative reference for data modeling, import/export formats, and integration patterns.

**Key Principles:**
- **Standards Compliance**: Schema.org VisualArtwork specification
- **Flexible Dating**: Supports academic dating conventions
- **Extensible Structure**: Easy addition of new fields
- **Data Integrity**: Comprehensive validation rules
- **Interoperability**: Compatible with major digital humanities platforms

## Core Data Model

### Primary Window Record Structure

```typescript
interface StainedGlassWindow {
  // System identification
  id: string;                      // UUID v4, auto-generated
  created: string;                 // ISO 8601 timestamp
  modified: string;                // ISO 8601 timestamp, auto-updated
  version: number;                 // Schema version for migrations
  
  // Essential identification
  title: string;                   // Required: Primary name/title
  alternativeTitles?: string[];    // Optional: Alternative names, variants
  
  // Location information (all required)
  currentLocation: {
    buildingName: string;          // Institution, church, museum name
    city: string;                  // Municipal location
    country: string;               // National location (from controlled vocab)
    specificLocation?: string;     // Position within building
    coordinates?: {                // GPS coordinates (future enhancement)
      latitude: number;
      longitude: number;
    };
  };
  
  // Temporal information
  dateCreated: {
    value: string;                 // Required: Human-readable date
    startYear?: number;            // Computed: Earliest possible year
    endYear?: number;              // Computed: Latest possible year
    precision: DatePrecision;      // Computed: Certainty level
    source?: string;               // Attribution for dating
  };
  
  // Physical characteristics
  materials: Material[];           // Required: At least one material
  dimensions?: {
    height?: number;               // Numeric value
    width?: number;                // Numeric value
    depth?: number;                // For relief work
    unit: DimensionUnit;           // Measurement unit
    notes?: string;                // Measurement context
  };
  
  // Visual content
  imageUrl?: string;               // Wikimedia Commons URL preferred
  imageCaption?: string;           // Alt text and description
  subjects?: string[];             // Iconographic keywords/tags
  description?: string;            // Detailed narrative description
  
  // Extended metadata (optional)
  attribution?: {
    artist?: string;               // Creator name(s)
    workshop?: string;             // Workshop or school
    patron?: string;               // Commissioning party
    source?: string;               // Information source
  };
  
  // Condition and conservation
  condition?: {
    status: ConditionStatus;       // Overall condition assessment
    notes?: string;                // Detailed condition notes
    lastAssessed?: string;         // ISO 8601 date
    assessor?: string;             // Who made the assessment
  };
  
  // Research metadata
  bibliography?: string[];         // Related publications, citations
  externalIds?: {                  // Links to external databases
    wikidata?: string;             // Wikidata Q-number
    viaf?: string;                 // VIAF identifier
    local?: string;                // Local institution ID
  };
  
  // User workflow
  tags?: string[];                 // User-defined tags for organization
  notes?: string;                  // Private research notes
  status?: WorkflowStatus;         // Documentation completion status
}
```

### Enumerated Types

```typescript
// Date precision levels
enum DatePrecision {
  EXACT = 'exact',           // "1523"
  CIRCA = 'circa',           // "circa 1450"
  CENTURY = 'century',       // "15th century"
  RANGE = 'range',           // "1450-1470"
  PERIOD = 'period',         // "early Renaissance"
  UNKNOWN = 'unknown'        // No reliable dating
}

// Physical condition assessment
enum ConditionStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown'
}

// Documentation workflow status
enum WorkflowStatus {
  DRAFT = 'draft',           // Incomplete documentation
  REVIEW = 'review',         // Ready for review
  COMPLETE = 'complete',     // Fully documented
  PUBLISHED = 'published'    // Public/exported
}

// Measurement units
enum DimensionUnit {
  CENTIMETERS = 'cm',
  METERS = 'm',
  INCHES = 'in',
  FEET = 'ft'
}
```

## Controlled Vocabularies

### Materials Taxonomy

```typescript
const MATERIALS: Material[] = [
  // Glass types
  'Stained glass',
  'Painted glass',
  'Clear glass',
  'Flashed glass',
  'Antique glass',
  'Cathedral glass',
  'Opalescent glass',
  'Dalle de verre',
  
  // Structural materials
  'Lead came',
  'Copper foil',
  'Zinc came',
  'Steel reinforcement',
  'Iron armature',
  
  // Frame materials
  'Stone frame',
  'Wood frame',
  'Steel frame',
  'Concrete frame',
  
  // Decorative techniques
  'Silver stain',
  'Vitreous paint',
  'Enamel paint',
  'Plating',
  'Etching',
  'Sandblasting',
  
  // Modern materials
  'Protective glazing',
  'Tempered glass',
  'Laminated glass',
  'Polycarbonate',
  
  // Generic/Other
  'Mixed media',
  'Unknown material',
  'Other'
];

// Material categories for filtering
const MATERIAL_CATEGORIES = {
  glass: ['Stained glass', 'Painted glass', 'Clear glass', 'Flashed glass'],
  structural: ['Lead came', 'Copper foil', 'Zinc came', 'Steel reinforcement'],
  frame: ['Stone frame', 'Wood frame', 'Steel frame', 'Concrete frame'],
  decorative: ['Silver stain', 'Vitreous paint', 'Enamel paint', 'Plating'],
  modern: ['Protective glazing', 'Tempered glass', 'Laminated glass']
};
```

### Geographic Vocabulary

```typescript
// Primary countries (most common in stained glass collections)
const COUNTRIES: Country[] = [
  'Austria',
  'Belgium',
  'Canada',
  'Czech Republic',
  'France',
  'Germany',
  'Ireland',
  'Italy',
  'Netherlands',
  'Poland',
  'Spain',
  'Switzerland',
  'United Kingdom',
  'United States',
  'Other'
];

// Country codes for data exchange
const COUNTRY_CODES = {
  'Austria': 'AT',
  'Belgium': 'BE',
  'Canada': 'CA',
  'Czech Republic': 'CZ',
  'France': 'FR',
  'Germany': 'DE',
  'Ireland': 'IE',
  'Italy': 'IT',
  'Netherlands': 'NL',
  'Poland': 'PL',
  'Spain': 'ES',
  'Switzerland': 'CH',
  'United Kingdom': 'GB',
  'United States': 'US'
};
```

### Subject/Iconography Vocabulary

```typescript
// Iconographic categories for tagging
const SUBJECT_CATEGORIES = {
  religious: [
    'Biblical scenes',
    'Old Testament',
    'New Testament',
    'Saints',
    'Virgin Mary',
    'Christ',
    'Apostles',
    'Angels',
    'Crucifixion',
    'Nativity',
    'Resurrection'
  ],
  secular: [
    'Heraldry',
    'Royal portraits',
    'Historical figures',
    'Allegorical figures',
    'Mythology',
    'Literature',
    'Science',
    'Trade guilds',
    'Donors'
  ],
  decorative: [
    'Geometric patterns',
    'Floral motifs',
    'Architectural elements',
    'Borders',
    'Ornamental',
    'Abstract'
  ],
  commemorative: [
    'War memorial',
    'Memorial window',
    'Dedication',
    'Anniversary'
  ]
};
```

## Validation Rules

### Required Field Validation

```typescript
interface ValidationRule {
  field: string;
  required: boolean;
  validator: (value: any) => boolean;
  errorMessage: string;
}

const VALIDATION_RULES: ValidationRule[] = [
  // Core required fields
  {
    field: 'title',
    required: true,
    validator: (value) => typeof value === 'string' && value.trim().length > 0,
    errorMessage: 'Title is required and cannot be empty'
  },
  {
    field: 'currentLocation.buildingName',
    required: true,
    validator: (value) => typeof value === 'string' && value.trim().length > 0,
    errorMessage: 'Building name is required'
  },
  {
    field: 'currentLocation.city',
    required: true,
    validator: (value) => typeof value === 'string' && value.trim().length > 0,
    errorMessage: 'City is required'
  },
  {
    field: 'currentLocation.country',
    required: true,
    validator: (value) => COUNTRIES.includes(value),
    errorMessage: 'Please select a valid country'
  },
  {
    field: 'dateCreated.value',
    required: true,
    validator: (value) => typeof value === 'string' && value.trim().length > 0,
    errorMessage: 'Date created is required'
  },
  {
    field: 'materials',
    required: true,
    validator: (value) => Array.isArray(value) && value.length > 0,
    errorMessage: 'At least one material must be selected'
  }
];
```

### Format Validation

```typescript
// Date format validation
function validateDateFormat(dateString: string): DateValidation {
  const patterns = {
    exact: /^\d{4}$/,                    // "1523"
    circa: /^(circa|c\.)\s*\d{4}$/i,     // "circa 1450"
    range: /^\d{4}[-–]\d{4}$/,           // "1450-1470"
    century: /^\d{1,2}(st|nd|rd|th)\s+century$/i, // "15th century"
    period: /^(early|mid|late)\s+\d{1,2}(st|nd|rd|th)\s+century$/i
  };
  
  for (const [precision, pattern] of Object.entries(patterns)) {
    if (pattern.test(dateString.trim())) {
      return {
        valid: true,
        precision: precision as DatePrecision,
        normalized: normalizeDateString(dateString)
      };
    }
  }
  
  return {
    valid: false,
    precision: DatePrecision.UNKNOWN,
    error: 'Invalid date format'
  };
}

// URL validation for images
function validateImageURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) &&
           (parsed.hostname.includes('wikimedia.org') ||
            parsed.hostname.includes('wikipedia.org') ||
            parsed.hostname === 'localhost'); // For development
  } catch {
    return false;
  }
}

// Dimension validation
function validateDimensions(dimensions: any): boolean {
  if (!dimensions) return true; // Optional field
  
  const { height, width, depth, unit } = dimensions;
  
  // At least one dimension must be provided
  if (!height && !width && !depth) return false;
  
  // All provided dimensions must be positive numbers
  if (height && (typeof height !== 'number' || height <= 0)) return false;
  if (width && (typeof width !== 'number' || width <= 0)) return false;
  if (depth && (typeof depth !== 'number' || depth <= 0)) return false;
  
  // Unit must be valid
  return Object.values(DimensionUnit).includes(unit);
}
```

## Data Processing and Transformation

### Date Processing

```typescript
// Extract year range from date string
function extractYearRange(dateString: string): { startYear?: number; endYear?: number } {
  const str = dateString.toLowerCase().trim();
  
  // Exact year: "1523"
  const exactMatch = str.match(/\b(\d{4})\b/);
  if (exactMatch && !str.includes('century')) {
    const year = parseInt(exactMatch[1]);
    return { startYear: year, endYear: year };
  }
  
  // Year range: "1450-1470"
  const rangeMatch = str.match(/(\d{4})[-–](\d{4})/);
  if (rangeMatch) {
    return {
      startYear: parseInt(rangeMatch[1]),
      endYear: parseInt(rangeMatch[2])
    };
  }
  
  // Century: "15th century"
  const centuryMatch = str.match(/(\d{1,2})(st|nd|rd|th)\s+century/);
  if (centuryMatch) {
    const century = parseInt(centuryMatch[1]);
    const startYear = (century - 1) * 100 + 1;
    const endYear = century * 100;
    
    // Adjust for period qualifiers
    if (str.includes('early')) {
      return { startYear, endYear: startYear + 33 };
    } else if (str.includes('mid')) {
      return { startYear: startYear + 33, endYear: startYear + 66 };
    } else if (str.includes('late')) {
      return { startYear: startYear + 66, endYear };
    }
    
    return { startYear, endYear };
  }
  
  return {}; // No extractable years
}

// Normalize date strings for consistency
function normalizeDateString(dateString: string): string {
  const str = dateString.trim();
  
  // Standardize "circa" format
  return str.replace(/^c\.\s*/i, 'circa ')
            .replace(/^ca\.\s*/i, 'circa ')
            .replace(/^~\s*/, 'circa ');
}
```

### Material Processing

```typescript
// Clean and validate materials array
function processMaterials(materials: string[]): string[] {
  return materials
    .map(material => material.trim())
    .filter(material => material.length > 0)
    .filter(material => MATERIALS.includes(material) || material === 'Other')
    .reduce((unique, material) => {
      return unique.includes(material) ? unique : [...unique, material];
    }, [] as string[]);
}

// Suggest materials based on partial input
function suggestMaterials(input: string): string[] {
  const query = input.toLowerCase().trim();
  if (query.length < 2) return [];
  
  return MATERIALS.filter(material =>
    material.toLowerCase().includes(query)
  ).slice(0, 10); // Limit suggestions
}
```

## Export Formats

### Schema.org JSON-LD Export

```typescript
// Transform window data to Schema.org VisualArtwork
function transformToSchemaOrg(window: StainedGlassWindow): SchemaOrgVisualArtwork {
  const artwork: SchemaOrgVisualArtwork = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    '@id': `urn:uuid:${window.id}`,
    
    // Basic identification
    name: window.title,
    alternateName: window.alternativeTitles,
    description: window.description,
    
    // Temporal information
    dateCreated: window.dateCreated.value,
    
    // Location
    contentLocation: {
      '@type': 'Place',
      name: window.currentLocation.buildingName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: window.currentLocation.city,
        addressCountry: COUNTRY_CODES[window.currentLocation.country] || window.currentLocation.country
      }
    },
    
    // Physical properties
    material: window.materials,
    artMedium: window.materials.join(', '),
    
    // Visual content
    image: window.imageUrl ? {
      '@type': 'ImageObject',
      url: window.imageUrl,
      caption: window.imageCaption
    } : undefined,
    
    // Subject matter
    about: window.subjects,
    keywords: window.subjects?.join(', '),
    
    // Attribution
    creator: window.attribution?.artist ? {
      '@type': 'Person',
      name: window.attribution.artist
    } : undefined,
    
    // Metadata
    dateModified: window.modified,
    identifier: window.id,
    
    // Additional properties
    additionalProperty: []
  };
  
  // Add dimensions if available
  if (window.dimensions) {
    if (window.dimensions.height) {
      artwork.height = {
        '@type': 'QuantitativeValue',
        value: window.dimensions.height,
        unitCode: window.dimensions.unit.toUpperCase()
      };
    }
    
    if (window.dimensions.width) {
      artwork.width = {
        '@type': 'QuantitativeValue',
        value: window.dimensions.width,
        unitCode: window.dimensions.unit.toUpperCase()
      };
    }
  }
  
  // Add external identifiers
  if (window.externalIds) {
    if (window.externalIds.wikidata) {
      artwork.sameAs = `https://www.wikidata.org/entity/${window.externalIds.wikidata}`;
    }
  }
  
  return artwork;
}
```

### CSV Export Format

```typescript
// Define CSV column structure
const CSV_COLUMNS = [
  'id',
  'title',
  'alternativeTitles',
  'buildingName',
  'city',
  'country',
  'specificLocation',
  'dateCreated',
  'startYear',
  'endYear',
  'materials',
  'height',
  'width',
  'unit',
  'imageUrl',
  'description',
  'subjects',
  'artist',
  'condition',
  'created',
  'modified'
];

// Transform window data to CSV row
function transformToCSVRow(window: StainedGlassWindow): Record<string, string> {
  return {
    id: window.id,
    title: escapeCSVField(window.title),
    alternativeTitles: escapeCSVField(window.alternativeTitles?.join('; ') || ''),
    buildingName: escapeCSVField(window.currentLocation.buildingName),
    city: escapeCSVField(window.currentLocation.city),
    country: escapeCSVField(window.currentLocation.country),
    specificLocation: escapeCSVField(window.currentLocation.specificLocation || ''),
    dateCreated: escapeCSVField(window.dateCreated.value),
    startYear: window.dateCreated.startYear?.toString() || '',
    endYear: window.dateCreated.endYear?.toString() || '',
    materials: escapeCSVField(window.materials.join('; ')),
    height: window.dimensions?.height?.toString() || '',
    width: window.dimensions?.width?.toString() || '',
    unit: window.dimensions?.unit || '',
    imageUrl: escapeCSVField(window.imageUrl || ''),
    description: escapeCSVField(window.description || ''),
    subjects: escapeCSVField(window.subjects?.join('; ') || ''),
    artist: escapeCSVField(window.attribution?.artist || ''),
    condition: window.condition?.status || '',
    created: window.created,
    modified: window.modified
  };
}

// Escape CSV field values
function escapeCSVField(value: string): string {
  if (!value) return '';
  
  // Escape quotes and wrap in quotes if necessary
  const escaped = value.replace(/"/g, '""');
  
  if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
    return `"${escaped}"`;
  }
  
  return escaped;
}
```

## Import Format Specifications

### Wikidata RDF Import

```typescript
// Parse Wikidata RDF triples
interface WikidataTriple {
  subject: string;
  predicate: string;
  object: string;
}

// Property mapping from Wikidata to internal schema
const WIKIDATA_PROPERTY_MAP = {
  'P31': 'instanceOf',           // instance of
  'P180': 'depicts',             // depicts (subject matter)
  'P186': 'material',            // material used
  'P195': 'collection',          // collection
  'P276': 'location',            // location
  'P571': 'inception',           // date created
  'P2048': 'height',             // height
  'P2049': 'width',              // width
  'P170': 'creator',             // creator
  'P18': 'image'                 // image
};

function parseWikidataWindow(triples: WikidataTriple[]): Partial<StainedGlassWindow> {
  const window: Partial<StainedGlassWindow> = {};
  
  // Group triples by subject
  const entityTriples = triples.reduce((acc, triple) => {
    if (!acc[triple.subject]) acc[triple.subject] = [];
    acc[triple.subject].push(triple);
    return acc;
  }, {} as Record<string, WikidataTriple[]>);
  
  // Process each entity
  for (const [entityId, entityTriples] of Object.entries(entityTriples)) {
    // Extract basic properties
    for (const triple of entityTriples) {
      const property = WIKIDATA_PROPERTY_MAP[triple.predicate];
      if (!property) continue;
      
      switch (property) {
        case 'depicts':
          if (!window.subjects) window.subjects = [];
          window.subjects.push(extractLabel(triple.object));
          break;
          
        case 'material':
          if (!window.materials) window.materials = [];
          const material = mapWikidataMaterial(triple.object);
          if (material) window.materials.push(material);
          break;
          
        case 'inception':
          window.dateCreated = {
            value: extractYear(triple.object),
            ...extractYearRange(extractYear(triple.object)),
            precision: DatePrecision.EXACT
          };
          break;
          
        case 'image':
          window.imageUrl = processWikimediaUrl(triple.object);
          break;
      }
    }
  }
  
  return window;
}
```

### CSV Import Mapping

```typescript
// Flexible CSV import with field mapping
interface CSVImportMapping {
  [csvColumn: string]: string; // Maps to internal field paths
}

const DEFAULT_CSV_MAPPING: CSVImportMapping = {
  'Title': 'title',
  'Building': 'currentLocation.buildingName',
  'City': 'currentLocation.city',
  'Country': 'currentLocation.country',
  'Date': 'dateCreated.value',
  'Materials': 'materials',
  'Description': 'description',
  'Image URL': 'imageUrl'
};

function parseCSVWindow(row: Record<string, string>, mapping: CSVImportMapping): Partial<StainedGlassWindow> {
  const window: any = {};
  
  for (const [csvColumn, internalPath] of Object.entries(mapping)) {
    const value = row[csvColumn]?.trim();
    if (!value) continue;
    
    // Set nested properties
    const pathParts = internalPath.split('.');
    let current = window;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) current[pathParts[i]] = {};
      current = current[pathParts[i]];
    }
    
    const finalKey = pathParts[pathParts.length - 1];
    
    // Special processing for certain fields
    if (finalKey === 'materials') {
      current[finalKey] = value.split(/[;,]/).map(m => m.trim()).filter(m => m);
    } else {
      current[finalKey] = value;
    }
  }
  
  return window as Partial<StainedGlassWindow>;
}
```

## Storage Schema and Migration

### Local Storage Structure

```typescript
interface StorageSchema {
  version: number;                    // Schema version for migrations
  windows: Record<string, StainedGlassWindow>;
  metadata: {
    created: string;                  // When storage was first created
    lastModified: string;             // Last modification time
    windowCount: number;              // Cache of window count
    totalSize: number;                // Estimated storage size
  };
  userPreferences: {
    defaultView: 'cards' | 'table';
    defaultCountry: string;
    autoSaveInterval: number;
  };
}

// Current schema version
const CURRENT_SCHEMA_VERSION = 2;
```

### Data Migration System

```typescript
// Migration functions for schema updates
const MIGRATIONS: Record<number, (data: any) => any> = {
  // Migration from version 1 to 2
  2: (data) => {
    // Add new fields introduced in version 2
    Object.values(data.windows).forEach((window: any) => {
      if (!window.version) window.version = 2;
      if (!window.condition) window.condition = { status: 'unknown' };
      if (!window.attribution) window.attribution = {};
      if (!window.externalIds) window.externalIds = {};
    });
    
    // Add metadata structure
    if (!data.metadata) {
      data.metadata = {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        windowCount: Object.keys(data.windows).length,
        totalSize: JSON.stringify(data).length
      };
    }
    
    data.version = 2;
    return data;
  }
};

// Apply migrations
function migrateData(data: any): StorageSchema {
  let currentVersion = data.version || 1;
  
  while (currentVersion < CURRENT_SCHEMA_VERSION) {
    const nextVersion = currentVersion + 1;
    if (MIGRATIONS[nextVersion]) {
      data = MIGRATIONS[nextVersion](data);
      currentVersion = nextVersion;
    } else {
      throw new Error(`No migration path from version ${currentVersion} to ${nextVersion}`);
    }
  }
  
  return data as StorageSchema;
}
```

## Integration Patterns

### External API Integration

```typescript
// Template for future API integrations
interface ExternalAPIConfig {
  endpoint: string;
  authentication: 'none' | 'apikey' | 'oauth';
  rateLimit: number; // requests per minute
  dataMapping: Record<string, string>;
}

// Example: DPLA (Digital Public Library of America) integration
const DPLA_CONFIG: ExternalAPIConfig = {
  endpoint: 'https://api.dp.la/v2/items',
  authentication: 'apikey',
  rateLimit: 100,
  dataMapping: {
    'sourceResource.title': 'title',
    'sourceResource.spatial.name': 'currentLocation.city',
    'sourceResource.date.displayDate': 'dateCreated.value',
    'sourceResource.description': 'description'
  }
};

// Generic API response transformer
function transformAPIResponse(response: any, config: ExternalAPIConfig): Partial<StainedGlassWindow>[] {
  const items = Array.isArray(response.docs) ? response.docs : [response];
  
  return items.map(item => {
    const window: any = {};
    
    for (const [apiPath, internalPath] of Object.entries(config.dataMapping)) {
      const value = getNestedValue(item, apiPath);
      if (value) {
        setNestedValue(window, internalPath, value);
      }
    }
    
    return window;
  });
}
```

### Backup and Recovery

```typescript
// Backup data structure
interface BackupData {
  version: number;
  timestamp: string;
  source: 'manual' | 'automatic';
  data: StorageSchema;
  checksum: string; // For data integrity verification
}

// Create backup
function createBackup(source: 'manual' | 'automatic' = 'manual'): BackupData {
  const data = loadStorageData();
  const serialized = JSON.stringify(data);
  
  return {
    version: CURRENT_SCHEMA_VERSION,
    timestamp: new Date().toISOString(),
    source,
    data,
    checksum: generateChecksum(serialized)
  };
}

// Restore from backup
function restoreFromBackup(backup: BackupData): boolean {
  try {
    // Verify data integrity
    const serialized = JSON.stringify(backup.data);
    if (generateChecksum(serialized) !== backup.checksum) {
      throw new Error('Backup data integrity check failed');
    }
    
    // Apply migrations if necessary
    const migratedData = migrateData(backup.data);
    
    // Restore to storage
    localStorage.setItem('stainedGlassData', JSON.stringify(migratedData));
    
    return true;
  } catch (error) {
    console.error('Backup restoration failed:', error);
    return false;
  }
}

// Generate simple checksum for data integrity
function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}
```

## Data Quality and Analytics

### Quality Metrics

```typescript
// Assess data completeness and quality
interface QualityMetrics {
  totalWindows: number;
  completeness: {
    withImages: number;
    withDimensions: number;
    withSubjects: number;
    withDescriptions: number;
    fullyDocumented: number; // All optional fields filled
  };
  dating: {
    exactDates: number;
    approximateDates: number;
    undatedWindows: number;
  };
  geographic: {
    countriesRepresented: string[];
    topCountries: Array<{ country: string; count: number }>;
  };
  materials: {
    mostCommon: Array<{ material: string; count: number }>;
    uniqueMaterials: string[];
  };
  dataIntegrity: {
    validImageUrls: number;
    validDimensions: number;
    duplicateTitles: number;
  };
}

function generateQualityMetrics(windows: StainedGlassWindow[]): QualityMetrics {
  // Implementation would analyze the windows array
  // and generate comprehensive quality metrics
  // This serves as a template for quality assessment
}
```

```

function generateQualityMetrics(windows: StainedGlassWindow[]): QualityMetrics {
  const metrics: QualityMetrics = {
    totalWindows: windows.length,
    completeness: {
      withImages: 0,
      withDimensions: 0,
      withSubjects: 0,
      withDescriptions: 0,
      fullyDocumented: 0
    },
    dating: {
      exactDates: 0,
      approximateDates: 0,
      undatedWindows: 0
    },
    geographic: {
      countriesRepresented: [],
      topCountries: []
    },
    materials: {
      mostCommon: [],
      uniqueMaterials: []
    },
    dataIntegrity: {
      validImageUrls: 0,
      validDimensions: 0,
      duplicateTitles: 0
    }
  };

  // Analyze each window
  const countryCount = new Map<string, number>();
  const materialCount = new Map<string, number>();
  const titles = new Set<string>();
  
  windows.forEach(window => {
    // Completeness analysis
    if (window.imageUrl) metrics.completeness.withImages++;
    if (window.dimensions) metrics.completeness.withDimensions++;
    if (window.subjects?.length) metrics.completeness.withSubjects++;
    if (window.description) metrics.completeness.withDescriptions++;
    
    // Check if fully documented
    const isFullyDocumented = !!(
      window.imageUrl &&
      window.dimensions &&
      window.subjects?.length &&
      window.description &&
      window.attribution?.artist
    );
    if (isFullyDocumented) metrics.completeness.fullyDocumented++;
    
    // Dating analysis
    if (window.dateCreated.precision === DatePrecision.EXACT) {
      metrics.dating.exactDates++;
    } else if (window.dateCreated.precision === DatePrecision.UNKNOWN) {
      metrics.dating.undatedWindows++;
    } else {
      metrics.dating.approximateDates++;
    }
    
    // Geographic analysis
    const country = window.currentLocation.country;
    countryCount.set(country, (countryCount.get(country) || 0) + 1);
    
    // Material analysis
    window.materials.forEach(material => {
      materialCount.set(material, (materialCount.get(material) || 0) + 1);
    });
    
    // Data integrity checks
    if (window.imageUrl && validateImageURL(window.imageUrl)) {
      metrics.dataIntegrity.validImageUrls++;
    }
    if (window.dimensions && validateDimensions(window.dimensions)) {
      metrics.dataIntegrity.validDimensions++;
    }
    
    // Duplicate title detection
    if (titles.has(window.title)) {
      metrics.dataIntegrity.duplicateTitles++;
    } else {
      titles.add(window.title);
    }
  });
  
  // Process geographic data
  metrics.geographic.countriesRepresented = Array.from(countryCount.keys());
  metrics.geographic.topCountries = Array.from(countryCount.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Process material data
  metrics.materials.uniqueMaterials = Array.from(materialCount.keys());
  metrics.materials.mostCommon = Array.from(materialCount.entries())
    .map(([material, count]) => ({ material, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return metrics;
}
```

## Research Data Standards

### Dublin Core Mapping

```typescript
// Map internal schema to Dublin Core for broader interoperability
interface DublinCoreMapping {
  'dc:title': string;
  'dc:creator': string;
  'dc:subject': string;
  'dc:description': string;
  'dc:date': string;
  'dc:type': string;
  'dc:format': string;
  'dc:identifier': string;
  'dc:source': string;
  'dc:language': string;
  'dc:coverage': string;
  'dc:rights': string;
}

function transformToDublinCore(window: StainedGlassWindow): DublinCoreMapping {
  return {
    'dc:title': window.title,
    'dc:creator': window.attribution?.artist || 'Unknown',
    'dc:subject': window.subjects?.join('; ') || '',
    'dc:description': window.description || '',
    'dc:date': window.dateCreated.value,
    'dc:type': 'StillImage',
    'dc:format': 'Stained glass window',
    'dc:identifier': window.id,
    'dc:source': window.attribution?.source || '',
    'dc:language': 'en', // Could be configurable
    'dc:coverage': `${window.currentLocation.city}, ${window.currentLocation.country}`,
    'dc:rights': 'Usage rights not specified'
  };
}
```

### CIDOC-CRM Integration

```typescript
// Basic CIDOC-CRM conceptual model mapping for museum interoperability
interface CIDOCMapping {
  entityType: string;
  properties: Record<string, any>;
}

function transformToCIDOC(window: StainedGlassWindow): CIDOCMapping {
  return {
    entityType: 'E22_Man-Made_Object',
    properties: {
      'P1_is_identified_by': window.title,
      'P2_has_type': 'Stained Glass Window',
      'P45_consists_of': window.materials,
      'P53_has_former_or_current_location': {
        type: 'E53_Place',
        value: `${window.currentLocation.buildingName}, ${window.currentLocation.city}`
      },
      'P108_has_produced': {
        type: 'E12_Production',
        'P4_has_time-span': window.dateCreated.value,
        'P14_carried_out_by': window.attribution?.artist
      },
      'P62_depicts': window.subjects
    }
  };
}
```

## Performance Optimization

### Data Compression

```typescript
// Compress window data for storage efficiency
function compressWindowData(windows: StainedGlassWindow[]): string {
  // Remove redundant data and compress common values
  const compressed = windows.map(window => {
    const compressed: any = { ...window };
    
    // Remove empty arrays and undefined values
    Object.keys(compressed).forEach(key => {
      const value = compressed[key];
      if (Array.isArray(value) && value.length === 0) {
        delete compressed[key];
      } else if (value === undefined || value === null || value === '') {
        delete compressed[key];
      }
    });
    
    return compressed;
  });
  
  return JSON.stringify(compressed);
}

// Decompress and restore full structure
function decompressWindowData(compressedData: string): StainedGlassWindow[] {
  const data = JSON.parse(compressedData);
  
  return data.map((window: any) => ({
    // Restore default values for optional fields
    alternativeTitles: [],
    subjects: [],
    tags: [],
    notes: '',
    ...window,
    // Ensure required nested objects exist
    currentLocation: {
      buildingName: '',
      city: '',
      country: '',
      ...window.currentLocation
    },
    dateCreated: {
      value: '',
      precision: DatePrecision.UNKNOWN,
      ...window.dateCreated
    },
    materials: window.materials || []
  }));
}
```

### Search Index

```typescript
// Create search index for fast text search
interface SearchIndex {
  [term: string]: Set<string>; // term -> set of window IDs
}

function buildSearchIndex(windows: StainedGlassWindow[]): SearchIndex {
  const index: SearchIndex = {};
  
  windows.forEach(window => {
    // Extract searchable text
    const searchableText = [
      window.title,
      ...(window.alternativeTitles || []),
      window.currentLocation.buildingName,
      window.currentLocation.city,
      window.currentLocation.country,
      window.currentLocation.specificLocation,
      window.description,
      ...(window.subjects || []),
      ...(window.materials || []),
      window.attribution?.artist,
      window.dateCreated.value
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Tokenize and index
    const tokens = searchableText.split(/\s+/)
      .filter(token => token.length > 2)
      .map(token => token.replace(/[^\w]/g, ''));
    
    tokens.forEach(token => {
      if (!index[token]) index[token] = new Set();
      index[token].add(window.id);
    });
  });
  
  return index;
}

// Fast search using index
function searchWindows(query: string, index: SearchIndex, windows: StainedGlassWindow[]): StainedGlassWindow[] {
  const terms = query.toLowerCase().split(/\s+/)
    .filter(term => term.length > 2)
    .map(term => term.replace(/[^\w]/g, ''));
  
  if (terms.length === 0) return windows;
  
  // Find intersection of window IDs for all terms
  let resultIds = index[terms[0]] || new Set();
  
  for (let i = 1; i < terms.length; i++) {
    const termIds = index[terms[i]] || new Set();
    resultIds = new Set([...resultIds].filter(id => termIds.has(id)));
  }
  
  // Return matching windows
  const windowMap = new Map(windows.map(w => [w.id, w]));
  return [...resultIds].map(id => windowMap.get(id)).filter(Boolean) as StainedGlassWindow[];
}
```

## Data Exchange Standards

### IIIF (International Image Interoperability Framework) Support

```typescript
// IIIF Manifest generation for image viewing
interface IIIFManifest {
  '@context': string;
  '@id': string;
  '@type': string;
  label: string;
  sequences: IIIFSequence[];
  metadata: Array<{ label: string; value: string }>;
}

function generateIIIFManifest(window: StainedGlassWindow): IIIFManifest {
  if (!window.imageUrl) {
    throw new Error('Cannot generate IIIF manifest without image URL');
  }
  
  return {
    '@context': 'http://iiif.io/api/presentation/2/context.json',
    '@id': `https://example.org/manifest/${window.id}`,
    '@type': 'sc:Manifest',
    label: window.title,
    sequences: [{
      '@id': `https://example.org/sequence/${window.id}`,
      '@type': 'sc:Sequence',
      canvases: [{
        '@id': `https://example.org/canvas/${window.id}`,
        '@type': 'sc:Canvas',
        label: window.title,
        height: window.dimensions?.height || 1000,
        width: window.dimensions?.width || 1000,
        images: [{
          '@type': 'oa:Annotation',
          motivation: 'sc:painting',
          resource: {
            '@id': window.imageUrl,
            '@type': 'dctypes:Image',
            format: 'image/jpeg'
          },
          on: `https://example.org/canvas/${window.id}`
        }]
      }]
    }],
    metadata: [
      { label: 'Title', value: window.title },
      { label: 'Location', value: `${window.currentLocation.buildingName}, ${window.currentLocation.city}` },
      { label: 'Date', value: window.dateCreated.value },
      { label: 'Materials', value: window.materials.join(', ') },
      { label: 'Description', value: window.description || 'No description available' }
    ]
  };
}
```

### Linked Data Integration

```typescript
// Extended Schema.org Dataset wrapper for collections
interface SchemaOrgDataset {
  '@context': 'https://schema.org';
  '@type': 'Dataset';
  name: string;
  description: string;
  dateCreated: string;
  creator: {
    '@type': 'SoftwareApplication';
    name: string;
    version: string;
  };
  license: string;
  keywords: string[];
  hasPart: SchemaOrgVisualArtwork[];
}

// Complete Schema.org VisualArtwork implementation
interface SchemaOrgVisualArtwork {
  '@type': 'VisualArtwork';
  name: string;
  alternateName?: string[];
  artform: 'Stained Glass Window';
  dateCreated: string;
  material: string[];
  description: string | null;
  keywords?: string[];
  locationCreated: {
    '@type': 'Place';
    name: string;
    address: {
      '@type': 'PostalAddress';
      addressLocality: string;
      addressCountry: string;
    };
  };
  contentLocation?: string | null;
  width?: {
    '@type': 'QuantitativeValue';
    value: number;
    unitText: string;
  };
  height?: {
    '@type': 'QuantitativeValue';
    value: number;
    unitText: string;
  };
  dateModified: string;
  identifier: string | Array<{
    '@type': 'PropertyValue';
    name: string;
    value: string;
  }>;
  sameAs?: string;
  image?: string;
  creator?: {
    '@type': 'Person';
    name: string;
  };
}
```

## Real-World Data Examples

### Wikidata Import Processing

Based on the provided Wikidata export, here's how the system processes real data:

```typescript
// Example from your Wikidata export
const wikidataTriples = [
  {
    item: "http://www.wikidata.org/entity/Q21061279",
    itemLabel: "Buntglasfenster",
    property: "http://www.wikidata.org/prop/direct/P186",
    propertyLabel: "Material",
    value: "http://www.wikidata.org/entity/Q2469680",
    valueLabel: "Antikglas"
  },
  {
    item: "http://www.wikidata.org/entity/Q29132852",
    itemLabel: "Q29132852",
    property: "http://www.wikidata.org/prop/direct/P17",
    propertyLabel: "Staat",
    value: "http://www.wikidata.org/entity/Q142",
    valueLabel: "Frankreich"
  }
];

// Enhanced Wikidata property mapping
const ENHANCED_WIKIDATA_MAPPING = {
  'P18': 'image',              // Bild (image)
  'P186': 'material',          // Material
  'P17': 'country',            // Staat (country)
  'P31': 'instanceOf',         // ist ein(e) (instance of)
  'P131': 'locatedIn',         // liegt in der Verwaltungseinheit (located in administrative unit)
  'P279': 'subclassOf',        // Unterklasse von (subclass of)
  'P373': 'commonsCategory',   // Commons-Kategorie
  'P1014': 'aatId',           // Art-and-Architecture-Thesaurus-Kennung
  'P571': 'inception',         // Entstehungsdatum (inception date)
  'P2048': 'height',          // Höhe (height)
  'P2049': 'width',           // Breite (width)
  'P170': 'creator',          // Schöpfer (creator)
  'P195': 'collection',       // Sammlung (collection)
  'P276': 'location'          // Ort (location)
};

// Material mapping from Wikidata to internal vocabulary
const WIKIDATA_MATERIAL_MAPPING = {
  'Q2469680': 'Antique glass',
  'Q60117': 'Lead came',
  'Q11474': 'Clear glass',
  'Q1323831': 'Stained glass',
  'Q28803532': 'Painted glass'
};

// Process real Wikidata window data
function processWikidataWindow(entityId: string, triples: any[]): Partial<StainedGlassWindow> {
  const window: Partial<StainedGlassWindow> = {
    externalIds: { wikidata: entityId.split('/').pop() }
  };
  
  const entityTriples = triples.filter(t => t.item === entityId);
  
  entityTriples.forEach(triple => {
    const property = triple.property.split('/').pop();
    const mapping = ENHANCED_WIKIDATA_MAPPING[property];
    
    if (!mapping) return;
    
    switch (mapping) {
      case 'material':
        if (!window.materials) window.materials = [];
        const materialId = triple.value.split('/').pop();
        const material = WIKIDATA_MATERIAL_MAPPING[materialId] || triple.valueLabel;
        if (material && !window.materials.includes(material)) {
          window.materials.push(material);
        }
        break;
        
      case 'country':
        if (!window.currentLocation) window.currentLocation = {} as any;
        window.currentLocation.country = triple.valueLabel;
        break;
        
      case 'locatedIn':
        if (!window.currentLocation) window.currentLocation = {} as any;
        // Prefer more specific location info
        if (!window.currentLocation.city || triple.valueLabel.length < window.currentLocation.city.length) {
          window.currentLocation.city = triple.valueLabel;
        }
        break;
        
      case 'image':
        window.imageUrl = processWikimediaUrl(triple.value);
        break;
        
      case 'inception':
        window.dateCreated = {
          value: extractDateFromWikidata(triple.value),
          ...extractYearRange(extractDateFromWikidata(triple.value)),
          precision: determineDatePrecision(triple.value)
        };
        break;
    }
  });
  
  // Set defaults for required fields if missing
  if (!window.title) {
    window.title = entityTriples[0]?.itemLabel || entityId.split('/').pop() || 'Untitled Window';
  }
  
  if (!window.currentLocation?.buildingName) {
    if (!window.currentLocation) window.currentLocation = {} as any;
    window.currentLocation.buildingName = 'Unknown Building';
  }
  
  if (!window.currentLocation?.city) {
    window.currentLocation.city = 'Unknown City';
  }
  
  if (!window.currentLocation?.country) {
    window.currentLocation.country = 'Unknown Country';
  }
  
  if (!window.materials?.length) {
    window.materials = ['Unknown material'];
  }
  
  if (!window.dateCreated) {
    window.dateCreated = {
      value: 'Unknown date',
      precision: DatePrecision.UNKNOWN
    };
  }
  
  return window;
}
```

### Export Format Examples

```typescript
// Generate complete dataset export as shown in your snippet
function generateDatasetExport(windows: StainedGlassWindow[]): SchemaOrgDataset {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Stained Glass Windows Documentation',
    description: 'Documentation of stained glass windows created with the Stained Glass Documentation Tool',
    dateCreated: new Date().toISOString(),
    creator: {
      '@type': 'SoftwareApplication',
      name: 'Stained Glass Documentation Tool',
      version: '2.0'
    },
    license: 'https://creativecommons.org/licenses/by/4.0/',
    keywords: [
      'stained glass',
      'cultural heritage',
      'art history',
      'documentation',
      'visual arts',
      'architecture'
    ],
    hasPart: windows.map(transformToSchemaOrg)
  };
}

// Enhanced transformation with external identifiers
function transformToSchemaOrg(window: StainedGlassWindow): SchemaOrgVisualArtwork {
  const artwork: SchemaOrgVisualArtwork = {
    '@type': 'VisualArtwork',
    name: window.title,
    artform: 'Stained Glass Window',
    dateCreated: window.created,
    material: window.materials,
    description: window.description || null,
    locationCreated: {
      '@type': 'Place',
      name: window.currentLocation.buildingName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: window.currentLocation.city,
        addressCountry: window.currentLocation.country
      }
    },
    contentLocation: window.currentLocation.specificLocation || null,
    dateModified: window.modified,
    identifier: window.id
  };
  
  // Add alternative names
  if (window.alternativeTitles?.length) {
    artwork.alternateName = window.alternativeTitles;
  }
  
  // Add keywords/subjects
  if (window.subjects?.length) {
    artwork.keywords = window.subjects;
  }
  
  // Add dimensions
  if (window.dimensions) {
    if (window.dimensions.width) {
      artwork.width = {
        '@type': 'QuantitativeValue',
        value: window.dimensions.width,
        unitText: window.dimensions.unit
      };
    }
    
    if (window.dimensions.height) {
      artwork.height = {
        '@type': 'QuantitativeValue',
        value: window.dimensions.height,
        unitText: window.dimensions.unit
      };
    }
  }
  
  // Add external identifiers
  if (window.externalIds && Object.keys(window.externalIds).length > 0) {
    const identifiers = [];
    
    // Internal ID
    identifiers.push({
      '@type': 'PropertyValue',
      name: 'Internal ID',
      value: window.id
    });
    
    // External IDs
    Object.entries(window.externalIds).forEach(([type, value]) => {
      if (value) {
        let name = type;
        switch (type) {
          case 'wikidata':
            name = 'Wikidata ID';
            artwork.sameAs = `http://www.wikidata.org/entity/${value}`;
            break;
          case 'viaf':
            name = 'VIAF ID';
            break;
          case 'local':
            name = 'Local Institution ID';
            break;
          default:
            name = `${type.charAt(0).toUpperCase()}${type.slice(1)} ID`;
        }
        
        identifiers.push({
          '@type': 'PropertyValue',
          name,
          value
        });
      }
    });
    
    artwork.identifier = identifiers.length > 1 ? identifiers : window.id;
  }
  
  // Add image
  if (window.imageUrl) {
    artwork.image = window.imageUrl;
  }
  
  // Add creator
  if (window.attribution?.artist) {
    artwork.creator = {
      '@type': 'Person',
      name: window.attribution.artist
    };
  }
  
  return artwork;
}
```

## Data Quality Assurance

### Import Validation

```typescript
// Validate imported data quality
interface ImportValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

function validateImportedData(windows: Partial<StainedGlassWindow>[]): ImportValidationResult {
  const result: ImportValidationResult = {
    valid: true,
    warnings: [],
    errors: [],
    suggestions: []
  };
  
  windows.forEach((window, index) => {
    const prefix = `Window ${index + 1}`;
    
    // Check required fields
    if (!window.title || window.title.trim() === '') {
      result.errors.push(`${prefix}: Title is required`);
      result.valid = false;
    }
    
    if (!window.currentLocation?.buildingName) {
      result.errors.push(`${prefix}: Building name is required`);
      result.valid = false;
    }
    
    if (!window.materials || window.materials.length === 0) {
      result.errors.push(`${prefix}: At least one material is required`);
      result.valid = false;
    }
    
    // Quality warnings
    if (!window.description) {
      result.warnings.push(`${prefix}: No description provided`);
    }
    
    if (!window.imageUrl) {
      result.warnings.push(`${prefix}: No image URL provided`);
    }
    
    if (!window.dateCreated?.value || window.dateCreated.value === 'Unknown date') {
      result.warnings.push(`${prefix}: Date information is missing or uncertain`);
    }
    
    // Suggestions for improvement
    if (window.currentLocation?.city === 'Unknown City') {
      result.suggestions.push(`${prefix}: Consider researching the specific city location`);
    }
    
    if (window.materials?.includes('Unknown material')) {
      result.suggestions.push(`${prefix}: Try to identify specific materials used`);
    }
  });
  
  return result;
}
```

### Data Enrichment

```typescript
// Enhance imported data with computed fields
function enrichWindowData(window: Partial<StainedGlassWindow>): StainedGlassWindow {
  const enriched: StainedGlassWindow = {
    // Generate ID if missing
    id: window.id || generateUUID(),
    
    // Set timestamps
    created: window.created || new Date().toISOString(),
    modified: new Date().toISOString(),
    version: CURRENT_SCHEMA_VERSION,
    
    // Required fields with defaults
    title: window.title || 'Untitled Window',
    currentLocation: {
      buildingName: window.currentLocation?.buildingName || 'Unknown Building',
      city: window.currentLocation?.city || 'Unknown City',
      country: window.currentLocation?.country || 'Unknown Country',
      specificLocation: window.currentLocation?.specificLocation,
      coordinates: window.currentLocation?.coordinates
    },
    materials: window.materials || ['Unknown material'],
    dateCreated: window.dateCreated || {
      value: 'Unknown date',
      precision: DatePrecision.UNKNOWN
    },
    
    // Optional fields
    alternativeTitles: window.alternativeTitles || [],
    dimensions: window.dimensions,
    imageUrl: window.imageUrl,
    imageCaption: window.imageCaption,
    subjects: window.subjects || [],
    description: window.description,
    attribution: window.attribution,
    condition: window.condition,
    bibliography: window.bibliography,
    externalIds: window.externalIds,
    tags: window.tags || [],
    notes: window.notes,
    status: window.status || WorkflowStatus.DRAFT
  };
  
  // Compute date range if missing
  if (!enriched.dateCreated.startYear && !enriched.dateCreated.endYear) {
    const range = extractYearRange(enriched.dateCreated.value);
    enriched.dateCreated.startYear = range.startYear;
    enriched.dateCreated.endYear = range.endYear;
  }
  
  // Normalize materials
  enriched.materials = processMaterials(enriched.materials);
  
  // Clean and normalize text fields
  enriched.title = enriched.title.trim();
  if (enriched.description) {
    enriched.description = enriched.description.trim();
  }
  
  return enriched;
}
```

## Future Data Extensions

### Planned Schema Enhancements

```typescript
// Version 3.0 planned extensions
interface StainedGlassWindowV3 extends StainedGlassWindow {
  // Conservation history
  conservationHistory?: Array<{
    date: string;
    conservator: string;
    treatment: string;
    notes: string;
    images?: string[];
  }>;
  
  // Detailed iconography
  iconography?: {
    mainSubject: string;
    secondarySubjects: string[];
    symbolism: string[];
    culturalContext: string;
  };
  
  // Technical specifications
  technicalSpecs?: {
    glassType: string;
    leadingPattern: string;
    mountingSystem: string;
    protectiveGlazing: boolean;
    lightingConditions: string;
  };
  
  // Research metadata
  research?: {
    publications: Array<{
      title: string;
      author: string;
      year: number;
      pages?: string;
      doi?: string;
    }>;
    exhibitions: Array<{
      title: string;
      venue: string;
      dates: string;
    }>;
    digitalCollections: string[];
  };
  
  // Relationships
  relationships?: {
    partOfSeries?: string;       // ID of related windows
    replacementFor?: string;     // ID of original window
    restoredVersion?: string;    // ID of pre-restoration state
    inspirationFor?: string[];   // IDs of influenced works
  };
}
```

This comprehensive DATA.md provides the complete data architecture foundation for the Stained Glass Documentation Tool, including real-world examples from your Wikidata integration and export formats. It serves as the authoritative reference for all data structures, transformations, and quality assurance processes.