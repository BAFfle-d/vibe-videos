import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vibe Video Generator',
  description: 'Create beat-synced music videos from stock footage',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
