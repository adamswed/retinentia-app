import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import '@/styles/globals.css';
import styles from '@/styles/layouts/main-layout.module.scss';
import { AuthProvider } from '@/context/auth-context';
import Footer from '@/components/shared/footer/footer';
import { MessageModalProvider } from '@/context/message-modal-context';
import RecaptchaProvider from '@/context/recaptcha-provider';
import { DeviceProvider } from '@/context/device-context';
import { UserAvatar } from '@/components/shared/user-avatar/user-avatar';

const roboto = Roboto({
  weight: ['300', '400', '500'],
  variable: '--roboto',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://retinentia.com'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'Retinentia | AI-Powered Index Cards & Flashcards',
    template: '%s | Retinentia',
  },
  description:
    'Retinentia is a free, private, and ad-free index card app. Use AI and Wikimedia to master vocabulary and terms with ease.',
  keywords: [
    'flashcards',
    'index cards',
    'study tool',
    'vocabulary builder',
    'AI flashcards',
    'test prep',
    'SAT prep',
    'memorization app',
  ],
  authors: [{ name: 'Retinentia Team' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        url: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    title: 'Retinentia | Memorize Anything with AI Index Cards',
    description:
      'Completely private, ad-free, and free to use. The modern way to learn new terms using AI and Wiktionary.',
    url: 'https://retinentia.com',
    siteName: 'Retinentia',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: 'Retinentia Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Retinentia | AI-Powered Index Cards',
    description:
      'The ultimate tool for students to memorize vocabulary. Free, private, and powered by AI.',
    images: ['/web-app-manifest-512x512.png'],
  },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${roboto.className} ${roboto.variable}`}>
      <body className={styles.app_background}>
        <RecaptchaProvider>
          <AuthProvider>
            <DeviceProvider>
              <MessageModalProvider>
                <>
                  <div className='avatar-container'>
                    <UserAvatar />
                  </div>
                  {children}
                </>
              </MessageModalProvider>
            </DeviceProvider>
          </AuthProvider>
        </RecaptchaProvider>
        <Footer />
      </body>
    </html>
  );
}
