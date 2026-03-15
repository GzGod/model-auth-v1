import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Model Auth V1",
  description: "Model fidelity auditing for API endpoints"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
