# API Services

This directory contains the API integration layer for the application.

## Structure

- `authService.ts` - Authentication service
- `index.ts` - Service exports
- `README.md` - This documentation

## Usage

```typescript
import { AuthService } from '@/services/authService';

// Login
const response = await AuthService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Logout
AuthService.logout();

// Check authentication
const isAuthenticated = AuthService.isAuthenticated();
```

## Adding New Services

1. Create types in `src/types/`
2. Create service in `src/services/`
3. Export from `src/services/index.ts`
4. Create hook in `src/hooks/` if needed
