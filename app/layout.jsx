import './globals.css';

export const metadata = {
  title: 'Shopify Booking System | Admin & Staff Dashboard',
  description: 'Shopify integrated booking system with staff schedule calendar, customer review portal, and Shopify Draft Order tip checkout.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090D16] text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
