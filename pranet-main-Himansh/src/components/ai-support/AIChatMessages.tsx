import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User } from "lucide-react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

/* ── Formatter: wraps AI section headers into styled blocks ── */
function formatResponse(text: string): string {
  const sections = [
    { key: "⚡ IMMEDIATE ACTION",            color: "#E05252", bg: "rgba(224,82,82,0.07)",   label: "⚡ IMMEDIATE ACTION (0–24 hrs)" },
    { key: "📋 SHORT-TERM PLAN",             color: "#3DBFAD", bg: "rgba(61,191,173,0.07)",  label: "📋 SHORT-TERM PLAN (2–7 days)" },
    { key: "🏛️ LEGAL & POLICY BASIS",        color: "#D4A84B", bg: "rgba(212,168,75,0.07)",  label: "🏛️ LEGAL & POLICY BASIS" },
    { key: "⚠️ LIMITATIONS & RESOURCE GAPS", color: "#E8A838", bg: "rgba(232,168,56,0.07)",  label: "⚠️ LIMITATIONS & RESOURCE GAPS" },
    { key: "🔗 INTER-AGENCY COORDINATION",   color: "#3DBFAD", bg: "rgba(61,191,173,0.07)",  label: "🔗 INTER-AGENCY COORDINATION" },
    { key: "📁 DOCUMENTATION CHECKLIST",     color: "#4CAF72", bg: "rgba(76,175,114,0.07)",  label: "📁 DOCUMENTATION CHECKLIST" },
    { key: "⚖️ DECISION SUMMARY",            color: "#D4A84B", bg: "rgba(212,168,75,0.07)",  label: "⚖️ DECISION SUMMARY" },
  ];

  sections.forEach(({ key, color, bg, label }) => {
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(
      new RegExp(`\\*\\*${esc}[^*]*\\*\\*:?`, "g"),
      `|||CUT|||<div style="border-left:3px solid ${color};background:${bg};border-radius:10px;padding:12px 14px;margin:10px 0"><div style="font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:${color};margin-bottom:8px;font-weight:700">${label}</div>`
    );
  });

  const parts = text.split("|||CUT|||");
  let out = parts[0];
  for (let i = 1; i < parts.length; i++) out += parts[i] + "</div>";

  return out
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, `<code style="font-family:'JetBrains Mono',monospace;font-size:11px;background:rgba(198,228,122,0.1);color:#C6E47A;padding:2px 6px;border-radius:4px">$1</code>`)
    .replace(/\[MANDATORY\]/g, `<span style="font-family:'JetBrains Mono',monospace;font-size:8px;padding:2px 7px;border-radius:3px;background:rgba(224,82,82,0.15);color:#E05252;border:1px solid rgba(224,82,82,0.35);margin:0 4px">[MANDATORY]</span>`)
    .replace(/\[RECOMMENDED\]/g, `<span style="font-family:'JetBrains Mono',monospace;font-size:8px;padding:2px 7px;border-radius:3px;background:rgba(61,191,173,0.12);color:#3DBFAD;border:1px solid rgba(61,191,173,0.3);margin:0 4px">[RECOMMENDED]</span>`)
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

