'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

/**
 * Thin wrapper around next-themes.
 *
 * - `attribute="class"` → adds/removes `.dark` on <html>, which is what
 *   globals.css and toCssVars() target.
 * - `defaultTheme="light"` → defaults to light theme.
 * - `disableTransitionOnChange` → prevents the flash of unstyled transition
 *   when switching themes.
 *
 * Usage in components: `import { useTheme } from 'next-themes'`
 * then `const { theme, setTheme } = useTheme()`
 * Values: "light" | "dark" | "system"
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
