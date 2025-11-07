import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Banshee - Que tu voz haga un libro',
  description: 'Convierte tu voz en un libro estructurado con IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}