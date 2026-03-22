import { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Map as MapIcon, ClipboardCheck, MessageSquare,
  User, Upload, CheckCircle2, Navigation, Send, CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/shared/StatusPill";
import { AnimatedCTA } from "@/components/shared/AnimatedCTA";
import { createIssueUpdate, getOrCreateDemoUser, listIssues, listUsers, updateIssueStatus, type Issue, type User as ApiUser } from "@/lib/api";

// ─── Bottom Nav ────────────────────────────────────────────────────────────────
const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { name: "Home",   path: "/officer",         icon: Home },
    { name: "Map",    path: "/officer/map",      icon: MapIcon },
    { name: "Tasks",  path: "/officer/tasks",    icon: ClipboardCheck },
    { name: "Chat",   path: "/officer/messages", icon: MessageSquare, badge: 1 },
    { name: "Me",     path: "/officer/profile",  icon: User },
  ];
  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-[#0D1A12] border-t border-border-forest-light z-50 flex items-center justify-around px-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link key={item.name} to={item.path}
            className={cn("flex flex-col items-center justify-center w-16 h-full relative transition-colors", isActive ? "text-lime" : "text-muted hover:text-cream")}>
            <Icon className="h-5 w-5 mb-1" />
            <span className="font-sans text-[10px] uppercase font-semibold">{item.name}</span>
            {item.badge && <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-health-red flex items-center justify-center font-data text-[9px] text-white font-bold">{item.badge}</div>}
          </Link>
        );
      })}
    </div>
  );
};

// ─── Mobile Header ─────────────────────────────────────────────────────────────
const MobileHeader = ({ title, officerName }: { title?: string; officerName?: string }) => (
  <header className="h-14 bg-forest-secondary flex items-center justify-between px-4 border-b border-border-forest-light sticky top-18 z-40">
    <div className="flex items-center gap-1">
      <span className="font-display italic text-cream text-lg">P</span>
      <span className="h-1 w-1 bg-lime rounded-full" />
      <span className="font-display italic text-cream text-lg">N</span>
    </div>
    {title && <span className="font-sans text-sm font-semibold text-muted uppercase tracking-wider">{title}</span>}
    <div className="flex items-center gap-2">
      <span className="font-sans text-xs font-semibold text-cream">{officerName || "Officer"}</span>
      <div className="h-2 w-2 rounded-full bg-health-green animate-pulse" />
    </div>
  </header>
);

const mapLink = "https://maps.app.goo.gl/2z7hszL1FxzcBYK29";
const mapEmbedSrc = "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d20366.907119904292!2d77.22196297614038!3d28.61683336618423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1773990601088!5m2!1sen!2sin";

