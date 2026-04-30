import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import Providers from "@/components/Providers"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CampusIQ - Find Your Perfect College",
  description: "Compare rankings, fees, and placements across India top institutions",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
