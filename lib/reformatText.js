/**
 * Recebe o texto cru extraído de um PDF (cheio de quebras de linha por causa
 * do layout da página) e devolve o texto reorganizado em parágrafos corridos,
 * como um texto normal de livro/artigo.
 *
 * Estratégia:
 * 1. Normaliza quebras de linha e espaços.
 * 2. Detecta hifenização de fim de linha ("informa-\nção" -> "informação")
 *    e junta as palavras.
 * 3. Junta linhas consecutivas em um único parágrafo, a menos que a linha
 *    anterior termine em pontuação final (. ! ? : ;) seguida de uma linha
 *    que pareça iniciar um novo parágrafo (linha em branco, item de lista,
 *    início de página, letra maiúscula após ponto final, etc.)
 * 4. Preserva linhas em branco como separadores reais de parágrafo.
 */

function reformatText(rawText) {
  if (!rawText) return "";

  // Normaliza quebras de linha (\r\n, \r -> \n)
  let text = rawText.replace(/\r\n?/g, "\n");

  // Remove espaços/tabs no fim de cada linha
  text = text
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .join("\n");

  const rawLines = text.split("\n");

  // Junta hifenização de fim de linha: "pala-\nvra" -> "palavra"
  const dehyphenated = [];
  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i];
    const match = line.match(/^(.*[a-zà-ú])-$/i);
    if (match && rawLines[i + 1] && /^[a-zà-ú]/i.test(rawLines[i + 1].trim())) {
      const nextLine = rawLines[i + 1];
      const nextTrimStart = nextLine.match(/^\S*/)[0];
      const restOfNext = nextLine.slice(nextTrimStart.length);
      dehyphenated.push(match[1] + nextTrimStart);
      rawLines[i + 1] = restOfNext.replace(/^\s+/, "");
      continue;
    }
    dehyphenated.push(line);
  }

  // Agrupa em parágrafos
  const paragraphs = [];
  let current = "";

  const looksLikeListItem = (l) => /^(\d+[.)]|[-•*])\s+/.test(l.trim());
  const looksLikeHeading = (l) =>
    l.trim().length > 0 &&
    l.trim().length <= 90 &&
    /[^.!?:;]$/.test(l.trim()) &&
    l.trim() === l.trim().toUpperCase() &&
    /[A-ZÀ-Ú]/.test(l.trim());
  // Parágrafos reais no PDF de origem normalmente vêm separados por linha
  // em branco; por isso, enquanto não houver linha em branco, título ou
  // item de lista, as linhas são simplesmente unidas ao parágrafo atual.
  for (let i = 0; i < dehyphenated.length; i++) {
    const line = dehyphenated[i].trim();

    if (line === "") {
      if (current) {
        paragraphs.push(current.trim());
        current = "";
      }
      continue;
    }

    if (looksLikeListItem(line) || looksLikeHeading(line)) {
      if (current) {
        paragraphs.push(current.trim());
        current = "";
      }
      paragraphs.push(line);
      continue;
    }

    current = current ? current + " " + line : line;
  }

  if (current) paragraphs.push(current.trim());

  // Colapsa espaços duplos
  const cleaned = paragraphs
    .map((p) => p.replace(/\s{2,}/g, " ").trim())
    .filter((p) => p.length > 0);

  return cleaned.join("\n\n");
}

module.exports = { reformatText };
