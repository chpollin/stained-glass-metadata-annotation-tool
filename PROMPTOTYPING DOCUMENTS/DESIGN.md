# Design Specifications - MVP

## Design Principles

### Core Design Philosophy
1. **Clarity over Elegance**: Form follows function - every element serves the user's goal
2. **Progressive Disclosure**: Essential fields first, optional details secondary
3. **Immediate Feedback**: Visual confirmation of every user action
4. **Forgiving Interface**: Easy to correct mistakes, hard to lose data
5. **Minimal Cognitive Load**: One primary action per screen

## Visual Hierarchy

### Typography Scale
```css
--text-xl: 1.5rem;     /* Page titles */
--text-lg: 1.25rem;    /* Section headers */
--text-base: 1rem;     /* Body text, labels */
--text-sm: 0.875rem;   /* Help text, captions */
--text-xs: 0.75rem;    /* Validation messages */
```

### Color Palette (Accessible)
```css
--primary: #2563eb;     /* Actions, links */
--success: #16a34a;     /* Saved states */
--warning: #d97706;     /* Missing optional */
--error: #dc2626;       /* Validation errors */
--neutral-900: #111827; /* Headings */
--neutral-700: #374151; /* Body text */
--neutral-500: #6b7280; /* Labels */
--neutral-300: #d1d5db; /* Borders */
--neutral-100: #f3f4f6; /* Backgrounds */
```

## Screen Layouts

### 1. Window List View (Landing Page)
```
+--------------------------------------------------+
| [🔍 Search windows...]              [+ New Window] |
+--------------------------------------------------+
| Window Title                    Location   Date   |
+--------------------------------------------------+
| ○ Rose Window, North Transept   Paris, FR  1250  | ←── Clickable rows
| ○ Crucifixion Scene             York, UK   1380  |
| ○ Saint Peter Window            Rome, IT   1456  |
+--------------------------------------------------+
| [Export All] [Clear Storage]                     |
+--------------------------------------------------+
```

**Layout Details:**
- Header: Search + New button (sticky)
- List: Sortable table with essential info
- Footer: Bulk actions
- Empty state: "No windows yet. Create your first one!"

### 2. Window Form View
```
+--------------------------------------------------+
| ← Back to List        Window Details    [Save]   |
+--------------------------------------------------+
| Title* [________________________]                |
| Alt Titles [________________________]            |
|                                                   |
| LOCATION (Required)                               |
| Building* [________________________]             |
| City* [________________________]                 |
| Country* [▼ Select Country]                       |
| Specific Location [________________________]      |
|                                                   |
| DATING                                            |
| Date Created* [________________________]          |
| Examples: "1450", "circa 1300", "early 15th c"   |
|                                                   |
| MATERIALS (Select all that apply)                 |
| ☑ Stained glass  ☑ Lead came  ☐ Painted glass   |
| ☐ Clear glass    ☐ Copper foil ☐ Steel frame    |
|                                                   |
| [Show Optional Fields ▼]                         |
+--------------------------------------------------+
```

**Progressive Disclosure:**
- Required fields always visible
- Optional fields behind accordion
- Smart defaults and examples
- Real-time validation

### 3. Export Dialog
```
+---------------------------+
| Export Windows            |
+---------------------------+
| ○ Export All (23 windows) |
| ○ Export Selected         |
|                           |
| Format: [JSON-LD ▼]       |
|                           |
| [Cancel] [Download]       |
+---------------------------+
```

## Component Design Patterns

### Enhanced Form Field Pattern
```tsx
<div className={`form-field ${required ? 'required' : 'optional'}`}>
  <label htmlFor="title" className="field-label">
    Window Title
    {required && <span className="required" aria-label="required">*</span>}
    {help && (
      <button 
        type="button" 
        className="help-trigger"
        aria-describedby="title-help"
        onClick={() => setShowHelp(!showHelp)}
      >
        ?
      </button>
    )}
  </label>
  <input
    id="title"
    className={`field-input ${error ? 'error' : ''} ${value ? 'filled' : ''}`}
    placeholder="e.g., Rose Window, North Transept"
    aria-describedby={`${error ? 'title-error' : ''} ${help ? 'title-help' : ''}`.trim()}
    aria-invalid={error ? 'true' : 'false'}
  />
  {error && (
    <div id="title-error" className="field-error" role="alert">
      <span className="error-icon">⚠</span>
      {error}
    </div>
  )}
  {help && showHelp && (
    <div id="title-help" className="field-help">
      {help}
    </div>
  )}
</div>
```

