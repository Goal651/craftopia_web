import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { Toaster } from "@/components/ui/sonner"
import { AppErrorBoundary } from "@/components/error-boundaries"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "ArtGallery - Contemporary Art Collection",
  description:
    "Discover extraordinary contemporary artworks from talented artists worldwide. Curated collection of paintings, digital art, sculptures, and photography.",
  keywords:
    "art gallery, contemporary art, paintings, digital art, sculptures, photography, art collection, buy art online",
  authors: [{ name: "ArtGallery" }],
  creator: "ArtGallery",
  publisher: "ArtGallery",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://artgallery.com",
    title: "ArtGallery - Contemporary Art Collection",
    description: "Discover extraordinary contemporary artworks from talented artists worldwide.",
    siteName: "ArtGallery",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ArtGallery - Contemporary Art Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ArtGallery - Contemporary Art Collection",
    description: "Discover extraordinary contemporary artworks from talented artists worldwide.",
    creator: "@artgallery",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#8b5cf6" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AppErrorBoundary
          onError={(error, errorInfo, errorId) => {
            console.error('App-level error:', error, errorInfo, errorId)
            // In production, send to error tracking service
            // errorTrackingService.captureException(error, {
            //   tags: { errorId, level: 'app' },
            //   extra: errorInfo
            // })
          }}
          resetOnPropsChange={true}
          resetKeys={[]} // Add keys that should trigger reset when changed
        >
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
            <AuthProvider>
              <CartProvider>
                <div className="relative min-h-screen">
                  <Navbar />
                  <main className="relative">{children}</main>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      style: {
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "var(--foreground)",
                      },
                    }}
                  />
                </div>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </AppErrorBoundary>
      </body>
    </html>
  )
}
