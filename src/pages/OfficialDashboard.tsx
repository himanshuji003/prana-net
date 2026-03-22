import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, Map as MapIcon, Layers, Users, Cpu,
  Activity, PieChart, Search, X, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/shared/StatusPill";
import { AnimatedCTA } from "@/components/shared/AnimatedCTA";
import { assignIssue, getOrCreateDemoUser, listIssues, listUsers, type Issue, type User } from "@/lib/api";

type RecommendationStatus = "pending" | "approved" | "removed";

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
    <div className="fixed left-0 top-0 h-full w-65 bg-[#0F1C13] border-r border-border-forest-light z-40 pt-18">
      <nav className="px-2 space-y-0.5 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.name} to={item.path}
              className={cn("flex items-center gap-3 px-4 py-3 rounded font-sans text-[14px] transition-all duration-150 border-l-[3px]",
                isActive ? "bg-accent-gold/10 border-accent-gold text-accent-gold" : "border-transparent text-muted hover:bg-white/4 hover:text-cream"
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
const LiveFeed = ({ issues }: { issues: Issue[] }) => {
  const events = issues
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
    .slice(0, 8)
    .map((issue) => ({
      token: `TKN-${issue._id.slice(-6).toUpperCase()}`,
      text: `${issue.status.replace(/_/g, " ")} • ${issue.location?.city || "Unknown Zone"}`,
      time: new Date(issue.updatedAt || issue.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));

  const displayEvents = events.length > 0
    ? [...events, ...events]
    : [
        { token: "SYS", text: "No live issue activity yet", time: "--:--" },
        { token: "SYS", text: "No live issue activity yet", time: "--:--" },
      ];

  return (
    <div className="overflow-hidden h-32 relative">
      <div className="animate-feed-scroll flex flex-col gap-2.5">
        {displayEvents.map((e, i) => (
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
  const [issues, setIssues] = useState<Issue[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [officialId, setOfficialId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [layerVisibility, setLayerVisibility] = useState({ officers: true, complaints: true, superTrees: true });
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [recommendationStatusByIssue, setRecommendationStatusByIssue] = useState<Record<string, RecommendationStatus>>({});
  const embedSrc = "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d20366.907119904292!2d77.22196297614038!3d28.61683336618423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1773990601088!5m2!1sen!2sin";

  const loadData = async () => {
    try {
      setError(null);
      const official = await getOrCreateDemoUser("official");
      setOfficialId(official._id);

      const [issueData, users] = await Promise.all([listIssues(), listUsers()]);
      const officerUsers = users.filter((user) => user.role === "officer");
      if (officerUsers.length === 0) {
        const seededOfficer = await getOrCreateDemoUser("officer");
        setOfficers([seededOfficer]);
      } else {
        setOfficers(officerUsers);
      }

      const sortedIssues = [...issueData].sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setIssues(sortedIssues);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load command data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const complaints = issues.map((issue) => {
    const priority: "hazardous" | "moderate" | "good" =
      issue.priority === "high" ? "hazardous" : issue.priority === "medium" ? "moderate" : "good";
    const borderColor = issue.priority === "high" ? "border-l-health-red" : issue.priority === "medium" ? "border-l-health-amber" : "border-l-health-green";
    const createdAt = issue.createdAt ? new Date(issue.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "now";
    return {
      id: issue._id,
      token: `TKN-${issue._id.slice(-6).toUpperCase()}`,
      type: issue.title || issue.category || "Pollution Issue",
      zone: issue.location?.city || "Unknown Zone",
      time: createdAt,
      priority,
      borderColor,
    };
  });

  const filteredComplaints = complaints.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return item.token.toLowerCase().includes(q) || item.type.toLowerCase().includes(q) || item.zone.toLowerCase().includes(q);
  });

  const activeComplaints = issues.filter((issue) => ["pending", "assigned", "in_progress"].includes(issue.status)).length;
  const avgResponseMinutes = (() => {
    const completed = issues.filter((issue) => ["resolved", "closed"].includes(issue.status) && issue.createdAt && issue.updatedAt);
    if (completed.length === 0) return "n/a";
    const total = completed.reduce((sum, issue) => {
      const duration = new Date(issue.updatedAt || 0).getTime() - new Date(issue.createdAt || 0).getTime();
      return sum + Math.max(0, duration / 60000);
    }, 0);
    return `${Math.round(total / completed.length)} min`;
  })();

  const selectedIssue = issues.find((issue) => issue._id === selectedToken);
  const selectedRecommendationStatus = selectedIssue ? (recommendationStatusByIssue[selectedIssue._id] || "pending") : "pending";

  const handleAssign = async (issueId: string, officerId: string) => {
    try {
      setAssigning(issueId);
      await assignIssue(issueId, officerId, officialId);
      setActionMessage("Officer assigned successfully.");
      setTimeout(() => setActionMessage(null), 2000);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign issue.");
    } finally {
      setAssigning(null);
    }
  };

  const handleApproveRecommendation = () => {
    if (!selectedIssue) return;
    setRecommendationStatusByIssue((prev) => ({ ...prev, [selectedIssue._id]: "approved" }));
    setActionMessage("Recommendation approved.");
    setTimeout(() => setActionMessage(null), 2000);
  };

  const handleRemoveRecommendation = () => {
    if (!selectedIssue) return;
    setRecommendationStatusByIssue((prev) => ({ ...prev, [selectedIssue._id]: "removed" }));
    setActionMessage("Recommendation removed.");
    setTimeout(() => setActionMessage(null), 2000);
  };

  const handleSelectOfficer = (officerId: string) => {
    if (!selectedIssue) return;
    handleAssign(selectedIssue._id, officerId);
  };

  const handleResetAction = () => {
    if (!selectedIssue) return;
    setRecommendationStatusByIssue((prev) => ({ ...prev, [selectedIssue._id]: "pending" }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-72px)] overflow-hidden flex flex-col">
      {/* Stats strip */}
      <div className="flex h-12 w-full border-b border-border-forest-light bg-forest-secondary shrink-0">
        {[
          { label: "Active Complaints", value: String(activeComplaints), color: "text-health-red" },
          { label: "Officers Deployed", value: String(officers.length), color: "text-accent-gold" },
          { label: "Avg Response", value: avgResponseMinutes, color: "text-accent-teal" },
          { label: "Super Trees", value: layerVisibility.superTrees ? "Layer ON" : "Layer OFF", color: "text-lime" },
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
          <iframe
            title="Official Command Map"
            src={embedSrc}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute inset-0 bg-forest-primary/10 pointer-events-none" />
          <div className="absolute top-4 left-4 bg-forest-card/80 backdrop-blur border border-border-forest-light p-4 rounded z-10">
            <p className="font-sans text-xs font-semibold text-cream mb-3 uppercase tracking-wider">Layers</p>
            <div className="space-y-2 font-sans text-xs text-muted">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={layerVisibility.officers} onChange={(e) => setLayerVisibility((prev) => ({ ...prev, officers: e.target.checked }))} className="accent-accent-gold" /> Officers
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={layerVisibility.complaints} onChange={(e) => setLayerVisibility((prev) => ({ ...prev, complaints: e.target.checked }))} className="accent-accent-gold" /> Complaints
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={layerVisibility.superTrees} onChange={(e) => setLayerVisibility((prev) => ({ ...prev, superTrees: e.target.checked }))} className="accent-accent-gold" /> Super Trees
              </label>
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
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by token, type, zone..." className="bg-forest-elevated border border-border-forest-light rounded h-8 pl-8 pr-3 font-data text-xs text-lime outline-none focus:border-accent-gold transition-colors w-60" />
            </div>
          </div>
          {actionMessage && <div className="px-4 py-2 font-sans text-xs text-health-green border-b border-border-forest-light">{actionMessage}</div>}
          {error && <div className="px-4 py-3 font-sans text-xs text-health-red border-b border-health-red/40 bg-health-red/10 flex justify-between items-center"><span>{error}</span> <button onClick={() => setError(null)} className="text-health-red/60 hover:text-health-red">✕</button></div>}
          {isLoading && <div className="px-4 py-3 font-sans text-xs text-muted">Loading complaints...</div>}
          {!layerVisibility.complaints && <div className="px-4 py-3 font-sans text-xs text-muted">Complaints layer is hidden. Enable it from Layers to view queue items.</div>}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
            {layerVisibility.complaints && filteredComplaints.map((item, i) => (
              <div key={i} onClick={() => setSelectedToken(item.id)}
                className={cn("bg-forest-card border border-border-forest-light border-l-[3px] rounded p-4 hover:border-accent-gold/40 cursor-pointer group transition-all", item.borderColor)}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-data text-xs text-lime font-bold block">{item.token}</span>
                    <span className="font-sans text-[14px] text-cream font-semibold">{item.type}</span>
                  </div>
                  {officers.length > 0 && (
                    <AnimatedCTA
                      variant="gold"
                      size="sm"
                      className="h-7 px-3 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={!officialId}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedToken(item.id);
                      }}
                    >
                      Show Details
                    </AnimatedCTA>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted font-sans mb-3">
                  <span>📍 {item.zone}</span><span>🕒 {item.time}</span>
                </div>
                <StatusPill label={item.priority} level={item.priority} />
              </div>
            ))}
            {layerVisibility.complaints && filteredComplaints.length === 0 && !isLoading && !error && (
              <div className="font-sans text-xs text-muted px-2 py-4">No complaints match your search.</div>
            )}
          </div>
          <div className="border-t border-border-forest-light bg-forest-card p-4 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-health-green animate-pulse" />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-muted">Live Activity Feed</span>
            </div>
            <LiveFeed issues={issues} />
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedToken && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-forest-primary/95 backdrop-blur-sm flex items-center justify-center p-4 pt-24">
            <motion.div initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.96 }}
              className="bg-forest-secondary border border-border-forest max-w-225 w-full max-h-[85vh] rounded overflow-hidden flex flex-col relative">
              <div className="p-6 border-b border-border-forest-light flex justify-between items-center bg-forest-card">
                <div>
                  <span className="font-sans text-[10px] tracking-[0.2em] text-muted uppercase">Complaint ID</span>
                  <h2 className="font-data text-2xl font-bold text-lime mt-1">TKN-{selectedToken.slice(-6).toUpperCase()}</h2>
                </div>
                <button onClick={() => { setSelectedToken(null); setError(null); }} className="h-9 w-9 bg-forest-elevated rounded flex items-center justify-center text-muted hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {error && (
                <div className="px-6 py-3 font-sans text-xs text-health-red border-b border-health-red/40 bg-health-red/10 flex justify-between items-center">
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="text-health-red/60 hover:text-health-red">✕</button>
                </div>
              )}
              {actionMessage && (
                <div className="px-6 py-3 font-sans text-xs text-health-green border-b border-health-green/40 bg-health-green/10">
                  {actionMessage}
                </div>
              )}
              <div className="flex flex-1 overflow-hidden">
                <div className="w-[55%] p-6 border-r border-border-forest-light overflow-y-auto space-y-6">
                  <div>
                    <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted mb-3">Incident Description</h3>
                    <p className="font-sans text-sm text-cream leading-relaxed bg-forest-elevated p-4 rounded border border-border-forest-light">{selectedIssue?.description || "No description available."}</p>
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
                      {selectedRecommendationStatus === "pending" ? (
                        <>
                          <AnimatedCTA
                            variant="primary"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={handleApproveRecommendation}
                          >
                            ✓ Approve
                          </AnimatedCTA>
                          <AnimatedCTA
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-xs opacity-60"
                            onClick={handleRemoveRecommendation}
                          >
                            ✗ Remove
                          </AnimatedCTA>
                        </>
                      ) : (
                        <AnimatedCTA
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={handleResetAction}
                        >
                          Reset Action
                        </AnimatedCTA>
                      )}
                    </div>
                    {selectedRecommendationStatus === "approved" && (
                      <p className="mt-3 font-sans text-xs text-health-green">Approved and queued for execution.</p>
                    )}
                    {selectedRecommendationStatus === "removed" && (
                      <p className="mt-3 font-sans text-xs text-health-red">Recommendation removed from queue.</p>
                    )}
                  </div>
                  <div className="p-5 overflow-y-auto flex-1">
                    <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted mb-4">Assign Officer</h3>
                    {selectedIssue?.assignedTo && (
                      <div className="mb-4 p-3 bg-health-green/10 border border-health-green/30 rounded">
                        <p className="font-sans text-[10px] text-health-green uppercase font-semibold mb-2">✓ Currently Assigned</p>
                        {typeof selectedIssue.assignedTo === "object" ? (
                          <>
                            <div className="font-sans text-sm font-semibold text-cream">{(selectedIssue.assignedTo as any).name}</div>
                            <div className="font-data text-[10px] text-muted">{((selectedIssue.assignedTo as any).department || "field").toUpperCase()}</div>
                          </>
                        ) : (
                          (() => {
                            const assignedOfficer = officers.find(o => o._id === selectedIssue.assignedTo);
                            return assignedOfficer ? (
                              <>
                                <div className="font-sans text-sm font-semibold text-cream">{assignedOfficer.name}</div>
                                <div className="font-data text-[10px] text-muted">{(assignedOfficer.department || "field").toUpperCase()}</div>
                              </>
                            ) : (
                              <div className="font-sans text-xs text-muted">Assigned: {typeof selectedIssue.assignedTo === "string" ? selectedIssue.assignedTo.slice(-6) : "Unknown"}</div>
                            );
                          })()
                        )}
                      </div>
                    )}
                    <div>
                      <p className="font-sans text-[10px] text-muted uppercase font-semibold mb-3">Reassign to Officer</p>
                      {officers.map((o, i) => {
                        const isAssigned = selectedIssue?.assignedTo && 
                          (typeof selectedIssue.assignedTo === "object" ? 
                            (selectedIssue.assignedTo as any)._id === o._id : 
                            selectedIssue.assignedTo === o._id);
                        return (
                          <div key={i} className={cn("flex items-center gap-3 p-3 border rounded mb-2 transition-all", 
                            isAssigned ? "border-health-green/50 bg-health-green/5" : "border-border-forest-light hover:bg-forest-elevated cursor-pointer")}>
                            <div className="h-9 w-9 rounded-full bg-forest-primary flex items-center justify-center text-xs font-bold border border-white/10 text-lime shrink-0">{o.name.slice(0, 1)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-sans text-sm font-semibold text-cream">{o.name}</div>
                              <div className="font-data text-[10px] text-muted">{(o.department || "field").toUpperCase()}</div>
                            </div>
                            <AnimatedCTA
                              variant={isAssigned ? "ghost" : "gold"}
                              size="sm"
                              className="h-8 px-3 text-xs"
                              disabled={!!(!selectedIssue || (assigning === selectedIssue._id) || !officialId || isAssigned)}
                              onClick={() => handleSelectOfficer(o._id)}
                            >
                              {assigning === selectedIssue?._id ? "Assigning..." : isAssigned ? "Assigned" : "Assign"}
                            </AnimatedCTA>
                          </div>
                        );
                      })}
                    </div>
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
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, RecommendationStatus>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setError(null);
        const data = await listIssues();
        if (!mounted) return;
        const sorted = [...data].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setIssues(sorted);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load AI recommendations.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const recs = issues
    .filter((issue) => (statuses[issue._id] || "pending") !== "removed")
    .slice(0, 12)
    .map((issue) => {
      const severity = issue.priority === "high" ? "critical" : issue.priority === "medium" ? "high" : "moderate";
      const title = (issue.title || issue.category || "Pollution issue").toLowerCase();
      const action = title.includes("smoke")
        ? "Dispatch rapid air scrubber unit"
        : title.includes("waste")
          ? "Route sanitation enforcement crew"
          : issue.priority === "high"
            ? "Deploy emergency mitigation task force"
            : "Schedule field inspection and corrective action";
      const confidence = issue.priority === "high" ? 94 : issue.priority === "medium" ? 84 : 72;
      const currentStatus = issue.status.replace(/_/g, " ");
      return {
        id: issue._id,
        priority: severity,
        incident: `TKN-${issue._id.slice(-6).toUpperCase()}`,
        zone: issue.location?.city || "Unknown Zone",
        action,
        rationale: `Status is ${currentStatus}. ${issue.description || "Issue details require field verification."}`,
        confidence,
      };
    });

  const removeRecommendation = (id: string) => {
    setStatuses((s) => ({ ...s, [id]: "removed" }));
  };

  const priorityColor: Record<string, string> = { critical: "#E05252", high: "#E8A838", moderate: "#C6E47A" };
  const priorityBorder: Record<string, string> = { critical: "border-l-health-red", high: "border-l-health-amber", moderate: "border-l-lime" };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-12 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 bg-accent-gold/20 border border-accent-gold rounded flex items-center justify-center shrink-0">
          <Cpu className="h-6 w-6 text-accent-gold" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-cream">AI <em style={{ fontStyle: "italic", color: "#D4A84B" }}>Recommendations</em></h1>
          <p className="font-sans text-sm text-muted mt-0.5">{recs.filter(r => (statuses[r.id] || "pending") === "pending").length} pending actions · Live issue feed</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-accent-gold/10 border border-accent-gold/30 px-4 py-2 rounded">
          <div className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
          <span className="font-data text-xs text-accent-gold uppercase tracking-wider">AI Engine Active</span>
        </div>
      </div>

      {/* Rec cards */}
      {loading && <div className="font-sans text-sm text-muted">Loading recommendations...</div>}
      {error && <div className="font-sans text-sm text-health-red mb-4">{error}</div>}
      <div className="space-y-4">
        {recs.map((rec) => {
          const s = statuses[rec.id] || "pending";
          return (
            <div key={rec.id} className={cn("bg-forest-card border border-border-forest-light rounded overflow-hidden border-l-4", priorityBorder[rec.priority])}>
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
                    <>
                      <div className="px-5 py-2 bg-health-green/15 border border-health-green/50 rounded font-sans text-sm font-semibold text-health-green flex items-center gap-2">✓ Approved & Dispatched</div>
                      <AnimatedCTA variant="ghost" size="sm" onClick={() => removeRecommendation(rec.id)}>Remove</AnimatedCTA>
                    </>
                  ) : s === "removed" ? (
                    <div className="px-5 py-2 bg-health-red/10 border border-health-red/40 rounded font-sans text-sm text-health-red flex items-center gap-2">✗ Removed</div>
                  ) : (
                    <>
                      <AnimatedCTA variant="primary" size="sm" className="px-6" onClick={() => setStatuses(s => ({ ...s, [rec.id]: "approved" }))}>✓ Approve Action</AnimatedCTA>
                      <AnimatedCTA variant="ghost" size="sm" className="opacity-60" onClick={() => removeRecommendation(rec.id)}>✗ Remove</AnimatedCTA>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {!loading && !error && recs.length === 0 && (
          <div className="font-sans text-sm text-muted">No active recommendations at the moment.</div>
        )}
      </div>
    </motion.div>
  );
};

// ─── OFFICER MANAGEMENT TAB ────────────────────────────────────────────────────
const OfficerManagementTab = () => {
  const [actionMessage, setActionMessage] = useState<string>("");
  const [officers, setOfficers] = useState<User[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [officialId, setOfficialId] = useState<string>("");
  const [assigningOfficerId, setAssigningOfficerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadOfficerData = async () => {
      try {
        const official = await getOrCreateDemoUser("official");
        if (!mounted) return;
        setOfficialId(official._id);

        const [users, issueData] = await Promise.all([listUsers(), listIssues()]);
        if (!mounted) return;
        setOfficers(users.filter((user) => user.role === "officer"));
        setIssues(issueData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOfficerData();
    return () => {
      mounted = false;
    };
  }, []);

  const getNextAssignableIssue = () => {
    const priorityRank: Record<Issue["priority"], number> = {
      high: 0,
      medium: 1,
      low: 2,
    };

    const pendingUnassigned = issues
      .filter((issue) => issue.status === "pending" && !issue.assignedTo)
      .sort((a, b) => {
        const byPriority = priorityRank[a.priority] - priorityRank[b.priority];
        if (byPriority !== 0) return byPriority;
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      });

    return pendingUnassigned[0];
  };

  const handleAssignTask = async (officer: User) => {
    const nextIssue = getNextAssignableIssue();
    if (!nextIssue) {
      setActionMessage("No pending unassigned issues available right now.");
      setTimeout(() => setActionMessage(""), 2500);
      return;
    }

    if (!officialId) {
      setActionMessage("Official identity not ready. Try again in a moment.");
      setTimeout(() => setActionMessage(""), 2500);
      return;
    }

    try {
      setAssigningOfficerId(officer._id);
      await assignIssue(nextIssue._id, officer._id, officialId);
      setActionMessage(`Assigned ${`TKN-${nextIssue._id.slice(-6).toUpperCase()}`} to ${officer.name}.`);
      const updatedIssues = await listIssues();
      setIssues(updatedIssues);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Failed to assign task.");
    } finally {
      setAssigningOfficerId(null);
      setTimeout(() => setActionMessage(""), 2800);
    }
  };

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

      {actionMessage && (
        <div className="mb-5 bg-forest-card border border-accent-gold/40 rounded px-4 py-3 font-sans text-sm text-accent-gold">
          {actionMessage}
        </div>
      )}

      {loading && (
        <div className="mb-5 bg-forest-card border border-border-forest-light rounded px-4 py-3 font-sans text-sm text-muted">
          Loading officers...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {officers.map((o, i) => {
          const officerTasks = issues.filter((issue) => {
            if (!issue.assignedTo) return false;
            if (typeof issue.assignedTo === "string") return issue.assignedTo === o._id;
            return issue.assignedTo._id === o._id;
          });
          const activeTaskCount = officerTasks.filter((issue) => issue.status === "assigned" || issue.status === "in_progress").length;
          const status = activeTaskCount > 0 ? "active" : "offline";
          const statusColor = status === "active" ? "text-health-green" : "text-muted";
          const dotColor = status === "active" ? "bg-health-green" : "bg-muted";
          const workloadLevel = activeTaskCount >= 3 ? "High" : activeTaskCount >= 1 ? "Medium" : "Available";
          const workloadColor = activeTaskCount >= 3 ? "text-health-red" : "text-health-green";
          const barColor = activeTaskCount >= 4 ? "#E05252" : activeTaskCount >= 2 ? "#E8A838" : "#4CAF72";
          const initials = o.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();

          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="bg-forest-card border border-border-forest-light rounded p-5 hover:border-accent-gold/40 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-accent-gold/15 border border-accent-gold/40 flex items-center justify-center text-accent-gold font-bold text-sm">
                    {initials || "OF"}
                  </div>
                  <div>
                    <div className="font-sans text-sm font-semibold text-cream">{o.name}</div>
                    <div className="font-data text-[11px] text-lime mt-0.5">{(o.department || "field-ops").toUpperCase()}</div>
                  </div>
                </div>
                <div className={cn("flex items-center gap-1.5", statusColor)}>
                  <div className={cn("w-2 h-2 rounded-full", dotColor, status === "active" && "animate-pulse")} />
                  <span className="font-sans text-xs capitalize">{status}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-muted">Zone</span>
                  <span className="text-cream">{o.department || "N/A"}</span>
                </div>
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-muted">Active Tasks</span>
                  <span className="text-cream">{activeTaskCount}</span>
                </div>
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-muted">Workload</span>
                  <span className={workloadColor}>{workloadLevel}</span>
                </div>
              </div>

              {/* Workload bar */}
              <div className="mb-4">
                <div className="w-full h-1.5 bg-forest-elevated rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((activeTaskCount / 5) * 100, 100)}%`, background: barColor }} />
                </div>
              </div>

              {status !== "offline" && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AnimatedCTA
                    variant="gold"
                    size="sm"
                    className="flex-1 text-[11px]"
                    disabled={loading || assigningOfficerId === o._id || !officialId}
                    onClick={() => handleAssignTask(o)}
                  >
                    {assigningOfficerId === o._id ? "Assigning..." : "Assign Task"}
                  </AnimatedCTA>
                  <AnimatedCTA
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-[11px]"
                    onClick={() => {
                      setActionMessage(`Opened command channel with ${o.name}.`);
                      setTimeout(() => setActionMessage(""), 2200);
                    }}
                  >
                    Chat
                  </AnimatedCTA>
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
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setError(null);
        const data = await listIssues();
        if (mounted) setIssues(data);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const key = d.toDateString();
    const dayIssues = issues.filter((issue) => new Date(issue.createdAt || 0).toDateString() === key);
    const dayResolved = dayIssues.filter((issue) => issue.status === "resolved" || issue.status === "closed").length;
    return {
      day: dayLabels[d.getDay()],
      complaints: dayIssues.length,
      resolved: dayResolved,
    };
  });

  const maxComplaints = Math.max(1, ...weekData.map((d) => d.complaints));
  const totalComplaints = issues.length;
  const resolvedCount = issues.filter((issue) => issue.status === "resolved" || issue.status === "closed").length;
  const activeCount = issues.filter((issue) => issue.status === "pending" || issue.status === "assigned" || issue.status === "in_progress").length;
  const resolutionRate = totalComplaints === 0 ? 0 : Math.round((resolvedCount / totalComplaints) * 100);

  const avgResponseMinutes = (() => {
    const completed = issues.filter((issue) => (issue.status === "resolved" || issue.status === "closed") && issue.createdAt && issue.updatedAt);
    if (completed.length === 0) return "n/a";
    const totalMinutes = completed.reduce((sum, issue) => {
      const diff = new Date(issue.updatedAt || 0).getTime() - new Date(issue.createdAt || 0).getTime();
      return sum + Math.max(0, diff / 60000);
    }, 0);
    return `${Math.round(totalMinutes / completed.length)} min`;
  })();

  const zoneCounts = issues.reduce<Record<string, number>>((acc, issue) => {
    const zone = issue.location?.city || "Unknown Zone";
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});

  const palette = ["#E05252", "#E8A838", "#C6E47A", "#3DBFAD", "#9DB4FF"];
  const zoneBreakdown = Object.entries(zoneCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([zone, count], idx) => ({
      zone,
      count,
      pct: totalComplaints === 0 ? 0 : Math.round((count / totalComplaints) * 100),
      color: palette[idx % palette.length],
    }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-12 overflow-y-auto">
      <h1 className="font-display text-3xl text-cream mb-8">Analytics <em style={{ fontStyle: "italic", color: "#D4A84B" }}>Overview</em></h1>

      {loading && <div className="font-sans text-sm text-muted mb-4">Loading analytics...</div>}
      {error && <div className="font-sans text-sm text-health-red mb-4">{error}</div>}

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Complaints", value: String(totalComplaints), color: "#E05252", sub: "All recorded issues" },
          { label: "Active Cases", value: String(activeCount), color: "#E8A838", sub: "Pending, assigned, in progress" },
          { label: "Resolved", value: String(resolvedCount), color: "#4CAF72", sub: `${resolutionRate}% resolution rate` },
          { label: "Avg Response Time", value: avgResponseMinutes, color: "#3DBFAD", sub: "Based on completed issues" },
        ].map((k, i) => (
          <div key={i} className="bg-forest-card border border-border-forest-light rounded p-5">
            <div className="font-sans text-[11px] uppercase tracking-[0.15em] text-muted">{k.label}</div>
            <div className="font-data text-[36px] font-bold leading-none mt-2" style={{ color: k.color }}>{k.value}</div>
            <div className="font-sans text-xs text-muted mt-2">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar chart — complaints by day */}
        <div className="lg:col-span-2 bg-forest-card border border-border-forest-light rounded p-6">
          <h3 className="font-sans text-base font-semibold text-cream mb-6">Weekly Complaint Volume</h3>
          <div className="flex items-end gap-3 h-40">
            {weekData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="font-data text-[10px] text-accent-gold">{d.complaints}</div>
                <motion.div className="w-full rounded-sm" initial={{ height: 0 }} whileInView={{ height: `${(d.complaints / maxComplaints) * 120}px` }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}
                  style={{ background: d.complaints >= 6 ? "#E05252" : d.complaints >= 3 ? "#E8A838" : "#4CAF72", minHeight: "4px" }} />
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
            {!loading && !error && zoneBreakdown.length === 0 && (
              <div className="font-sans text-sm text-muted">No zone distribution available yet.</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── MAP TAB ──────────────────────────────────────────────────────────────────
const HeatmapTab = () => {
  const mapLink = "https://maps.app.goo.gl/2z7hszL1FxzcBYK29";
  const embedSrc = "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d20366.907119904292!2d77.22196297614038!3d28.61683336618423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1773990601088!5m2!1sen!2sin";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-12 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-cream">Live <em style={{ fontStyle: "italic", color: "#D4A84B" }}>Map</em></h1>
          <p className="font-sans text-sm text-muted mt-1">Location intelligence and active complaint zones.</p>
        </div>
        <a
          href={mapLink}
          target="_blank"
          rel="noreferrer"
          className="font-data text-xs uppercase tracking-wider text-accent-gold border border-accent-gold/40 bg-accent-gold/10 px-3 py-2 rounded hover:bg-accent-gold/20 transition-colors"
        >
          Open in Google Maps
        </a>
      </div>

      <div className="bg-forest-card border border-border-forest-light rounded overflow-hidden">
        <iframe
          title="Prana Net Map"
          src={embedSrc}
          className="w-full h-[70vh] min-h-105"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </motion.div>
  );
};

const SensorNetworkTab = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await listIssues();
        if (mounted) setIssues(data);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const total = issues.length;
  const active = issues.filter((issue) => issue.status === "assigned" || issue.status === "in_progress").length;
  const resolved = issues.filter((issue) => issue.status === "resolved" || issue.status === "closed").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-12 overflow-y-auto">
      <h1 className="font-display text-3xl text-cream mb-2">Sensor <em style={{ fontStyle: "italic", color: "#D4A84B" }}>Network</em></h1>
      <p className="font-sans text-sm text-muted mb-8">Operational health and incident load derived from live issue traffic.</p>

      {loading ? (
        <div className="font-sans text-sm text-muted">Loading sensor telemetry...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[{ label: "Total Incidents", value: String(total), color: "#D4A84B" }, { label: "Active Response", value: String(active), color: "#E8A838" }, { label: "Resolved", value: String(resolved), color: "#4CAF72" }].map((item) => (
            <div key={item.label} className="bg-forest-card border border-border-forest-light rounded p-5">
              <div className="font-sans text-xs uppercase tracking-wider text-muted">{item.label}</div>
              <div className="font-data text-4xl font-bold mt-2" style={{ color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-forest-card border border-border-forest-light rounded p-5">
        <h3 className="font-sans text-base font-semibold text-cream mb-4">Node Status</h3>
        <div className="space-y-3">
          {["ST-001 North Corridor", "ST-002 Industrial Belt", "ST-003 River Side", "ST-004 Downtown Hub"].map((node, idx) => (
            <div key={node} className="flex items-center justify-between border border-border-forest-light rounded px-4 py-3">
              <span className="font-sans text-sm text-cream">{node}</span>
              <span className={cn("font-data text-xs uppercase tracking-wider", idx === 1 ? "text-health-amber" : "text-health-green")}>{idx === 1 ? "Needs Calibration" : "Operational"}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export const OfficialDashboard = () => (
  <div className="min-h-screen bg-forest-primary font-sans pt-18">
    <Sidebar />
    <div className="ml-65 min-h-screen">
      <Routes>
        <Route path="/"          element={<CommandOverview />} />
        <Route path="/queue"     element={<CommandOverview />} />
        <Route path="/ai"        element={<AIRecommendationsTab />} />
        <Route path="/officers"  element={<OfficerManagementTab />} />
        <Route path="/sensors"   element={<SensorNetworkTab />} />
        <Route path="/analytics" element={<AnalyticsTab />} />
        <Route path="/map"       element={<HeatmapTab />} />
        <Route path="*"          element={<CommandOverview />} />
      </Routes>
    </div>
  </div>
);
