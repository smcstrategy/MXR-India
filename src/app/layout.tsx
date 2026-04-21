import type { Metadata } from "next";
import "./globals.css";
import ServiceWorkerInit from "@/components/ServiceWorkerInit";

export const metadata: Metadata = {
  title: "MXR India | Project Status",
  description: "Daily reporting and project status tool for MXR India branch",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerInit />
        {children}
      </body>
    </html>
  );
}
