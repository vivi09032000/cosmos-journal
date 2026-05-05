---
name: Cosmos Journal
description: A warm ritual journaling app for goals, gratitude, moon phases, and angel signals.
colors:
  paper: "#f5efe6"
  paper-strong: "#ede4d8"
  paper-card: "#faf6f0"
  paper-deep: "#f0e8dc"
  paper-soft: "#faf6f0e0"
  line: "#b5783a33"
  line-strong: "#b5783a80"
  ink: "#2e2318"
  ink-soft: "#6b5540"
  ink-faint: "#a08870"
  navy: "#25314d"
  navy-deep: "#1a2237"
  gold: "#b5783a"
  gold-soft: "#e8c99a"
  olive: "#7a8c6e"
  danger: "#9f4f34"
typography:
  display:
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", Georgia, serif'
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  headline:
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", Georgia, serif'
    fontSize: "1.7rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.005em"
  title:
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", Georgia, serif'
    fontSize: "1.35rem"
    fontWeight: 500
    lineHeight: 1.35
  body:
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", Georgia, serif'
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", Georgia, serif'
    fontSize: "0.76rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.26em"
rounded:
  field: "0.5rem"
  soft-card: "0.75rem"
  card: "0.85rem"
  panel: "1rem"
  sheet: "1.4rem"
  screen: "1.5rem"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.25rem"
  xl: "1.5rem"
  section: "1.4rem"
components:
  button-primary:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.gold}"
    rounded: "{rounded.field}"
    padding: "0 1.25rem"
    height: "2.95rem"
  button-secondary:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 1rem"
    height: "2.9rem"
  input-default:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 1rem"
    height: "2.9rem"
  card-paper:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "1rem"
  chip-signal:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.gold}"
    rounded: "{rounded.pill}"
    padding: "0.22rem 0.6rem"
---

# Design System: Cosmos Journal

## 1. Overview

**Creative North Star: "The Lunar Paper Companion"**

Cosmos Journal should feel like a private paper ritual that happens to live in a browser. The interface carries the warmth of a handwritten journal, the quiet contrast of night-sky cards, and the light ornament of astrology. It is a product UI, so the ritual atmosphere must never hide the next action.

The system uses a restrained warm palette: parchment surfaces, brown ink, amber interaction states, sage support, and deep navy for the most important cosmic moments. It rejects SaaS dashboard language, cold productivity UI, fake device frames, neon, purple AI gradients, and decorative glass effects.

**Key Characteristics:**
- Single-column mobile-first app shell with a fixed bottom navigation.
- Parchment surfaces with thin amber borders and low ambient shadows.
- Deep navy is reserved for moon phase, angel decode, and goal imagery.
- Serif typography is the product voice, not only decoration.
- Motion is short and state-driven: cards, drawers, sheets, and selected chips.

## 2. Colors

The palette is warm paper at rest, amber for interaction, navy for cosmic emphasis, and sage for gentle balance.

### Primary
- **Amber Ink**: The primary action and selection color. Use it for active navigation, selected chips, progress fills, linked signal badges, and important text actions.
- **Moonlit Navy**: The high-contrast cosmic surface. Use it only for moon cards, angel decode cards, and goal hero imagery where the page needs one strong visual anchor.

### Secondary
- **Sage Balance**: A quiet supportive color for gratitude and calm status labels. Use sparingly where amber would feel too transactional.
- **Terracotta Warning**: Error and danger tone. Use for failures, destructive actions, or upload problems only.

### Neutral
- **Parchment Ground**: The base app background. It should feel warm, never pure white.
- **Cream Card**: The standard card surface for forms, journals, empty states, and list rows.
- **Deep Brown Ink**: Primary text. Never use pure black.
- **Soft Brown Ink**: Secondary text, metadata, and explanatory copy.
- **Faint Brown Ink**: Labels, helper text, inactive navigation, and low-emphasis timestamps.
- **Amber Rule**: Borders, dividers, and focus rings use amber with alpha. Lines should feel printed, not boxed.

### Named Rules
**The One Night Sky Rule.** Each screen may have one dominant navy feature surface. If everything is cosmic, nothing is important.

**The Warm Neutral Rule.** Never introduce pure white, pure black, cool gray, neon, or purple AI gradients. Every neutral must lean toward paper, brown, or cream.

## 3. Typography

**Display Font:** Cormorant Garamond with Noto Serif TC and Georgia fallback.
**Body Font:** Cormorant Garamond with Noto Serif TC and Georgia fallback.
**Label/Mono Font:** JetBrains Mono or Fira Code only for technical identifiers when needed.

**Character:** The product speaks through a unified serif stack. Headings feel literary and ritual-like; labels stay quiet through small size, uppercase spacing, and amber-brown color rather than a separate sans voice.

### Hierarchy
- **Display** (400, 2rem, 1.12): Page titles such as 今日, 目標, 天使, 感恩, and major detail titles.
- **Headline** (400, 1.7rem, 1.2): Card titles, goal titles, large angel numbers, and important ritual prompts.
- **Title** (500, 1.35rem, 1.35): Section titles inside cards and focused prompts.
- **Body** (400, 0.95rem, 1.6): Main explanatory text, journal entries, form copy, and empty states. Keep prose within 65 to 75 characters per line on desktop.
- **Label** (500, 0.76rem, 0.26em): Kicker labels, metadata, tags, tabs, and navigation captions.

