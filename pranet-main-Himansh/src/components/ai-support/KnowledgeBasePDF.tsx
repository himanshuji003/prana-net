import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface PDFContext {
  name: string;
  text: string;
  pages: number;
}

interface KnowledgeBasePDFProps {
  pdfContexts: PDFContext[];
  onAdd: (pdf: PDFContext) => void;
  onRemove: (name: string) => void;
}

export const KnowledgeBasePDF = ({ pdfContexts, onAdd, onRemove }: KnowledgeBasePDFProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingNames, setProcessingNames] = useState<string[]>([]);

  const processPDF = async (file: File) => {
    if (file.type !== "application/pdf") return;
    setProcessingNames((prev) => [...prev, file.name]);
    try {
      const pdfjsLib = (window as any)["pdfjs-dist/build/pdf"];
      if (!pdfjsLib) {
        console.error("pdf.js not loaded");
        return;
      }
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      let txt = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const pg = await pdf.getPage(i);
        const c = await pg.getTextContent();
        txt += (c.items as any[]).map((s: any) => s.str).join(" ") + "\n";
      }
      txt = txt.replace(/\s+/g, " ").trim();
      const trunc = txt.length > 14000 ? txt.slice(0, 14000) + "\n[...truncated for context limit]" : txt;
      onAdd({ name: file.name, text: trunc, pages: pdf.numPages });
    } catch (e) {
      console.error("PDF parse error:", e);
    } finally {
      setProcessingNames((prev) => prev.filter((n) => n !== file.name));
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => processPDF(f));
  };

  return (
    <div>
      <div className="font-data text-[9px] uppercase tracking-[0.18em] text-muted mb-2.5">
        📄 Knowledge Base (PDFs)
      </div>
      <div
        className={cn(
          "border-[1.5px] border-dashed rounded-lg p-3 text-center cursor-pointer transition-all duration-200 bg-forest-elevated",
          isDragging
            ? "border-accent-gold bg-accent-gold/5"
            : "border-border-forest-light hover:border-accent-gold/50 hover:bg-accent-gold/3"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <div className="text-xl mb-1">📂</div>
        <p className="font-sans text-[10.5px] text-muted">Click or drag PDFs here</p>
        <p className="font-data text-[9px] text-muted/60 mt-0.5">Bye-laws · SOPs · Past orders · Policy</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
      />

      {(processingNames.length > 0 || pdfContexts.length > 0) && (
        <div className="flex flex-col gap-1.5 mt-2">
          {processingNames.map((name) => (
            <div key={name} className="bg-forest-card border border-border-forest-light rounded px-2.5 py-1.5 flex items-center gap-2">
              <span className="font-data text-[10.5px] text-muted flex-1 truncate">⏳ {name}</span>
            </div>
          ))}
          {pdfContexts.map((pdf) => (
            <div key={pdf.name} className="bg-forest-card border border-border-forest-light rounded px-2.5 py-1.5 flex items-center gap-2">
              <span className="font-data text-[10.5px] text-cream flex-1 truncate">📄 {pdf.name}</span>
              <span className="font-data text-[8.5px] px-1.5 py-0.5 rounded bg-health-green/10 text-health-green border border-health-green/20">
                {pdf.pages}p
              </span>
              <button
                onClick={() => onRemove(pdf.name)}
                className="font-data text-[12px] text-muted hover:text-health-red transition-colors leading-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
