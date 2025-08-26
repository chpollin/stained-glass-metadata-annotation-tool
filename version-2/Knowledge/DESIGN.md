# Design Specification

## Design Principles
1. **Clarity**: Data-first interface with minimal decoration
2. **Efficiency**: Quick access to items and annotations
3. **Consistency**: Uniform interaction patterns
4. **Professionalism**: Academic tool aesthetic

## Layout Structure

### Application Shell
```
┌─────────────────────────────────────────┐
│ Header Bar                              │
├─────────────────────────────────────────┤
│ Filter Bar                              │
├───────────┬─────────────────────────────┤
│ Sidebar   │ Main Content Area           │
│ (250px)   │ (Responsive)                │
└───────────┴─────────────────────────────┘
```

### Header (60px)
- Logo/Title: "CVMA Annotation Tool"
- Search bar (center, 400px wide)
- View toggle (Grid/List)
- Export button
- Settings icon

### Filter Bar (50px)
- Active filters as chips with × remove
- "Add Filter" dropdown
- "Clear All" link
- Result count: "Showing 234 of 8,730 items"

### Sidebar (Collapsible)
- **Quick Filters**
  - Period ranges
  - Locations (top 10)
  - Common subjects
- **Annotation Stats**
  - Total annotations
  - Recent activity
  - Export options

### Main Content Area

#### Grid View
- Card layout (300px × 400px)
- 3-4 columns responsive
- Image thumbnail (280px × 200px)
- Title (2 lines max)
- Period badge
- Annotation indicator

#### List View
- Table format with columns:
  - Thumbnail (60px)
  - ID
  - Label
  - Period
  - Location
  - Annotations
  - Actions

#### Item Detail Modal
```
┌────────────────────────────────────┐
│ [×] Close                          │
├────────────┬───────────────────────┤
│            │ Properties Panel      │
│   Image    ├───────────────────────┤
│   Viewer   │ Annotations Panel     │
│            │                       │
└────────────┴───────────────────────┘
```

## Visual Design

### Typography
- **Font**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI)
- **Headings**: 24px (h1), 18px (h2), 16px (h3)
- **Body**: 14px
- **Small**: 12px

### Color Palette
```
Primary:    #2C3E50 (Dark blue-gray)
Secondary:  #3498DB (Blue)
Success:    #27AE60 (Green)
Warning:    #F39C12 (Orange)
Danger:     #E74C3C (Red)
Background: #FFFFFF
Surface:    #F8F9FA
Border:     #DEE2E6
Text:       #212529
Muted:      #6C757D
```

### Components

#### Cards
- White background
- 1px border (#DEE2E6)
- 4px border-radius
- Subtle shadow on hover
- 8px padding

#### Buttons
- Primary: Blue background, white text
- Secondary: White background, gray border
- Height: 36px
- Padding: 8px 16px
- Border-radius: 4px

#### Forms
- Input height: 36px
- Border: 1px solid #DEE2E6
- Focus: Blue border
- Label above input
- Helper text below (12px, gray)

#### Tables
- Alternating row colors
- Hover highlight
- Sticky header
- Sortable columns

## Interaction Patterns

### Search
- Debounced live search (300ms)
- Highlight matching terms
- Search suggestions dropdown

### Filtering
- Instant apply
- Multiple selection with checkboxes
- Filter count badges
- Collapsible filter groups

### Annotations
- Inline editing
- Auto-save with indicator
- Confirmation for deletion
- Version history (optional)

### Image Viewing
- Click to open lightbox
- Pinch/scroll zoom
- Pan with drag
- Download original link

## Responsive Breakpoints
- **Desktop**: ≥1200px (full layout)
- **Tablet**: 768px-1199px (collapsed sidebar)
- **Mobile**: <768px (stacked layout, cards only)

## Accessibility Features
- Focus indicators (2px blue outline)
- Skip navigation links
- ARIA labels for icons
- Semantic HTML structure
- Keyboard shortcuts:
  - `/` - Focus search
  - `g` then `l` - Switch to list
  - `g` then `g` - Switch to grid
  - `Esc` - Close modal

## Loading States
- Skeleton screens for cards
- Progress bar for data loading
- Spinner for async operations
- Error messages with retry

## Empty States
- Illustration (optional)
- Clear message
- Action button (clear filters, etc.)

## Performance Optimizations
- Virtual scrolling for large lists
- Progressive image loading
- Debounced search/filter
- Cached filter results
- Lazy load modal content