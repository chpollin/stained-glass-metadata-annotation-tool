# CVMA Annotation Tool - MVP

A web-based tool for browsing and annotating CVMA (Corpus Vitrearum Medii Aevi) stained glass metadata.

## Features (MVP v1)

- **Browse Collection**: View all 8,730 stained glass items
- **Grid/List Views**: Toggle between card grid and table list
- **Search**: Find items by ID, label, or period
- **Item Details**: Click any item to see full metadata
- **Responsive Design**: Works on desktop and tablet
- **Fast Performance**: Pre-processed data for quick loading

## Quick Start

1. **Process Data** (already done):
   ```bash
   node process-data.js
   ```

2. **Start Local Server**:
   ```bash
   python server.py
   ```

3. **Open Browser**: http://localhost:8000

## File Structure

```
version-2/
├── index.html          # Main application
├── app.js              # JavaScript logic
├── server.py           # Local development server
├── process-data.js     # Data transformation script
├── data/
│   ├── cvma_complete_data_*.json  # Original JSON-LD data
│   └── cvma-processed.json        # Processed item-centric data
└── Knowledge/          # Documentation
```

## Data Processing

The original JSON-LD format (143,615 triples) is transformed into:
- Item-centric JSON structure
- Normalized periods and locations
- Reduced file size (55MB → 14MB)
- Optimized for web display

## Current Limitations

- **Read-only**: No annotation editing yet
- **Basic search**: Simple text matching only
- **No filtering**: By period, location, or subject
- **No exports**: Data export functionality pending
- **Local storage**: No persistence between sessions

## Next Iterations

1. **Annotation System**: Add/edit/delete annotations
2. **Advanced Filtering**: By period, location, subject
3. **Data Export**: JSON, CSV annotation export
4. **Persistence**: Save annotations locally
5. **GitHub Pages**: Deploy as static site

## Browser Requirements

- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Local storage support
- 50MB+ available memory

## Data Statistics

- **Total Items**: 8,730
- **Unique Locations**: 233  
- **Unique Subjects**: 2,081
- **Processed Size**: 13.93 MB
- **Average Properties**: 12.85 per item