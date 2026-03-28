import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Download, BrainCircuit, Sparkles, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ProblemCard, CIVIC_PROBLEMS, type CivicProblem } from "./ProblemCard";
import { KnowledgeBasePDF, type PDFContext } from "./KnowledgeBasePDF";
import { ResourcePanel } from "./ResourcePanel";
import { AIChatMessages, type ChatMessage } from "./AIChatMessages";
import { AIChatInput } from "./AIChatInput";

/* ── System Prompt ── */
const buildSystemPrompt = (resources: string, pdfContext: string) => `
You are PRANA-AI — MCD Decision Support AI deployed via PRANA-NET city intelligence platform.
You respond exactly like a senior MCD Joint Commissioner with 20+ years experience.

CURRENT WARD RESOURCES:
  - ${resources}

RULES (NEVER violate):
1. Jurisdiction: Always clarify MCD vs DJB / PWD / NDMC / Delhi Police / DPCC / DFS / DDA / BSES / DDMA.
2. Resources: Never recommend actions beyond the listed resources.
3. Legal process: Cite exact law sections for every enforcement action.
4. Prohibited: Manual sewer entry, stray dog culling, demolition without due process.
5. Document everything.

RESPONSE FORMAT (use exactly):
**⚡ IMMEDIATE ACTION (0–24 hours):** Numbered, [MANDATORY]/[RECOMMENDED] tagged.
**📋 SHORT-TERM PLAN (2–7 days):** Follow-up steps and notices.
**🏛️ LEGAL & POLICY BASIS:** Exact sections — e.g. "Section 343 DMC Act, 1957".
**⚠️ LIMITATIONS & RESOURCE GAPS:** Honest constraints.
**🔗 INTER-AGENCY COORDINATION:** Roles and formal communications required.
**📁 DOCUMENTATION CHECKLIST:** Every document to maintain.
**⚖️ DECISION SUMMARY:** 2–3 sentence bottom line.

POLICY KNOWLEDGE BASE (uploaded PDFs):
${pdfContext}
`.trim();

