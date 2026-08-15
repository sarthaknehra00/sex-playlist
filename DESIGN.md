---
name: Nocturne Lounge
colors:
  surface: '#101418'
  surface-dim: '#101418'
  surface-bright: '#36393e'
  surface-container-lowest: '#0b0f13'
  surface-container-low: '#181c20'
  surface-container: '#1c2024'
  surface-container-high: '#272a2f'
  surface-container-highest: '#31353a'
  on-surface: '#e0e2e9'
  on-surface-variant: '#dac1b9'
  inverse-surface: '#e0e2e9'
  inverse-on-surface: '#2d3136'
  outline: '#a28c84'
  outline-variant: '#55433d'
  surface-tint: '#ffb59a'
  primary: '#ffb59a'
  on-primary: '#5a1b01'
  primary-container: '#d47855'
  on-primary-container: '#501600'
  inverse-primary: '#964829'
  secondary: '#ffb94c'
  on-secondary: '#442b00'
  secondary-container: '#ce8b00'
  on-secondary-container: '#452c00'
  tertiary: '#aac8f9'
  on-tertiary: '#0c3159'
  tertiary-container: '#7492c0'
  on-tertiary-container: '#022a52'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#783114'
  secondary-fixed: '#ffddb2'
  secondary-fixed-dim: '#ffb94c'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#624000'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#aac8f9'
  on-tertiary-fixed: '#001c3a'
  on-tertiary-fixed-variant: '#284871'
  background: '#101418'
  on-background: '#e0e2e9'
  surface-variant: '#31353a'
  deep-burgundy: '#2D0A0A'
  midnight-indigo: '#0A0C1A'
  charcoal-glass: rgba(15, 18, 25, 0.7)
typography:
  display-lg:
    fontFamily: ebGaramond
    fontSize: 64px
    fontWeight: '500'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: ebGaramond
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: ebGaramond
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: inter
    fontSize: 18px
    fontWeight: '300'
    lineHeight: '1.6'
  body-md:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-desktop: 64px
  section-gap: 128px
---

## Brand & Style

This design system captures the essence of a premium, late-night lounge—sophisticated, sensual, and deeply immersive. It is designed for an intimate music platform where the interface recedes to let the emotional weight of the sound take center stage. 

The aesthetic blends **Minimalism** with **Glassmorphism**. It utilizes heavy whitespace (or "darkspace") to create breathing room between elements, while frosted glass textures provide a sense of physical depth and tactile luxury. The emotional response is one of calm, exclusivity, and focused discovery.

## Colors

The palette is anchored in a "Midnight Black" (`#05080C`) foundation, creating a low-light environment that reduces eye strain and emphasizes mood. 

- **Primary & Secondary:** Rich burgundy (`#C66D4B`) and soft amber/gold (`#F1A82A`) act as "glowing" interactive accents, mimicking the dim embers of a lounge or neon lights in the distance.
- **Tertiary:** A muted indigo (`#6A88B5`) is used for secondary information and subtle cooling effects.
- **Gradients:** Use soft radial gradients that transition from `deep-burgundy` to `neutral` to create atmospheric "pools" of light behind featured artists or active players.

## Typography

The typography strategy relies on the contrast between high-culture editorial and functional modernism.

- **Headlines:** `EB Garamond` provides a literary, timeless sophistication. It should be used with generous leading and occasional italics for emphasis to evoke a sense of high-end curation.
- **Body & UI:** `Inter` ensures maximum legibility against dark backgrounds. Use lighter weights (300) for large blocks of text to maintain a delicate, "airy" feel.
- **Labels:** Use uppercase with increased letter spacing for navigation and small metadata to maintain a clean, structured appearance.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy to maintain a cinematic, controlled composition. The desktop experience uses a 12-column grid with wide margins (`64px`) to ensure content feels like it's being presented in a gallery.

- **Atmospheric Spacing:** Use exaggerated vertical gaps (`128px`) between major sections to prevent the UI from feeling crowded.
- **Asymmetry:** Occasionally break the grid with large-scale imagery or floating player controls to enhance the "bespoke" feel of the platform.
- **Reflow:** On smaller screens, margins compress to `24px`, and the grid collapses to 4 columns, while maintaining the signature generous padding around touch targets.

## Elevation & Depth

Depth is achieved through **Glassmorphism** rather than traditional shadows. Surfaces do not "cast" shadows as much as they "filter" the light behind them.

- **Surface Layers:** The base layer is the midnight neutral. Secondary surfaces (like sidebars or players) use a `charcoal-glass` fill with a `20px` backdrop blur.
- **Edge Highlighting:** Instead of drop shadows, use a 1px inner border (stroke) with a low-opacity white or amber to simulate the way light catches the edge of a glass pane.
- **Glow:** High-priority interactive elements (like the 'Play' button) should have a soft, outer glow using the `primary` or `secondary` hex codes, suggesting an internal light source.

## Shapes

The shape language is understated and architectural. 

- **Soft Edges:** Use `0.25rem` (4px) roundedness for most UI components (inputs, list items) to maintain a crisp, professional look. 
- **Large Containers:** Use `rounded-lg` (8px) for cards and modals to slightly soften the atmosphere. 
- **Circular Accents:** Playback controls and artist avatars should be fully circular to provide a rhythmic counterpoint to the rectangular grid.

## Components

- **Buttons:** Primary buttons are ghost-style with a 1px border and a subtle amber glow on hover. Text is always `label-md` uppercase.
- **Glass Cards:** Music albums are housed in cards with no visible background until hover, at which point a `charcoal-glass` fill and subtle scale-up effect are applied.
- **Input Fields:** Minimalist underlines rather than boxes. On focus, the underline transitions from charcoal to a glowing burgundy.
- **The Player:** A persistent, frosted glass bar at the bottom of the screen. Controls are minimal, using thin-stroke icons and generous spacing.
- **Chips/Tags:** Small, pill-shaped elements with a low-opacity indigo fill, used for genres or moods.
- **Playlists:** Presented as clean, vertical lists with generous line-height; the active track is highlighted by a soft amber "glow" pulse next to the track name.