### Smart Material Selection Pattern
```tsx
<div className="material-selector">
  <label className="field-label">Materials Used *</label>
  <div className="selected-materials">
    {selectedMaterials.map(material => (
      <span key={material} className="material-tag">
        {material}
        <button 
          type="button" 
          aria-label={`Remove ${material}`}
          onClick={() => removeMaterial(material)}
        >×</button>
      </span>
    ))}
  </div>
  <div className="material-options">
    <input 
      type="text" 
      placeholder="Search materials..."
      value={materialSearch}
      onChange={e => setMaterialSearch(e.target.value)}
    />
    <div className="material-grid">
      {filteredMaterials.map(material => (
        <button
          key={material}
          type="button"
          className={`material-option ${isSelected(material) ? 'selected' : ''}`}
          onClick={() => toggleMaterial(material)}
        >
          {material}
        </button>
      ))}
    </div>
    <button type="button" className="add-custom">
      + Add custom material
    </button>
  </div>
</div>
```

### Save State Indicator
```tsx
<div className="save-indicator">
  {saving && <span className="saving">● Saving...</span>}
  {saved && <span className="saved">✓ Saved</span>}
  {error && <span className="save-error">⚠ Save failed</span>}
</div>
```

## Interactive Behaviors

### Auto-Save Strategy
- **Trigger**: 2 seconds after last keystroke
- **Visual**: Subtle indicator in header
- **Feedback**: "Saved" confirmation (2s fade)
- **Error**: Persistent error state with retry

### Form Validation
- **Real-time**: Check format as user types
- **Submit**: Block with error summary
- **Recovery**: Clear errors on correction
- **Accessibility**: Screen reader announcements

### Search & Filter
- **Instant**: Results update on keystroke
- **Highlight**: Match text highlighted
- **Empty**: "No matches found. Try different terms."
- **Performance**: Debounced to 300ms

## Mobile Adaptations

### Responsive Breakpoints
```css
--mobile: 0-640px;     /* Stack form fields */
--tablet: 641-1024px;  /* 2-column layout */
--desktop: 1025px+;    /* Full layout */
```

### Mobile-Specific Changes
- Single column form layout
- Larger touch targets (44px minimum)
- Simplified navigation
- Swipe actions for list items
- Bottom sheet for filters

## Accessibility Features

### Keyboard Navigation
- Tab order follows visual hierarchy
- Skip links for screen readers
- Enter submits forms
- Escape closes dialogs
- Arrow keys navigate lists

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for complex interactions
- Status announcements for state changes
- Form error associations
- Loading state announcements

### Visual Accessibility
- WCAG AA contrast ratios
- Focus indicators (3px outline)
- No color-only information
- Scalable to 200% zoom
- High contrast mode support

## Error States & Edge Cases

### Data Loss Prevention
```
+--------------------------------+
| ⚠ Unsaved Changes             |
+--------------------------------+
| You have unsaved changes.      |
| What would you like to do?     |
|                                |
| [Save] [Discard] [Cancel]      |
+--------------------------------+
```

### Storage Warnings
```
+--------------------------------+
| ⚠ Storage Nearly Full         |
+--------------------------------+
| You're using 4.2MB of 5MB     |
| available storage.             |
|                                |
| Consider exporting and         |
| removing old records.          |
|                                |
| [Export All] [Dismiss]        |
+--------------------------------+
```

### Offline Handling
```
+--------------------------------+
| 📡 Working Offline            |
+--------------------------------+
| Your changes are saved locally |
| and will be available when you |
| return.                        |
+--------------------------------+
```

## Performance Considerations

### Loading States
- Skeleton screens for slow connections
- Progressive enhancement
- Lazy loading for large lists
- Optimistic UI updates

### Animation Guidelines
- Subtle transitions (200ms ease-out)
- Respect prefers-reduced-motion
- Performance over polish
- No animations on mobile

## Content Strategy

### Helpful Microcopy
- **Empty states**: "Ready to document your first window?"
- **Loading**: "Loading your windows..."
- **Success**: "Window saved successfully"
- **Errors**: "Please check the highlighted fields"

### Placeholder Examples
- Title: "Rose Window, North Transept"
- Building: "Notre-Dame Cathedral"
- Date: "circa 1250" or "early 13th century"
- Description: "Large rose window depicting scenes from..."

## Design Validation Checklist

### Usability Testing Scenarios
- [ ] New user creates first window record (< 5 minutes)
- [ ] User finds and edits existing record (< 2 minutes)
- [ ] User exports data successfully (< 1 minute)
- [ ] User recovers from form errors (< 30 seconds)
- [ ] User understands save state (immediate feedback)

### Accessibility Audit
- [ ] Navigate entire app with keyboard only
- [ ] Use with screen reader (NVDA/JAWS)
- [ ] Test at 200% browser zoom
- [ ] Verify color contrast ratios
- [ ] Test with high contrast mode

### Cross-Browser Testing
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)

This design specification bridges your requirements and implementation, providing clear visual and interaction patterns while maintaining the MVP's simplicity.