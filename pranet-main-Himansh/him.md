# PRANA-NET Documentation

## Project Overview

**PRANA-NET** is a modern web application built with React, TypeScript, and Vite, featuring a nature-inspired design system with animated components and multiple dashboard interfaces for different user roles.

### Project Metadata

- **Name**: prana-net
- **Version**: 0.0.0
- **Type**: Single Page Application (SPA)
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1
- **Language**: TypeScript 5.9.3

---

## Technology Stack

### Core Dependencies

- **React**: ^19.2.0 - UI library
- **React DOM**: ^19.2.0 - DOM rendering
- **React Router DOM**: ^7.13.1 - Client-side routing
- **TypeScript**: ~5.9.3 - Type safety

### UI & Styling

- **Tailwind CSS**: ^4.2.1 (via @tailwindcss/vite)
- **Framer Motion**: ^12.35.1 - Animation library
- **Lucide React**: ^0.577.0 - Icon library
- **clsx**: ^2.1.1 - Conditional className utilities
- **tailwind-merge**: ^3.5.0 - Merge Tailwind classes

### Development Tools

- **Vite**: ^7.3.1 - Build tool and dev server
- **ESLint**: ^9.39.1 - Code linting
- **TypeScript ESLint**: ^8.48.0 - TS-specific linting
- **@vitejs/plugin-react**: ^5.1.1 - React plugin for Vite

---

## Project Structure

```
prana-net/
├── public/                    # Static assets
├── src/
│   ├── assets/               # Images, fonts, etc.
│   ├── components/
│   │   ├── shared/          # Reusable components
│   │   │   ├── AnimatedCTA.tsx
│   │   │   ├── FloatingCard.tsx
│   │   │   ├── GlassNavbar.tsx
│   │   │   ├── GradientMeshBackground.tsx
│   │   │   ├── MarqueeTicker.tsx
│   │   │   └── StatusPill.tsx
│   │   └── ui/              # UI primitives
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── pages/               # Route components
│   │   ├── CitizenDashboard.tsx
│   │   ├── LandingPage.tsx
│   │   ├── OfficerDashboard.tsx
│   │   └── OfficialDashboard.tsx
│   ├── App.tsx              # Root component
│   ├── App.css              # App-specific styles
│   ├── index.css            # Global styles
│   └── main.tsx             # Entry point
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML template
├── netlify.toml             # Netlify deployment config
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config (base)
├── tsconfig.app.json        # TypeScript config (app)
├── tsconfig.node.json       # TypeScript config (Node)
└── vite.config.ts           # Vite configuration
```

---

## Application Architecture

### Routing Structure

The application uses React Router with lazy loading for optimal performance:

- **`/`** - Landing Page
- **`/citizen/*`** - Citizen Dashboard
- **`/official/*`** - Official Dashboard
- **`/officer/*`** - Officer Dashboard

### Route Configuration

```typescript
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const CitizenDashboard = lazy(() => import("@/pages/CitizenDashboard"));
const OfficialDashboard = lazy(() => import("@/pages/OfficialDashboard"));
const OfficerDashboard = lazy(() => import("@/pages/OfficerDashboard"));
```

### Animation System

- **AnimatePresence**: Manages page transitions
- **Framer Motion**: Powers component animations
- **Custom animations**: Leaf sway, drift, and bush sway effects

---

## Component Library

### Shared Components

1. **GlassNavbar** - Navigation bar with glassmorphism effect
2. **GradientMeshBackground** - Animated gradient background
3. **AnimatedCTA** - Animated call-to-action button
4. **MarqueeTicker** - Scrolling text ticker
5. **FloatingCard** - Card with floating animation
6. **StatusPill** - Status indicator component

### Design System

