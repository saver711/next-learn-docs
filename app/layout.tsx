import "@/app/ui/global.css"
import { inter, lusitana } from "@/app/ui/fonts"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    // %s => every page title
    /* 
    in invoices page just:
    export const metadata: Metadata = {
      title: "Invoices"
    }
    */
    template: "%s | Acme Dashboard",
    default: "Acme Dashboard"
  },
  description: "The official Next.js Learn Dashboard built with App Router.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh")
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${inter.className} ${lusitana.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
