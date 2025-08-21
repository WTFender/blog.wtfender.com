# Blog Changes Summary - Last 3 Days
*Generated on August 20, 2025*

## Overview
This document summarizes all the changes made to the WTFender blog over the last 3 days, including theme updates, CSS customizations, layout improvements, and configuration changes.

## Major Changes

### 1. Theme Migration and Setup (2 days ago)
- **Switched from Terminal theme to Stack theme**
- Added complete Stack theme implementation with extensive customization
- Updated Hugo configuration for new theme compatibility
- Added GitHub Actions deployment workflow updates

**Files Modified:**
- Complete theme structure added under `themes/stack/`
- `config.yaml` - Major restructuring for Stack theme
- `.github/workflows/deploy.yml` - Updated build process

### 2. Custom CSS and Styling (Last 24 hours)
- **Extensive CSS customizations** in `assets/scss/custom.scss`
- Implemented custom blue and purple color scheme
- Enhanced sidebar styling and layout
- Created beveled badge styling for tags and categories

**Key CSS Features Added:**
- Custom color variables (--accent-color: #23B0FF, --purple-accent: #6B69D6)
- Dark/light mode support
- Sidebar menu item left-alignment
- Site name gradient background styling
- Widget styling with transparent backgrounds
- Tag cloud and category beveled badges
- Table of Contents (TOC) enhancements

### 3. Widget and Sidebar Improvements (Today)
- **TOC Widget Restructuring**: Moved section title into widget icon div for inline display
- **Sidebar Display Logic**: Added conditional display rules for right sidebar
- **Archive Widget Hiding**: Implemented selective hiding based on child elements

**CSS Selector Changes:**
```scss
// Hide Archives widget only when it contains widget--archives child
.widget.archives:has(.widget-archive--list) {
    display: none !important;
}

// Hide right sidebar when TOC is empty
.sidebar.right-sidebar.sticky:has(#TableOfContents:empty) {
    display: none !important;
}

// Display widget icon and title on same line
.widget.archives .widget-icon {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
}
```

### 4. Project Section Redesign (Today)
**Updated Projects widget in config.yaml:**
- Removed GitHub icons from project listings
- Swapped column positions (project name now on left)
- Left-aligned project names and descriptions
- Kept star/fork counts on the right

**Layout Change:**
```
Before: [Stats] [Project Name (center)] [GitHub Icon]
After:  [Project Name (left)] [Stats (right)]
```

### 5. Layout Template Customizations
- **Custom baseof.html**: Added wide-mode functionality
- **Custom single.html**: Enhanced post page layout
- **Custom widget templates**: 
  - `toc.html` - Table of Contents with icon integration
  - `categories.html` - Custom category widget
  - `markdown-text.html` - Custom markdown text widget

### 6. Wide Mode Feature
- **TypeScript implementation** (`assets/ts/wide-mode.ts`)
- Toggle button in sidebar
- Floating close button when active
- Responsive layout adjustments
- CSS grid layout modifications for full-width content

**Wide Mode Features:**
- Hides sidebar and TOC when active
- Expands content to full width
- Floating close button with animation
- Persistent toggle state

## Technical Details

### File Structure Changes
```
├── assets/
│   ├── scss/custom.scss (1336 lines of custom styling)
│   └── ts/wide-mode.ts (191 lines of functionality)
├── layouts/
│   ├── _default/
│   │   ├── baseof.html (wide-mode integration)
│   │   ├── index.html (custom homepage)
│   │   └── single.html (enhanced post layout)
│   └── partials/
│       └── widget/ (custom widget templates)
├── themes/stack/ (complete theme implementation)
└── config.yaml (extensive reconfiguration)
```

### Configuration Updates
- **Widgets Configuration**: Added custom Projects markdown widget with GitHub stats
- **Color Scheme**: Set to dark mode only (`toggle: false`, `default: dark`)
- **Table of Contents**: Enabled with custom styling
- **Menu Structure**: Updated navigation and social links
- **Sidebar Configuration**: Custom subtitle and avatar settings

### CSS Architecture
- **CSS Variables**: Comprehensive color system with dark/light mode variants
- **Component-Based Styling**: Modular approach for widgets, tags, sidebar elements
- **Responsive Design**: Mobile-first approach with breakpoint considerations
- **Animation Support**: Smooth transitions and hover effects

## Recent Session Changes (Last few hours)

### Right Sidebar Improvements
1. **Conditional Display**: Right sidebar now only shows on post pages with content
2. **TOC Icon Integration**: Hash icon and "Contents" title now display inline
3. **HTML Structure**: Moved h2 title inside widget-icon div for better layout

### Projects Widget Redesign
1. **Removed GitHub Icons**: Cleaned up visual clutter
2. **Layout Restructure**: Project names prominently displayed on left
3. **Text Alignment**: All text now left-aligned for better readability
4. **Maintained Functionality**: GitHub links and stats still accessible

### Widget Hiding Logic
```scss
// Hide archives widget with specific content
.widget.archives:has(.widget-archive--list) {
    display: none !important;
}

// Hide empty TOC containers
.sidebar.right-sidebar.sticky:has(#TableOfContents:empty) {
    display: none !important;
}
```

## Commit History (Last 3 days)
- `f2bddea` - styles (latest)
- `8044439` - style 
- `5827949` - update build
- `1aaa79d` - update build
- `035935d` - add theme (Stack theme integration)
- `254b25f` - update job
- `5e300ed` - retheme (initial theme switch)

## Impact and Results
- **Enhanced User Experience**: Better navigation and visual hierarchy
- **Improved Performance**: Optimized CSS and reduced visual clutter
- **Mobile Responsiveness**: Better mobile layout with responsive design
- **Accessibility**: Improved focus states and keyboard navigation
- **Customization**: Highly customized appearance matching brand colors
- **Functionality**: Wide-mode reading experience and improved TOC

## Future Considerations
- Monitor wide-mode usage and user feedback
- Consider adding more interactive elements
- Potential color scheme variations
- Performance optimization for large CSS file
- Additional widget customizations based on content needs

---
*This summary reflects the comprehensive redesign and enhancement of the WTFender blog, transitioning from a basic setup to a highly customized, feature-rich Hugo site.*
