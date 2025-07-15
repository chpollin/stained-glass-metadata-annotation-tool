# Design System - Stained Glass Documentation Tool

## Overview

This document defines the complete design system for a professional research tool that handles serious academic work while remaining intuitive for first-time users. The interface supports intensive data entry sessions, large collection management, and standards-compliant export workflows.

**Core Philosophy**: Create an interface that feels like professional research software but requires zero training to use effectively.

## Design Principles

### 1. Research-First Interface Design
- **Information Hierarchy**: Critical metadata (title, location, date, materials) prominently displayed, supplementary details accessible via progressive disclosure
- **Professional Aesthetics**: Clean, institutional appearance suitable for academic environments, museums, and conservation labs
- **Data Integrity Visual Language**: Required fields marked clearly, validation states color-coded, completion status indicated via border colors (green=complete, amber=partial)
- **Workflow Efficiency**: Streamlined paths optimized for repetitive documentation tasks, bulk operations, and export workflows

### 2. Progressive Disclosure Strategy
- **Essential-First Layout**: Core window metadata visible immediately without scrolling
- **Smart Sectioning**: Optional fields grouped logically (Physical Description, Attribution, Research Notes) behind labeled expandable sections
- **Context-Sensitive Help**: Assistance available on-demand without cluttering primary interface
- **Graceful Feature Degradation**: Core functionality accessible even when advanced features unavailable

### 3. Accessibility as Foundation
- **Universal Input Methods**: Full functionality via mouse, keyboard, touch, or assistive technologies
- **Semantic Structure**: Proper heading hierarchy, landmark regions, logical tab order following visual layout
- **High Contrast Compliance**: All color combinations exceed WCAG AA standards (4.5:1 minimum), automatic adaptation for high contrast mode
- **Flexible Scaling**: Interface remains functional when text scaled to 200%, layout adapts appropriately

### 4. Performance-Aware Design Patterns
- **Lazy Loading Strategy**: Images and non-critical content load only when needed, skeleton placeholders maintain layout stability
- **Responsive Feedback**: Interface responds immediately to user actions, data syncs in background
- **Scalable Architecture**: Design patterns proven effective with both small collections (10 windows) and large datasets (3,789+ windows)
- **Memory Efficiency**: Visual strategies that minimize resource usage during extended research sessions

## Visual Design Language

### Color Strategy and Semantic Meaning
**Neutral Foundation**: Gray-based palette forms interface backbone, colors used strategically for meaning
- **Primary Blue** (`#2563eb`): Actions, links, active states, focus indicators
- **Semantic Green** (`#10b981`): Success states, saved confirmations, complete records
- **Semantic Amber** (`#f59e0b`): Warnings, incomplete records, missing optional data  
- **Semantic Red** (`#dc2626`): Errors, validation failures, destructive actions
- **Status Indicators**: Window cards use colored left borders to indicate completion status

### Typography Hierarchy and Readability
**System Font Stack**: Maximum compatibility and performance (`-apple-system, BlinkMacSystemFont, Segoe UI`)
**Scale**: Six-level hierarchy from page titles (1.5rem) to validation messages (0.75rem)
**Reading Optimization**: Line heights and letter spacing optimized for extended documentation sessions, academic text density
**Weight Strategy**: Regular (400) for body text, medium (500) for labels, semibold (600) for section headers, bold (700) for page titles

### Spatial Design and Information Density
**Spacing Scale**: 4px base unit with geometric progression (4px, 8px, 12px, 16px, 24px, 32px)
**Academic Density**: Higher information density than consumer applications, appropriate for research contexts
**Breathing Room**: Strategic whitespace reduces cognitive load during intensive data entry
**Flexible Grid**: CSS Grid-based layouts adapt from single-column mobile to multi-column desktop

## Interface Patterns and Components

### Window List and Data Visualization
**Dual View Strategy**:
- **Card View**: Visual browsing with thumbnail images, essential metadata overlay, hover interactions for quick preview
- **Table View**: Dense information display optimized for research analysis, sortable columns, bulk selection capabilities

**Information Architecture**:
- **Card Layout**: Image thumbnail, title, location, date, completion status indicator
- **Table Columns**: Progressive disclosure based on screen size (Title → Location → Date → Materials → Actions)
- **Status Communication**: Visual completion indicators, bulk selection feedback, real-time search result counts