### Named Rules
**The Serif Product Rule.** Serif is allowed in UI controls here because it is the product voice. Keep it legible with larger sizes and generous line-height.

**The Quiet Label Rule.** Labels should be small, spaced, and calm. Do not shout with heavy weights or saturated color.

## 4. Elevation

Depth is created through paper layering, borders, and low ambient shadows. Shadows should feel like stacked stationery on a desk, not floating glass panels. Tonal layers are the default; large shadows are reserved for sheets, drawers, active cards, and goal imagery.

### Shadow Vocabulary
- **Paper Lift** (`0 8px 24px rgba(46, 35, 24, 0.08)`): Default card elevation for paper cards.
- **Screen Frame** (`0 18px 48px rgba(46, 35, 24, 0.08)`): Desktop app shell only.
- **Cosmic Feature** (`0 18px 34px rgba(24, 31, 53, 0.22)`): Navy hero or moon surfaces.
- **Bottom Sheet** (`0 -12px 40px rgba(46, 35, 24, 0.14)`): Bottom sheet and modal-like mobile surfaces.
- **Drawer** (`-8px 0 40px rgba(46, 35, 24, 0.12)`): Right side drawer.

### Named Rules
**The Paper Stack Rule.** Shadows must be soft and brown-tinted. If the shadow looks like a generic app modal, reduce opacity or replace it with a border and tonal layer.

## 5. Components

### Buttons
- **Shape:** Small rectangular softness (`0.5rem`) for primary and secondary actions. Pills are reserved for chips and navigation selectors.
- **Primary:** Cream-to-paper gradient with amber text, thin amber border, and low shadow. It is calm, not loud.
- **Hover / Focus:** Hover lifts by `-1px`; focus uses a 2px amber outline with 3px offset. Disabled state drops to 50% opacity and never moves.
- **Secondary / Ghost:** Secondary keeps the same geometry with quieter border and dark ink text. Ghost actions should be text-like and low contrast.

### Chips
- **Style:** Rounded pills with amber border, paper tint, and spaced label text.
- **State:** Selected chips use amber-tinted fill and amber text. Unselected chips stay paper-toned with soft brown text.
- **Use:** Mood choices, daily question choices, angel signal badges, status pills, and linked number tags.

### Cards / Containers
- **Corner Style:** Standard cards use `0.85rem`; soft inner cards use `0.75rem`; large panels use `1rem` or more.
- **Background:** Cards use cream gradients or paper-soft alpha. Navy cards use star textures and line-art circles only when acting as a cosmic feature.
- **Shadow Strategy:** Paper cards use Paper Lift. Soft cards use inset highlight instead of outer shadow.
- **Border:** Thin amber-brown borders only. Do not use thick side accents.
- **Internal Padding:** Common card padding is `1rem` to `1.5rem`; dense mobile cards may reduce to `0.9rem`.

### Inputs / Fields
- **Style:** Cream field, 1px amber line, `0.5rem` radius, serif text.
- **Focus:** Border shifts to deeper brown and adds a soft amber focus glow.
- **Error / Disabled:** Errors use terracotta copy. Disabled controls reduce opacity but keep layout stable.

### Navigation
- **Bottom Navigation:** Fixed on mobile, absolute within the app shell on wider screens. Four primary tabs only: Today, Goals, Angel, Gratitude.
- **Active State:** Amber icon, amber label, and a short underline. Inactive state uses faint brown.
- **Side Drawer:** Right side drawer holds profile, daily history, achievements, language, and lower-frequency routes. It should not compete with bottom navigation.

### Signature Component: Ritual Stack
The 今日小儀式 stack shows one ritual card at a time while exposing the next card titles below. It should reduce anxiety, not create a task list. Completion states remain visible but quiet.

### Signature Component: Cosmic Feature Card
The moon phase, angel decode, and goal hero cards use navy surfaces, amber decoration, and cream text. This is the primary emotional contrast in the product.

## 6. Do's and Don'ts

### Do:
- **Do** use parchment, cream, brown ink, amber, sage, and deep navy as the core vocabulary.
- **Do** reserve navy for the most important cosmic information on the screen.
- **Do** make mobile the primary design target with clear 44px touch zones.
- **Do** keep bottom navigation to four high-frequency tabs.
- **Do** use empty states that explain the next gentle action, not just "nothing here."
- **Do** keep motion between 150ms and 280ms for state transitions.
- **Do** show loading skeletons for images and content that may arrive late.

### Don't:
- **Don't** use fake phone frames, fake status bars, or portfolio-style app mockups.
- **Don't** make the interface feel like a SaaS dashboard, productivity tool, or cold database system.
- **Don't** use neon, purple AI default gradients, glassmorphism, pure white, pure black, or cool gray UI.
- **Don't** put thick colored side stripes on cards or list items.
- **Don't** use gradient text.
- **Don't** create nested card stacks unless the stack itself is the interaction pattern.
- **Don't** use a modal as the first solution when inline editing, bottom sheets, or progressive reveal would work.
