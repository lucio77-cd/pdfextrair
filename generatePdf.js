const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const PAGE_WIDTH = 595.28; // A4 em pontos
const PAGE_HEIGHT = 841.89;
const MARGIN = 56; // ~2cm
const FONT_SIZE = 11;
const LINE_HEIGHT = FONT_SIZE * 1.4;
const PARAGRAPH_GAP = LINE_HEIGHT * 0.6;

function wrapLine(text, font, size, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const tentative = current ? current + " " + word : word;
    const width = font.widthOfTextAtSize(tentative, size);
    if (width <= maxWidth) {
      current = tentative;
    } else {
      if (current) lines.push(current);
      // Se a própria palavra for maior que a largura da página, corta ela
      if (font.widthOfTextAtSize(word, size) > maxWidth) {
        let chunk = "";
        for (const ch of word) {
          const t = chunk + ch;
          if (font.widthOfTextAtSize(t, size) > maxWidth) {
            lines.push(chunk);
            chunk = ch;
          } else {
            chunk = t;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function generatePdfFromText(text, title) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const maxWidth = PAGE_WIDTH - MARGIN * 2;

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const newPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  };

  const drawLine = (lineText, useFont, size, color = rgb(0, 0, 0)) => {
    if (y < MARGIN) newPage();
    page.drawText(lineText, {
      x: MARGIN,
      y,
      size,
      font: useFont,
      color,
    });
    y -= LINE_HEIGHT;
  };

  if (title) {
    const titleLines = wrapLine(title, boldFont, 16, maxWidth);
    for (const l of titleLines) {
      if (y < MARGIN) newPage();
      page.drawText(l, { x: MARGIN, y, size: 16, font: boldFont });
      y -= 16 * 1.3;
    }
    y -= PARAGRAPH_GAP;
  }

  const paragraphs = text.split(/\n{2,}/);

  for (const paragraph of paragraphs) {
    const clean = paragraph.replace(/\n/g, " ").trim();
    if (!clean) continue;

    const lines = wrapLine(clean, font, FONT_SIZE, maxWidth);
    for (const line of lines) {
      drawLine(line, font, FONT_SIZE);
    }
    y -= PARAGRAPH_GAP;
  }

  const bytes = await pdfDoc.save();
  return bytes;
}

module.exports = { generatePdfFromText };
