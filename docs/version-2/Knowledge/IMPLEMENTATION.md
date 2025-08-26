# Implementation Specification

## Technology Stack

### Frontend Framework
**Vue.js 3** with Composition API
- Reactive data handling
- Component-based architecture
- Small bundle size (~30KB)
- No build step option (CDN)

### Styling
**Tailwind CSS** via CDN
- Utility-first approach
- No custom CSS needed
- Responsive utilities built-in
- PurgeCSS for production

### Data Management
**Pinia** (Vue store)
- Centralized state management
- Cached computed properties
- DevTools integration

### Build Tools
**Vite** (optional)
- Fast HMR development
- Optimized production builds
- Static site generation

## Architecture

### Data Flow
```
JSON-LD File → Parser → Transformer → Index → Store → Components
                           ↓
                    Aggregated Format
                           ↓
                    LocalStorage Cache
```

### Directory Structure
```
/
├── index.html
├── data/
│   └── cvma-processed.json (generated)
├── src/
│   ├── components/
│   │   ├── ItemCard.vue
│   │   ├── ItemList.vue
│   │   ├── ItemDetail.vue
│   │   ├── FilterPanel.vue
│   │   └── AnnotationForm.vue
│   ├── stores/
│   │   ├── items.js
│   │   └── annotations.js
│   ├── utils/
│   │   ├── parser.js
│   │   └── search.js
│   └── main.js
└── dist/ (GitHub Pages deployment)
```

## Data Processing

### JSON-LD Transformation
Convert triple format to item-centric format:

```javascript
// Input: Triple format
{
  "results": {
    "bindings": [
      {
        "item": { "value": "https://corpusvitrearum.de/id/F14120" },
        "property": { "value": "http://www.w3.org/2000/01/rdf-schema#label" },
        "value": { "value": "Grablegung Christi (Detail)" }
      }
    ]
  }
}

// Output: Aggregated format
{
  "items": {
    "F14120": {
      "id": "F14120",
      "uri": "https://corpusvitrearum.de/id/F14120",
      "label": "Grablegung Christi (Detail)",
      "image": "https://corpusvitrearum.de/.../14120.jpg",
      "period": "um 1379",
      "periodNormalized": { "start": 1378, "end": 1380 },
      "location": {
        "uri": "http://sws.geonames.org/8349587",
        "label": "Extracted from Geonames"
      },
      "type": "Stained Glass",
      "subject": ["Grablegung", "Christi"],
      "license": "CC BY-NC 4.0"
    }
  }
}
```

### Preprocessing Script
```javascript
// process-data.js - Run once to generate aggregated JSON
async function processData() {
  const raw = await fetch('cvma_complete_data.json');
  const data = await raw.json();
  
  const items = {};
  
  // Group by item URI
  for (const binding of data.results.bindings) {
    const itemId = extractId(binding.item.value);
    if (!items[itemId]) {
      items[itemId] = { id: itemId };
    }
    
    const prop = extractProperty(binding.property.value);
    items[itemId][prop] = parseValue(binding.value);
  }
  
  // Normalize dates, locations, subjects
  for (const item of Object.values(items)) {
    item.periodNormalized = parsePeriod(item.approximatePeriod);
    item.locationLabel = await fetchLocationName(item.relatedLocation);
    item.subjects = parseIconclass(item.subjectConcept);
  }
  
  return items;
}
```

## GitHub Pages Deployment

### Static Site Approach
1. **Build Process**
   ```bash
   npm run build  # Generates dist/
   ```

2. **GitHub Actions Workflow**
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - run: npm ci
         - run: npm run build
         - uses: JamesIves/github-pages-deploy-action@4
           with:
             branch: gh-pages
             folder: dist
   ```

3. **Data Hosting**
   - Process JSON-LD once, commit aggregated version
   - Host on GitHub (under 100MB limit)
   - Or use GitHub LFS for larger files

### URL Structure
```
https://[username].github.io/cvma-annotation-tool/
├── /                    # Main app
├── /item/[id]          # Direct link to item
├── /search?q=[query]   # Search results
└── /data/items.json    # Processed data
```

## Key Implementation Details

### Search Implementation
```javascript
// Fuse.js for fuzzy search
import Fuse from 'fuse.js';

const searchIndex = new Fuse(items, {
  keys: ['label', 'period', 'subjects'],
  threshold: 0.3,
  includeScore: true
});

function search(query) {
  return searchIndex.search(query);
}
```

### Filter System
```javascript
// Multi-criteria filtering
function applyFilters(items, filters) {
  return items.filter(item => {
    if (filters.period && !inPeriodRange(item, filters.period)) 
      return false;
    if (filters.location && !filters.location.includes(item.location)) 
      return false;
    if (filters.subject && !hasSubject(item, filters.subject)) 
      return false;
    return true;
  });
}
```

### Annotation Storage
```javascript
// LocalStorage with versioning
class AnnotationStore {
  save(itemId, annotation) {
    const key = `annotations_${itemId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({
      ...annotation,
      timestamp: Date.now(),
      id: crypto.randomUUID()
    });
    localStorage.setItem(key, JSON.stringify(existing));
  }
  
  export() {
    const all = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('annotations_')) {
        all[key] = JSON.parse(localStorage.getItem(key));
      }
    }
    return all;
  }
}
```

### Image Optimization
```javascript
// Progressive loading with intersection observer
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
});
```

## Performance Optimizations

### Data Loading Strategy
1. **Initial Load**: Show skeleton while fetching
2. **Progressive Enhancement**: Load core data first
3. **Caching**: Store processed data in IndexedDB
4. **Pagination**: Virtual scroll for large lists

### Bundle Optimization
```javascript
// Vite config for code splitting
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia'],
          'search': ['fuse.js'],
          'utils': ['./src/utils/']
        }
      }
    }
  }
}
```

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Process data (one-time)
npm run process-data

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing Strategy
- Unit tests for data transformation
- Component testing with Vitest
- E2E testing with Playwright
- Performance testing with Lighthouse

## Alternative Approaches

### No-Build Option
For simplicity, use CDN versions:
```html
<!-- index.html -->
<script src="https://unpkg.com/vue@3"></script>
<script src="https://unpkg.com/pinia"></script>
<script src="https://cdn.jsdelivr.net/npm/fuse.js"></script>
<link href="https://unpkg.com/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
```

### Serverless Functions (Optional)
If data processing needs server-side:
- Netlify Functions
- Vercel Edge Functions
- Cloudflare Workers

### Progressive Web App
Add offline capability:
```javascript
// Service Worker for offline access
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/data/items.json',
        '/src/main.js'
      ]);
    })
  );
});
```

## Migration Path
1. **Phase 1**: Static prototype with CDN
2. **Phase 2**: Build pipeline with Vite
3. **Phase 3**: Add PWA features
4. **Phase 4**: Optional API backend