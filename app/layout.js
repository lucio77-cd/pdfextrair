export const metadata = {
  title: "PDF em Texto Corrido",
  description:
    "Envie um PDF, receba de volta o texto extraído e reorganizado em formato corrido. Nada é salvo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
