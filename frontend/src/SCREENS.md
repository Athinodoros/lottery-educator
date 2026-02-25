# Frontend - Screen Architecture

## Overview

The frontend is built using **React Native + Expo** with **TypeScript** for type safety. All screens follow a consistent layout pattern and integrate with the backend API Gateway on port 3000.

## Screen Hierarchy

```
Root (_layout.tsx)
├── Home (index.tsx) - Main dashboard
├── Games (games.tsx) - Game selection and play
├── Statistics (statistics.tsx) - Win probability display
├── Motivation (motivation.tsx) - Educational content
└── Admin (admin.tsx) - System status and debug info
```

## Navigation Structure

### Tab Navigation (Bottom Tabs)
- **Home** - Dashboard with featured games and statistics overview
- **Play** - Interactive game play screen
- **Stats** - Detailed statistics and probability information
- **Learn** - Educational content about lottery odds
- **Tools** - Admin tools and system status

## Core Components

### Header.tsx
Reusable top navigation component with customizable title and subtitle.

**Props:**
- `title: string` - Header title
- `subtitle?: string` - Optional subtitle
- `style?: ViewStyle` - Custom styling
- `children?: React.ReactNode` - Action buttons/content

**Example:**
```tsx
<Header title="Play Lottery" subtitle="Select a game to play" />
```

### Container.tsx
Safe area aware container wrapper for all screens.

**Props:**
- `children: React.ReactNode` - Screen content
- `padded?: boolean` - Apply default padding (default: true)
- `style?: ViewStyle` - Custom styling

### Button.tsx
Reusable button component with multiple variants.

**Props:**
- `label: string` - Button text
- `onPress: () => void` - Click handler
- `variant?: 'primary' | 'secondary' | 'outline'` - Button style
- `size?: 'small' | 'medium' | 'large'` - Button size
- `disabled?: boolean` - Disable state
- `loading?: boolean` - Show loading spinner

**Variants:**
- `primary` - Indigo background, white text (CTA)
- `secondary` - Gray background, dark text
- `outline` - Transparent background, indigo border

### Card.tsx
Display game, statistic, or result information.

**Props:**
- `data: { title, subtitle?, value?, description? }` - Card data
- `onPress?: () => void` - Click handler

## State Management

### navigationContext.ts
Light weight context for navigation state across screens.

**Exported:**
- `useNavigation()` - Hook to access navigation state
- `NavigationProvider` - Wrapper component (use in root layout)

**State:**
- `activeTab: string` - Current active screen
- `selectedGameId: string | null` - Currently selected game
- `isLoading: boolean` - Global loading state

## Screen Details

### index.tsx (Home Screen)
- Display featured lottery games
- Show latest game statistics  
- Quick links to Play and Stats screens
- Daily odds trivia/tips

### games.tsx (Game Play Screen)
- Display selected game rules
- Number selection interface
- Play button with draw animation
- Results display with statistics

### statistics.tsx (Statistics Screen)
- Game statistics view with comparison
- Win probability displays
- Human-readable examples ("would take X lifetimes")
- Historical game results list

### motivation.tsx (Learn Screen)
- Educational content about lottery odds
- Visual probability comparisons
- Expected value calculations
- Risk communication guidelines

### admin.tsx (Tools Screen)
- System health status
- Backend service connectivity
- Debug information
- Clear local storage option

## Layout Patterns

### Standard Screen Layout
```
┌─────────────────────────┐
│       Header            │
├─────────────────────────┤
│                         │
│    ScrollView          │
│   Content goes here    │
│                         │
├─────────────────────────┤
│  [Tab Navigation Bar]   │
└─────────────────────────┘
```

### Content Structure
1. Header with screen title
2. Container with safe area padding
3. ScrollView for scrollable content
4. Buttons/CTAs at bottom of content

## Styling

### Color Palette
- **Primary**: `#6366f1` (Indigo) - Actions, highlights
- **Neutral**: `#1f2937` (Dark Gray) - Text
- **Border**: `#e5e7eb` (Light Gray) - Dividers
- **Background**: `#ffffff` (White) - Base
- **Accent**: `#10b981` (Green) - Success states

### Typography
- **Header**: 28px, Bold (700)
- **Title**: 16px, Bold (700)
- **Body**: 14px, Regular (400)
- **Caption**: 12px, Regular (400)

## API Integration Points

### Screen ↔ Backend Routes

| Screen | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| Home | GET /games | GET | Fetch game list |
| Home | GET /stats | GET | Fetch all statistics |
| Games | GET /games/:id | GET | Get game details |
| Games | POST /games/:id/play | POST | Execute game play |
| Statistics | GET /stats/:gameId | GET | Get game statistics |
| Statistics | GET /stats/:gameId/examples | GET | Get probability examples |
| Admin | GET /health | GET | Check system health |
| Admin | GET /services | GET | List online services |

## Performance Considerations

- **Lazy Loading**: Game lists loaded on demand
- **Caching**: Statistics cached in browser storage
- **Image Optimization**: Game images lazy loaded
- **Screen Transition**: Use navigation stack for smooth transitions

## Accessibility

- Sufficient color contrast (WCAG AA)
- Touch targets minimum 44x44 points
- Semantic HTML/RN components
- Screen reader friendly labels

## Future Enhancements

- [ ] Offline mode with service worker
- [ ] Push notifications for daily odds
- [ ] Game history with local storage
- [ ] Favorites/bookmarks
- [ ] Share game results
- [ ] Dark mode support
- [ ] Multi-language support