/* ── Welcome Screen ── */
const WelcomeScreen = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center px-10 py-12 gap-6">
    <motion.div
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      className="text-6xl select-none"
    >🏛️</motion.div>

    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <h2 className="font-display text-[28px] text-cream leading-tight mb-2">
        PRANA-NET <em className="not-italic" style={{ color: "#D4A84B" }}>Decision Intelligence</em>
      </h2>
      <p className="font-sans text-sm text-muted leading-relaxed max-w-sm mx-auto">
        Select a civic problem from the left panel, or type your issue below.
        The AI responds as a senior MCD officer — bound by Delhi bye-laws, real resources, and proper procedure.
      </p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap gap-2 justify-center"
    >
      {["Policy-Bound", "Resource-Aware", "Llama-Powered", "Offline · Private", "Delhi-Specific", "SC/NGT Orders"].map((t, i) => (
        <motion.span
          key={t}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 + i * 0.06 }}
          className="font-data text-[9.5px] px-3 py-1.5 rounded-full border border-border-forest-light text-muted hover:border-accent-gold/40 hover:text-accent-gold/80 transition-all cursor-default"
        >{t}</motion.span>
      ))}
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-forest-card border border-border-forest-light rounded-2xl p-5 max-w-xs text-left shadow-lg"
    >
      <div className="font-data text-[8.5px] uppercase tracking-[0.2em] mb-4" style={{ color: "#D4A84B" }}>Quick Setup</div>
      <div className="space-y-3">
        {[
          { cmd: "ollama serve", note: "Start Ollama" },
          { cmd: "set OLLAMA_ORIGINS=*", note: "Allow browser access" },
          { cmd: "ollama pull llama3.2", note: "Download model" },
        ].map(({ cmd, note }, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-accent-gold/20 text-accent-gold font-data text-[9px] flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
            <div>
              <code className="font-data text-[10.5px] text-lime">{cmd}</code>
              <div className="font-sans text-[9.5px] text-muted mt-0.5">{note}</div>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-full bg-accent-gold/20 text-accent-gold font-data text-[9px] flex items-center justify-center shrink-0 font-bold">4</span>
          <div className="font-sans text-[10.5px] text-cream">
            Click <strong className="text-accent-gold">Connect</strong> in the input toolbar
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

/* ── Typing indicator ── */
const TypingIndicator = () => (
  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 items-end">
    <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-accent-teal/20 to-forest-elevated border border-accent-teal/25">
      <Bot className="h-4 w-4 text-accent-teal" />
    </div>
    <div className="bg-forest-card border border-border-forest-light rounded-2xl rounded-bl-sm px-5 py-4">
      <div className="font-data text-[7.5px] uppercase tracking-[0.2em] text-muted/60 mb-2.5">PRANA-AI · THINKING</div>
      <div className="flex gap-1.5 items-center">
        {[0, 1, 2].map(j => (
          <motion.span
            key={j}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: j * 0.18, ease: "easeInOut" }}
            className="block w-2 h-2 rounded-full bg-accent-teal/50"
          />
        ))}
      </div>
    </div>
  </motion.div>
);

/* ── Main export ── */
export const AIChatMessages = ({ messages, isTyping }: { messages: ChatMessage[]; isTyping: boolean }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) return <WelcomeScreen />;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
      <AnimatePresence initial={false}>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className={`flex gap-3 items-end ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
              msg.role === "user"
                ? "bg-gradient-to-br from-accent-gold/25 to-forest-elevated border border-accent-gold/30"
                : "bg-gradient-to-br from-accent-teal/25 to-forest-elevated border border-accent-teal/25"
            }`}>
              {msg.role === "user"
                ? <User className="h-4 w-4 text-accent-gold" />
                : <Bot className="h-4 w-4 text-accent-teal" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[78%] rounded-2xl px-5 py-4 border text-[13.5px] leading-[1.78] shadow-md ${
              msg.role === "user"
                ? "bg-forest-elevated border-accent-gold/20 rounded-br-sm"
                : "bg-forest-card border-border-forest-light rounded-bl-sm"
            }`}>
              <div className={`font-data text-[7.5px] uppercase tracking-[0.2em] mb-3 ${
                msg.role === "user" ? "text-right text-accent-gold/50" : "text-muted/60"
              }`}>
                {msg.role === "user" ? "OFFICER INPUT" : "PRANA-AI · MCD DECISION ADVISOR"}
              </div>

              {msg.role === "assistant" ? (
                <div
                  className="font-sans text-cream"
                  dangerouslySetInnerHTML={{ __html: formatResponse(msg.content) }}
                />
              ) : (
                <div className="font-sans text-cream whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
};
