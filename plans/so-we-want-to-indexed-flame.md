# BIMBox Field App — Mobile Implementation Plan

## Context

The user wants a mobile field app for construction site workers that complements an existing web-based BIM platform (BIMBox). Field personnel use this app on-site to:
- Log in (email/password or OTP)
- View a floor plan map with issue/task pins
- Create and manage Issues, Tasks, RFIs, and Field Notes
- Attach photos to existing items
- Navigate to a specific site location via "Take Me There" GPS-like routing

Ten Figma screens were provided: Login (2 states), OTP, Login Success, Mobile Home (floor plan), and 5 web reference screens showing data models for Tasks/Issues.

Design tokens extracted from Figma:
- Primary: `#0052ff`
- Font families: Urbanist (headings/UI), Poppins (body text)
- Background: `#ffffff`, surface: `#f7faff`
- Text: `#1f1f1f`, muted: `#515256`, `#94a3b8`
- Status colors: High=`#f97316`, Medium=`#3b82f6`, Low=`#6b7280`, Completed=`#22c55e`, In Progress=`#a855f7`, To Do=`#3b82f6`

---

## Screens & Routes (app-level state machine in App.tsx)

| Screen key | Description |
|---|---|
| `login` | Email + password form |
| `otp` | 6-digit OTP verify |
| `success` | Login success splash |
| `home` | Floor plan map with pins + bottom nav |
| `issues` | Issues list |
| `tasks` | Tasks list (card view) |
| `rfis` | RFI list |
| `fieldnotes` | Field Notes list |
| `detail` | Universal item detail (Issue/Task/RFI/FieldNote) |
| `create` | Create new item form |
| `navigate` | "Take Me There" — animated floor plan routing + arrival popup |

Navigation is a simple string state variable (no router library needed — single page with conditional rendering).

---

## File Structure

```
src/
  App.tsx                    — top-level screen router, mock auth state
  index.css                  — Google Fonts import + Tailwind
  data/
    mockData.ts              — mock issues, tasks, RFIs, field notes
  components/
    BottomNav.tsx            — 4-tab bottom navigation
    StatusBadge.tsx          — colored pill for status/severity
    ItemCard.tsx             — reusable card for list items
    FloatingActionButton.tsx — blue + FAB
    MapView.tsx              — SVG floor plan with interactive pins
    TopBar.tsx               — page header with back button
  screens/
    LoginScreen.tsx
    OtpScreen.tsx
    SuccessScreen.tsx
    HomeScreen.tsx           — map + filter chips + FAB + bottom nav
    IssueListScreen.tsx
    TaskListScreen.tsx
    RfiListScreen.tsx
    FieldNoteListScreen.tsx
    ItemDetailScreen.tsx     — tabs: Detail | Photos | Activity
    CreateItemScreen.tsx     — type picker + form fields
    NavigateScreen.tsx       — floor plan + animated routing + arrival popup
```

---

## Implementation Details

### Fonts
Add to `src/index.css` (before `@import 'tailwindcss'`):
```css
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&family=Poppins:wght@400;500;600&display=swap');
```
Set `font-family: 'Urbanist', sans-serif` as default body font.

### Mock Data (`src/data/mockData.ts`)
- 8 issues with id, title, status, severity, assignee, dueDate, location(x,y), photos[]
- 6 tasks with id, title, status, priority, assignee, dueDate, progress, subtasks[]
- 3 RFIs, 4 field notes
- Each item has a `type: 'issue'|'task'|'rfi'|'fieldnote'`

### HomeScreen
- Blue header bar with Service / Level / Markups filter chips (pill dropdowns)
- `MapView` component: SVG blueprint-style floor plan (simplified grid of rooms) with colored pin markers (red = issue, orange = RFI/question, blue = current position)
- Animated "pulse" ring on current position pin
- Floating `+` FAB bottom-right → opens CreateItemScreen
- BottomNav: Home | Issues | Tasks | Field Notes | RFI

### MapView
- SVG with hardcoded room grid (matches Figma screenshot aesthetic — light blue lines on white/light blue bg)
- Pins rendered as SVG foreignObject or absolute-positioned divs
- Tapping a pin → opens ItemDetailScreen for that item
- Used also in NavigateScreen with animated path drawing

### ItemDetailScreen
- Top: item ID badge, title, breadcrumb
- Left panel equivalent on mobile: Status, Priority, Assignee, Due Date (each as a tappable row with inline editing)
- Tabs: Detail | Photos | Activity
- Photos tab: grid of photo thumbnails + "+ Add Photo" button (triggers file input)
- Activity tab: chronological log with comment input
- "Take Me There" button if item has location coords → navigates to NavigateScreen

### NavigateScreen  
- Shows floor plan MapView
- Animated dotted path from current position to target pin
- Walking progress indicator
- When animation completes → modal popup: "You've Arrived! 📍 [Location Name]" with action buttons (Create Task / Create Issue / View Item)

### CreateItemScreen
- Type selector tabs: Issue | Task | RFI | Field Note
- Form fields: Title, Description, Location (tap on map mini-view), Assignee, Due Date, Priority/Severity, Photos (camera capture)
- Submit → adds to mock data list + returns to appropriate list screen

### StatusBadge
- Props: `status: string` → maps to background/text color
- TO DO: blue, IN PROGRESS: purple, COMPLETED: green, BUG/BLOCKED: red, REVIEW: yellow

---

## Key Interactions

1. Login form → tap Login → OtpScreen → fill 6 boxes → Verify → SuccessScreen (2s) → HomeScreen
2. Home map → tap pin → ItemDetailScreen
3. ItemDetailScreen → "Take Me There" → NavigateScreen → arrival popup
4. FAB on Home → CreateItemScreen → submit → list screen
5. BottomNav tabs switch between list screens
6. Item list card tap → ItemDetailScreen
7. ItemDetailScreen photos tab → "+ Add Photo" → native file picker
8. Status/assignee rows in detail → inline tap to change (simple modal picker)

---

## Assets

Download the Figma assets archive for the login screens (BIMBox logo SVG, mail icon, visibility icon). Install under `public/assets/`. For other screens, use inline SVG icons (Heroicons-style) and Unsplash placeholder images for site photos.

Asset archive to install:
```bash
curl -L "https://www.figma.com/api/mcp/asset/3cde80bc-5b2f-4a6e-986e-7c64f60bcec2.zip" -o /tmp/figma-assets.zip && unzip -o /tmp/figma-assets.zip 'assets/*' -d public
```

---

## Verification

1. Visual check: Login screen matches Figma screenshot (blue brand, Urbanist font, light blue input fields)
2. Navigate from Login → OTP → Home without errors
3. Bottom nav switches screens
4. Tapping a map pin opens detail
5. "Take Me There" shows animated path and arrival popup
6. Create form submits and item appears in list
7. Photo attach button is present on item detail (functional file input)