### Form Design and Data Entry Patterns
**Required vs Optional Field Strategy**:
- **Primary Section**: Title, building, city, country, date, materials always visible
- **Secondary Sections**: Expandable groups for dimensions, attribution, detailed description, research notes
- **Visual Hierarchy**: Required fields marked with red asterisk, optional sections clearly labeled

**Material Selection Interface**:
- **Tag-Based Selection**: Visual tags for selected materials, search functionality for large vocabularies
- **Custom Entry**: Support for materials not in controlled vocabulary
- **Visual Feedback**: Selected vs available states clearly differentiated

**Image Integration Workflow**:
- **Wikimedia Commons Support**: Direct URL processing with automatic thumbnail generation
- **Preview System**: Immediate visual feedback for valid URLs
- **Fallback Handling**: Graceful placeholder for missing or invalid images
- **Performance**: Lazy loading for large collections, click-to-zoom functionality

### Feedback Systems and Status Communication
**Auto-Save Visual Language**:
- **Persistent Indicator**: Subtle status in header area, non-intrusive during normal operation
- **State Transitions**: "Saving..." → "Saved" → fade pattern, error states with retry options
- **No Modal Interruptions**: Continuous workflow without blocking notifications

**Validation and Error Communication**:
- **Real-Time Feedback**: Validation as users type, immediate border color changes
- **Helpful Error Messages**: Specific problems with correction guidance ("Title cannot be empty" vs generic errors)
- **Success Indicators**: Subtle visual confirmation for completed fields
- **Form Blocking**: Submit disabled until all validation errors resolved

**Search and Filter Feedback**:
- **Instant Results**: Real-time filtering with highlighted match terms
- **Result Communication**: Clear counts, filter summaries, "no results" with suggested actions
- **Performance Indicators**: Loading states for large dataset operations

### Modal and Dialog Patterns
**Context-Appropriate Sizing**:
- **Standard Modals**: Confirmation dialogs, simple forms (max-width: 500px)
- **Image Viewer**: Full-screen overlay with dark background, click-outside-to-close
- **Import/Export Flows**: Larger modals for complex workflows with progress indicators

**Accessibility Integration**:
- **Focus Management**: Proper focus trapping, return focus to trigger element
- **Keyboard Navigation**: Escape key closes, tab order contained within modal
- **Screen Reader Support**: Proper ARIA labels, status announcements

## Responsive Design Strategy

### Mobile-First Approach and Adaptations
**Navigation Transformation**:
- **Desktop**: Horizontal navigation bar with clear sections
- **Mobile**: Collapsible menu or tab-based navigation, larger touch targets (minimum 44px)

**Form Layout Evolution**:
- **Desktop**: Multi-column layouts for related fields (city/country side-by-side)
- **Tablet**: Two-column approach for medium-density forms  
- **Mobile**: Single-column with full-width inputs, optimized keyboard types

**Table Responsive Strategy**:
- **Progressive Column Hiding**: Less critical information hidden at smaller breakpoints
- **Column Priority Order**: Title (always visible) → Location → Date → Materials → Actions
- **Mobile Tables**: Horizontal scroll with sticky first column, touch-friendly row selection

### Touch and Gesture Integration
**Touch-Friendly Interactions**:
- **Minimum Target Size**: 44px for all interactive elements following iOS accessibility guidelines
- **Swipe Actions**: Delete and edit actions on mobile list items
- **Gesture Support**: Pinch-to-zoom for image viewing, pull-to-refresh for data updates

**Device-Specific Optimizations**:
- **iOS**: 16px font size minimum to prevent zoom on focus
- **Android**: Material Design-inspired ripple effects on buttons
- **Desktop**: Hover states and right-click context menus

## Accessibility Implementation Strategy

### Keyboard Navigation Architecture
- **Complete Keyboard Access**: Every feature accessible without pointing device
- **Logical Tab Order**: Follows visual layout and user workflow patterns
- **Skip Link System**: Jump to main content, skip navigation, skip to search results
- **Escape Key Patterns**: Consistent behavior for closing modals, clearing search, canceling operations

