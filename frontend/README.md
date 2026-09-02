# Frontend Directory Structure

```
src/
├── app/                          # Next.js app router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   ├── (auth)/                  # Auth routes group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (student)/               # Student routes group
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── events/page.tsx
│   │   └── bookmarks/page.tsx
│   ├── (organizer)/             # Organizer routes group
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── events/page.tsx
│   │   └── submissions/page.tsx
│   ├── (admin)/                 # Admin routes group
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── users/page.tsx
│   │   └── events/page.tsx
│   └── api/                     # API route handlers
│
├── components/                   # Reusable React components
│   ├── common/                  # Shared components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── events/                  # Event components
│   │   ├── EventCard.tsx
│   │   ├── EventList.tsx
│   │   ├── EventDetails.tsx
│   │   └── EventForm.tsx
│   ├── auth/                    # Auth components
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── ui/                      # UI components
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       └── Toast.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useEvents.ts
│   └── useFetch.ts
│
├── services/                     # API service functions
│   ├── auth.service.ts
│   ├── events.service.ts
│   └── api.client.ts
│
├── store/                        # Zustand store
│   ├── auth.store.ts
│   ├── events.store.ts
│   └── ui.store.ts
│
├── types/                        # TypeScript types
│   ├── index.ts
│   ├── event.types.ts
│   ├── user.types.ts
│   └── api.types.ts
│
├── utils/                        # Utility functions
│   ├── api.ts
│   ├── validation.ts
│   ├── formatting.ts
│   └── constants.ts
│
├── config/                       # Configuration files
│   ├── env.ts
│   └── constants.ts
│
└── __tests__/                    # Test files
    ├── components/
    ├── hooks/
    └── services/
```

## Key Setup Notes

1. **App Router**: Next.js 14+ app router for file-based routing
2. **Route Groups**: Using parentheses for logical grouping without affecting URL structure
3. **Type Safety**: Full TypeScript support with strict mode
4. **Styling**: Tailwind CSS + PostCSS for modern CSS-in-JS
5. **State Management**: Zustand for lightweight, modern state management
6. **API Communication**: Axios with custom API client for backend requests
7. **Testing**: Jest with React Testing Library for component testing

## Development Workflow

```bash
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run type-check      # Check TypeScript types
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm test                # Run tests
npm run test:coverage   # Run tests with coverage
```