- **Theme**: Nature/forest-inspired with lime green accents
- **Background**: Deep forest colors (#0F2B18, #152318)
- **Accent Colors**: Lime (#C6E47A), Green (#4CAF72), Teal (#3DBFAD)
- **Glass Effects**: Glassmorphism for modern UI elements
- **Decorative Elements**: SVG leaf and bush illustrations

---

## Development

### Prerequisites

- Node.js (latest LTS recommended)
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install
```

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Development Server

```bash
npm run dev
```

Access the app at `http://localhost:5173` (default Vite port)

### Building for Production

```bash
npm run build
```

Outputs to `dist/` directory. Build process:

1. TypeScript compilation (`tsc -b`)
2. Vite bundling and optimization

---

## Configuration

### Vite Configuration

**File**: `vite.config.ts`

```typescript
- Plugins: Tailwind CSS, React
- Path alias: "@" → "./src"
- Hot Module Replacement (HMR) enabled
```

### TypeScript Configuration

**Files**: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`

- Strict mode enabled
- No unused locals/imports allowed
- Path mapping: `@/*` → `src/*`

### ESLint Configuration

**File**: `eslint.config.js`

- React hooks rules
- React refresh rules
- TypeScript-aware linting

### CSS Configuration

**File**: `src/index.css`

- Google Fonts import (must come before Tailwind)
- Tailwind CSS directives
- Custom animations (leaf-sway, leaf-drift, bush-sway)

---

## Deployment

### Netlify Deployment

**Configuration File**: `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Quick Deploy Steps

1. **Via Git Integration** (Recommended)
   - Push code to GitHub/GitLab/Bitbucket
   - Connect repository in Netlify dashboard
   - Auto-deploys on push to main branch

2. **Via Netlify CLI**

   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod --dir=dist
   ```

3. **Pre-deploy Checklist**
   ```bash
   npm install
   npm run build
   ```

### SPA Redirect Configuration

The `/* → /index.html` redirect ensures React Router works correctly on page refresh and direct URL access.

---

## Best Practices

### Code Quality

1. **No unused imports**: TypeScript will fail builds on unused code
2. **Import order**: Keep Google Fonts before Tailwind CSS imports
3. **Type safety**: All variables and functions are typed
4. **ESLint compliance**: Follow configured linting rules

### Performance Optimization

1. **Lazy loading**: Pages are code-split and loaded on demand
2. **Suspense fallback**: Loading state during route transitions
3. **Vite HMR**: Fast refresh during development
4. **Production builds**: Minified and optimized

### Component Development

1. **Shared components**: Reusable components in `components/shared/`
2. **UI primitives**: Base components in `components/ui/`
3. **Path aliases**: Use `@/` prefix for imports
4. **Framer Motion**: Use for animations consistently

---

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check for unused imports in TypeScript files
   - Verify import order in `index.css`
   - Run `npm run lint` to identify issues

2. **Routing Issues**
   - Ensure `netlify.toml` includes SPA redirect
   - Check React Router configuration in `App.tsx`

3. **Styling Issues**
   - Verify Tailwind CSS classes are valid
   - Check that `@tailwindcss/vite` plugin is configured
   - Ensure Google Fonts load before Tailwind

4. **Performance Issues**
   - Verify lazy loading is working
   - Check Framer Motion animation performance
   - Use React DevTools Profiler

---

## Future Enhancements

### Potential Improvements

- [ ] Add authentication system
- [ ] Implement API integration
- [ ] Add testing (Vitest, React Testing Library)
- [ ] Implement state management (Zustand/Redux)
- [ ] Add dark/light theme toggle
- [ ] Improve accessibility (ARIA labels, keyboard navigation)
- [ ] Add PWA capabilities
- [ ] Implement analytics tracking
- [ ] Add error boundaries
- [ ] Create component documentation (Storybook)

---

## Project Conventions

### File Naming

- **Components**: PascalCase (e.g., `GlassNavbar.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Styles**: kebab-case or single word (e.g., `index.css`)

### Import Order

1. React core imports
2. Third-party libraries
3. Internal components (with `@/` alias)
4. Relative imports
5. Styles

### Component Structure

```typescript
// 1. Imports
import React from 'react';

// 2. Type definitions
interface ComponentProps {
  // props
}

// 3. Component definition
export const Component: React.FC<ComponentProps> = ({ props }) => {
  // hooks
  // logic

  return (
    // JSX
  );
};
```

---

## Resources

### Documentation Links

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [React Router](https://reactrouter.com/)
- [Netlify Docs](https://docs.netlify.com/)

### Command Reference

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm install`     | Install dependencies     |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

---

## License & Credits

This project uses open-source libraries and follows their respective licenses.

### Key Technologies Credits

- React Team for React framework
- Evan You for Vite
- Vercel for Next.js patterns
- Tailwind Labs for Tailwind CSS
- Framer for Framer Motion

---

## Maintenance Notes

### Keep Updated

- Regularly update dependencies for security
- Test builds before deploying
- Keep `package-lock.json` committed
- Monitor Netlify build logs

### Memory Repository Notes

- Build passes with `npm run build`
- Netlify config in `netlify.toml`
- Avoid unused imports (TS strict mode)
- CSS import order matters (Google Fonts first)

---

**Last Updated**: March 9, 2026  
**Status**: Active Development  
**Deploy Status**: Ready for Netlify