### Screen Reader Integration
- **Semantic HTML Foundation**: Proper heading hierarchy (h1 → h6), landmark regions, list structures
- **Descriptive Labels**: All form fields, buttons, and links clearly labeled with context
- **Live Region Strategy**: Status announcements for auto-save, search results, validation changes
- **Error Association**: Validation messages properly linked to form fields via `aria-describedby`

### Visual Accessibility Features
- **High Contrast Adaptation**: Interface automatically adapts for high contrast mode users
- **Focus Indicators**: 2px blue outline with 2px offset on all interactive elements
- **Color Independence**: No information conveyed through color alone, always paired with text or icons
- **Text Scaling Support**: Layout remains functional and usable at 200% browser zoom

## Data Visualization and Status Patterns

### Collection Overview and Statistics
**Dashboard Statistics**: Key metrics displayed as cards (total windows, countries represented, dated items, storage usage)
**Status Visualization**: Progress indicators for collection completeness, visual health metrics
**Filter State Communication**: Active filters clearly indicated with removal options

### Loading and Empty State Design
**Skeleton Loading**: Placeholder content that matches final layout structure, maintains visual stability
**Empty State Messaging**: Encouraging rather than discouraging language ("Ready to document your first window?")
**Progressive Loading**: Critical interface elements load first, enhancements load progressively

### Bulk Operations and Selection Patterns
**Selection Visual Language**: Checkbox-based selection with visual feedback, selected row highlighting
**Bulk Action Bar**: Contextual actions appear when items selected, clear count and action options
**Progress Communication**: Clear feedback during bulk operations with ability to cancel

## Error States and Edge Case Handling

### Data Loss Prevention Design
**Unsaved Changes Warning**: Modal dialog with clear options (Save/Discard/Cancel) when navigating away
**Auto-Recovery Interface**: Clear notification when drafts restored, option to discard recovered content
**Storage Limit Warnings**: Progressive warnings at 80%, 90%, 95% capacity with export suggestions

### Network and Performance Error Handling
**Offline State Communication**: Clear indication when working without internet connection
**Retry Mechanisms**: User-initiated retry for failed operations with exponential backoff
**Graceful Degradation**: Core functionality available even when enhanced features fail

### Import/Export Error Communication
**Validation Reports**: Detailed error lists with specific line numbers and correction suggestions
**Preview Systems**: Show data transformation before committing import operations
**Format Guidance**: Clear examples and format requirements for successful imports

## Performance Considerations in Design

### Loading Optimization Patterns
**Critical Path Design**: Essential interface elements prioritized in loading sequence
**Progressive Enhancement**: Advanced features load after core functionality established
**Image Strategy**: Lazy loading with low-quality placeholders, automatic thumbnail generation

### Interaction Responsiveness Design
**Optimistic UI Updates**: Interface responds immediately to user actions, resolves conflicts in background
**Debounced Interactions**: Search delayed 300ms to prevent excessive queries while maintaining responsiveness
**Background Processing**: Long operations (export generation, bulk imports) don't block user interface

### Memory Management Considerations
**Virtual Scrolling**: Large collections rendered efficiently without memory bloat
**Image Cleanup**: Automatic cleanup of off-screen images to prevent memory leaks
**Data Pagination**: Large datasets loaded incrementally with clear navigation

## Content Strategy and Microcopy

### Helpful Guidance and Examples
**Smart Placeholders**: Specific examples instead of generic text ("Rose Window, North Transept" vs "Enter title")
**Format Guidance**: Multiple acceptable formats shown ("1450", "circa 1300", "early 15th century")
**Context-Aware Help**: Assistance text adapts to user's current task and input state

### Error Communication Tone
**Specific Problem Identification**: "Title cannot be empty" rather than generic "Validation error"
**Solution-Oriented Language**: "Try a different search term" instead of just "No results found"
**Professional Academic Tone**: Language appropriate for institutional and research contexts

### Status and Success Communication
**Subtle Confirmation**: Non-intrusive success messages that don't interrupt workflow
**Progress Communication**: Clear status during long operations with estimated completion times
**Achievement Recognition**: Positive reinforcement for completion milestones without being patronizing

This design system creates a professional research environment that handles the complexity of academic documentation while maintaining intuitive usability for users at all experience levels.