import { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Map as MapIcon, FileEdit, Archive, MessageSquare, Settings,
  AlertTriangle, Upload, User, Send, CheckCheck, Clock, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/shared/StatusPill";
import { AnimatedCTA } from "@/components/shared/AnimatedCTA";

// ─── Sparkline ─────────────────────────────────────────────────────────────────
const Sparkline = ({ data, color = "#C6E47A" }: { data: number[]; color?: string }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`${color}15`} />
    </svg>
  );
};

// ─── CSS AQI Gauge ─────────────────────────────────────────────────────────────
const AQIGauge = ({ value = 87, label = "AQI", color = "#E8A838" }: { value?: number; label?: string; color?: string }) => {
  const pct = Math.min(value / 300, 1);
  const angle = pct * 180;
  const rad = (angle - 90) * (Math.PI / 180);
  const r = 44, cx = 60, cy = 56;
  const nX = cx + r * Math.cos(rad), nY = cy + r * Math.sin(rad);
  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="68" viewBox="0 0 120 68">
        <path d="M 16 56 A 44 44 0 0 1 104 56" stroke="#1E3225" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d={`M 16 56 A 44 44 0 0 1 ${nX} ${nY}`} stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx={nX} cy={nY} r="5" fill={color} />
        <text x="60" y="52" textAnchor="middle" fill={color} fontSize="18" fontFamily="JetBrains Mono" fontWeight="700">{value}</text>
        <text x="60" y="64" textAnchor="middle" fill="#A8A89C" fontSize="8" fontFamily="Sora" letterSpacing="2">{label}</text>
      </svg>
    </div>
  );
};

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { name: "Overview",       path: "/citizen",            icon: Home },
    { name: "Air Map",        path: "/citizen/map",         icon: MapIcon },
    { name: "Report Issue",   path: "/citizen/report",      icon: FileEdit },
    { name: "My Complaints",  path: "/citizen/complaints",  icon: Archive },
    { name: "Messages",       path: "/citizen/messages",    icon: MessageSquare, badge: 2 },
    { name: "Settings",       path: "/citizen/settings",    icon: Settings },
  ];
  return (
    <div className="fixed left-0 top-0 h-full w-[240px] bg-forest-secondary border-r border-border-forest-light z-40 pt-[72px] flex flex-col">
      <div className="px-5 py-5 border-b border-border-forest">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-accent-teal/20 border border-accent-teal flex items-center justify-center">
            <User className="h-5 w-5 text-accent-teal" />
          </div>
          <div>
            <p className="font-sans font-semibold text-sm text-cream">Alex M.</p>
            <p className="font-data text-xs text-lime">Zone 4A</p>
          </div>
        </div>
        <div className="flex justify-center"><AQIGauge value={87} label="CURRENT AQI" color="#E8A838" /></div>
      </div>
      <nav className="px-2 space-y-0.5 py-4 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.name} to={item.path}
              className={cn("flex items-center gap-3 px-4 py-3 rounded font-sans text-[14px] transition-all duration-150 border-l-[3px]",
                isActive ? "bg-accent-teal/10 border-accent-teal text-accent-teal" : "border-transparent text-muted hover:bg-white/[0.04] hover:text-cream"
              )}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge && <span className="h-5 w-5 rounded-full bg-health-red flex items-center justify-center font-data text-[10px] font-bold text-white">{item.badge}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-border-forest text-center">
        <p className="font-data text-[10px] text-muted">Sensor sync: 2 min ago</p>
        <div className="flex justify-center gap-1 mt-2">{[...Array(10)].map((_,i) => <div key={i} className={`h-1.5 w-1.5 rounded-full ${i<8?"bg-health-green":"bg-border-forest-light"}`} />)}</div>
      </div>
    </div>
  );
};

// ─── SparklineStrip ────────────────────────────────────────────────────────────
const SparklineStrip = () => {
  const pollutants = [
    { label: "PM2.5", current: "42 µg/m³", data: [55,48,42,51,44,39,42], color: "#C6E47A" },
    { label: "PM10",  current: "67 µg/m³", data: [70,65,72,68,66,71,67], color: "#E8A838" },
    { label: "CO₂",   current: "412 ppm",  data: [400,408,415,410,405,414,412], color: "#3DBFAD" },
    { label: "NOx",   current: "28 ppb",   data: [32,29,25,30,27,26,28], color: "#C6E47A" },
  ];
  return (
    <div className="w-full bg-forest-secondary border border-border-forest-light rounded mb-6 flex divide-x divide-border-forest-light overflow-hidden">
      {pollutants.map((p, i) => (
        <div key={i} className="flex-1 flex items-center gap-3 px-5 py-3">
          <div>
            <div className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted">{p.label}</div>
            <div className="font-data text-sm font-bold mt-0.5" style={{ color: p.color }}>{p.current}</div>
          </div>
          <div className="ml-auto"><Sparkline data={p.data} color={p.color} /></div>
        </div>
      ))}
    </div>
  );
};

