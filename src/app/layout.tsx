import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LightTheme, DarkTheme, toCssVars, varsToCss } from '@/styles/theme';

// Compile theme tokens at build time — no runtime cost.
const lightCss = varsToCss(toCssVars(LightTheme));
const darkCss  = varsToCss(toCssVars(DarkTheme));
const themeStyles = `:root {\n${lightCss}\n}\n.dark {\n${darkCss}\n}`;

export const metadata: Metadata = {
  title: 'Ishtyle',
  description: 'Ishtyle — fashion for everyone',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning prevents React from warning about the `class`
    // attribute mismatch that next-themes applies on the client (light/dark).
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inject design-system tokens as CSS variables before first paint */}
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
