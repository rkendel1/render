"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { examples } from "@/lib/examples";
import { createSpecStreamCompiler } from "@json-render/core";
import type { Spec } from "@json-render/core";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FileText, Download, Menu, Loader2, PenLine } from "lucide-react";

type Mode = "scratch" | "example";
type MainTab = "preview" | "json";

interface Selection {
  mode: Mode;
  exampleName?: string;
}

function Logo({ size = "default" }: { size?: "default" | "sm" }) {
  const iconSize = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const titleSize = size === "sm" ? "text-sm" : "text-base";
  const subtitleSize = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={cn(
          iconSize,
          "rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0",
        )}
      >
        <FileText className="h-4 w-4" />
      </div>
      <div>
        <h1 className={cn(titleSize, "font-bold tracking-tight leading-tight")}>
          json-render
        </h1>
        <p className={cn(subtitleSize, "text-muted-foreground leading-tight")}>
          React PDF
        </p>
      </div>
    </div>
  );
}

function NavItem({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-0.5 w-full rounded-lg border px-3 py-2.5 text-left text-[13px] transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "border-border hover:bg-accent hover:border-accent-foreground/20",
      )}
    >
      <span className="font-semibold text-[13px] leading-snug">{label}</span>
      <span
        className={cn(
          "text-[11px] leading-snug",
          active ? "text-primary-foreground/80" : "text-muted-foreground",
        )}
      >
        {description}
      </span>
    </button>
  );
}

export default function Page() {
  const [selection, setSelection] = useState<Selection>({
    mode: "example",
    exampleName: examples[0]!.name,
  });
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedSpec, setGeneratedSpec] = useState<Spec | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>("preview");
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const pdfUrlRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentExample =
    selection.mode === "example"
      ? examples.find((e) => e.name === selection.exampleName)
      : null;

  const activeSpec = generatedSpec ?? currentExample?.spec ?? null;

  const examplePdfUrl =
    selection.mode === "example" && !generatedSpec
      ? `/api/pdf?name=${selection.exampleName}`
      : null;

  const displayPdfUrl = pdfUrl ?? examplePdfUrl;

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
    setMainTab("preview");

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
        throw new Error("Generation failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      const compiler = createSpecStreamCompiler<Spec>(
        startingSpec ? { ...startingSpec } : {},
      );

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const { result, newPatches } = compiler.push(chunk);

        if (newPatches.length > 0) {
          setGeneratedSpec(result);
        }
      }

      const finalSpec = compiler.getResult();
      setGeneratedSpec(finalSpec);
      setGenerating(false);
      await fetchPdfBlob(finalSpec);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setGenerating(false);
    }
  }, [prompt, selection, currentExample, fetchPdfBlob]);

  const select = (next: Selection) => {
    setSelection(next);
    setGeneratedSpec(null);
    setPdfUrl(null);
    setError(null);
    setPrompt("");
    setMainTab("preview");
    setSheetOpen(false);
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

  const sidebarBody = (
    <>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-3">
          <p className="px-1 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Start
          </p>
          <NavItem
            label="From scratch"
            description="Describe the PDF you want to create"
            active={selection.mode === "scratch"}
            onClick={() => select({ mode: "scratch" })}
          />

          <p className="px-1 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Examples
          </p>
          {examples.map((ex) => (
            <NavItem
              key={ex.name}
              label={ex.label}
              description={ex.description}
              active={
                selection.mode === "example" &&
                selection.exampleName === ex.name
              }
              onClick={() => select({ mode: "example", exampleName: ex.name })}
            />
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="flex flex-col gap-2 p-3">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Prompt
        </p>
        <Textarea
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
          rows={3}
          className="min-h-[72px] resize-y text-[13px]"
        />
        <Button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <PenLine className="h-4 w-4" />
              Generate PDF
            </>
          )}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          Cmd+Enter to generate
        </p>
      </div>

      {error && (
        <div className="mx-3 mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-dvh">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-80 min-w-80 flex-col border-r bg-card">
        <div className="shrink-0 border-b px-4 py-4">
          <Logo />
        </div>
        {sidebarBody}
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b bg-card px-3 py-2">
          {/* Mobile menu */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 flex flex-col">
              <SheetHeader className="shrink-0 border-b px-4 py-4">
                <SheetTitle>
                  <Logo size="sm" />
                </SheetTitle>
              </SheetHeader>
              {sidebarBody}
            </SheetContent>
          </Sheet>

          <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)}>
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              {activeSpec && <TabsTrigger value="json">JSON</TabsTrigger>}
            </TabsList>
          </Tabs>

          <div className="flex-1" />

          {activeSpec && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="relative flex flex-1 min-h-0 bg-neutral-600">
          {mainTab === "preview" && (
            <>
              {generating && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-neutral-600/90 backdrop-blur-sm">
                  <div className="h-9 w-9 rounded-full border-[3px] border-white/15 border-t-white animate-[spin_0.8s_linear_infinite]" />
                  <p className="text-sm font-medium text-white/80">
                    Generating your PDF...
                  </p>
                </div>
              )}

              {!generating && displayPdfUrl ? (
                <iframe
                  key={displayPdfUrl}
                  src={displayPdfUrl}
                  className="h-full w-full border-none"
                  title="PDF preview"
                />
              ) : !generating ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/6">
                    <FileText className="h-10 w-10 text-neutral-400" />
                  </div>
                  <p className="text-base font-semibold text-neutral-300">
                    {selection.mode === "scratch"
                      ? "Start from scratch"
                      : "PDF Preview"}
                  </p>
                  <p className="max-w-[280px] text-center text-sm text-neutral-400">
                    {selection.mode === "scratch"
                      ? "Describe the PDF you want and hit Generate"
                      : "Select an example or type a prompt to modify it"}
                  </p>
                </div>
              ) : null}
            </>
          )}

          {mainTab === "json" && activeSpec && (
            <ScrollArea className="flex-1">
              <pre className="p-5 text-xs leading-relaxed font-mono text-foreground/70 bg-muted">
                {JSON.stringify(activeSpec, null, 2)}
              </pre>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
