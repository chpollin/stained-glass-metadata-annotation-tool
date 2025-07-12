# Implementation Instructions - MVP

## Quick Start Architecture

### Simple Tech Stack
```
- React 18 with TypeScript
- CSS Modules (no CSS framework needed)
- localStorage (no IndexedDB)
- No external dependencies except React
```

### Minimal Project Structure
```
src/
├── components/
│   ├── WindowForm.tsx        // Main form component
│   ├── WindowList.tsx        // List view of windows
│   └── ExportButton.tsx      // Export functionality
├── types/
│   └── Window.ts             // TypeScript interfaces
├── utils/
│   ├── storage.ts            // localStorage wrapper
│   ├── validation.ts         // Simple validation
│   └── export.ts             // JSON-LD generation
├── App.tsx                   // Main app component
└── constants.ts              // Materials, countries lists
```

## Implementation Steps (2-3 days)

### Day 1: Core Functionality

#### Morning: Setup & Data Model
```typescript
// types/Window.ts
export interface Window {
  id: string;
  title: string;
  currentLocation: Location;
  dateCreated: DateInfo;
  materials: string[];
  // ... other fields
}

// utils/storage.ts
export const storage = {
  save: (window: Window) => {
    const data = JSON.parse(localStorage.getItem('windows') || '{}');
    data[window.id] = window;
    localStorage.setItem('windows', JSON.stringify(data));
  },
  
  getAll: (): Window[] => {
    const data = JSON.parse(localStorage.getItem('windows') || '{}');
    return Object.values(data);
  }
};
```

#### Afternoon: Basic Form Component
```typescript
// components/WindowForm.tsx
export function WindowForm({ windowId }: { windowId?: string }) {
  const [formData, setFormData] = useState<Window>(createEmptyWindow());
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateWindow(formData)) {
      storage.save(formData);
      // Show success message
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        required
        value={formData.title}
        onChange={e => setFormData({...formData, title: e.target.value})}
        placeholder="Window title"
      />
      {/* Other fields */}
    </form>
  );
}
```

### Day 2: List View & Export

#### Morning: Window List
```typescript
// components/WindowList.tsx
export function WindowList() {
  const [windows, setWindows] = useState<Window[]>([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    setWindows(storage.getAll());
  }, []);
  
  const filtered = windows.filter(w => 
    w.title.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div>
      <input 
        placeholder="Search windows..." 
        onChange={e => setSearch(e.target.value)}
      />
      <div className="window-grid">
        {filtered.map(window => (
          <WindowCard key={window.id} window={window} />
        ))}
      </div>
    </div>
  );
}
```

#### Afternoon: Export Functionality
```typescript
// utils/export.ts
export function toJsonLd(window: Window) {
  return {
    "@context": {
      "@vocab": "http://schema.org/",
      "title": "name",
      "materials": "material"
    },
    "@id": `urn:uuid:${window.id}`,
    "@type": "VisualArtwork",
    "title": window.title,
    "currentLocation": {
      "@type": "Place",
      "name": window.currentLocation.buildingName,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": window.currentLocation.city,
        "addressCountry": window.currentLocation.country
      }
    },
    "dateCreated": window.dateCreated.value,
    "materials": window.materials
  };
}

// components/ExportButton.tsx
export function ExportButton({ windows }: { windows: Window[] }) {
  const handleExport = () => {
    const data = windows.map(toJsonLd);
    const blob = new Blob([JSON.stringify(data, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stained-glass-windows.json';
    a.click();
  };
  
  return <button onClick={handleExport}>Export JSON-LD</button>;
}
```

### Day 3: Polish & Testing

#### Critical Validation
```typescript
// utils/validation.ts
export function validateWindow(window: Partial<Window>): string[] {
  const errors: string[] = [];
  
  if (!window.title?.trim()) {
    errors.push('Title is required');
  }
  
  if (!window.currentLocation?.buildingName) {
    errors.push('Building name is required');
  }
  
  if (!window.materials?.length) {
    errors.push('At least one material is required');
  }
  
  return errors;
}
```

## Key Simplifications

### What We Removed
1. **No Complex State Management**: Just React useState
2. **No RDF Libraries**: Simple JSON-LD templates
3. **No Image Handling**: Text-only for MVP
4. **No Hierarchies**: Flat window records only
5. **No External APIs**: Everything local

### Storage Strategy
```typescript
// Super simple localStorage approach
const STORAGE_KEY = 'stainedGlassWindows';

// Save
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

// Load
const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

// Check capacity
const size = new Blob([localStorage.getItem(STORAGE_KEY) || '']).size;
if (size > 5 * 1024 * 1024) { // 5MB warning
  alert('Storage nearly full');
}
```

### Styling Approach
```css
/* Simple, effective CSS */
.form-field {
  margin-bottom: 1rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: bold;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error {
  color: red;
  font-size: 0.875rem;
}
```

## Testing Checklist

### Manual Testing (30 minutes)
- [ ] Create new window - saves correctly
- [ ] Edit existing window - updates correctly  
- [ ] Delete window - removes from list
- [ ] Required fields - shows errors
- [ ] Export single - downloads JSON
- [ ] Export all - downloads array
- [ ] Browser refresh - data persists
- [ ] Search - filters correctly

### Edge Cases to Test
- [ ] Very long titles
- [ ] Special characters in text
- [ ] Empty material selection
- [ ] Date text variations
- [ ] Storage full scenario

## Common Pitfalls Avoided

1. **Over-engineering**: No complex patterns or abstractions
2. **External Dependencies**: Everything works offline
3. **Complex Validation**: Simple, clear rules only
4. **Performance Issues**: Direct localStorage, no abstractions
5. **Browser Compatibility**: Standard APIs only

## Deployment

### Simple Static Hosting
```bash
npm run build
# Deploy 'dist' folder to:
# - GitHub Pages
# - Netlify (drag & drop)
# - Vercel
# - Any static host
```

No server, no database, no configuration needed!