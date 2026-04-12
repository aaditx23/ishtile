import type { Metadata } from 'next';
import { Anton } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LightTheme, DarkTheme, toCssVars, varsToCss } from '@/styles/theme';

// Compile theme tokens at build time — no runtime cost.
const lightCss = varsToCss(toCssVars(LightTheme));
const darkCss  = varsToCss(toCssVars(DarkTheme));
const themeStyles = `:root {\n${lightCss}\n}\n.dark {\n${darkCss}\n}`;
const anton = Anton({ subsets: ['latin'], weight: '400', display: 'swap' });

export const metadata: Metadata = {
  title: 'Ishtile',
  description: 'Ishtile — fashion for everyone',
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
      <body className={anton.className}>
        <ThemeProvider>
          <main>
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
