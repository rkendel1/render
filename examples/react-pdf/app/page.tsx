"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { examples } from "@/lib/examples";
import type { Spec } from "@json-render/core";

type Mode = "scratch" | "example";

interface Selection {
  mode: Mode;
  exampleName?: string;
}

const MIN_SIDEBAR = 260;
const MAX_SIDEBAR = 600;
const DEFAULT_SIDEBAR = 340;

export default function Page() {
  const [selection, setSelection] = useState<Selection>({
    mode: "example",
    exampleName: examples[0]!.name,
  });
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedSpec, setGeneratedSpec] = useState<Spec | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showSpec, setShowSpec] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfUrlRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR);
  const [isResizing, setIsResizing] = useState(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = e.clientX - dragStartX.current;
      const next = Math.min(
        MAX_SIDEBAR,
        Math.max(MIN_SIDEBAR, dragStartWidth.current + delta),
      );
      setSidebarWidth(next);
    };
    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      setIsResizing(true);
      dragStartX.current = e.clientX;
      dragStartWidth.current = sidebarWidth;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [sidebarWidth],
  );

  const currentExample =
    selection.mode === "example"
      ? examples.find((e) => e.name === selection.exampleName)
      : null;

  const activeSpec = generatedSpec ?? currentExample?.spec ?? null;

  const examplePdfUrl =
    selection.mode === "example" && !generatedSpec
      ? `/api/pdf?name=${selection.exampleName}`
      : null;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selection.mode, selection.exampleName]);

  const fetchPdfBlob = useCallback(async (spec: Spec) => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }

    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spec }),
    });

    if (!res.ok) {
      throw new Error("Failed to generate PDF");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    pdfUrlRef.current = url;
    setPdfUrl(url);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const startingSpec =
        selection.mode === "example" && currentExample
          ? currentExample.spec
          : null;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), startingSpec }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Generation failed");
      }

      const { spec } = await res.json();
      setGeneratedSpec(spec);
      await fetchPdfBlob(spec);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }, [prompt, selection, currentExample, fetchPdfBlob]);

  const handleSelectExample = (name: string) => {
    setSelection({ mode: "example", exampleName: name });
    setGeneratedSpec(null);
    setPdfUrl(null);
    setError(null);
    setPrompt("");
  };

  const handleSelectScratch = () => {
    setSelection({ mode: "scratch" });
    setGeneratedSpec(null);
    setPdfUrl(null);
    setError(null);
    setPrompt("");
  };

  const handleDownload = async () => {
    if (!activeSpec) return;

    if (generatedSpec) {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec: generatedSpec, download: true }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } else if (selection.mode === "example") {
      window.open(
        `/api/pdf?name=${selection.exampleName}&download=1`,
        "_blank",
      );
    }
  };

  const displayPdfUrl = pdfUrl ?? examplePdfUrl;

  return (
    <div style={styles.container}>
      <aside
        style={{
          ...styles.sidebar,
          width: sidebarWidth,
          minWidth: sidebarWidth,
        }}
      >
        <h1 style={styles.logo}>json-render</h1>
        <p style={styles.subtitle}>React PDF</p>

        <nav style={styles.nav}>
          {/* From scratch */}
          <button
            onClick={handleSelectScratch}
            style={{
              ...styles.navItem,
              ...(selection.mode === "scratch" ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navLabel}>From scratch</span>
            <span style={styles.navDesc}>
              Describe the PDF you want to create
            </span>
          </button>

          <div style={styles.divider} />

          {/* Examples */}
          {examples.map((ex) => (
            <button
              key={ex.name}
              onClick={() => handleSelectExample(ex.name)}
              style={{
                ...styles.navItem,
                ...(selection.mode === "example" &&
                selection.exampleName === ex.name
                  ? styles.navItemActive
                  : {}),
              }}
            >
              <span style={styles.navLabel}>{ex.label}</span>
              <span style={styles.navDesc}>{ex.description}</span>
            </button>
          ))}
        </nav>

        {/* Prompt area */}
        <div style={styles.promptArea}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder={
              selection.mode === "scratch"
                ? "Describe the PDF you want to generate..."
                : `Modify the ${currentExample?.label ?? "example"}...`
            }
            style={styles.textarea}
            rows={3}
          />
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            style={{
              ...styles.generateBtn,
              opacity: generating || !prompt.trim() ? 0.5 : 1,
            }}
          >
            {generating ? "Generating..." : "Generate PDF"}
          </button>
          <span style={styles.hint}>Cmd+Enter to generate</span>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Actions */}
        <div style={styles.actions}>
          {activeSpec && (
            <button onClick={handleDownload} style={styles.downloadBtn}>
              Download PDF
            </button>
          )}
          {activeSpec && (
            <button
              onClick={() => setShowSpec((v) => !v)}
              style={styles.specToggle}
            >
              {showSpec ? "Hide" : "Show"} JSON Spec
            </button>
          )}
        </div>
      </aside>

      {/* Resize handle */}
      <div onMouseDown={handleResizeStart} style={styles.resizeHandle} />

      {/* Main content */}
      <main style={styles.main}>
        {generating && (
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Generating PDF...</p>
          </div>
        )}

        {!generating && showSpec && activeSpec ? (
          <div style={styles.specViewer}>
            <div style={styles.specHeader}>
              <h2 style={styles.specTitle}>JSON Spec</h2>
              <button
                onClick={() => setShowSpec(false)}
                style={styles.specClose}
              >
                Close
              </button>
            </div>
            <pre style={styles.specCode}>
              {JSON.stringify(activeSpec, null, 2)}
            </pre>
          </div>
        ) : !generating && displayPdfUrl ? (
          <iframe
            key={displayPdfUrl}
            src={displayPdfUrl}
            style={styles.iframe}
            title="PDF preview"
          />
        ) : !generating ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>
              {selection.mode === "scratch"
                ? "Describe the PDF you want and hit Generate"
                : "Select an example or type a prompt to modify it"}
            </p>
          </div>
        ) : null}
      </main>

      {isResizing && <div style={styles.resizeOverlay} />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
  },
  sidebar: {
    background: "var(--surface)",
    display: "flex",
    flexDirection: "column",
    padding: 20,
    gap: 4,
    overflow: "auto",
  },
  resizeHandle: {
    width: 5,
    cursor: "col-resize",
    background: "var(--border)",
    flexShrink: 0,
    transition: "background 0.15s",
  },
  resizeOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    cursor: "col-resize",
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: 13,
    color: "var(--text-muted)",
    margin: 0,
    marginBottom: 12,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  divider: {
    height: 1,
    background: "var(--border)",
    margin: "6px 0",
  },
  navItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    padding: "8px 10px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    background: "transparent",
    textAlign: "left",
    fontSize: 13,
    transition: "all 0.15s",
    width: "100%",
    cursor: "pointer",
  },
  navItemActive: {
    background: "var(--primary)",
    color: "#fff",
    borderColor: "var(--primary)",
  },
  navLabel: {
    fontWeight: 600,
    fontSize: 13,
  },
  navDesc: {
    fontSize: 11,
    opacity: 0.8,
    lineHeight: "1.3",
  },
  promptArea: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 12,
    flex: 1,
    minHeight: 0,
  },
  textarea: {
    resize: "vertical",
    padding: "10px 12px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontFamily: "var(--font)",
    fontSize: 13,
    lineHeight: "1.5",
    outline: "none",
    minHeight: 72,
  },
  generateBtn: {
    padding: "10px 16px",
    background: "var(--primary)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  hint: {
    fontSize: 11,
    color: "var(--text-muted)",
    textAlign: "center",
  },
  error: {
    padding: "8px 12px",
    background: "#fef2f2",
    color: "#b91c1c",
    borderRadius: "var(--radius)",
    fontSize: 12,
    marginTop: 8,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 12,
  },
  downloadBtn: {
    display: "block",
    textAlign: "center",
    padding: "9px 16px",
    background: "transparent",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  specToggle: {
    padding: "9px 16px",
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 13,
    cursor: "pointer",
  },
  main: {
    flex: 1,
    background: "#525659",
    display: "flex",
    position: "relative",
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
  },
  empty: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#a0a4a8",
    fontSize: 15,
    maxWidth: 280,
    textAlign: "center",
    lineHeight: "1.5",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(82, 86, 89, 0.85)",
    zIndex: 10,
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid rgba(255,255,255,0.2)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 12,
  },
  specViewer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
    overflow: "hidden",
  },
  specHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    borderBottom: "1px solid var(--border)",
  },
  specTitle: {
    fontSize: 15,
    fontWeight: 600,
    margin: 0,
  },
  specClose: {
    padding: "5px 10px",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 12,
    color: "var(--text-muted)",
    cursor: "pointer",
  },
  specCode: {
    flex: 1,
    overflow: "auto",
    padding: 20,
    margin: 0,
    fontSize: 12,
    lineHeight: "1.5",
    fontFamily: "var(--font-mono)",
    background: "#fafafa",
  },
};
