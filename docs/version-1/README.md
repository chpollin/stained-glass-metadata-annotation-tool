# Stained Glass Documentation Tool

A professional, browser-based application for documenting and managing stained glass window metadata. Built for researchers, conservators, and institutions who need to catalog stained glass collections with academic rigor and export standards-compliant data.

## Overview

This tool provides a complete solution for stained glass documentation, from initial data entry through professional export formats. It handles collections of any size (tested with 3,789+ windows) while maintaining excellent performance and full accessibility compliance.

**Key Features:**
- Complete window metadata management (CRUD operations)
- Real-time search and advanced filtering
- Standards-compliant export (Schema.org JSON-LD, CSV)
- Wikimedia Commons image integration
- Bulk operations for large collections
- Full accessibility (WCAG 2.1 AA compliant)
- Zero-dependency, client-side application

## Quick Start

### Download and Run Locally
1. Download all files to a folder
2. Open `index.html` in any modern browser
3. Start documenting windows immediately

**No build process, no dependencies, no server required.**

## Documentation Suite

This project includes comprehensive documentation for different audiences:

| Document | Purpose | Audience |
|----------|---------|----------|
| **[REQUIREMENTS.md](REQUIREMENTS.md)** | Complete feature specifications and implementation status | Project managers, stakeholders |
| **[DESIGN.md](DESIGN.md)** | UI/UX patterns, visual design system, and interaction guidelines | Designers, frontend developers |
| **[INSTRUCTIONS.md](INSTRUCTIONS.md)** | Technical implementation details and development guide | Developers, maintainers |
| **[DATA.md](DATA.md)** | Data structures, schemas, and export formats | Data architects, integrators |

## Core Capabilities

### Window Documentation
- **Required Fields**: Title, building, location, date, materials
- **Optional Fields**: Alternative titles, dimensions, images, detailed descriptions
- **Flexible Dating**: Supports "circa 1450", "early 13th century", exact years
- **Material Selection**: Comprehensive vocabulary with custom additions

### Search & Discovery
- **Real-time Search**: Instant results across all text fields (<50ms response)
- **Advanced Filtering**: By country, materials, date ranges
- **Dual Views**: Card view with images, sortable table view
- **Statistics Dashboard**: Collection metrics and insights

### Data Management
- **Auto-save**: Every 30 seconds with visual indicators
- **Draft Recovery**: Automatic restoration after crashes
- **Bulk Operations**: Select multiple windows for export or deletion
- **Storage Monitoring**: Capacity warnings and cleanup options

### Import & Export
- **Import Sources**: Wikidata RDF, CSV files with field mapping
- **Export Formats**: Schema.org JSON-LD (linked data), CSV for spreadsheets
- **Bulk Export**: Selected windows or entire collection
- **Standards Compliance**: Full Schema.org VisualArtwork specification

### Images & Media
- **Wikimedia Integration**: Direct URL support with thumbnail generation
- **Lazy Loading**: Optimized performance for large collections
- **Image Viewer**: Full-screen modal with keyboard navigation
- **Format Support**: JPEG, PNG, SVG, WebP

## Technical Specifications

### Browser Requirements
- **Chrome 90+** (recommended)
- **Firefox 88+** 
- **Safari 14+**
- **Edge 90+**

### Performance Characteristics
- **Scale**: Handles 3,789+ windows efficiently
- **Search Speed**: <50ms for 4,000+ records
- **Load Time**: <2 seconds on 3G connections
- **Memory Usage**: <50MB for large collections
- **Export Speed**: <5 seconds for 4,000+ records

### Technology Stack
- **Frontend**: HTML5, CSS3, ES6+ JavaScript
- **Storage**: Browser localStorage with compression
- **Standards**: Schema.org, WCAG 2.1 AA, semantic HTML
- **Dependencies**: Zero external libraries

## Getting Started Guide

### 1. Create Your First Window
1. Click "Add Window" in the navigation
2. Fill in required fields (marked with *)
3. Add optional details as needed
4. Save automatically happens every 30 seconds

### 2. Add Images
1. Find your window on Wikimedia Commons
2. Copy the image URL
3. Paste into the "Image URL" field
4. Preview appears automatically

### 3. Search Your Collection
1. Use the search box for instant filtering
2. Apply country or material filters
3. Switch between card and table views
4. Sort by any column in table view

### 4. Export Your Data
1. Select windows or choose "Export All"
2. Pick JSON-LD for linked data or CSV for spreadsheets
3. Download begins automatically
4. Data is fully compliant with standards

## Use Cases

### Academic Research
- Document windows across multiple institutions
- Export linked data for digital humanities projects
- Collaborate with standardized metadata formats
- Track research progress with comprehensive records

### Museum Collections
- Catalog institutional stained glass holdings
- Prepare exhibition materials with rich metadata
- Share collection data with external researchers
- Maintain professional documentation standards

### Conservation Projects
- Record condition and treatment details
- Track changes over time with modification timestamps
- Document materials and techniques systematically
- Export reports for grant applications and publications

### Educational Projects
- Student assignments with structured data entry
- Comparative analysis across regions and periods
- Digital literacy training with professional tools
- Research methodology instruction

## Advanced Features

### Bulk Operations
- Import hundreds of records from Wikidata exports
- Select multiple windows for simultaneous operations
- Export filtered subsets of your collection
- Delete multiple records with confirmation

### Professional Workflows
- Auto-save with draft recovery prevents data loss
- Real-time validation ensures data quality
- Standards-compliant export for digital preservation
- Accessibility features for inclusive use

### Data Integration
- Schema.org compliance enables linked data workflows
- CSV export integrates with spreadsheet analysis
- Wikimedia integration connects to global image resources
- Open standards ensure long-term preservation

### Accessibility Statement
This application is designed to be accessible to all users and complies with WCAG 2.1 AA standards. Features include:
- Complete keyboard navigation
- Screen reader compatibility
- High contrast support
- Scalable text and interfaces
- Semantic HTML structure