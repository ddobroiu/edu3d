import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://edu3d.ro"),
  title: {
    default: "EDU3D - platforma educationala de vizualizare 3D si realitate virtuala",
    template: "%s | EDU3D",
  },
  description:
    "Platforma educationala pentru invatamantul primar si gimnazial. Elevii realizeaza modele tridimensionale pornind de la un text sau de la o fotografie si le studiaza in 3D, in realitate augmentata si in realitate virtuala.",
  keywords: [
    "material didactic 3D",
    "realitate virtuala in scoala",
    "modele tridimensionale",
    "resurse educationale digitale",
    "invatamant primar si gimnazial",
  ],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://edu3d.ro",
    siteName: "EDU3D",
    title: "EDU3D - platforma educationala de vizualizare 3D si realitate virtuala",
    description:
      "Material didactic tridimensional pentru orele de la clasa. Elevii realizeaza modele proprii si le studiaza in 3D, AR si VR.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#5b2ff0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        {/* Consent Mode v2 -- trebuie sa ruleze inainte de gtag.js. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'functionality_storage': 'granted',
                'security_storage': 'granted',
                'wait_for_update': 500
              });
              try {
                if (localStorage.getItem('cookie_consent') === 'granted') {
                  gtag('consent', 'update', {
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                    'analytics_storage': 'granted'
                  });
                }
              } catch (e) {}
            `,
          }}
        />
        {/* GA4 property "EDU3D.ro", in contul Culoarea din Viata SA SRL.
            Site-ul nu avea deloc masurare pana acum. */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-VS4WW03B3Z" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              gtag('js', new Date());
              gtag('config', 'G-VS4WW03B3Z');
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* mydashboard.ro: vizite, surse de trafic si legatura cu platile (proiectul edu3d) */}
        <script defer src="https://mydashboard.ro/t.js" data-site="89c4bbcba1a83d01" />
      </head>
      <body className="flex min-h-screen flex-col">
        <Providers>
          {/* Sarim direct la continut -- util cu tastatura si cu cititoarele de ecran. */}
          <Link
            href="#continut"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:font-semibold"
          >
            Sari la continut
          </Link>
          <Navbar />
          <main id="continut" className="paper-grid flex-1">
            {children}
          </main>
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
