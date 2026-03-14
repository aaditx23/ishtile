# Ishtile Frontend

## Required Environment Variables

Create a `.env.local` file in this folder with:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

`NEXT_PUBLIC_BASE_URL` is required for Pathao-related API calls and webhook callback URL generation.
If it is missing, the app will throw: `NEXT_PUBLIC_BASE_URL is not configured`.
