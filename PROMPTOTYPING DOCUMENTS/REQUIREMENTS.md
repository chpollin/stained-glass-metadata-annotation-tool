# Requirements - MVP Version

## Core Features (Must Have)

### 1. Window Record Management
- **Create**: New window record with form
- **Edit**: Modify existing records
- **Delete**: Remove records (with confirmation)
- **List**: View all saved windows

### 2. Essential Fields
- Title (required)
- Location: Building, City, Country (required)
- Specific location within building (optional)
- Creation date (flexible text format)
- Materials (multi-select from list)
- Dimensions (optional)
- Free-text description
- Subject tags

### 3. Local Persistence
- Auto-save every change
- Work continues after browser refresh
- No data loss on crash
- Clear storage option

### 4. Data Export
- Export single window as JSON-LD
- Export all windows as JSON-LD array
- Download as .json file
- Copy to clipboard option

### 5. Basic Validation
- Prevent save without required fields
- Visual indicators for missing data
- Simple error messages
- Format hints (e.g., date examples)

## User Interface Requirements

### Form Design
- Single-page form per window
- Clear field labels
- Helpful placeholders
- Inline validation messages
- Save indicator

### Navigation
- List/Grid view of all windows
- Click to edit
- "New Window" button
- Search by title
- Sort by date/title

### Responsive Design
- Desktop: Full form view
- Tablet: Adjusted layout
- Mobile: Basic support (view-only)

## Technical Requirements

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- Instant form response
- < 1s to load 100 records
- Smooth scrolling

### Data Limits
- 1000 windows max (localStorage limit)
- 10MB total storage
- Warning at 80% capacity

## User Stories - Simplified

**US1**: As a researcher, I can create a window record with basic metadata, so that I have a digital record.

**US2**: As a researcher, I can save my work and return later, so that I don't lose progress.

**US3**: As a researcher, I can export my data as JSON-LD, so that I can use it in other systems.

**US4**: As a researcher, I can see all my window records in a list, so that I can manage my documentation.

**US5**: As a researcher, I can edit existing records, so that I can update information.

## Out of Scope for MVP

- User accounts/authentication
- Cloud storage/sync
- Image uploads
- Complex relationships
- RDF formats beyond JSON-LD
- Collaborative features
- Version history
- Advanced search
- Import functionality
- Print layouts

## Success Criteria

1. User can document 10 windows in 30 minutes
2. Zero data loss during normal use
3. Export produces valid JSON-LD
4. Works on standard modern browsers
5. No training required to start using