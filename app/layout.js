import { Inter, Manrope } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" })

export const metadata = {
  title: "CreatorOS — Your creative command center",
  description: "Create more, grow smarter, and run your content engine in one place.",
}

// Runs before paint to apply the saved theme and avoid a flash of the wrong mode.
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem("theme");
    var m = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (t === "dark" || (!t && m)) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{ className: "!bg-popover !text-popover-foreground !border-border" }}
        />
      </body>
    </html>
  )
}