/* ── Main Panel ── */
export const AICopilotPanel = () => {
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [pdfContexts, setPdfContexts]   = useState<PDFContext[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CivicProblem | null>(null);
  const [pendingPrompt, setPendingPrompt]     = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading]       = useState(false);
  const [progress, setProgress]         = useState(0);
  const [ollamaUrl, setOllamaUrl]       = useState("http://localhost:11434");
  const [model, setModel]               = useState("llama3.2");
  const [sidebarOpen, setSidebarOpen]   = useState(true);

  const historyRef  = useRef<{ role: string; content: string }[]>([]);
  const staffRef    = useRef<HTMLDivElement>(null);
  const vehicleRef  = useRef<HTMLDivElement>(null);
  const budgetRef   = useRef<HTMLDivElement>(null);
  const casesRef    = useRef<HTMLDivElement>(null);

  const getResources = () => [
    `Field Staff on Duty: ${staffRef.current?.innerText?.trim() ?? "42"}`,
    `Available Vehicles: ${vehicleRef.current?.innerText?.trim() ?? "8"}`,
    `Remaining Budget: ${budgetRef.current?.innerText?.trim() ?? "₹1.2L"}`,
    `Pending Cases: ${casesRef.current?.innerText?.trim() ?? "87"}`,
    `PDF Docs Loaded: ${pdfContexts.length ? pdfContexts.map(p => p.name).join(", ") : "None"}`,
  ].join("\n  - ");

  const getPDFContext = () => !pdfContexts.length
    ? "No policy documents uploaded. Use general MCD Act knowledge and note verification is needed."
    : pdfContexts.map(p => `\n\n=== DOCUMENT: "${p.name}" (${p.pages} pages) ===\n${p.text}`).join("");

  const selectProblem = (p: CivicProblem) => { setSelectedProblem(p); setPendingPrompt(p.prompt); };
  const clearProblem  = () => { setSelectedProblem(null); setPendingPrompt(""); };

  /* ── Robust Ollama send: /api/generate primary, auto-:latest, /api/chat fallback ── */
  const handleSend = async (text: string) => {
    if (isLoading) return;
    clearProblem();
    setIsLoading(true);
    setProgress(20);

    setMessages(prev => [...prev, { role: "user", content: text }]);
    historyRef.current = [...historyRef.current, { role: "user", content: text }];

    const sys = buildSystemPrompt(getResources(), getPDFContext());
    const fullPrompt = `${sys}\n\n[OFFICER QUERY]: ${text}\n\n[PRANA-AI RESPONSE]:`;

    // Try model names: exact, then with :latest suffix
    const modelNames = model.includes(":") ? [model] : [model, `${model}:latest`];

    const tryGenerate = async (modelName: string) =>
      fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          prompt: fullPrompt,
          stream: true,
          options: { temperature: 0.35, top_p: 0.88, repeat_penalty: 1.1, num_ctx: 4096 },
        }),
      });

    const tryChat = async (modelName: string) =>
      fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: "system", content: sys }, ...historyRef.current],
          stream: true,
          options: { temperature: 0.35, top_p: 0.88, repeat_penalty: 1.1 },
        }),
      });

    try {
      setProgress(40);

      let res: Response | null = null;
      let usedGenerate = true;
      let lastStatus = 0;

      // Try each model name variant
      for (const name of modelNames) {
        // Try /api/generate first (most widely supported)
        const r1 = await tryGenerate(name);
        if (r1.ok) { res = r1; break; }
        lastStatus = r1.status;

        // If not a model-not-found error, stop trying
        if (r1.status !== 404) { res = r1; break; }

        // Try /api/chat as secondary
        const r2 = await tryChat(name);
        if (r2.ok) { res = r2; usedGenerate = false; break; }
        lastStatus = r2.status;
      }

      if (!res || !res.ok) {
        const status = lastStatus;
        if (status === 404) {
          const pullName = modelNames[0];
          throw new Error(
            `MODEL_NOT_FOUND:${pullName}`
          );
        }
        throw new Error(`Ollama HTTP ${status}`);
      }

      setProgress(65);
      let full = "";
      setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split("\n").filter(Boolean)) {
          try {
            const d = JSON.parse(line);
            const token = usedGenerate ? (d.response ?? "") : (d.message?.content ?? "");
            if (token) {
              full += token;
              setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: full, streaming: true };
                return next;
              });
            }
          } catch {}
        }
      }

      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: full };
        return next;
      });
      historyRef.current = [...historyRef.current, { role: "assistant", content: full }];
      setProgress(100);
      setTimeout(() => setProgress(0), 800);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const isNet = /fetch|networkerror|connection refused|failed to fetch/i.test(msg);
      const isModelNotFound = msg.startsWith("MODEL_NOT_FOUND:");
      const pullName = isModelNotFound ? msg.split(":")[1] : model;

      let errorContent: string;
      if (isNet) {
        errorContent = `## ⚠️ Cannot reach Ollama\n\nOllama is not running at \`${ollamaUrl}\`\n\n**To fix, run these 3 commands in your terminal:**\n\`\`\`\nset OLLAMA_ORIGINS=*\nollama serve\n\`\`\`\nThen refresh and click **Connect**.`;
      } else if (isModelNotFound) {
        errorContent = `## ⚠️ Model Not Found: \`${pullName}\`\n\nThe model is not installed in Ollama. **Run this to fix:**\n\`\`\`\nollama pull ${pullName}\n\`\`\`\nOr click **Connect** to see which models are installed and select one.`;
      } else {
        errorContent = `## ⚠️ Ollama Error\n\n\`${msg}\`\n\n**Try:** Click **Connect** to auto-detect available models, or check that Ollama is running with:\n\`\`\`\nollama list\n\`\`\``;
      }

      setMessages(prev => [...prev, { role: "assistant", content: errorContent }]);
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };


  const clearChat = () => {
    setMessages([]); historyRef.current = []; clearProblem(); setProgress(0);
  };

  const exportChat = () => {
    if (!historyRef.current.length) return;
    const body = historyRef.current.map(m => `[${m.role.toUpperCase()}]\n${m.content}`).join("\n\n──────────\n\n");
    const blob = new Blob([`PRANA-NET AI Copilot\nExported: ${new Date().toLocaleString("en-IN")}\n${"═".repeat(50)}\n\n${body}`], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `PRANA_${new Date().toISOString().slice(0,10)}.txt` });
    a.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex overflow-hidden bg-forest-primary">


      {/* ══ SIDEBAR ══ */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 230, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="shrink-0 bg-forest-secondary border-r border-border-forest-light flex flex-col overflow-hidden"
          >
            {/* Sidebar header */}
            <div className="px-4 py-3.5 border-b border-border-forest-light bg-forest-card/50 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg,rgba(212,168,75,0.35),rgba(212,168,75,0.1))", border: "1px solid rgba(212,168,75,0.4)" }}
                >
                  <BrainCircuit className="h-[18px] w-[18px] text-accent-gold" />
                </div>
                <div>
                  <div className="font-display text-[15px] leading-tight" style={{ color: "#D4A84B" }}>AI Copilot</div>
                  <div className="font-data text-[8px] uppercase tracking-[0.2em] text-muted">MCD Decision Support · PRANA-NET</div>
                </div>
                <div className="ml-auto flex items-center gap-1.5 bg-health-green/10 border border-health-green/25 px-2.5 py-1 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-health-green animate-pulse" />
                  <span className="font-data text-[8px] text-health-green uppercase tracking-wider">Live</span>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto divide-y divide-border-forest-light">
              {/* Problem cards */}
              <div className="p-3">
                <div className="font-data text-[8px] uppercase tracking-[0.2em] text-muted/70 mb-2.5 flex items-center gap-2">
                  <span className="h-px w-4 bg-border-forest-light" />🗂 Delhi Civic Problems
                </div>
                <div className="flex flex-col gap-1.5">
                  {CIVIC_PROBLEMS.map(p => (
                    <ProblemCard key={p.id} problem={p} isActive={selectedProblem?.id === p.id} onSelect={selectProblem} />
                  ))}
                </div>
              </div>

              {/* PDF upload */}
              <div className="p-3">
                <KnowledgeBasePDF
                  pdfContexts={pdfContexts}
                  onAdd={pdf => setPdfContexts(prev => [...prev.filter(p => p.name !== pdf.name), pdf])}
                  onRemove={name => setPdfContexts(prev => prev.filter(p => p.name !== name))}
                />
              </div>

              {/* Resources */}
              <div className="p-3">
                <ResourcePanel staffRef={staffRef} vehicleRef={vehicleRef} budgetRef={budgetRef} casesRef={casesRef} />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ══ MAIN CHAT AREA ══ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Toolbar */}
        <div className="bg-forest-secondary border-b border-border-forest-light px-4 py-3 flex items-center gap-3 shrink-0">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="w-8 h-8 rounded-xl border border-border-forest-light bg-forest-elevated flex items-center justify-center text-muted hover:border-accent-gold/40 hover:text-accent-gold transition-all shrink-0"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
          </button>

          {/* Title + active problem pill */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Sparkles className="h-3.5 w-3.5 text-accent-gold shrink-0" />
            <span className="font-display text-[15px] text-cream shrink-0">Decision Support Console</span>

            <AnimatePresence>
              {selectedProblem && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.88, x: -8 }}
                  className="flex items-center gap-1.5 bg-forest-elevated border border-accent-gold/30 rounded-full pl-2 pr-1.5 py-1 ml-1 min-w-0"
                >
                  <span className="text-sm">{selectedProblem.icon}</span>
                  <span className="font-sans text-[11px] text-cream truncate max-w-[120px]">{selectedProblem.title}</span>
                  <button
                    onClick={clearProblem}
                    className="w-4 h-4 flex items-center justify-center text-muted/60 hover:text-health-red transition-colors rounded-full hover:bg-white/5"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5 shrink-0">
            <button onClick={clearChat} className="flex items-center gap-1.5 bg-forest-elevated border border-border-forest-light rounded-xl px-3 py-1.5 text-muted hover:border-health-red/40 hover:text-health-red transition-all font-sans text-[11px]">
              <Trash2 className="h-3 w-3" /> Clear
            </button>
            <button onClick={exportChat} className="flex items-center gap-1.5 bg-forest-elevated border border-border-forest-light rounded-xl px-3 py-1.5 text-muted hover:border-accent-gold/40 hover:text-accent-gold transition-all font-sans text-[11px]">
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-[2px] bg-forest-primary shrink-0 overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%`, opacity: progress > 0 ? 1 : 0 }}
            transition={{ ease: "easeOut", duration: 0.4 }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#D4A84B,#3DBFAD,#4CAF72)" }}
          />
        </div>

        {/* Chat messages */}
        <AIChatMessages messages={messages} isTyping={isLoading && messages[messages.length - 1]?.role === "user"} />

        {/* Input */}
        <AIChatInput
          ollamaUrl={ollamaUrl}
          model={model}
          pdfCount={pdfContexts.length}
          isLoading={isLoading}
          onOllamaUrlChange={setOllamaUrl}
          onModelChange={setModel}
          onModelsDetected={models => { if (models.length && !models.includes(model)) setModel(models[0]); }}
          onSend={handleSend}
          defaultPrompt={pendingPrompt}
        />
      </div>
    </motion.div>
  );
};
