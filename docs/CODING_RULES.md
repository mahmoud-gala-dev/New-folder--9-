# Coding Rules & Best Practices

This document outlines the coding standards and best practices for the project.

## 1. General Principles
- **Clean Code:** Write code that is easy to read and maintain.
- **DRY (Don't Repeat Yourself):** Abstract common logic into reusable functions or hooks.
- **KISS (Keep It Simple, Stupid):** Avoid over-engineering.

## 2. TypeScript Guidelines
- **Strict Typing:** Avoid using `any`. Use `unknown` if the type is truly unknown.
- **Interfaces vs. Types:** 
  - Use `interface` for public APIs and objects that might be extended.
  - Use `type` for unions, intersections, and simple data structures.
- **Enums:** Use standard `enum` for sets of related constants.
- **Naming:** Use PascalCase for types/interfaces and camelCase for variables/functions.

```typescript
// Example: Interface definition
interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}
```

## 3. React Best Practices
- **Functional Components:** Use functional components with hooks.
- **Hooks:** 
  - Keep hooks simple and focused.
  - Use `useCallback` and `useMemo` only when necessary for performance.
- **Props:** Destructure props in the function signature.
- **Component Structure:**
  - One component per file.
  - Small, focused components.

```tsx
// Example: Functional Component
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded ${variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'}`}
    >
      {label}
    </button>
  );
};
```

## 4. Project Structure
- **src/components:** Shared UI components.
- **src/hooks:** Custom React hooks.
- **src/services:** API calls and external integrations.
- **src/types:** Global TypeScript definitions.
- **src/utils:** Helper functions.

## 5. Styling (Tailwind CSS)
- Use utility classes directly in JSX.
- Use the `@theme` block in `index.css` for custom colors and fonts.
- Avoid complex conditional class logic; use a utility like `clsx` or `tailwind-merge` if needed.

## 6. State Management
- Use `useState` for local component state.
- Use `useContext` or a library like `Zustand` for global state.
- Keep state as close to where it's used as possible.
