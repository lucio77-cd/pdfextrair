import { NextResponse } from "next/server";

// Força execução em runtime Node.js (pdf-parse e pdf-lib precisam disso,
// não funcionam no runtime "edge").
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Nenhum arquivo PDF enviado." },
        { status: 400 }
      );
    }

    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "O arquivo enviado precisa ser um PDF." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Importa dinamicamente para evitar problemas de bundling do Next.js
    const pdfParse = (await import("pdf-parse")).default;
    const { reformatText } = await import("../../../lib/reformatText.js");
    const { generatePdfFromText } = await import(
      "../../../lib/generatePdf.js"
    );

    const parsed = await pdfParse(inputBuffer);
    const rawText = parsed.text || "";

    if (!rawText.trim()) {
      return NextResponse.json(
        {
          error:
            "Não foi possível extrair texto deste PDF. Ele pode ser um PDF escaneado (imagem) sem texto selecionável.",
        },
        { status: 422 }
      );
    }

    const flowingText = reformatText(rawText);

    const originalName = (file.name || "documento").replace(/\.pdf$/i, "");
    const outputBytes = await generatePdfFromText(
      flowingText,
      originalName
    );

    // Nada é salvo em disco/servidor: o buffer é gerado em memória e
    // devolvido diretamente na resposta.
    return new NextResponse(Buffer.from(outputBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${originalName}-corrido.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao processar o PDF. Tente novamente." },
      { status: 500 }
    );
  }
}
