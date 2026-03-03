import "./globals.css";
import { AllProviders } from "@/providers/AllProviders";
import { fontVariables } from "@/context/theme/font";
import {Toaster} from "@/components/ui/toaster";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        <AllProviders>
            {children}
            <Toaster />
        </AllProviders>
      </body>
    </html>
  );
}
