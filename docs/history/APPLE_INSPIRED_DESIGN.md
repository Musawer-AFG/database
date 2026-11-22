# Apple-inspired design notes

The interface borrows broad usability principles from Apple's Human Interface Guidelines:
- Clear hierarchy and generous spacing
- Consistent alignment and grouped related controls
- Comfortable information density
- Adaptation across desktop and mobile widths
- Sidebar navigation for desktop and collapsible navigation on smaller screens

It does not use Apple's logos, icons, proprietary assets, or claim to be an Apple product. The blue accent, translucent surfaces, typography stack and rounded components are an original web design direction.

## RTL and sidebar
The application shell uses left-to-right layout only to anchor the navigation rail on the physical right. The workspace and all content remain right-to-left for Afghan Dari.

## Design tokens
- Canvas: `#f5f5f7`
- Primary surface: `#ffffff`
- Text: `#1d1d1f`
- Secondary text: `#86868b`
- Accent: `#007aff`
- Border: `#e5e5ea`
- Card radius: `18px`
- Control radius: `12px`


## Expandable sidebar groups
Each navigation section is an accordion. The Bills group opens by default and contains Sales Bills, Purchase Bills, and Returned Bills. Other groups can be expanded independently.
