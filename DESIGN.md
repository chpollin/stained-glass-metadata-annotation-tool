# Stained Glass Design System Documentation

## Overview

Professional academic research interface optimized for intuitive usability without training.

**Core Philosophy**: Professional research capability; zero required training.

---

## Design Principles

### 1. Research-First Interface

* **Information Hierarchy**: Critical metadata prominently visible; supplementary via progressive disclosure.
* **Professional Aesthetics**: Clean, institutional style suitable for academic/museum environments.
* **Data Integrity**: Required fields clearly indicated; validation color-coded (green=complete, amber=partial).
* **Workflow Efficiency**: Optimized for repetitive tasks, bulk actions, exports.

### 2. Progressive Disclosure

* **Essential-First Layout**: Immediate core metadata visibility.
* **Smart Sectioning**: Optional fields grouped logically behind expandable labels.
* **Context-Sensitive Help**: On-demand, unobtrusive guidance.
* **Graceful Degradation**: Core functionality independent of advanced features.

### 3. Accessibility Foundation

* **Universal Inputs**: Mouse, keyboard, touch, assistive technologies.
* **Semantic Structure**: Clear headings, logical tab orders, landmarks.
* **High Contrast Compliance**: Meets WCAG AA (4.5:1), auto-adaptation for high-contrast modes.
* **Flexible Scaling**: Fully functional at 200% text scaling.

### 4. Performance Patterns

* **Lazy Loading**: Images/non-critical content load progressively; placeholders maintain stability.
* **Responsive Feedback**: Instant UI responses; background syncing.
* **Scalable Architecture**: Efficient with small (\~10) to large (3,789+) collections.
* **Memory Efficiency**: Optimized resource usage for long sessions.

---

## Visual Design Language

### Color Semantics

* Neutral gray-based UI.
* **Primary Blue** (`#2563eb`): Actions, focus.
* **Green** (`#10b981`): Success, completeness.
* **Amber** (`#f59e0b`): Warnings, partial completeness.
* **Red** (`#dc2626`): Errors, destructive actions.
* Colored borders indicate completion status.

### Typography

* System fonts (`-apple-system, BlinkMacSystemFont, Segoe UI`).
* Six-level hierarchy (1.5rem–0.75rem); optimized readability.
* Weight: Regular (400), medium (500 labels), semibold (600 headers), bold (700 titles).

### Spacing & Density

* Base spacing: 4px increments (4–32px).
* Higher info density suited for academic context.
* Strategic whitespace reduces cognitive load.
* CSS Grid adapts mobile–desktop.

---

## Interface Components & Patterns

### Window List & Data Visualization

* Dual view: **Card** (visual browse) & **Table** (research analysis, sortable).
* Cards: Thumbnails, essential metadata, quick preview interactions.
* Tables: Progressive disclosure (Title always visible, then Location, Date, Materials, Actions).

### Forms & Data Entry

* Required (always visible) vs. optional (expandable).
* Tag-based materials selection; custom entries supported.
* Wikimedia Commons integration; previews, lazy loading, click-to-zoom images.

### Feedback & Status

* Auto-save: Non-intrusive indicators; clear transitions (saving → saved).
* Validation: Real-time feedback; precise error messages; submit blocked until resolved.
* Search/filter: Instant feedback; match highlights; clear result counts.

### Modals & Dialogs

* Contextual sizes: Standard (confirmation, simple forms), full-screen image viewer, larger import/export flows.
* Accessibility: Proper focus trapping, ARIA labeling, keyboard navigation.

---

## Responsive & Device-Specific Design

### Mobile-First Adaptation

* Navigation: Desktop horizontal, mobile collapsible/tabbed.
* Forms: Multi-column desktop, single-column mobile; touch-optimized targets (44px+).
* Tables: Progressive column hiding, horizontal scrolling, sticky titles on mobile.

### Touch/Gestures

* Swipe to edit/delete; pinch-to-zoom images; pull-to-refresh.
* Device optimizations: iOS (16px min), Android (Material ripple), desktop (hover/right-click).

---

## Accessibility Implementation

* Full keyboard accessibility; logical tabbing, skip links.
* Semantic HTML, proper headings, landmarks.
* Clear descriptive ARIA labels, real-time status announcements.
* Auto-adaptive high contrast, consistent focus indicators, scalable text (200%).

---

## Data Visualization & Status Patterns

* Dashboard metrics: windows, countries, completeness status.
* Filter states clearly communicated; progressive loading with placeholders.
* Bulk actions: Checkboxes, contextual action bars, clear progress/cancel options.

---

## Error Handling & Edge Cases

* **Data Loss Prevention**: Unsaved warnings, auto-recovery.
* **Network Issues**: Offline indicators, retry with exponential backoff.
* **Import/Export**: Validation error specifics, preview transformations, format guidance.

---

## Performance Optimizations

* Prioritized loading, progressive enhancement.
* Optimistic UI responses; debounced search (300ms delay).
* Virtual scrolling, image cleanup, incremental data pagination.

---

## Content & Microcopy Strategy

* Clear, actionable placeholders and examples.
* Precise, helpful error messages; solution-focused language.
* Subtle confirmations, professional tone, positive reinforcement without patronizing.
