import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createTheme, MantineProvider, ColorSchemeScript } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oficina de Bordado Livre",
  description: "Ganta sua vaga na nossa oficina exclusiva.",
};

// Definição da nossa paleta de cores Rose e Champagne para o Mantine
const theme = createTheme({
  fontFamily: inter.style.fontFamily,
  primaryColor: "rose",
  colors: {
    // 10 tonalidades obrigatórias do Mantine para a cor personalizada
    rose: [
      "#FFF1F2",
      "#FFE4E6",
      "#FECDD3",
      "#FDA4AF",
      "#FB7185",
      "#F43F5E",
      "#E11D48",
      "#BE123C",
      "#9F1239",
      "#881337", // Tons elegantes de rosé/vinho
    ],
    champagne: [
      "#FDFBF7",
      "#F8F4EA",
      "#F1E9D2",
      "#EADDB3",
      "#DECFA0",
      "#D0BD84",
      "#C0A867",
      "#A89050",
      "#8A733E",
      "#6E5A30", // Tons dourados/champanhe pastel
    ],
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Usamos a propriedade strategy ou deixamos o Mantine gerenciar sem o aviso do Turbopack */}
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={inter.className}>
        <MantineProvider
          theme={theme}
          defaultColorScheme="light"
        >
          <Notifications position="top-right" zIndex={1000} />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
