# CVMA Stained Glass Metadata Annotation Tool [THIS IS AN EXPERIMENT FOR A PRESENTATION]

A comprehensive web-based platform for browsing, filtering, and annotating the **CVMA (Corpus Vitrearum Medii Aevi)** stained glass collection. This tool provides scholars and researchers with powerful capabilities to explore 8,730 medieval stained glass items and add scholarly annotations.

## 🎯 Live Demo

**👉 [Access the tool here](https://chpollin.github.io/stained-glass-metadata-annotation-tool/docs/version-2/)**

## ✨ Features

### 📚 **Core Functionality**
- **Browse Collection**: Explore all 8,730 stained glass items from the CVMA database
- **Grid/List Views**: Toggle between visual card grid and detailed table list
- **Item Details**: Click any item to view complete metadata with high-resolution images
- **Responsive Design**: Optimized for desktop and tablet research workflows

### 🔍 **Advanced Search & Filtering**
- **Text Search**: Find items by ID, label, period, or description
- **Period Range Filtering**: Filter by specific date ranges (1100-2000)
- **Location Filtering**: Multi-select filtering by geographic locations (Geonames)
- **Subject Filtering**: Filter by iconographic subjects and themes
- **Element Type Filtering**: Filter by AAT (Art & Architecture Thesaurus) codes
- **Combined Filtering**: Use search + filters together for precise results

### 📝 **Annotation System**
- **Add Annotations**: Create scholarly notes with categorization
- **Annotation Categories**: Note, Iconography, Dating, Attribution, Condition, Correction
- **Edit & Delete**: Full CRUD operations for annotation management
- **Persistent Storage**: Annotations saved to browser localStorage
- **Visual Indicators**: See annotation counts on items in grid/list views

### 💾 **Data Management**
- **Export Annotations**: Download all annotations as JSON
- **Import Annotations**: Upload and merge annotation datasets
- **Filter Persistence**: All filter settings saved across browser sessions
- **Performance Optimized**: Fast loading and responsive filtering of large dataset

## 🚀 Quick Start

### Online Usage (Recommended)
Simply visit the live demo link above - no installation required!

### Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/[your-username]/stained-glass-metadata-annotation-tool.git
   cd stained-glass-metadata-annotation-tool/docs/version-2
   ```

2. **Start local server**:
   ```bash
   python server.py
   ```

3. **Open in browser**: http://localhost:8000

## 📊 Dataset Statistics

- **Total Items**: 8,730 stained glass artifacts
- **Geographic Coverage**: 233 unique locations across Europe
- **Iconographic Subjects**: 2,081 distinct subjects and themes
- **Time Period**: Primarily 12th-16th centuries (1100-1600)
- **Data Size**: 14MB optimized JSON (originally 55MB JSON-LD)

## 🎨 Usage Guide

### Browsing the Collection
1. **View modes**: Switch between grid (visual) and list (detailed) views
2. **Pagination**: Navigate through results 50 items at a time
3. **Item details**: Click any item to open detailed modal with metadata

### Using Advanced Filters
1. **Show Filters**: Click the green "Show Filters" button
2. **Set Period**: Enter date range (e.g., 1300-1500 for medieval pieces)
3. **Select Locations**: Multi-select from available geographic locations
4. **Choose Subjects**: Pick iconographic themes of interest
5. **Apply**: Click "Apply Filters" to see results
6. **Combine**: Use text search alongside filters for precise queries

### Creating Annotations
1. **Open Item**: Click any item to view details
2. **Select Category**: Choose annotation type (note, iconography, etc.)
3. **Add Content**: Write your scholarly observation or note
4. **Save**: Click "Add Annotation" to save
5. **Manage**: Edit or delete annotations using the buttons
6. **Export**: Download all annotations for backup or sharing

## 🔧 Technical Details

### Architecture
- **Frontend**: Vanilla HTML5, CSS3, ES6+ JavaScript
- **Data Format**: Optimized JSON from original JSON-LD triples
- **Storage**: Browser localStorage for annotations and filters
- **Deployment**: Static site on GitHub Pages
- **Testing**: Comprehensive test suite with 16 unit tests

### Data Processing Pipeline
The tool processes the original CVMA JSON-LD data:
1. **Extraction**: 143,615 RDF triples converted to item-centric format
2. **Normalization**: Period dates and locations standardized
3. **Optimization**: File size reduced from 55MB to 14MB
4. **Indexing**: Pre-built filter options for performance

### Browser Requirements
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (ES6+ support)
- **JavaScript**: Must be enabled
- **Storage**: 50MB+ localStorage capacity
- **Memory**: Sufficient for handling 14MB dataset

## 🧪 Testing

The tool includes comprehensive testing:

```bash
# Tests run automatically on page load
# Or manually execute in browser console:
runTests()
```

**Test Coverage**:
- Core functionality (data loading, views, search, pagination)
- Annotation system (CRUD, validation, export/import)
- Advanced filtering (period, location, subject, element type)
- UI interactions (modals, forms, error handling)
- State persistence (localStorage integration)

## 📈 Performance

- **Initial Load**: < 3 seconds for 8,730 items
- **Search Results**: < 500ms response time
- **Filter Operations**: Real-time updates
- **Memory Usage**: Optimized for large dataset handling
- **Caching**: Smart localStorage caching for annotations and filters

## 📖 Research Context

The **Corpus Vitrearum Medii Aevi** is an international research project documenting medieval stained glass windows. This tool provides researchers with:

- **Comprehensive Access**: Browse the complete CVMA dataset
- **Advanced Analysis**: Filter by multiple scholarly criteria
- **Annotation Capability**: Add research notes and observations
- **Data Portability**: Export annotations for publication or sharing

## 🔗 Related Resources

- [Corpus Vitrearum International](http://www.corpusvitrearum.org/)
- [CVMA Deutschland](https://corpusvitrearum.de/)
- [Geonames](http://www.geonames.org/) (Geographic data)
- [Getty AAT](http://www.getty.edu/research/tools/vocabularies/aat/) (Art & Architecture Thesaurus)

