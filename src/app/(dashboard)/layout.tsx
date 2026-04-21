import type { Metadata } from "next";
import "../globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "MXR India | Project Status",
  description: "Daily reporting and project status tool for MXR India branch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Header />
              <div className="content-area">
                {children}
              </div>
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
