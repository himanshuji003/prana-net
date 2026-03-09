import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, Map as MapIcon, Layers, Users, Cpu,
  Activity, PieChart, Search, X, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/shared/StatusPill";
import { AnimatedCTA } from "@/components/shared/AnimatedCTA";

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { name: "Command Overview",   path: "/official",           icon: BarChart2 },
    { name: "Complaint Queue",    path: "/official/queue",      icon: Layers },
    { name: "Officer Management", path: "/official/officers",   icon: Users },
    { name: "AI Recommendations", path: "/official/ai",         icon: Cpu },
    { name: "Sensor Network",     path: "/official/sensors",    icon: Activity },
    { name: "Analytics",          path: "/official/analytics",  icon: PieChart },
    { name: "Heatmap",            path: "/official/map",        icon: MapIcon },
  ];
  return (
    <div className="fixed left-0 top-0 h-full w-[260px] bg-[#0F1C13] border-r border-border-forest-light z-40 pt-[72px]">
      <nav className="px-2 space-y-0.5 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.name} to={item.path}
              className={cn("flex items-center gap-3 px-4 py-3 rounded font-sans text-[14px] transition-all duration-150 border-l-[3px]",
                isActive ? "bg-accent-gold/10 border-accent-gold text-accent-gold" : "border-transparent text-muted hover:bg-white/[0.04] hover:text-cream"
              )}>
              <Icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

// ─── LIVE FEED ─────────────────────────────────────────────────────────────────
const LiveFeed = () => {
  const events = [
    { token: "TKN-847", text: "assigned to Officer D. Jackson", time: "2 min ago" },
    { token: "TKN-846", text: "escalated to Priority 1 — Zone 2B", time: "4 min ago" },
    { token: "TKN-839", text: "resolved by Officer A. Smith", time: "6 min ago" },
    { token: "TKN-835", text: "new complaint submitted — Zone 7C", time: "8 min ago" },
    { token: "ST-007",  text: "Super Tree offline — Manual check needed", time: "11 min ago" },
  ];
  return (
    <div className="overflow-hidden h-32 relative">
      <div className="animate-feed-scroll flex flex-col gap-2.5">
        {[...events, ...events].map((e, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full bg-health-green shrink-0 animate-pulse" />
            <span className="font-data text-[11px] text-lime">{e.token}</span>
            <span className="font-data text-[11px] text-muted">{e.text}</span>
            <span className="font-data text-[10px] text-muted/60 ml-auto">{e.time}</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #111F16)" }} />
    </div>
  );
};

// ─── COMMAND OVERVIEW ──────────────────────────────────────────────────────────
const CommandOverview = () => {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const complaints = [
    { id: "TKN-2024-847", type: "Industrial Smoke",  zone: "Zone 4A", time: "10 mins ago", priority: "hazardous", borderColor: "border-l-health-red" },
    { id: "TKN-2024-846", type: "Chemical Spill",    zone: "Zone 2B", time: "45 mins ago", priority: "hazardous", borderColor: "border-l-health-red" },
    { id: "TKN-2024-842", type: "Waste Burning",     zone: "Zone 1A", time: "2 hrs ago",   priority: "moderate",  borderColor: "border-l-health-amber" },
    { id: "TKN-2024-839", type: "Construction Dust", zone: "Zone 7C", time: "3 hrs ago",   priority: "good",      borderColor: "border-l-health-green" },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-72px)] overflow-hidden flex flex-col">
      {/* Stats strip */}
      <div className="flex h-12 w-full border-b border-border-forest-light bg-forest-secondary shrink-0">
        {[
          { label: "Active Complaints", value: "47", color: "text-health-red" },
          { label: "Officers Deployed", value: "12", color: "text-accent-gold" },
          { label: "Avg Response",      value: "23 min", color: "text-accent-teal" },
          { label: "Super Trees",       value: "8/10",   color: "text-lime" },
        ].map((stat, i) => (
          <div key={i} className="flex-1 flex items-center justify-center border-r border-border-forest-light last:border-0 font-data text-xs tracking-wider">
            <span className="text-muted mr-2 uppercase text-[10px]">{stat.label}:</span>
            <span className={cn("font-bold", stat.color)}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="w-[58%] h-full relative bg-forest-primary border-r border-border-forest-light overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 35% 45%, rgba(224,82,82,0.5) 0%, transparent 35%), radial-gradient(circle at 65% 60%, rgba(232,168,56,0.3) 0%, transparent 25%), radial-gradient(circle at 75% 30%, rgba(76,175,114,0.3) 0%, transparent 20%)" }} />
          <div className="absolute inset-0 grid-texture opacity-5" />
          {[{x:"32%",y:"42%",c:"#E05252"},{x:"62%",y:"57%",c:"#E8A838"},{x:"70%",y:"27%",c:"#4CAF72"}].map((p,i) => (
            <div key={i} className="absolute z-10 cursor-pointer group" style={{ left: p.x, top: p.y }}>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/80 shadow-md transition-transform group-hover:scale-125" style={{ background: p.c }} />
            </div>
          ))}
          <div className="absolute top-4 left-4 bg-forest-card/80 backdrop-blur border border-border-forest-light p-4 rounded z-10">
            <p className="font-sans text-xs font-semibold text-cream mb-3 uppercase tracking-wider">Layers</p>
            <div className="space-y-2 font-sans text-xs text-muted">
              {["Officers","Complaints","Super Trees"].map(l => <label key={l} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-accent-gold" /> {l}</label>)}
            </div>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-health-green/10 border border-health-green/30 px-3 py-1.5 rounded z-10">
            <div className="w-2 h-2 rounded-full bg-health-green animate-pulse" />
            <span className="font-data text-[10px] text-health-green uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* Queue */}
        <div className="w-[42%] h-full bg-forest-secondary flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border-forest-light bg-forest-card flex justify-between items-center shrink-0">
            <h3 className="font-sans font-semibold text-sm text-cream">Complaint Queue</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted" />
              <input type="text" placeholder="Search..." className="bg-forest-elevated border border-border-forest-light rounded h-8 pl-8 pr-3 font-data text-xs text-lime outline-none focus:border-accent-gold transition-colors w-48" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
            {complaints.map((item, i) => (
              <div key={i} onClick={() => setSelectedToken(item.id)}
                className={cn("bg-forest-card border border-border-forest-light border-l-[3px] rounded p-4 hover:border-accent-gold/40 cursor-pointer group transition-all", item.borderColor)}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-data text-xs text-lime font-bold block">{item.id}</span>
                    <span className="font-sans text-[14px] text-cream font-semibold">{item.type}</span>
                  </div>
                  <AnimatedCTA variant="gold" size="sm" className="h-7 px-3 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">Assign</AnimatedCTA>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted font-sans mb-3">
                  <span>📍 {item.zone}</span><span>🕒 {item.time}</span>
                </div>
                <StatusPill label={item.priority} level={item.priority as any} />
              </div>
            ))}
          </div>
          <div className="border-t border-border-forest-light bg-forest-card p-4 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-health-green animate-pulse" />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-muted">Live Activity Feed</span>
            </div>
            <LiveFeed />
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedToken && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-forest-primary/95 backdrop-blur-sm flex items-center justify-center p-4 pt-24">
            <motion.div initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.96 }}
              className="bg-forest-secondary border border-border-forest max-w-[900px] w-full max-h-[85vh] rounded overflow-hidden flex flex-col relative">
              <div className="p-6 border-b border-border-forest-light flex justify-between items-center bg-forest-card">
                <div>
                  <span className="font-sans text-[10px] tracking-[0.2em] text-muted uppercase">Complaint ID</span>
                  <h2 className="font-data text-2xl font-bold text-lime mt-1">{selectedToken}</h2>
                </div>
                <button onClick={() => setSelectedToken(null)} className="h-9 w-9 bg-forest-elevated rounded flex items-center justify-center text-muted hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-1 overflow-hidden">
                <div className="w-[55%] p-6 border-r border-border-forest-light overflow-y-auto space-y-6">
                  <div>
                    <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted mb-3">Incident Description</h3>
                    <p className="font-sans text-sm text-cream leading-relaxed bg-forest-elevated p-4 rounded border border-border-forest-light">Large plumes of dark gray smoke. Smell of sulfur and burning plastic detected. Needs immediate verification.</p>
                  </div>
                  <div>
                    <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted mb-3">Sensor Readings — Zone 4A</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[["PM2.5","187 µg/m³","#E05252"],["CO₂","428 ppm","#E8A838"],["NOx","54 ppb","#E8A838"]].map(([l,v,c], i) => (
                        <div key={i} className="bg-forest-elevated border border-border-forest-light rounded p-3 text-center">
                          <div className="font-data text-[10px] text-muted uppercase">{l}</div>
                          <div className="font-data text-lg font-bold mt-1" style={{ color: c }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-[45%] flex flex-col overflow-hidden bg-forest-card">
                  <div className="p-5 border-b border-border-forest-light">
                    <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-gold mb-3 flex items-center gap-2"><Cpu className="h-3.5 w-3.5" /> AI Recommendations</h3>
                    <div className="bg-health-amber/10 border border-health-amber p-4 rounded mb-4">
                      <p className="font-sans text-sm font-semibold text-cream mb-2">Deploy Water Sprinkler Truck</p>
                      <span className="font-data text-[10px] text-health-amber block">⚡ PM2.5: 187 µg/m³ — 340% above threshold</span>
                    </div>
                    <div className="flex gap-3">
                      <AnimatedCTA variant="primary" size="sm" className="flex-1 text-xs">✓ Approve</AnimatedCTA>
                      <AnimatedCTA variant="ghost" size="sm" className="flex-1 text-xs opacity-60">✗ Dismiss</AnimatedCTA>
                    </div>
                  </div>
                  <div className="p-5 overflow-y-auto flex-1">
                    <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted mb-4">Assign Officer</h3>
                    {[{ name: "Officer D. Jackson", badge:"BADGE-092", dist:"2km" }, { name: "Officer A. Smith", badge:"BADGE-114", dist:"5km" }].map((o, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border border-border-forest-light rounded hover:bg-forest-elevated cursor-pointer mb-2 transition-all">
                        <div className="h-9 w-9 rounded-full bg-forest-primary flex items-center justify-center text-xs font-bold border border-white/10 text-lime shrink-0">{o.name[8]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-sans text-sm font-semibold text-cream">{o.name}</div>
                          <div className="font-data text-[10px] text-muted">{o.badge} · {o.dist}</div>
                        </div>
                        <AnimatedCTA variant="gold" size="sm" className="h-8 px-3 text-xs">Select</AnimatedCTA>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── AI RECOMMENDATIONS TAB ────────────────────────────────────────────────────
const AIRecommendationsTab = () => {
  const recs = [
    {
      id: "REC-001", priority: "critical", incident: "TKN-2024-847", zone: "Zone 4A",
      action: "Deploy Emergency Water Sprinkler Truck",
      rationale: "PM2.5 at 187 µg/m³ — 340% above threshold. Industrial source identified.",
      confidence: 97, status: "pending",
    },
    {
      id: "REC-002", priority: "high", incident: "TKN-2024-846", zone: "Zone 2B",
      action: "Activate Hazmat Response Unit",
      rationale: "Chemical spill signature detected in sensor data. NOx spike at 4× normal.",
      confidence: 89, status: "approved",
    },
    {
      id: "REC-003", priority: "moderate", incident: "Zone 3A",  zone: "Zone 3A",
      action: "Increase Super Tree fan speed to 100%",
      rationale: "Predictive model shows PM accumulation in 45 min based on wind direction.",
      confidence: 74, status: "pending",
    },
    {
      id: "REC-004", priority: "low", incident: "General",    zone: "City-Wide",
      action: "Send health advisory push notification",
      rationale: "City-wide AQI trending upward. Alert sensitive populations.",
      confidence: 92, status: "pending",
    },
  ];

  const [statuses, setStatuses] = useState<Record<string, string>>(Object.fromEntries(recs.map(r => [r.id, r.status])));

  const priorityColor: Record<string, string> = { critical: "#E05252", high: "#E8A838", moderate: "#E8A838", low: "#C6E47A" };
  const priorityBorder: Record<string, string> = { critical: "border-l-health-red", high: "border-l-health-amber", moderate: "border-l-health-amber", low: "border-l-lime" };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-12 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 bg-accent-gold/20 border border-accent-gold rounded flex items-center justify-center shrink-0">
          <Cpu className="h-6 w-6 text-accent-gold" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-cream">AI <em style={{ fontStyle: "italic", color: "#D4A84B" }}>Recommendations</em></h1>
          <p className="font-sans text-sm text-muted mt-0.5">{recs.filter(r => statuses[r.id] === "pending").length} pending actions · Updated 90 seconds ago</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-accent-gold/10 border border-accent-gold/30 px-4 py-2 rounded">
          <div className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
          <span className="font-data text-xs text-accent-gold uppercase tracking-wider">AI Engine Active</span>
        </div>
      </div>

      {/* Rec cards */}
      <div className="space-y-4">
        {recs.map((rec) => {
          const s = statuses[rec.id];
          return (
            <div key={rec.id} className={cn("bg-forest-card border border-border-forest-light rounded overflow-hidden border-l-[4px]", priorityBorder[rec.priority])}>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-data text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider" style={{ background: `${priorityColor[rec.priority]}20`, color: priorityColor[rec.priority], border: `1px solid ${priorityColor[rec.priority]}60` }}>
                        {rec.priority}
                      </span>
                      <span className="font-data text-xs text-lime">{rec.incident}</span>
                      <span className="font-sans text-xs text-muted">📍 {rec.zone}</span>
                    </div>
                    <h3 className="font-sans text-lg font-bold text-cream">{rec.action}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {/* Confidence ring */}
                    <svg width="52" height="52" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="22" fill="none" stroke="#1E3225" strokeWidth="4" />
                      <circle cx="26" cy="26" r="22" fill="none" stroke={priorityColor[rec.priority]} strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 22}`}
                        strokeDashoffset={`${2 * Math.PI * 22 * (1 - rec.confidence / 100)}`}
                        strokeLinecap="round" transform="rotate(-90 26 26)" />
                      <text x="26" y="30" textAnchor="middle" fill={priorityColor[rec.priority]} fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">{rec.confidence}%</text>
                    </svg>
                    <span className="font-data text-[10px] text-muted">Confidence</span>
                  </div>
                </div>

                <div className="bg-forest-elevated border border-border-forest-light rounded p-4 mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-3.5 w-3.5 text-accent-gold" />
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-accent-gold">AI Rationale</span>
                  </div>
                  <p className="font-sans text-sm text-muted leading-relaxed">{rec.rationale}</p>
                </div>

                <div className="flex items-center gap-3">
                  {s === "approved" ? (
                    <div className="px-5 py-2 bg-health-green/15 border border-health-green/50 rounded font-sans text-sm font-semibold text-health-green flex items-center gap-2">✓ Approved & Dispatched</div>
                  ) : s === "dismissed" ? (
                    <div className="px-5 py-2 bg-health-red/10 border border-health-red/40 rounded font-sans text-sm text-health-red flex items-center gap-2">✗ Dismissed</div>
                  ) : (
                    <>
                      <AnimatedCTA variant="primary" size="sm" className="px-6" onClick={() => setStatuses(s => ({ ...s, [rec.id]: "approved" }))}>✓ Approve Action</AnimatedCTA>
                      <AnimatedCTA variant="ghost" size="sm" className="opacity-60" onClick={() => setStatuses(s => ({ ...s, [rec.id]: "dismissed" }))}>✗ Dismiss</AnimatedCTA>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── OFFICER MANAGEMENT TAB ────────────────────────────────────────────────────
const OfficerManagementTab = () => {
  const officers = [
    { name: "Officer D. Jackson", badge: "092", zone: "Zone 4A",    status: "active",   tasks: 2, lat: 4 },
    { name: "Officer A. Smith",   badge: "114", zone: "Zone 2B",    status: "active",   tasks: 1, lat: 8 },
    { name: "Officer P. Sharma",  badge: "134", zone: "Zone 7C",    status: "en-route", tasks: 1, lat: 3 },
    { name: "Officer L. Mehta",   badge: "078", zone: "Zone 3A",    status: "active",   tasks: 3, lat: 2 },
    { name: "Officer R. Kumar",   badge: "021", zone: "Zone 1A",    status: "offline",  tasks: 0, lat: 0 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-12 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-3xl text-cream">Officer <em style={{ fontStyle: "italic", color: "#D4A84B" }}>Management</em></h1>
          <p className="font-sans text-sm text-muted mt-1">12 officers on duty · 3 available for dispatch</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-data text-xs text-muted">
            <div className="w-2 h-2 rounded-full bg-health-green" /> Active
            <div className="w-2 h-2 rounded-full bg-health-amber ml-3" /> En Route
            <div className="w-2 h-2 rounded-full bg-border-forest-light ml-3" /> Offline
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {officers.map((o, i) => {
          const statusColor = o.status === "active" ? "text-health-green" : o.status === "en-route" ? "text-health-amber" : "text-muted";
          const dotColor = o.status === "active" ? "bg-health-green" : o.status === "en-route" ? "bg-health-amber" : "bg-muted";

          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="bg-forest-card border border-border-forest-light rounded p-5 hover:border-accent-gold/40 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-accent-gold/15 border border-accent-gold/40 flex items-center justify-center text-accent-gold font-bold text-sm">
                    {o.name.split(" ").slice(-1)[0][0]}{o.name.split(" ").slice(-2)[0][0]}
                  </div>
                  <div>
                    <div className="font-sans text-sm font-semibold text-cream">{o.name}</div>
                    <div className="font-data text-[11px] text-lime mt-0.5">BADGE-{o.badge}</div>
                  </div>
                </div>
                <div className={cn("flex items-center gap-1.5", statusColor)}>
                  <div className={cn("w-2 h-2 rounded-full", dotColor, o.status === "active" && "animate-pulse")} />
                  <span className="font-sans text-xs capitalize">{o.status}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-muted">Zone</span>
                  <span className="text-cream">{o.zone}</span>
                </div>
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-muted">Active Tasks</span>
                  <span className="text-cream">{o.tasks}</span>
                </div>
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-muted">Workload</span>
                  <span className={o.lat >= 3 ? "text-health-red" : "text-health-green"}>{o.lat >= 3 ? "High" : o.lat >= 1 ? "Medium" : "Available"}</span>
                </div>
              </div>

              {/* Workload bar */}
              <div className="mb-4">
                <div className="w-full h-1.5 bg-forest-elevated rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((o.lat / 5) * 100, 100)}%`, background: o.lat >= 4 ? "#E05252" : o.lat >= 2 ? "#E8A838" : "#4CAF72" }} />
                </div>
              </div>

              {o.status !== "offline" && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AnimatedCTA variant="gold" size="sm" className="flex-1 text-[11px]">Assign Task</AnimatedCTA>
                  <AnimatedCTA variant="ghost" size="sm" className="flex-1 text-[11px]">Chat</AnimatedCTA>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── ANALYTICS TAB ─────────────────────────────────────────────────────────────
const AnalyticsTab = () => {
  const weekData = [
    { day: "Mon", aqi: 72, complaints: 8  },
    { day: "Tue", aqi: 85, complaints: 14 },
    { day: "Wed", aqi: 94, complaints: 19 },
    { day: "Thu", aqi: 78, complaints: 11 },
    { day: "Fri", aqi: 87, complaints: 16 },
    { day: "Sat", aqi: 101, complaints: 22 },
    { day: "Sun", aqi: 83, complaints: 12 },
  ];
  const maxAqi = Math.max(...weekData.map(d => d.aqi));

  const zoneBreakdown = [
    { zone: "Zone 4A", count: 23, pct: 48, color: "#E05252" },
    { zone: "Zone 2B", count: 12, pct: 25, color: "#E8A838" },
    { zone: "Zone 7C", count: 8,  pct: 17, color: "#C6E47A" },
    { zone: "Zone 1A", count: 5,  pct: 10, color: "#3DBFAD" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-12 overflow-y-auto">
      <h1 className="font-display text-3xl text-cream mb-8">Analytics <em style={{ fontStyle: "italic", color: "#D4A84B" }}>Overview</em></h1>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { label: "Avg Weekly AQI",     value: "85.7",  color: "#E8A838", sub: "+4% vs last week" },
          { label: "Total Complaints",    value: "102",   color: "#E05252", sub: "This month" },
          { label: "Resolved",           value: "91",    color: "#4CAF72", sub: "89% resolution rate" },
          { label: "Avg Response Time",  value: "23 min",color: "#3DBFAD", sub: "−5 min vs target" },
        ].map((k, i) => (
          <div key={i} className="bg-forest-card border border-border-forest-light rounded p-5">
            <div className="font-sans text-[11px] uppercase tracking-[0.15em] text-muted">{k.label}</div>
            <div className="font-data text-[36px] font-bold leading-none mt-2" style={{ color: k.color }}>{k.value}</div>
            <div className="font-sans text-xs text-muted mt-2">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar chart — AQI by day */}
        <div className="lg:col-span-2 bg-forest-card border border-border-forest-light rounded p-6">
          <h3 className="font-sans text-base font-semibold text-cream mb-6">Weekly AQI Trend</h3>
          <div className="flex items-end gap-3 h-40">
            {weekData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="font-data text-[10px] text-accent-gold">{d.aqi}</div>
                <motion.div className="w-full rounded-sm" initial={{ height: 0 }} whileInView={{ height: `${(d.aqi / maxAqi) * 120}px` }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}
                  style={{ background: d.aqi > 95 ? "#E05252" : d.aqi > 80 ? "#E8A838" : "#4CAF72", minHeight: "4px" }} />
                <div className="font-data text-[10px] text-muted">{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone breakdown */}
        <div className="bg-forest-card border border-border-forest-light rounded p-6">
          <h3 className="font-sans text-base font-semibold text-cream mb-6">Complaints by Zone</h3>
          <div className="space-y-4">
            {zoneBreakdown.map((z, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <span className="font-sans text-sm text-cream">{z.zone}</span>
                  <span className="font-data text-sm font-bold" style={{ color: z.color }}>{z.count}</span>
                </div>
                <div className="w-full h-2 bg-forest-elevated rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }} whileInView={{ width: `${z.pct}%` }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                    style={{ background: z.color, opacity: 0.85 }} />
                </div>
                <div className="font-data text-[10px] text-muted mt-0.5 text-right">{z.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export const OfficialDashboard = () => (
  <div className="min-h-screen bg-forest-primary font-sans pt-[72px]">
    <Sidebar />
    <div className="ml-[260px] min-h-screen">
      <Routes>
        <Route path="/"          element={<CommandOverview />} />
        <Route path="/ai"        element={<AIRecommendationsTab />} />
        <Route path="/officers"  element={<OfficerManagementTab />} />
        <Route path="/analytics" element={<AnalyticsTab />} />
        <Route path="*"          element={<div className="p-8 font-sans text-muted text-sm">Component under active development.</div>} />
      </Routes>
    </div>
  </div>
);
