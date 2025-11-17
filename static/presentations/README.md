# ORD Presentations

This directory contains reveal.js presentations for Open Resource Discovery (ORD).

## Available Presentations

### ORD Introduction (`ord-intro.html`)

A comprehensive introduction to Open Resource Discovery with flexible timing:

- **Core presentation**: 10 minutes (fundamentals)
- **Extended presentation**: 30-40 minutes (with deep dives)

#### Structure

**10-Minute Core (Horizontal slides - press →)**
1. Introduction
2. The Problem
3. What is ORD?
4. How It Works (3 roles)
5. What You Can Describe
6. Benefits
7. Getting Started

**Optional Deep Dives (Vertical slides - press ↓)**
- Integration challenges in detail
- Governance & standards alignment
- Transport modes (Pull, Import, Future)
- Provider architecture
- Resource types deep dive
- Real-world use cases
- Data model & ID system
- Grouping & bundling concepts
- Perspectives (Static vs Dynamic)
- SAP architecture example
- Advanced features (versioning, access strategies, policies)
- Extensibility mechanisms
- Roadmap & community

#### How to Use

1. **View locally**: Open `ord-intro.html` in a web browser
2. **View via Docusaurus**: Navigate to `/presentations/ord-intro.html` when the docs site is running
3. **Navigation**:
   - **→** / **←**: Move horizontally through main topics
   - **↓** / **↑**: Dive deeper into current topic (optional content)
   - **Space**: Navigate forward (follows vertical first, then horizontal)
   - **Esc**: Overview mode (see all slides)
   - **S**: Speaker notes (if any)
   - **F**: Fullscreen mode

#### Presentation Modes

**Short version (10-12 min)**:
- Stay on horizontal slides only (press → to advance)
- Skip all vertical deep dives
- Perfect for: Quick overviews, conference talks, executive briefings

**Medium version (20-25 min)**:
- Include select deep dives on:
  - How It Works → Transport Modes
  - What You Can Describe → Resource Types
  - Benefits → Use Cases
  - Perspectives → Static vs Dynamic

**Long version (35-40 min)**:
- Include all deep dives
- Perfect for: Technical workshops, training sessions, deep-dive webinars

#### Customization

The presentation uses reveal.js 5.0.4 from CDN. To customize:

1. **Themes**: Change the theme by modifying the CSS link:
   ```html
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/theme/black.css">
   ```
   Available themes: black, white, league, beige, sky, night, serif, simple, solarized

2. **Transitions**: Modify the `transition` option in the script:
   ```javascript
   transition: 'slide', // none/fade/slide/convex/concave/zoom
   ```

3. **Content**: Edit the HTML directly to update slides

## Technical Details

- **Framework**: reveal.js 5.0.4
- **Loading**: All dependencies loaded via CDN (no local installation needed)
- **Images**: References images from `/static/img/` directory
- **Browser support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Offline**: Works offline after first load (CDN assets cached)

## Creating New Presentations

To create a new presentation:

1. Copy `ord-intro.html` as a template
2. Modify the content within `<div class="slides">`
3. Update the title and metadata in the `<head>`
4. Test in a browser

## Resources

- [reveal.js Documentation](https://revealjs.com/)
- [ORD Specification](https://github.com/open-resource-discovery/specification)
- [ORD Documentation](https://sap.github.io/open-resource-discovery)