// ─── ACTIVE TASK TAB ───────────────────────────────────────────────────────────
const ActiveTaskTab = ({ officerName, officerId }: { officerName?: string; officerId?: string }) => {
  const [taskState, setTaskState] = useState(0); // 0-4
  const [currentTask, setCurrentTask] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const loadFirstTask = async () => {
      if (!officerId) {
        setLoading(false);
        return;
      }
      try {
        setError(null);
        const issues = await listIssues();
        const assigned = issues.filter((issue) => {
          if (!issue.assignedTo) return false;
          if (issue.status === "resolved" || issue.status === "closed") return false;
          if (typeof issue.assignedTo === "string") return issue.assignedTo === officerId;
          return issue.assignedTo._id === officerId;
        });
        if (assigned.length > 0) {
          setCurrentTask(assigned[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load task");
      } finally {
        setLoading(false);
      }
    };
    loadFirstTask();
  }, [officerId]);

  const handleMarkResolved = async () => {
    if (!currentTask) return;
    try {
      setResolving(true);
      await updateIssueStatus(currentTask._id, "resolved");
      if (officerId) {
        await createIssueUpdate({
          issueId: currentTask._id,
          userId: officerId,
          message: "Task marked as resolved",
          statusUpdate: "resolved",
        });
      }
      setTaskState(4); // Show resolved screen
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark task as resolved");
    } finally {
      setResolving(false);
    }
  };

  const handleViewNextTask = async () => {
    try {
      setLoading(true);
      setResolving(false);
      setTaskState(0);
      const issues = await listIssues();
      const assigned = issues.filter((issue) => {
        if (!issue.assignedTo) return false;
        if (issue.status === "resolved" || issue.status === "closed") return false;
        if (typeof issue.assignedTo === "string") return issue.assignedTo === officerId;
        return issue.assignedTo._id === officerId;
      });
      if (assigned.length > 0) {
        setCurrentTask(assigned[0]);
      } else {
        setCurrentTask(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load next task");
    } finally {
      setLoading(false);
      setResolving(false);
    }
  };

  const steps = [
    { label: "Accept Task",      bg: "bg-health-green text-forest-primary" },
    { label: "Start Inspection", bg: "bg-health-amber text-forest-primary" },
    { label: "Action Taken",     bg: "bg-health-green text-forest-primary" },
    { label: "Mark Resolved",    bg: "bg-accent-teal text-forest-primary" },
  ];

  if (loading) {
    return (
      <div className="pb-24">
        <MobileHeader title="Active Task" officerName={officerName} />
        <div className="p-4 font-sans text-sm text-muted">Loading task...</div>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="pb-24">
        <MobileHeader title="Active Task" officerName={officerName} />
        <div className="p-4 flex flex-col items-center justify-center text-center py-20">
          <div className="h-16 w-16 rounded-full bg-health-green/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-health-green" />
          </div>
          <h2 className="font-display text-2xl text-cream mb-2">All Set!</h2>
          <p className="font-sans text-muted text-sm">No active tasks at the moment. Great work!</p>
        </div>
      </div>
    );
  }

  const token = `TKN-${currentTask._id.slice(-6).toUpperCase()}`;
  const title = currentTask.title || currentTask.category || "Assigned Issue";
  const location = [currentTask.location?.address, currentTask.location?.city].filter(Boolean).join(", ") || "Location not provided";

  return (
    <div className="pb-24">
      <MobileHeader title="Active Task" officerName={officerName} />

      <AnimatePresence>
        {taskState < 4 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="w-full bg-health-red/10 border-l-4 border-health-red border-y border-y-border-forest flex items-start p-4 gap-3 relative overflow-hidden">
            {taskState === 0 && <div className="absolute left-0 top-0 h-full w-1 bg-health-red animate-pulse" />}
            <div className="flex-1">
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-health-red">⚡ New Assignment</span>
              <div className="font-data text-xl text-health-red font-bold mt-1">{token}</div>
              <p className="font-sans text-sm text-cream mt-1">{title}</p>
              <div className="flex items-center gap-2 mt-2 font-sans text-xs text-muted">
                <Navigation className="h-3 w-3" /> {location}
              </div>
            </div>
            <div className="text-right">
              <StatusPill label={currentTask.priority === "high" ? "High" : "Medium"} level={currentTask.priority === "high" ? "hazardous" : "moderate"} />
              <p className="font-data text-[10px] text-muted mt-2">{new Date(currentTask.createdAt || 0).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="m-4 p-3 bg-health-red/10 border border-health-red/40 rounded font-sans text-xs text-health-red flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-health-red/60 hover:text-health-red">✕</button>
        </div>
      )}

      {taskState < 4 ? (
        <motion.div layout className="m-4 bg-forest-card border border-border-forest-light rounded p-5">
          <p className="font-sans text-[15px] text-muted leading-relaxed mb-4">
            {currentTask.description || "Task details and instructions"}
          </p>
          <div className="bg-health-green/10 border border-health-green/30 text-lime p-3 rounded font-sans text-xs flex gap-2 mb-6 items-start">
            <span className="shrink-0 mt-0.5 animate-pulse">⚡</span>
            <span><b>Category:</b> {currentTask.category || "General"} • <b>Priority:</b> {currentTask.priority}</span>
          </div>

          {/* Sequential steps with vertical timeline line */}
          <div className="relative pl-6 space-y-3">
            <div className="absolute left-2.75 top-3 bottom-3 w-px border-l-2 border-dashed border-border-forest-light" />
            {steps.map((btn, i) => {
              if (i > taskState) return null;
              const isActive = i === taskState;
              const isDone = i < taskState;
              const shouldDisable = i === steps.length - 1 && resolving; // Disable when resolving
              return (
                <div key={i} className="relative flex items-center gap-3">
                  {/* Timeline dot */}
                  <div className={cn("absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center z-10 border-2",
                    isDone ? "bg-health-green border-health-green text-forest-primary" : isActive ? "bg-accent-teal border-accent-teal text-forest-primary" : "bg-forest-elevated border-border-forest-light"
                  )}>
                    {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="font-data text-[10px] font-bold">{i+1}</span>}
                  </div>
                  <motion.button layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      if (isActive && i === steps.length - 1) {
                        handleMarkResolved();
                      } else if (isActive) {
                        setTaskState(s => s + 1);
                      }
                    }}
                    disabled={isDone || shouldDisable}
                    className={cn("flex-1 h-12 rounded font-sans text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200",
                      isDone ? "bg-forest-elevated text-muted/50 border border-border-forest-light line-through" : isActive ? btn.bg : "bg-forest-elevated text-muted border border-border-forest-light"
                    )}>
                    {isDone ? <><CheckCircle2 className="h-4 w-4" /> Completed</> : shouldDisable ? "Resolving..." : btn.label}
                  </motion.button>
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {taskState >= 2 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-8 border-t border-border-forest-light pt-6 overflow-hidden">
                <h4 className="font-sans text-sm font-semibold text-cream uppercase tracking-wider mb-4">Evidence & Field Notes</h4>
                <textarea rows={3} placeholder="Enter field observations here..." className="w-full bg-forest-elevated border border-border-forest-light p-3 rounded text-sm text-cream placeholder-muted outline-none focus:border-lime transition-colors mb-4 resize-none" />
                <div className="border-2 border-dashed border-border-forest-light rounded h-24 flex flex-col items-center justify-center text-muted">
                  <Upload className="h-5 w-5 mb-1" />
                  <span className="text-xs">Tap to capture photo/video</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="m-4 flex flex-col items-center justify-center p-8 text-center bg-health-green/10 border border-health-green/30 rounded py-16">
          <div className="h-20 w-20 rounded-full bg-health-green flex items-center justify-center text-forest-primary mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="font-display text-3xl text-health-green mb-2">Issue Resolved</h2>
          <p className="font-sans text-sm text-cream mb-8">{token} closed. Report sent to Command.</p>
          <AnimatedCTA variant="primary" className="w-full" onClick={handleViewNextTask} disabled={loading}>
            {loading ? "Loading..." : "View Next Assignment"}
          </AnimatedCTA>
        </motion.div>
      )}
    </div>
  );
};

const OfficerTasksTab = ({ officer }: { officer: ApiUser | null }) => {
  const [tasks, setTasks] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadTasks = async () => {
    if (!officer) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const issues = await listIssues();
      const assigned = issues.filter((issue) => {
        if (!issue.assignedTo) return false;
        if (issue.status === "resolved" || issue.status === "closed") return false;
        if (typeof issue.assignedTo === "string") return issue.assignedTo === officer._id;
        return issue.assignedTo._id === officer._id;
      });
      const sorted = [...assigned].sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setTasks(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load officer tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [officer?._id]);

  const moveStatus = async (issue: Issue, nextStatus: Issue["status"]) => {
    try {
      setUpdatingId(issue._id);
      await updateIssueStatus(issue._id, nextStatus);
      if (officer?._id) {
        await createIssueUpdate({
          issueId: issue._id,
          userId: officer._id,
          message: `Status changed to ${nextStatus.replace(/_/g, " ")}`,
          statusUpdate: nextStatus,
        });
      }
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusLabel: Record<Issue["status"], string> = {
    pending: "Pending",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
  };

  const statusPill: Record<Issue["status"], "info" | "moderate" | "good"> = {
    pending: "info",
    assigned: "moderate",
    in_progress: "moderate",
    resolved: "good",
    closed: "good",
  };

  return (
    <div className="pb-24">
      <MobileHeader title="Tasks" officerName={officer?.name} />
      <div className="p-4 space-y-4">
        {!officer && <div className="font-sans text-sm text-muted">Loading officer profile...</div>}
        {loading && <div className="font-sans text-sm text-muted">Loading assigned tasks...</div>}
        {error && <div className="font-sans text-sm text-health-red">{error}</div>}
        {!loading && !error && tasks.length === 0 && (
          <div className="bg-forest-card border border-border-forest-light rounded p-5 font-sans text-sm text-muted">
            No tasks assigned yet. Ask command center to assign an issue.
          </div>
        )}

        {tasks.map((task) => {
          const token = `TKN-${task._id.slice(-6).toUpperCase()}`;
          const location = [task.location?.address, task.location?.city].filter(Boolean).join(", ") || "Location not provided";
          const canStart = task.status === "assigned";
          const canResolve = task.status === "in_progress";

          return (
            <div key={task._id} className="bg-forest-card border border-border-forest-light rounded p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-data text-xs text-lime font-bold">{token}</div>
                  <h3 className="font-sans text-base text-cream font-semibold mt-1">{task.title || task.category || "Assigned Issue"}</h3>
                  <p className="font-sans text-xs text-muted mt-1">{location}</p>
                </div>
                <StatusPill label={statusLabel[task.status]} level={statusPill[task.status]} />
              </div>

              <p className="font-sans text-sm text-muted mt-3">{task.description || "No description provided."}</p>

              <div className="mt-4 flex gap-2">
                <AnimatedCTA
                  variant="teal"
                  size="sm"
                  className="flex-1"
                  disabled={!canStart || updatingId === task._id}
                  onClick={() => moveStatus(task, "in_progress")}
                >
                  {updatingId === task._id && canStart ? "Updating..." : "Start"}
                </AnimatedCTA>
                <AnimatedCTA
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  disabled={!canResolve || updatingId === task._id}
                  onClick={() => moveStatus(task, "resolved")}
                >
                  {updatingId === task._id && canResolve ? "Updating..." : "Mark Resolved"}
                </AnimatedCTA>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── MAP TAB ──────────────────────────────────────────────────────────────────
const OfficerMapTab = () => (
  <div className="pb-24 h-[calc(100vh-72px)] flex flex-col">
    <MobileHeader title="Map" />
    <div className="p-4 flex-1 flex flex-col gap-3 min-h-0">
      <div className="flex items-center justify-between">
        <p className="font-sans text-xs text-muted uppercase tracking-wider">Zone 4A Live Map</p>
        <a
          href={mapLink}
          target="_blank"
          rel="noreferrer"
          className="font-data text-[10px] uppercase tracking-wider text-accent-gold border border-accent-gold/40 bg-accent-gold/10 px-2.5 py-1.5 rounded"
        >
          Open Maps
        </a>
      </div>
      <div className="flex-1 rounded border border-border-forest-light overflow-hidden min-h-105 bg-forest-card">
        <iframe
          title="Officer Field Map"
          src={mapEmbedSrc}
          className="w-full h-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  </div>
);

// ─── OFFICER CHAT ──────────────────────────────────────────────────────────────
type Msg = { id: number; from: "me" | "citizen" | "command"; text: string; time: string };

const OfficerChatTab = () => {
  const threads = [
    { id: "TKN-2024-847", name: "Alex M. (Citizen)", avatar: "AM", last: "Yes, south gate facing N.R. road.", time: "12:27 PM", unread: 1, active: true },
    { id: "CMD", name: "Command Center", avatar: "CC", last: "Proceed to Zone 4A. Take readings.", time: "12:20 PM", unread: 0, active: true },
  ];

  const chatData: Record<string, Msg[]> = {
    "TKN-2024-847": [
      { id: 1, from: "me",     text: "Hello, I've received your complaint. Heading to Zone 4A now.",              time: "12:22 PM" },
      { id: 2, from: "citizen", text: "Thank you! The smoke is still heavy near the south gate.",                  time: "12:24 PM" },
      { id: 3, from: "me",     text: "Noted. Can you confirm the exact gate — is it facing the main road?",       time: "12:25 PM" },
      { id: 4, from: "citizen", text: "Yes, south gate facing N.R. road. Large chimney stack visible.",             time: "12:27 PM" },
    ],
    "CMD": [
      { id: 1, from: "command", text: "Officer Jackson, complaint TKN-847 assigned. Proceed to Zone 4A immediately.", time: "12:20 PM" },
      { id: 2, from: "me",     text: "Acknowledged. En route.",                                                      time: "12:21 PM" },
      { id: 3, from: "command", text: "Take PM2.5 and NOx readings on arrival. Report back in 15 min.",               time: "12:22 PM" },
    ],
  };

  const [activeThread, setActiveThread] = useState("TKN-2024-847");
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState<Record<string, Msg[]>>(chatData);
  const endRef = useRef<HTMLDivElement>(null);

  const activeT = threads.find(t => t.id === activeThread)!;
  const msgs = messages[activeThread] || [];

  const sendMsg = () => {
    if (!inputVal.trim()) return;
    const newMsg: Msg = { id: Date.now(), from: "me", text: inputVal.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => ({ ...prev, [activeThread]: [...(prev[activeThread] || []), newMsg] }));
    setInputVal("");
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeThread]);

  return (
    <div className="pb-16 h-[calc(100vh-72px)] flex flex-col">
      <MobileHeader title="Messages" />

      {/* Thread switcher */}
      <div className="flex border-b border-border-forest-light bg-forest-secondary shrink-0">
        {threads.map(t => (
          <button key={t.id} onClick={() => setActiveThread(t.id)}
            className={cn("flex-1 flex flex-col items-center gap-1 py-3 px-3 border-b-2 transition-colors relative",
              activeThread === t.id ? "border-accent-teal text-cream bg-forest-primary/40" : "border-transparent text-muted hover:text-cream"
            )}>
            <span className="font-sans text-xs font-semibold truncate max-w-25">{t.name}</span>
            <span className="font-data text-[10px] text-lime">{t.id}</span>
            {t.unread > 0 && <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-health-red flex items-center justify-center font-data text-[9px] text-white">{t.unread}</div>}
          </button>
        ))}
      </div>

      {/* Chat header mini */}
      <div className="px-4 py-3 bg-forest-card border-b border-border-forest flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-accent-gold/20 border border-accent-gold flex items-center justify-center text-accent-gold font-bold text-xs">{activeT.avatar}</div>
        <div>
          <span className="font-sans text-sm font-semibold text-cream">{activeT.name}</span>
          <div className="flex items-center gap-2">
            {activeT.active && <div className="w-1.5 h-1.5 rounded-full bg-health-green animate-pulse" />}
            <span className="font-data text-[10px] text-muted">{activeT.active ? "Online" : "Offline"}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {msgs.map(msg => (
          <div key={msg.id} className={cn("flex gap-2 max-w-[88%]", msg.from === "me" ? "ml-auto flex-row-reverse" : "")}>
            {msg.from !== "me" && (
              <div className="w-7 h-7 rounded-full bg-accent-gold/20 border border-accent-gold flex items-center justify-center text-accent-gold font-bold text-[10px] shrink-0 self-end">{activeT.avatar}</div>
            )}
            <div className={cn("rounded p-3 font-sans text-sm leading-relaxed",
              msg.from === "me" ? "bg-accent-teal text-forest-primary rounded-br-none" : msg.from === "command" ? "bg-accent-gold/20 border border-accent-gold/30 text-cream rounded-bl-none" : "bg-forest-card border border-border-forest-light text-cream rounded-bl-none"
            )}>
              {msg.from === "command" && <div className="font-data text-[9px] font-bold text-accent-gold uppercase tracking-wider mb-1">Command Center</div>}
              <p>{msg.text}</p>
              <div className={cn("text-[10px] mt-1 font-data flex items-center gap-1", msg.from === "me" ? "justify-end text-forest-primary/60" : "text-muted")}>
                {msg.time}
                {msg.from === "me" && <CheckCheck className="h-3 w-3" />}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border-forest-light bg-forest-secondary px-4 py-3 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea rows={1} value={inputVal} onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
            placeholder="Type message… (Enter to send)"
            className="flex-1 bg-forest-elevated border border-border-forest-light rounded p-3 font-sans text-sm text-cream placeholder:text-muted outline-none focus:border-lime transition-colors resize-none min-h-11" />
          <button onClick={sendMsg} className="h-11 w-11 bg-accent-teal rounded flex items-center justify-center hover:brightness-110 transition-all shrink-0">
            <Send className="h-4 w-4 text-forest-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PROFILE TAB ───────────────────────────────────────────────────────────────
const ProfileTab = ({ officer }: { officer: ApiUser | null }) => {
  const [onDuty, setOnDuty] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadIssues = async () => {
      if (!officer) return;
      const data = await listIssues();
      if (mounted) setIssues(data);
    };
    loadIssues();
    return () => {
      mounted = false;
    };
  }, [officer?._id]);

  const assignedToOfficer = issues.filter((issue) => {
    if (!officer || !issue.assignedTo) return false;
    if (typeof issue.assignedTo === "string") return issue.assignedTo === officer._id;
    return issue.assignedTo._id === officer._id;
  });
  const activeTasks = assignedToOfficer.filter((issue) => issue.status === "assigned" || issue.status === "in_progress").length;
  const completedTasks = assignedToOfficer.filter((issue) => issue.status === "resolved" || issue.status === "closed").length;
  const resolutionRate = assignedToOfficer.length === 0 ? "0%" : `${Math.round((completedTasks / assignedToOfficer.length) * 100)}%`;
  const initials = officer?.name
    ? officer.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "OF";

  return (
  <div className="pb-24">
    <MobileHeader title="Profile" officerName={officer?.name} />
    <div className="p-4 space-y-4">
      {/* Avatar */}
      <div className="bg-forest-card border border-border-forest-light rounded p-6 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-accent-gold/20 border-2 border-accent-gold flex items-center justify-center text-accent-gold font-bold text-2xl">{initials}</div>
        <div className="text-center">
          <h2 className="font-sans font-bold text-cream text-lg">{officer?.name || "Officer"}</h2>
          <p className="font-data text-sm text-lime mt-0.5">{(officer?.department || "field-ops").toUpperCase()}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-health-green animate-pulse" />
            <span className={cn("font-sans text-xs", onDuty ? "text-health-green" : "text-health-red")}>{onDuty ? "On Duty" : "Off Duty"}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[[String(activeTasks), "Active Tasks"], [String(completedTasks), "Completed"], [resolutionRate, "Resolution Rate"]].map(([v,l]) => (
          <div key={l} className="bg-forest-card border border-border-forest-light rounded p-4 text-center">
            <div className="font-data text-2xl font-bold text-lime">{v}</div>
            <div className="font-sans text-[10px] text-muted uppercase tracking-wider mt-1">{l}</div>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="bg-forest-card border border-border-forest-light rounded overflow-hidden">
        {[["Department", officer?.department || "Field Operations"], ["Email", officer?.email || "N/A"], ["Role", officer?.role || "officer"], ["Equipment", "Kit-B, N95, Meter"]].map(([l,v]) => (
          <div key={l} className="flex justify-between items-center px-5 py-4 border-b border-border-forest-light last:border-0">
            <span className="font-sans text-sm text-muted">{l}</span>
            <span className="font-sans text-sm text-cream">{v}</span>
          </div>
        ))}
      </div>

      <AnimatedCTA
        variant="ghost"
        className="w-full border-health-red text-health-red hover:bg-health-red/10"
        onClick={() => setOnDuty((v) => !v)}
      >
        {onDuty ? "Go Off Duty" : "Return On Duty"}
      </AnimatedCTA>
    </div>
  </div>
  );
};

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export const OfficerDashboard = () => (
  <OfficerDashboardContent />
);

const OfficerDashboardContent = () => {
  const [officer, setOfficer] = useState<ApiUser | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadOfficer = async () => {
      const users = await listUsers();
      const officers = users.filter((user) => user.role === "officer");
      if (officers.length > 0) {
        if (mounted) setOfficer(officers[0]);
        return;
      }

      const seeded = await getOrCreateDemoUser("officer");
      if (mounted) setOfficer(seeded);
    };

    loadOfficer();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div className="min-h-screen bg-forest-primary font-sans pt-18 max-w-120 mx-auto relative">
        <Routes>
          <Route path="/"         element={<ActiveTaskTab officerName={officer?.name} officerId={officer?._id} />} />
          <Route path="/map"      element={<OfficerMapTab />} />
          <Route path="/tasks"    element={<OfficerTasksTab officer={officer} />} />
          <Route path="/messages" element={<OfficerChatTab />} />
          <Route path="/profile"  element={<ProfileTab officer={officer} />} />
          <Route path="*"         element={<OfficerTasksTab officer={officer} />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  );
};
