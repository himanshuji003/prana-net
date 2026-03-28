import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Send, Loader2, Wifi, WifiOff, RefreshCw, ChevronDown } from "lucide-react";

interface AIChatInputProps {
  ollamaUrl: string;
  model: string;
  pdfCount: number;
  isLoading: boolean;
  onOllamaUrlChange: (url: string) => void;
  onModelChange: (model: string) => void;
  onModelsDetected: (models: string[]) => void;
  onSend: (text: string) => void;
  defaultPrompt?: string;
}

type ConnState = "idle" | "checking" | "connected" | "failed";
const DEFAULT_MODELS = ["llama3.2", "llama3.1", "llama3", "llama2", "mistral", "gemma2", "phi3", "deepseek-r1"];

export const AIChatInput = ({
  ollamaUrl, model, pdfCount, isLoading,
  onOllamaUrlChange, onModelChange, onModelsDetected, onSend, defaultPrompt,
}: AIChatInputProps) => {
  const [text, setText] = useState(defaultPrompt ?? "");
  const [connState, setConnState] = useState<ConnState>("idle");
  const [availableModels, setAvailableModels] = useState<string[]>(DEFAULT_MODELS);
  const [connErr, setConnErr] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevPromptRef = useRef(defaultPrompt);

  useEffect(() => {
    if (defaultPrompt !== prevPromptRef.current) {
      prevPromptRef.current = defaultPrompt;
      setText(defaultPrompt ?? "");
      setTimeout(() => autoResize(), 10);
    }
  }, [defaultPrompt]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const doSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); }
  };

  const testConn = async () => {
    setConnState("checking");
    setConnErr("");
    try {
      const r = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(6000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const names: string[] = (data.models ?? []).map((m: any) => m.name as string);
      if (names.length) {
        setAvailableModels(names);
        onModelsDetected(names);
        if (!names.includes(model)) onModelChange(names[0]);
      }
      setConnState("connected");
    } catch (err: any) {
      setConnState("failed");
      setConnErr(err.name === "TimeoutError"
        ? "Timed out — is Ollama running?"
        : "Can't reach Ollama — run: ollama serve && set OLLAMA_ORIGINS=*");
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="shrink-0 bg-forest-secondary border-t border-border-forest-light">

      {/* ── Connection toolbar ── */}
      <div className="px-4 py-2.5 border-b border-border-forest-light bg-forest-primary/30 flex items-center gap-2.5 flex-wrap">

        {/* URL */}
        <div className="flex items-center gap-2 bg-forest-elevated border border-border-forest-light rounded-xl px-3 py-2 flex-1 min-w-[160px] focus-within:border-accent-gold/40 transition-colors">
          <span className="font-data text-[8.5px] uppercase tracking-wider text-muted shrink-0">URL</span>
          <input
            type="text"
            value={ollamaUrl}
            onChange={e => { onOllamaUrlChange(e.target.value); setConnState("idle"); }}
            className="bg-transparent text-cream placeholder:text-muted font-data text-[11px] outline-none flex-1 min-w-0"
            placeholder="http://localhost:11434"
          />
        </div>

        {/* Model */}
        <div className="flex items-center gap-2 bg-forest-elevated border border-border-forest-light rounded-xl px-3 py-2 focus-within:border-accent-gold/40 transition-colors relative">
          <span className="font-data text-[8.5px] uppercase tracking-wider text-muted shrink-0">Model</span>
          <select
            value={model}
            onChange={e => onModelChange(e.target.value)}
            className="bg-transparent text-cream font-data text-[11px] outline-none cursor-pointer appearance-none pr-5"
          >
            {availableModels.map(m => (
              <option key={m} value={m} className="bg-[#0F1C13] text-cream">{m}</option>
            ))}
          </select>
          <ChevronDown className="h-3 w-3 text-muted absolute right-2.5 pointer-events-none" />
        </div>

        {/* Connect button */}
        <button
          onClick={testConn}
          className={cn(
            "flex items-center gap-2 border rounded-xl px-3.5 py-2 cursor-pointer transition-all duration-200 font-data text-[10.5px] shrink-0",
            connState === "connected" ? "bg-health-green/10 border-health-green/35 text-health-green hover:bg-health-green/15" :
            connState === "failed"    ? "bg-health-red/10 border-health-red/35 text-health-red hover:bg-health-red/15" :
                                        "bg-forest-elevated border-border-forest-light text-muted hover:border-accent-gold/40 hover:text-accent-gold"
          )}
        >
          {connState === "checking" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> :
           connState === "connected" ? <Wifi className="h-3.5 w-3.5" /> :
           connState === "failed"    ? <WifiOff className="h-3.5 w-3.5" /> :
                                       <Wifi className="h-3.5 w-3.5" />}
          {connState === "checking" ? "Checking…" :
           connState === "connected" ? `Connected · ${availableModels.length} model${availableModels.length !== 1 ? "s" : ""}` :
           connState === "failed"    ? "Failed — Retry" : "Connect"}
        </button>
      </div>

      {/* Error hint */}
      {connState === "failed" && connErr && (
        <div className="px-4 py-2 bg-health-red/5 border-b border-health-red/20 font-data text-[10px] text-health-red flex items-center gap-2">
          <span>⚠</span>
          <span>{connErr}</span>
        </div>
      )}

      {/* ── Input area ── */}
      <div className="p-4">
        <div className={cn(
          "relative flex items-end gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200",
          "bg-forest-elevated",
          isLoading
            ? "border-border-forest-light"
            : hasText
              ? "border-accent-gold/50 shadow-[0_0_0_1px_rgba(212,168,75,0.12),0_0_20px_rgba(212,168,75,0.06)]"
              : "border-border-forest-light focus-within:border-accent-gold/40"
        )}>
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            rows={1}
            disabled={isLoading}
            onChange={e => { setText(e.target.value); autoResize(); }}
            onKeyDown={handleKey}
            placeholder="Describe the civic problem, complaint details, location, or any policy question…"
            className="flex-1 bg-transparent border-none outline-none resize-none text-cream font-sans text-[13.5px] leading-[1.6] placeholder:text-muted/50 disabled:opacity-60 min-h-[24px] max-h-[140px]"
          />

          {/* Send button — ALWAYS VISIBLE */}
          <button
            onClick={doSend}
            disabled={isLoading || !hasText}
            className={cn(
              "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
              isLoading
                ? "bg-forest-card border border-border-forest-light cursor-not-allowed"
                : hasText
                  ? "bg-accent-gold cursor-pointer hover:bg-amber-400 hover:scale-105 active:scale-95 shadow-[0_0_16px_rgba(212,168,75,0.45)]"
                  : "bg-forest-card border border-border-forest-light cursor-not-allowed opacity-40"
            )}
            title="Send (Enter)"
          >
            {isLoading
              ? <Loader2 className="h-4 w-4 text-muted animate-spin" />
              : <Send className={cn("h-4 w-4", hasText ? "text-forest-primary" : "text-muted")} />
            }
          </button>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-2.5 px-1">
          <span className={cn(
            "flex items-center gap-1.5 font-data text-[9px] px-2.5 py-1 rounded-full border transition-all",
            pdfCount > 0
              ? "bg-health-green/10 text-health-green border-health-green/25"
              : "text-muted/60 border-transparent"
          )}>
            {pdfCount > 0 ? <>📄 {pdfCount} doc{pdfCount !== 1 ? "s" : ""} in context</> : "No PDF context"}
          </span>
          <span className="font-data text-[9px] text-muted/40">
            <kbd className="bg-forest-card border border-border-forest-light rounded px-1">Enter</kbd> send &nbsp;·&nbsp;
            <kbd className="bg-forest-card border border-border-forest-light rounded px-1">Shift+Enter</kbd> newline
          </span>
        </div>
      </div>
    </div>
  );
};
