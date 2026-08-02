import { Geist, Geist_Mono, Outfit, Raleway } from "next/font/google"

import "./globals.css"
import "./styles.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const ralewayHeading = Raleway({subsets:['latin'],variable:'--font-heading'});

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "Portfolio",
  description: "Portfolio",
}

export const ogImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Portfolio",
  type: "image/png",
  secureUrl: "https://www.example.com/og-image.png",
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", outfit.variable, ralewayHeading.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
