// src/app/layout.tsx
import { CartProvider } from "@/src/app/components/cart-provider";
import { CategoryProvider } from "@/src/app/components/category-provider";
import { QueryProvider } from "@/src/app/components/query-provider";
import { ThemeProvider } from "@/src/app/components/theme-provider";
import { Toaster } from "@/src/app/components/ui/toaster";
import { AuthProvider } from "@/src/app/context/auth-context";
import { LayoutWrapper } from "@/src/app/components/layout-wrapper";
import "@/src/app/index.css";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  LOCALE,
  SITE_NAME,
  SITE_URL,
  TITLE_TEMPLATE,
} from "@/src/app/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";

const inter = Inter({ subsets: ["latin"] });

/*
 * The site-wide defaults. `metadataBase` is what turns every
 * relative canonical and OG image below into an absolute URL -
 * without it Next emits a warning and drops them.
 *
 * `title.default` is the homepage's own title; `title.template`
 * wraps every other page's, so no page has to spell out the
 * brand suffix itself.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: TITLE_TEMPLATE,
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  /*
   * No `alternates.canonical` and no `openGraph.url` here on
   * purpose. Metadata cascades, so a canonical set on the
   * layout is inherited by every page that does not override
   * it - which would point /women, /lawn and the rest at the
   * homepage and take them out of the index. The homepage sets
   * its own in src/app/page.tsx; every other route sets its own
   * beside its title.
   */
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: LOCALE,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  /*
   * Google ignores the keywords meta tag, so there is none. The
   * research is expressed in the titles, headings and copy of
   * the pages themselves, which is the only place it counts.
   */
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* en-PK: the audience, the currency and the sizing are Pakistani. */
  return (
    <html lang="en-PK">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          {/* Outermost of the data providers: the others read through it. */}
          <QueryProvider>
            <AuthProvider>
              <CartProvider>
                {/*
                 * Above LayoutWrapper so the admin, which renders
                 * without the header, reads the same store the
                 * storefront does.
                 */}
                <CategoryProvider>
                  <div className="flex min-h-screen flex-col">
                    <LayoutWrapper>{children}</LayoutWrapper>
                  </div>
                </CategoryProvider>
                <Toaster />
              </CartProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>

        {/*
         * Vercel Web Analytics: page views and visitors, no
         * cookies. Outside the providers because it renders
         * nothing and only reports the route it is on.
         */}
        <Analytics />
      </body>
    </html>
  );
}
