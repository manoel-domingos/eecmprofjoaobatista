---
colors:
  brand:
    50: "#eff6ff"
    100: "#dbeafe"
    400: "#60a5fa"
    500: "#3b82f6"
    600: "#2563eb"
    700: "#1d4ed8"
  slate:
    50: "#f8fafc"
    100: "#f1f5f9"
    200: "#e2e8f0"
    300: "#cbd5e1"
    400: "#94a3b8"
    500: "#64748b"
    600: "#475569"
    700: "#334155"
    800: "#1e293b"
    900: "#0f172a"
  emerald:
    400: "#34d399"
    500: "#10b981"
    600: "#059669"
    700: "#047857"
  rose:
    400: "#fb7185"
    500: "#f43f5e"
    600: "#e11d48"
  purple:
    400: "#c084fc"
    600: "#9333ea"
    700: "#7e22ce"
  amber:
    500: "#f59e0b"

typography:
  fontFamily: "ui-sans-serif, system-ui, sans-serif"
  sizes:
    xs: "0.75rem"
    sm: "0.875rem"
    base: "1rem"
    lg: "1.125rem"
    xl: "1.25rem"
    2xl: "1.5rem"
  weights:
    medium: 500
    semibold: 600
    bold: 700

spacing:
  1: "0.25rem"
  1.5: "0.375rem"
  2: "0.5rem"
  2.5: "0.625rem"
  3: "0.75rem"
  4: "1rem"
  6: "1.5rem"
  8: "2rem"

radii:
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  full: "9999px"

shadows:
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
  2xl: "0 25px 50px -12px rgb(0 0 0 / 0.25)"

motion:
  duration:
    200: "200ms"
    300: "300ms"
  easing:
    in-out: "cubic-bezier(0.4, 0, 0.2, 1)"
---

# Gestão Disciplinar EECM

A clean, structured, and informative design system tailored for a school administration and discipline management tool. The identity prioritizes readability, clear hierarchical navigation, and immediate status recognition to support fast decision-making by school managers and coordinators.

## Look and Feel

### Professional & Trustworthy
The application heavily relies on the Slate color palette. A light background (`slate-50`) paired with highly legible typography (`slate-800` for primary text and `slate-500` for secondary data) establishes a calm and professional atmosphere. The design intentionally avoids overwhelming the user with loud colors, reserving them exclusively for actionable items and status indicators.

### Status-Driven Accents
Actions and statuses are vividly distinguishable. The Brand Blue (`blue-600`) draws attention to primary actions like adding new records or saving configurations. The system uses semantic color coding for distinct administrative concepts: 
- **Emerald/Green** is used for successful states, positive behavior (praises), and online syncing status.
- **Rose/Red** serves as an alert for accidents, deletion warnings, or offline statuses.
- **Amber/Yellow** signifies warnings or highlights top-performing classes and students in rankings.
- **Purple** is used specifically to designate the highest level of administrative access ("Gestor"), visually separating system configuration from daily operations.

### Clean Data Presentation
Information dense areas, like tables and lists, are housed within `rounded-2xl` or `rounded-xl` cards using subtle borders (`border-slate-200`) and minimal shadowing (`shadow-sm`). This compartmentalization creates distinct zones without adding visual clutter. Alternating row transitions on hover ensure readability when scanning through extensive lists of students or occurrences.

### Responsive & Accessible Structure
The layout is built around a collapsible sidebar that accommodates a large number of administrative modules without compromising screen real estate. Icons from the `lucide-react` library accompany every menu item and action button, promoting quick visual scanning and enhancing accessibility across different devices and screen sizes. Small touches, like customized thin scrollbars, maintain the polished aesthetic even when dealing with overflowing lists.
