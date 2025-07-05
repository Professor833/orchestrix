import { Providers } from '@/components/providers'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Orchestrix - AI Workflow Automation Platform',
  description: 'Build, deploy, and manage AI-powered workflows with ease',
  keywords: ['AI', 'workflow', 'automation', 'integration', 'no-code'],
  authors: [{ name: 'Orchestrix Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://orchestrix.app',
    title: 'Orchestrix - AI Workflow Automation Platform',
    description: 'Build, deploy, and manage AI-powered workflows with ease',
    siteName: 'Orchestrix',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orchestrix - AI Workflow Automation Platform',
    description: 'Build, deploy, and manage AI-powered workflows with ease',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>
          {children}
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  )
}