const KpiCard = ({ label, value, unit, color, sparkData }: { label: string; value: string; unit: string; color: string; sparkData: number[] }) => (
  <div className="bg-forest-card border border-border-forest-light rounded p-6 hover:border-health-green transition-all duration-200 flex flex-col justify-between" style={{ minHeight: "140px" }}>
    <div>
      <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">{label}</div>
      <div className="font-data font-bold mt-2 leading-none" style={{ fontSize: "clamp(36px, 4vw, 52px)", color }}>{value}</div>
      <div className="font-data text-xs text-muted mt-1">{unit}</div>
    </div>
    <div className="mt-3"><Sparkline data={sparkData} color={color} /></div>
  </div>
);

// ─── OVERVIEW TAB ──────────────────────────────────────────────────────────────
const OverviewTab = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 pb-32">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="font-display text-3xl text-cream">Air Quality Overview</h1>
        <p className="font-sans text-sm text-muted mt-1">Zone 4A — Mumbai Central · Updated 2 min ago</p>
      </div>
      <div className="h-3 w-3 rounded-full bg-health-green animate-pulse" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      <KpiCard label="Current AQI" value="87" unit="Moderate" color="#E8A838" sparkData={[75,80,85,82,88,84,87]} />
      <KpiCard label="PM 2.5" value="42" unit="µg/m³" color="#C6E47A" sparkData={[55,48,42,51,44,39,42]} />
      <KpiCard label="PM 10" value="67" unit="µg/m³" color="#E8A838" sparkData={[70,65,72,68,66,71,67]} />
      <KpiCard label="CO₂" value="412" unit="ppm" color="#3DBFAD" sparkData={[400,408,415,410,405,414,412]} />
    </div>
    <SparklineStrip />
    <div className="w-full p-4 mb-6 bg-health-amber/10 border-l-4 border-health-amber rounded flex items-start gap-4">
      <AlertTriangle className="h-5 w-5 text-health-amber shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-sans font-semibold text-sm text-health-amber">Health Advisory: Moderate</h4>
        <p className="font-sans text-sm text-muted mt-1 leading-relaxed">Sensitive individuals should limit prolonged outdoor activity. Wear N95 mask if necessary.</p>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="col-span-1 lg:col-span-2">
        <h3 className="font-sans text-[18px] font-semibold text-cream mb-4">Live Pollution Heatmap</h3>
        <div className="w-full h-[380px] bg-forest-secondary border border-border-forest rounded relative overflow-hidden flex items-center justify-center">
          <div className="absolute top-8 left-16 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(224,82,82,0.3) 0%, transparent 70%)" }} />
          <div className="absolute bottom-16 right-20 w-36 h-36 rounded-full" style={{ background: "radial-gradient(circle, rgba(232,168,56,0.25) 0%, transparent 70%)" }} />
          <div className="absolute top-24 right-32 w-28 h-28 rounded-full" style={{ background: "radial-gradient(circle, rgba(76,175,114,0.3) 0%, transparent 70%)" }} />
          {[{x:"30%",y:"35%",c:"#E05252"},{x:"65%",y:"60%",c:"#E8A838"},{x:"72%",y:"25%",c:"#4CAF72"}].map((p,i) => (
            <div key={i} className="absolute" style={{ left: p.x, top: p.y }}><div className="w-3 h-3 rounded-full border-2 border-white/80 shadow-md" style={{ background: p.c }} /></div>
          ))}
          <div className="z-10 bg-forest-card/80 backdrop-blur border border-white/10 p-3 rounded text-center">
            <p className="font-data text-lime text-xs">Interactive Map Active</p>
            <p className="font-sans text-[10px] text-muted mt-1">3 active heat zones</p>
          </div>
        </div>
      </div>
      <div className="col-span-1 pl-0 lg:pl-4 border-l-0 lg:border-l border-border-forest-light">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans text-lg font-semibold text-cream">Recent Reports</h3>
          <Link to="/citizen/complaints" className="text-accent-teal text-xs uppercase tracking-wider font-semibold">View All →</Link>
        </div>
        <div className="space-y-3">
          {[
            { id: "TKN-2024-847", type: "Industrial Smoke", status: "moderate", statusLabel: "In Progress", time: "10 mins ago" },
            { id: "TKN-2024-846", type: "Construction Dust", status: "info", statusLabel: "Assigned", time: "2 hrs ago" },
            { id: "TKN-2024-842", type: "Garbage Dumping", status: "good", statusLabel: "Resolved", time: "Yesterday" },
          ].map((ticket, i) => (
            <div key={i} className="p-4 bg-forest-card border border-border-forest rounded hover:border-accent-teal/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="font-data text-xs font-bold text-lime">{ticket.id}</span>
                <span className="text-[11px] text-muted font-sans">{ticket.time}</span>
              </div>
              <p className="font-sans text-cream text-[14px] font-semibold mb-3">{ticket.type}</p>
              <StatusPill label={ticket.statusLabel} level={ticket.status as any} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── MY COMPLAINTS TAB ─────────────────────────────────────────────────────────
const ComplaintsTab = () => {
  const complaints = [
    {
      id: "TKN-2024-847", type: "Industrial Smoke", zone: "Zone 4A, Sector 9",
      submitted: "Today, 12:04 PM", priority: "hazardous",
      timeline: [
        { label: "Submitted", time: "12:04 PM", done: true, icon: <FileEdit className="h-3.5 w-3.5" /> },
        { label: "Under Review", time: "12:07 PM", done: true, icon: <Clock className="h-3.5 w-3.5" /> },
        { label: "Officer Assigned", time: "12:22 PM", done: true, icon: <User className="h-3.5 w-3.5" /> },
        { label: "En Route", time: "12:31 PM", done: false, icon: <MapIcon className="h-3.5 w-3.5" /> },
        { label: "Resolved", time: "—", done: false, icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
      ],
      officer: "Officer Raj Kumar · Badge 092",
    },
    {
      id: "TKN-2024-846", type: "Construction Dust", zone: "Zone 4A, Main Rd",
      submitted: "Today, 09:18 AM", priority: "moderate",
      timeline: [
        { label: "Submitted", time: "09:18 AM", done: true, icon: <FileEdit className="h-3.5 w-3.5" /> },
        { label: "Under Review", time: "09:21 AM", done: true, icon: <Clock className="h-3.5 w-3.5" /> },
        { label: "Officer Assigned", time: "09:40 AM", done: true, icon: <User className="h-3.5 w-3.5" /> },
        { label: "En Route", time: "09:52 AM", done: true, icon: <MapIcon className="h-3.5 w-3.5" /> },
        { label: "Resolved", time: "10:30 AM", done: true, icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
      ],
      officer: "Officer A. Smith · Badge 114",
    },
  ];

  const [open, setOpen] = useState<string | null>(complaints[0].id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-32 max-w-4xl">
      <h1 className="font-display text-3xl text-cream mb-2">My <em style={{ fontStyle: "italic", color: "#3DBFAD" }}>Complaints</em></h1>
      <p className="font-sans text-sm text-muted mb-8">Track every report you've submitted — from submission to resolution.</p>

      <div className="space-y-4">
        {complaints.map((c) => {
          const activeStep = c.timeline.filter(t => t.done).length - 1;
          const isOpen = open === c.id;
          const pColor = c.priority === "hazardous" ? "#E05252" : c.priority === "moderate" ? "#E8A838" : "#4CAF72";

          return (
            <div key={c.id} className="bg-forest-card border border-border-forest-light rounded overflow-hidden" style={{ borderLeft: `4px solid ${pColor}` }}>
              {/* Header row */}
              <button className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors text-left" onClick={() => setOpen(isOpen ? null : c.id)}>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-data text-sm font-bold text-lime">{c.id}</div>
                    <div className="font-sans text-[15px] font-semibold text-cream mt-0.5">{c.type}</div>
                    <div className="font-sans text-xs text-muted mt-1">📍 {c.zone} · {c.submitted}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusPill label={c.timeline.filter(t => t.done).length === c.timeline.length ? "Resolved" : "In Progress"} level={c.timeline.filter(t => t.done).length === c.timeline.length ? "good" : "moderate"} />
                  <span className="text-muted text-sm">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* Timeline detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-6 border-t border-border-forest-light pt-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Timeline */}
                        <div>
                          <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-5">Resolution Timeline</h4>
                          <div className="relative pl-6 space-y-0">
                            {/* Connecting vertical line */}
                            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border-forest-light" />
                            {c.timeline.map((step, si) => (
                              <div key={si} className="relative flex items-start gap-4 pb-6 last:pb-0">
                                {/* Step dot */}
                                <div className={cn("absolute -left-6 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10",
                                  step.done
                                    ? si === activeStep
                                      ? "bg-accent-teal border-accent-teal text-forest-primary"
                                      : "bg-health-green border-health-green text-forest-primary"
                                    : "bg-forest-elevated border-border-forest-light text-muted"
                                )}>
                                  {step.done ? <CheckCheck className="h-3 w-3" /> : step.icon}
                                </div>
                                <div className="pl-2">
                                  <div className={cn("font-sans text-sm font-semibold", step.done ? "text-cream" : "text-muted")}>{step.label}</div>
                                  <div className="font-data text-[11px] text-muted mt-0.5">{step.time}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Details + action */}
                        <div className="space-y-5">
                          <div className="bg-forest-elevated border border-border-forest-light rounded p-4">
                            <div className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-muted mb-2">Assigned Officer</div>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-accent-gold/20 border border-accent-gold flex items-center justify-center text-accent-gold font-bold text-sm">RK</div>
                              <div>
                                <div className="font-sans text-sm font-semibold text-cream">{c.officer.split(" · ")[0]}</div>
                                <div className="font-data text-[11px] text-muted">{c.officer.split(" · ")[1]}</div>
                              </div>
                              {c.timeline[c.timeline.length - 1].done || (
                                <Link to="/citizen/messages" className="ml-auto">
                                  <AnimatedCTA variant="ghost" size="sm" className="text-xs border-accent-teal text-accent-teal hover:bg-accent-teal">
                                    <MessageSquare className="h-3.5 w-3.5 mr-2" /> Chat
                                  </AnimatedCTA>
                                </Link>
                              )}
                            </div>
                          </div>

                          <div className="bg-forest-elevated border border-border-forest-light rounded p-4">
                            <div className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-muted mb-2">Progress</div>
                            <div className="flex justify-between font-data text-xs mb-2">
                              <span className="text-muted">{c.timeline.filter(t => t.done).length}/{c.timeline.length} steps</span>
                              <span className="text-lime">{Math.round((c.timeline.filter(t => t.done).length / c.timeline.length) * 100)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-forest-primary rounded-full overflow-hidden">
                              <motion.div className="h-full bg-health-green rounded-full" initial={{ width: 0 }} animate={{ width: `${(c.timeline.filter(t => t.done).length / c.timeline.length) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── MESSAGES / CHAT TAB ───────────────────────────────────────────────────────
type Message = { id: number; from: "me" | "officer"; text: string; time: string; read: boolean };

const MessagesTab = () => {
  const threads = [
    { id: "TKN-2024-847", type: "Industrial Smoke", officer: "Officer Raj Kumar", avatar: "RK", lastMsg: "I'm 3 min away. Please stay inside.", time: "12:31 PM", unread: 2, active: true },
    { id: "TKN-2024-842", type: "Garbage Dumping", officer: "Officer A. Smith",   avatar: "AS", lastMsg: "Issue resolved. Report closed.",   time: "Yesterday", unread: 0, active: false },
  ];

  const [activeThread, setActiveThread] = useState(threads[0].id);
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: "officer", text: "Hello Alex, I've received your complaint. Heading to Zone 4A now.", time: "12:22 PM", read: true },
    { id: 2, from: "me",      text: "Thank you! The smoke is still heavy near the south gate.", time: "12:24 PM", read: true },
    { id: 3, from: "officer", text: "Noted. Can you confirm the exact gate location? Is it facing the main road?", time: "12:25 PM", read: true },
    { id: 4, from: "me",      text: "Yes, south gate facing N.R. road. Large chimney stack visible.", time: "12:27 PM", read: true },
    { id: 5, from: "officer", text: "Got it. I'm coordinating with the pollution control team. ETA 8 minutes.", time: "12:28 PM", read: true },
    { id: 6, from: "officer", text: "I'm 3 min away. Please stay inside.", time: "12:31 PM", read: false },
  ]);

  const activeT = threads.find(t => t.id === activeThread)!;

  const sendMsg = () => {
    if (!inputVal.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), from: "me", text: inputVal.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), read: false }]);
    setInputVal("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-72px)] flex overflow-hidden">

      {/* Thread list */}
      <div className="w-[280px] shrink-0 border-r border-border-forest-light bg-forest-secondary flex flex-col">
        <div className="p-5 border-b border-border-forest">
          <h2 className="font-display text-2xl text-cream">Messages</h2>
          <p className="font-sans text-xs text-muted mt-1">Complaint communications</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map((t) => (
            <button key={t.id} onClick={() => setActiveThread(t.id)}
              className={cn("w-full text-left px-5 py-4 border-b border-border-forest flex gap-3 hover:bg-forest-card transition-colors",
                activeThread === t.id ? "bg-forest-card border-l-2 border-l-accent-teal" : "border-l-2 border-l-transparent"
              )}>
              <div className="w-10 h-10 rounded-full bg-accent-gold/20 border border-accent-gold flex items-center justify-center text-accent-gold font-bold text-sm shrink-0">{t.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="font-sans text-sm font-semibold text-cream truncate">{t.officer}</div>
                  <div className="font-data text-[10px] text-muted ml-2 shrink-0">{t.time}</div>
                </div>
                <div className="font-data text-[11px] text-lime truncate">{t.id}</div>
                <div className="font-sans text-xs text-muted truncate mt-0.5">{t.lastMsg}</div>
              </div>
              {t.unread > 0 && <div className="h-5 w-5 rounded-full bg-accent-teal flex items-center justify-center font-data text-[10px] font-bold text-forest-primary shrink-0 self-center">{t.unread}</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-forest-primary">
        {/* Chat header */}
        <div className="h-16 border-b border-border-forest-light bg-forest-secondary px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent-gold/20 border border-accent-gold flex items-center justify-center text-accent-gold font-bold text-sm">{activeT.avatar}</div>
            <div>
              <div className="font-sans text-sm font-semibold text-cream">{activeT.officer}</div>
              <div className="flex items-center gap-2">
                {activeT.active && <div className="w-2 h-2 rounded-full bg-health-green animate-pulse" />}
                <span className="font-data text-[11px] text-muted">{activeT.active ? "Active" : "Offline"} · {activeT.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-data text-[11px] text-muted uppercase tracking-wider">Re: {activeT.type}</span>
          </div>
        </div>

        {/* Context banner */}
        <div className="px-6 py-3 bg-accent-teal/5 border-b border-border-forest flex items-center gap-3">
          <div className="font-data text-[11px] text-lime">{activeT.id}</div>
          <div className="h-px flex-1 bg-border-forest-light" />
          <StatusPill label={activeT.active ? "In Progress" : "Resolved"} level={activeT.active ? "moderate" : "good"} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3 max-w-[80%]", msg.from === "me" ? "ml-auto flex-row-reverse" : "")}>
              {msg.from === "officer" && (
                <div className="w-8 h-8 rounded-full bg-accent-gold/20 border border-accent-gold flex items-center justify-center text-accent-gold font-bold text-xs shrink-0 self-end">{activeT.avatar}</div>
              )}
              <div className={cn("rounded p-3.5 font-sans text-sm leading-relaxed",
                msg.from === "me"
                  ? "bg-accent-teal text-forest-primary rounded-br-none"
                  : "bg-forest-card border border-border-forest-light text-cream rounded-bl-none"
              )}>
                <p>{msg.text}</p>
                <div className={cn("flex items-center gap-1 mt-1.5 font-data text-[10px]", msg.from === "me" ? "justify-end text-forest-primary/60" : "text-muted")}>
                  {msg.time}
                  {msg.from === "me" && (msg.read ? <CheckCheck className="h-3 w-3" /> : <CheckCheck className="h-3 w-3 opacity-50" />)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border-forest-light bg-forest-secondary px-5 py-4 shrink-0">
          <div className="flex gap-3 items-end">
            <textarea
              rows={1}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              placeholder="Type a message… (Enter to send)"
              className="flex-1 bg-forest-elevated border border-border-forest-light rounded p-3.5 font-sans text-sm text-cream placeholder:text-muted outline-none focus:border-accent-teal transition-colors resize-none min-h-[48px] max-h-28"
            />
            <button onClick={sendMsg}
              className="h-12 w-12 bg-accent-teal rounded flex items-center justify-center hover:brightness-110 transition-all shrink-0">
              <Send className="h-5 w-5 text-forest-primary" />
            </button>
          </div>
          <p className="font-data text-[10px] text-muted mt-2 text-center">Messages are encrypted end-to-end · PRANA-NET Secure Channel</p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── REPORT TAB ────────────────────────────────────────────────────────────────
const ReportTab = () => {
  const [success, setSuccess] = useState(false);
  const categories = ["🔥 Waste Burning", "🏗️ Construction Dust", "🏭 Industrial Smoke", "🗑️ Garbage Dumping", "❓ Other"];
  const [selectedCat, setSelectedCat] = useState(categories[0]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-3xl pb-32">
      <h2 className="font-display text-4xl text-cream mb-2">Report a <em style={{ fontStyle: "italic", color: "#3DBFAD" }}>pollution</em> issue</h2>
      <p className="font-sans text-muted mb-8">Your report reaches the command center in real time. Expected officer response: &lt; 5 min.</p>

      <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setSuccess(true); }}>
        <div className="space-y-3">
          <label className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Location</label>
          <div className="w-full h-48 bg-forest-secondary border border-border-forest-light rounded relative flex items-center justify-center overflow-hidden">
            <div className="absolute top-8 left-12 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(76,175,114,0.15) 0%, transparent 70%)" }} />
            <AnimatedCTA variant="ghost" size="sm" type="button" className="z-10 bg-forest-card/60 backdrop-blur text-xs">📍 Drop Pin on Map</AnimatedCTA>
          </div>
          <input type="text" placeholder="Or search address manually..." className="w-full bg-forest-elevated border border-border-forest-light rounded h-[52px] px-4 font-sans text-sm text-cream focus:border-health-green outline-none transition-colors placeholder:text-muted" />
        </div>
        <div className="space-y-3">
          <label className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Issue Category</label>
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <button key={cat} type="button" onClick={() => setSelectedCat(cat)}
                className={cn("px-4 py-2 rounded-full font-sans text-sm border transition-all duration-200",
                  cat === selectedCat ? "bg-health-green/15 border-health-green text-lime" : "bg-forest-elevated border-border-forest-light text-muted hover:border-health-green/50"
                )}>{cat}</button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <label className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Detailed Description</label>
          <textarea rows={4} placeholder="Describe what you observed. Odor, volume, potential source..." className="w-full bg-forest-elevated border border-border-forest-light rounded p-4 font-sans text-sm text-cream focus:border-health-green outline-none transition-colors resize-none placeholder:text-muted" />
        </div>
        <div className="space-y-3">
          <label className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Evidence Upload</label>
          <div className="border-2 border-dashed border-border-forest-light bg-forest-secondary hover:border-health-green/50 transition-all rounded h-32 flex flex-col items-center justify-center cursor-pointer group">
            <Upload className="h-6 w-6 text-muted mb-2 group-hover:text-health-green transition-colors" />
            <p className="font-sans text-sm text-muted">Drag files here or click to upload</p>
            <p className="font-sans text-xs text-muted/50 mt-1">JPG, PNG, MP4 up to 50MB</p>
          </div>
        </div>
        <AnimatedCTA variant="primary" className="w-full h-14" type="submit">Submit Report →</AnimatedCTA>
      </form>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-forest-primary/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-forest-card border border-border-forest-light shadow-2xl p-12 max-w-md w-full text-center relative rounded">
              <button onClick={() => setSuccess(false)} className="absolute top-4 right-4 text-muted hover:text-white w-8 h-8 flex items-center justify-center">✕</button>
              <div className="h-16 w-16 bg-health-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="h-8 w-8 bg-health-green rounded-full flex items-center justify-center text-forest-primary font-bold text-xl">✓</div>
              </div>
              <h3 className="font-display text-3xl text-cream mb-2">Report Submitted</h3>
              <p className="font-sans text-muted mb-8 text-sm leading-relaxed">An officer will be dispatched within 5 min. Track your complaint with:</p>
              <div className="bg-forest-secondary border border-border-forest rounded py-4 px-6 mb-8 flex items-center justify-center">
                <code className="font-data text-2xl font-bold text-lime tracking-wide">TKN-2024-00848</code>
              </div>
              <div className="flex gap-3">
                <AnimatedCTA variant="teal" className="flex-1" onClick={() => setSuccess(false)}>Track Complaint</AnimatedCTA>
                <Link to="/citizen/messages" className="flex-1"><AnimatedCTA variant="ghost" className="w-full">Open Chat →</AnimatedCTA></Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── SETTINGS TAB ──────────────────────────────────────────────────────────────
const SettingsTab = () => {
  const [notifs, setNotifs] = useState({ aqi: true, complaints: true, officer: true, weekly: false });
  const [zone, setZone] = useState("Zone 4A — Mumbai Central");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-2xl pb-32">
      <h2 className="font-display text-4xl text-cream mb-8">Settings</h2>

      {/* Profile */}
      <section className="mb-10">
        <div className="section-label">Account</div>
        <div className="bg-forest-card border border-border-forest-light rounded p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent-teal/20 border-2 border-accent-teal flex items-center justify-center text-accent-teal font-bold text-xl">AM</div>
            <div>
              <p className="font-sans font-semibold text-cream">Alex M.</p>
              <p className="font-data text-xs text-lime mt-0.5">Citizen · Verified</p>
            </div>
          </div>
          <div className="space-y-3">
            {[["Name", "Alex Mehta"], ["Email", "alex.m@email.com"], ["Phone", "+91 98765 43210"]].map(([l,v]) => (
              <div key={l} className="flex items-center justify-between py-3 border-t border-border-forest-light">
                <span className="font-sans text-sm text-muted">{l}</span>
                <span className="font-sans text-sm text-cream">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zone */}
      <section className="mb-10">
        <div className="section-label">Monitoring Zone</div>
        <div className="bg-forest-card border border-border-forest-light rounded p-6">
          <label className="font-sans text-xs text-muted uppercase tracking-wider block mb-3">Primary Zone</label>
          <select value={zone} onChange={e => setZone(e.target.value)} className="w-full bg-forest-elevated border border-border-forest-light rounded h-12 px-4 font-sans text-sm text-cream outline-none focus:border-health-green transition-colors">
            {["Zone 4A — Mumbai Central", "Zone 2B — Andheri West", "Zone 1A — Fort", "Zone 7C — Chembur"].map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-10">
        <div className="section-label">Notifications</div>
        <div className="bg-forest-card border border-border-forest-light rounded overflow-hidden">
          {[
            { key: "aqi", label: "AQI Health Alerts", desc: "Alert when AQI crosses thresholds in your zone" },
            { key: "complaints", label: "Complaint Status Updates", desc: "Updates on your submitted reports" },
            { key: "officer", label: "Officer Messages", desc: "New messages from assigned field officers" },
            { key: "weekly", label: "Weekly Air Quality Report", desc: "Weekly digest of pollution trends in your area" },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between px-6 py-4 border-b border-border-forest-light last:border-0 hover:bg-white/[0.02] transition-colors">
              <div>
                <p className="font-sans text-sm font-semibold text-cream">{setting.label}</p>
                <p className="font-sans text-xs text-muted mt-0.5">{setting.desc}</p>
              </div>
              <button onClick={() => setNotifs(n => ({ ...n, [setting.key]: !n[setting.key as keyof typeof n] }))}
                className={cn("w-12 h-6 rounded-full transition-all duration-200 relative shrink-0 ml-4",
                  notifs[setting.key as keyof typeof notifs] ? "bg-accent-teal" : "bg-forest-elevated border border-border-forest-light"
                )}>
                <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200",
                  notifs[setting.key as keyof typeof notifs] ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <AnimatedCTA variant="primary" className="w-full h-12">Save Changes</AnimatedCTA>
    </motion.div>
  );
};

// ─── Main layout ───────────────────────────────────────────────────────────────
export const CitizenDashboard = () => (
  <div className="min-h-screen bg-forest-primary font-sans pt-[72px]">
    <Sidebar />
    <div className="ml-[240px] min-h-screen">
      <Routes>
        <Route path="/"           element={<OverviewTab />} />
        <Route path="/report"     element={<ReportTab />} />
        <Route path="/complaints" element={<ComplaintsTab />} />
        <Route path="/messages"   element={<MessagesTab />} />
        <Route path="/settings"   element={<SettingsTab />} />
        <Route path="*"           element={<div className="p-8 font-sans text-muted text-sm">This section is under active development.</div>} />
      </Routes>
    </div>
  </div>
);
