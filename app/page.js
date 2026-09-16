"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error | done
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setStatus("idle");
    setErrorMsg("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao processar o PDF.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match ? match[1] : "documento-corrido.pdf";

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus("done");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Erro inesperado.");
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>PDF em texto corrido</h1>
        <p style={styles.subtitle}>
          Envie um PDF e receba de volta o mesmo conteúdo, com o texto
          extraído e reorganizado em parágrafos corridos. Nada é enviado a um
          banco de dados nem fica salvo — ao sair ou recarregar a página,
          tudo começa do zero novamente.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={styles.fileInput}
          />

          <button
            type="submit"
            disabled={!file || status === "loading"}
            style={{
              ...styles.button,
              ...(!file || status === "loading" ? styles.buttonDisabled : {}),
            }}
          >
            {status === "loading" ? "Processando..." : "Gerar PDF corrido"}
          </button>
        </form>

        {status === "error" && (
          <p style={styles.error}>{errorMsg}</p>
        )}
        {status === "done" && (
          <p style={styles.success}>
            Pronto! O download começou. Envie outro arquivo quando quiser.
          </p>
        )}
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f5f7",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: 24,
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: "32px 28px",
    maxWidth: 480,
    width: "100%",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 8,
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 1.5,
    color: "#555",
    marginBottom: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  fileInput: {
    fontSize: 14,
  },
  button: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    fontSize: 15,
    cursor: "pointer",
  },
  buttonDisabled: {
    background: "#9ca3af",
    cursor: "not-allowed",
  },
  error: {
    marginTop: 16,
    color: "#b91c1c",
    fontSize: 14,
  },
  success: {
    marginTop: 16,
    color: "#166534",
    fontSize: 14,
  },
};
