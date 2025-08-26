# Requirements Specification

## Project Overview
Web-based annotation tool for CVMA stained glass metadata (JSON-LD format) with 8,730 items and 143,615 triples.

## Functional Requirements

### Core Features

#### 1. Data Display
- Browse all 8,730 stained glass items
- View item details with all 13 properties
- Display images from corpusvitrearum.de URLs
- Show metadata in readable format (not raw JSON-LD)

#### 2. Search & Filter
- Text search across labels and descriptions
- Filter by property values:
  - Period (approximatePeriod, creationPeriod)
  - Location (relatedLocation)
  - Subject concept (subjectConcept/Iconclass)
  - Type (elementType)
  - License type
- Multi-select filtering
- Clear all filters option

#### 3. Annotation System
- Add custom annotations to items
- Annotation types:
  - Text notes
  - Tags/categories
  - Quality assessments
  - Corrections/suggestions
- Track annotation author and timestamp
- Export annotations separately from source data

#### 4. Data Management
- Import CVMA JSON-LD file
- Export annotations as:
  - JSON
  - CSV
  - RDF/JSON-LD (maintaining semantic structure)
- Batch operations for annotations

### User Interface Requirements

#### Navigation
- Item list/grid view toggle
- Pagination (50-100 items per page)
- Quick jump to item by ID
- Breadcrumb navigation

#### Item View
- Structured property display
- Large image viewer with zoom
- Annotation panel
- External link to source (corpusvitrearum.de)

#### Performance
- Handle 55MB dataset efficiently
- Lazy load images
- Client-side filtering without lag
- Responsive design for tablets/desktop

## Technical Requirements

### Data Processing
- Parse JSON-LD structure
- Transform triples to item-centric format
- Index for fast searching
- Cache processed data in browser

### Storage
- LocalStorage for annotations
- Optional export/import of annotation sets
- No backend required (static site)

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript
- No IE11 support needed

### Deployment
- Static site hosting (GitHub Pages)
- Single-page application
- No server dependencies
- CDN for libraries

## Non-Functional Requirements

### Usability
- Intuitive navigation
- Minimal learning curve
- Keyboard shortcuts for power users
- Clear visual hierarchy

### Performance
- Initial load < 3 seconds
- Search results < 500ms
- Smooth scrolling with 100+ images

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode

### Security
- No sensitive data handling
- XSS protection for user input
- Content Security Policy headers

## Constraints

### Data
- Read-only access to CVMA data
- Preserve original data integrity
- Annotations stored separately

### Technical
- Client-side only (no backend)
- 100MB storage limit (LocalStorage)
- Cross-origin image loading

### Legal
- Respect image licenses
- Attribution requirements
- GDPR compliance for annotations

## Success Metrics
- Load and display all 8,730 items
- Search response < 500ms
- Annotation export/import reliability
- Mobile responsive design
- Zero data loss for annotations