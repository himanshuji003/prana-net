import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { AnimatedCTA } from "@/components/shared/AnimatedCTA";
import { MarqueeTicker } from "@/components/shared/MarqueeTicker";

// ─── Leaf & Bush SVG Decorations ──────────────────────────────────────────────
const LeafDecoration = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
    {/* Large back-left leaf cluster */}
    <svg className="absolute -left-16 top-[15%] opacity-10 animate-leaf-sway" style={{ animationDuration: "7s" }} width="320" height="320" viewBox="0 0 320 320" fill="none">
      <path d="M60,280 Q10,180 80,100 Q150,20 240,60 Q180,140 200,220 Q160,200 60,280Z" fill="#4CAF72" opacity="0.7"/>
      <path d="M80,270 Q50,200 100,140 Q150,80 210,100 Q170,160 180,230Z" fill="#C6E47A" opacity="0.4"/>
      <line x1="80" y1="270" x2="170" y2="120" stroke="#4CAF72" strokeWidth="2" opacity="0.5"/>
      <line x1="130" y1="200" x2="190" y2="150" stroke="#4CAF72" strokeWidth="1.5" opacity="0.4"/>
    </svg>

    {/* Top-right decorative leaf */}
    <svg className="absolute -right-8 top-[5%] opacity-8 animate-leaf-drift" style={{ animationDuration: "9s", animationDelay: "1.5s" }} width="280" height="280" viewBox="0 0 280 280" fill="none">
      <path d="M220,20 Q280,80 260,160 Q240,240 160,260 Q100,200 120,120 Q140,40 220,20Z" fill="#4CAF72" opacity="0.6"/>
      <path d="M200,40 Q250,90 235,150 Q215,210 155,230 Q110,180 130,120Z" fill="#C6E47A" opacity="0.3"/>
      <line x1="200" y1="40" x2="160" y2="220" stroke="#4CAF72" strokeWidth="1.5" opacity="0.4"/>
    </svg>

    {/* Mid-left small leaf */}
    <svg className="absolute left-[8%] top-[55%] opacity-8 animate-leaf-sway" style={{ animationDuration: "6s", animationDelay: "2s" }} width="160" height="160" viewBox="0 0 160 160" fill="none">
      <path d="M30,130 Q10,80 50,40 Q90,0 130,30 Q100,70 110,110 Q75,100 30,130Z" fill="#3DBFAD" opacity="0.5"/>
      <line x1="40" y1="120" x2="100" y2="50" stroke="#3DBFAD" strokeWidth="1" opacity="0.5"/>
    </svg>

    {/* Bottom-left bush cluster */}
    <svg className="absolute -bottom-4 -left-12 opacity-12 animate-bush-sway" width="500" height="200" viewBox="0 0 500 200" fill="none">
      <ellipse cx="80" cy="160" rx="100" ry="60" fill="#0F2B18" opacity="0.9"/>
      <ellipse cx="60" cy="140" rx="80" ry="50" fill="#152318"/>
      <ellipse cx="180" cy="170" rx="120" ry="55" fill="#0F2B18" opacity="0.9"/>
      <ellipse cx="160" cy="150" rx="90" ry="45" fill="#152318"/>
      <ellipse cx="330" cy="175" rx="140" ry="50" fill="#0F2B18" opacity="0.9"/>
      <ellipse cx="310" cy="155" rx="110" ry="42" fill="#152318"/>
      <ellipse cx="470" cy="165" rx="90" ry="48" fill="#0F2B18" opacity="0.9"/>
      {/* Small highlight leaves on top of bushes */}
      <path d="M40,110 Q20,80 50,60 Q80,40 100,70 Q75,80 40,110Z" fill="#1C3D22" opacity="0.8"/>
      <path d="M130,100 Q110,65 145,50 Q180,35 195,65 Q165,75 130,100Z" fill="#1C3D22" opacity="0.7"/>
      <path d="M280,95 Q260,62 295,48 Q330,35 342,68 Q315,75 280,95Z" fill="#1C3D22" opacity="0.8"/>
    </svg>

    {/* Bottom-right bush cluster */}
    <svg className="absolute -bottom-4 -right-8 opacity-12 animate-bush-sway" style={{ animationDelay: "1.8s" }} width="450" height="180" viewBox="0 0 450 180" fill="none">
      <ellipse cx="370" cy="155" rx="110" ry="55" fill="#0F2B18" opacity="0.9"/>
      <ellipse cx="350" cy="135" rx="90" ry="45" fill="#152318"/>
      <ellipse cx="240" cy="168" rx="130" ry="50" fill="#0F2B18" opacity="0.9"/>
      <ellipse cx="100" cy="160" rx="120" ry="52" fill="#0F2B18" opacity="0.9"/>
      <path d="M200,90 Q180,58 215,45 Q248,32 258,62 Q232,70 200,90Z" fill="#1C3D22" opacity="0.8"/>
      <path d="M340,80 Q320,50 350,38 Q382,26 390,55 Q368,62 340,80Z" fill="#1C3D22" opacity="0.8"/>
    </svg>

    {/* Floating ambient particles — tiny dots */}
    {[...Array(16)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-health-green"
        style={{
          width: `${2 + (i % 3)}px`,
          height: `${2 + (i % 3)}px`,
          left: `${5 + (i * 6.2) % 90}%`,
          top: `${10 + (i * 7.3) % 80}%`,
          opacity: 0.15 + (i % 4) * 0.05,
          animation: `leafDrift ${4 + (i % 4)}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
        }}
      />
    ))}
  </div>
);

// ─── Ambient Glow Orbs ─────────────────────────────────────────────────────────
const AmbientOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="animate-orb absolute -top-32 right-[5%] w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(76,175,114,0.07) 0%, transparent 70%)", filter: "blur(60px)", animationDuration: "14s" }} />
    <div className="animate-orb absolute top-[40%] -left-40 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(61,191,173,0.05) 0%, transparent 70%)", filter: "blur(80px)", animationDuration: "18s", animationDelay: "3s" }} />
    <div className="animate-orb absolute bottom-0 right-[20%] w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(198,228,122,0.04) 0%, transparent 70%)", filter: "blur(80px)", animationDuration: "22s", animationDelay: "6s" }} />
  </div>
);

// ─── Scrolling Mosaic Card Types ───────────────────────────────────────────────
const MosaicCard = ({ type }: { type: number }) => {
  const sizes = [
    "w-[320px] h-[200px]", // wide
    "w-[200px] h-[280px]", // portrait
    "w-[240px] h-[240px]", // square
    "w-[320px] h-[200px]", // wide
    "w-[200px] h-[280px]", // portrait
    "w-[320px] h-[200px]", // wide
    "w-[240px] h-[240px]", // square
    "w-[200px] h-[280px]", // portrait
  ];

  const cards = [
    // Card 1 — AQI Reading
    <div className="flex flex-col justify-between h-full p-5">
      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">Live Reading · Mumbai Central</span>
      <div>
        <div className="font-data text-[72px] font-bold leading-none text-health-amber">87</div>
        <div className="font-data text-xs text-muted mt-1">AQI · Moderate</div>
      </div>
      <div className="flex gap-[3px] items-end h-10">
        {[30,45,52,40,65,87,72,88,70,87].map((v,i) => (
          <div key={i} className="w-3 rounded-sm bg-health-amber/60 transition-all" style={{ height: `${v/88*100}%`, opacity: 0.4 + i*0.06 }} />
        ))}
      </div>
    </div>,
    // Card 2 — Super Tree
    <div className="flex flex-col items-center justify-center h-full p-5 text-center" style={{ background: "linear-gradient(180deg, rgba(76,175,114,0.08) 0%, transparent 100%)" }}>
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="mb-3">
        <path d="M28,48 L28,20" stroke="#4CAF72" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M28,30 Q18,22 14,12 Q22,16 28,24" fill="#4CAF72" opacity="0.8"/>
        <path d="M28,24 Q38,16 42,6 Q34,10 28,18" fill="#C6E47A" opacity="0.7"/>
        <path d="M28,20 Q20,14 18,4 Q26,10 28,18" fill="#4CAF72" opacity="0.5"/>
        <circle cx="28" cy="46" r="5" fill="rgba(76,175,114,0.2)" stroke="#4CAF72" strokeWidth="1"/>
      </svg>
      <div className="font-data text-sm text-lime font-bold">ST-007</div>
      <div className="font-sans text-xs text-muted mt-1">Super Tree</div>
      <div className="flex items-center gap-2 mt-3">
        <div className="h-2 w-2 rounded-full bg-health-green animate-pulse" />
        <span className="font-data text-xs text-health-green">Online</span>
      </div>
    </div>,
    // Card 3 — Heatmap mini
    <div className="relative flex flex-col justify-between h-full p-5 overflow-hidden">
      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-muted z-10 relative">Pollution Heatmap</span>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(224,82,82,0.4) 0%, transparent 70%)", top: "20%", left: "10%" }} />
        <div className="absolute w-24 h-24 rounded-full" style={{ background: "radial-gradient(circle, rgba(232,168,56,0.3) 0%, transparent 70%)", bottom: "20%", right: "15%" }} />
        <div className="absolute w-16 h-16 rounded-full" style={{ background: "radial-gradient(circle, rgba(76,175,114,0.4) 0%, transparent 70%)", top: "50%", right: "30%" }} />
      </div>
      <div className="z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-health-red" /><span className="font-data text-[10px] text-muted">Zone 4A — High</span>
        </div>
      </div>
    </div>,
    // Card 4 — Complaint card
    <div className="flex flex-col justify-between h-full p-5">
      <div className="font-data text-sm font-bold text-lime">TKN-2024-00847</div>
      <div>
        <div className="font-sans text-[13px] font-semibold text-cream mb-1">Industrial Smoke</div>
        <div className="font-sans text-[11px] text-muted">📍 Zone 4A, Sector 9</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="px-3 py-1 rounded-full border border-health-amber text-health-amber bg-health-amber/10 font-sans text-[10px] font-semibold uppercase tracking-wider">In Progress</div>
        <div className="w-7 h-7 rounded-full bg-accent-teal/20 border border-accent-teal flex items-center justify-center text-[10px] font-bold text-accent-teal">RK</div>
      </div>
    </div>,
    // Card 5 — PM2.5 hazardous
    <div className="flex flex-col justify-between h-full p-5" style={{ background: "linear-gradient(160deg, rgba(224,82,82,0.06) 0%, transparent 60%)" }}>
      <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-health-red">⚠ Hazardous Zone</span>
      <div>
        <div className="font-data text-[72px] font-bold leading-none text-health-red">147</div>
        <div className="font-data text-[10px] text-muted">PM2.5 µg/m³</div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between font-data text-[11px]"><span className="text-muted">PM10</span><span className="text-health-amber">203</span></div>
        <div className="flex justify-between font-data text-[11px]"><span className="text-muted">CO₂</span><span className="text-lime">412 ppm</span></div>
        <div className="flex justify-between font-data text-[11px]"><span className="text-muted">NOx</span><span className="text-lime">38 ppb</span></div>
      </div>
    </div>,
    // Card 6 — AI Recommendation
    <div className="flex flex-col justify-between h-full p-5">
      <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-accent-gold">⚡ AI Recommendation</div>
      <div>
        <div className="font-sans text-[15px] font-semibold text-cream leading-snug">Deploy Sprinkler Truck — Zone 4A</div>
        <div className="font-data text-[11px] text-muted mt-2">PM2.5: 187 µg/m³ · 340% threshold</div>
      </div>
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 rounded-full border border-health-green bg-health-green/10 font-sans text-[10px] font-semibold uppercase tracking-wider text-health-green">✓ Approved</div>
      </div>
    </div>,
    // Card 7 — Officer status
    <div className="flex flex-col items-center justify-center h-full p-5 text-center">
      <div className="w-14 h-14 rounded-full bg-accent-gold/20 border-2 border-accent-gold flex items-center justify-center text-xl font-bold text-accent-gold mb-3">RK</div>
      <div className="font-sans text-[13px] font-semibold text-cream">Officer Raj Kumar</div>
      <div className="flex items-center gap-2 my-2"><div className="w-2 h-2 rounded-full bg-health-green animate-pulse" /><span className="font-data text-[11px] text-health-green">Active</span></div>
      <div className="w-full mt-2">
        <div className="flex justify-between font-sans text-[10px] text-muted mb-1"><span>Workload</span><span>3/5</span></div>
        <div className="w-full h-1.5 bg-forest-elevated rounded-full overflow-hidden"><div className="h-full bg-health-green w-[60%] rounded-full" /></div>
      </div>
    </div>,
    // Card 8 — Bioreactor
    <div className="flex flex-col items-center justify-between h-full p-5" style={{ background: "linear-gradient(180deg, rgba(61,191,173,0.06) 0%, transparent 100%)" }}>
      <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-accent-teal">Liquid Tree Bioreactor</span>
      <div className="relative flex items-center justify-center w-full flex-1">
        {[0,1,2].map(i => (
          <div key={i} className="absolute rounded-full border border-accent-teal/30" style={{ width: `${60+i*30}px`, height: `${60+i*30}px`, opacity: 0.5 - i*0.12, animation: `ripple ${2+i}s ease-out infinite`, animationDelay: `${i*0.7}s` }} />
        ))}
        <div className="w-14 h-14 rounded-full bg-accent-teal/20 border border-accent-teal flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22C17 22 21 17.5 21 12C21 8 18 5 15 3C15 7 13 9 12 10C11 9 9 7 9 3C6 5 3 8 3 12C3 17.5 7 22 12 22Z" stroke="#3DBFAD" strokeWidth="1.5"/></svg>
        </div>
      </div>
      <div className="font-data text-sm font-bold text-accent-teal">CO₂ → O₂</div>
    </div>,
  ];

  return (
    <div className={`${sizes[type]} shrink-0 bg-forest-card border border-border-forest-light rounded-lg overflow-hidden`}>
      {cards[type]}
    </div>
  );
};

const MosaicRow = ({ direction = "left", delay = 0, cards }: { direction?: "left"|"right", delay?: number, cards: number[] }) => (
  <div className="overflow-hidden w-full">
    <div
      className={`flex gap-5 w-max ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}`}
      style={{ animationDuration: direction === "left" ? "40s" : "55s", animationDelay: `${delay}s` }}
    >
      {[...cards, ...cards].map((c, i) => <MosaicCard key={i} type={c} />)}
    </div>
  </div>
);

// ─── CSS Super Tree Illustration ───────────────────────────────────────────────
const SuperTreeVisual = () => (
  <div className="relative flex flex-col items-center" style={{ height: "400px" }}>
    {/* Concentric sensor rings */}
    {[1,2,3].map(i => (
      <div key={i} className="absolute rounded-full border border-health-green/10" style={{ width: `${80+i*80}px`, height: `${80+i*80}px`, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    ))}
    {/* Trunk */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[4px] rounded-full" style={{ height: "300px", background: "linear-gradient(to top, #4CAF72, #C6E47A)" }} />
    {/* Sensor nodes on trunk */}
    {[{ top: "30%", label: "PM2.5" }, { top: "52%", label: "CO₂" }, { top: "72%", label: "NOx" }].map((node, i) => (
      <div key={i} className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3" style={{ top: node.top }}>
        <div className="font-data text-[11px] text-muted text-right w-14">{node.label}</div>
        <div className="border border-dashed border-health-green/40 w-6 h-0" />
        <div className="w-10 h-10 rounded-full border-2 border-health-green bg-health-green/10 animate-sensor-pulse z-10" />
        <div className="border border-dashed border-health-green/40 w-6 h-0" />
        <div className="font-data text-[11px] text-muted w-14">Live</div>
      </div>
    ))}
    {/* Crown — airflow output dots */}
    <div className="absolute flex gap-3 items-end" style={{ top: "6%" }}>
      {[20, 14, 18, 14, 20].map((delay, i) => (
        <div key={i} className="w-3 h-3 rounded-full bg-lime" style={{ opacity: 0.7 + i * 0.06, animation: `floatUp ${1.2 + i * 0.2}s ease-in-out infinite alternate`, animationDelay: `${delay * 0.05}s` }} />
      ))}
    </div>
    {/* Base root spread */}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-3 rounded-full bg-health-green/20 blur-sm" />
  </div>
);

// ─── Main Landing Page ────────────────────────────────────────────────────────
export const LandingPage = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] as any } }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.8 } }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="relative min-h-screen"
    >
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col pt-[72px] overflow-hidden">
        {/* Layered bg */}
        <div className="absolute inset-0" style={{ background: "#0D1A12" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(76,175,114,0.12) 0%, transparent 70%)" }} />
        {/* Noise grain */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, filter: "contrast(120%) brightness(110%)" }} />

        <AmbientOrbs />
        <LeafDecoration />

        {/* Hero headline */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-start justify-center flex-1 px-8 md:px-16 lg:px-24 max-w-7xl mx-auto w-full pb-8"
        >
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="section-label mb-0">
            Environmental Intelligence Platform
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="mt-4">
            <p className="font-sans font-light text-lg text-muted">(We monitor)</p>
            <h1 className="font-display leading-none mt-1" style={{ fontSize: "clamp(72px, 9vw, 116px)" }}>
              <em style={{ fontStyle: "italic", color: "#C6E47A" }}>u</em>rban{" "}
              <em style={{ fontStyle: "italic", color: "#C6E47A" }}>a</em>ir
            </h1>
            <h1 className="font-display leading-none text-cream" style={{ fontSize: "clamp(72px, 9vw, 116px)" }}>
              intelligently.
            </h1>
          </motion.div>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="mt-8 font-sans font-light text-xl text-muted max-w-lg leading-[1.75]">
            Connecting IoT Super Trees, AI analytics, and civic participation to regenerate urban air quality in real time.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="mt-10 flex gap-4 flex-wrap">
            <Link to="/citizen"><AnimatedCTA variant="teal" size="lg">Citizen Portal →</AnimatedCTA></Link>
            <Link to="/official"><AnimatedCTA variant="ghost" size="lg">Government Login</AnimatedCTA></Link>
          </motion.div>
        </motion.div>

        {/* ─ Mosaic Scroller ─ */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="relative z-10 w-full mt-4 space-y-5 pb-8">
          <MosaicRow direction="left"  cards={[0,1,2,3,4,5,6,7]} />
          <MosaicRow direction="right" cards={[4,7,2,5,0,6,3,1]} delay={0.5} />
        </motion.div>

        {/* Live Data Ticker */}
        <div className="relative z-10 w-full h-12 bg-forest-secondary border-t border-b border-border-forest overflow-hidden flex items-center">
          <div className="flex w-max animate-scroll-left gap-8 pl-8" style={{ animationDuration: "25s" }}>
            {[...Array(3)].map((_, rep) =>
              ["PM2.5: 42 µg/m³","PM10: 67 µg/m³","CO₂: 412 ppm","NOx: 28 ppb","TEMP: 34°C","HUMIDITY: 68%","AQI: 87 MODERATE","SUPER TREES: 8/10 ONLINE"].map((item, i) => (
                <div key={`${rep}-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                  <span className="font-data text-sm uppercase tracking-wider text-lime">{item}</span>
                  <span className="text-health-green">→</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── 01 SYSTEM FLOW ── */}
      <section id="system-flow" className="relative bg-forest-primary py-24 px-8 md:px-16 overflow-hidden">
        {/* Ghost bg number */}
        <div className="absolute -top-10 -left-5 font-data font-bold text-[240px] leading-none pointer-events-none select-none" style={{ color: "#0F1C13", zIndex: 0 }}>01</div>
        <AmbientOrbs />
        <LeafDecoration />

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
            <div className="section-label">01 — System Flow</div>
            <h2 className="font-display text-[clamp(40px,5vw,64px)] leading-[1.05] text-cream max-w-2xl">
              From <em style={{ fontStyle: "italic", color: "#C6E47A" }}>detection</em> to action in minutes
            </h2>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🌿", title: "Physical Infrastructure", desc: "Super Tree filtration nodes actively purify the air and capture real-time atmospheric data at street level.", tag: "Sensors · HEPA · Algae" },
              { icon: "⚡", title: "Data Intelligence", desc: "Cloud-based AI processes immense datasets to predict hotspots, isolate sources, and trigger action thresholds.", tag: "AI · ML · Cloud Sync" },
              { icon: "📱", title: "Application Layer", desc: "Three specialized dashboards turn analyzed data into citizen engagement, official commands, and field execution.", tag: "3 Dashboards · Real-Time" },
            ].map((card, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.15} variants={fadeUp}>
                <div className="h-full bg-forest-card border border-border-forest-light rounded p-10 corner-bracket grid-texture relative overflow-hidden group hover:border-health-green transition-all duration-200" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}>
                  <div className="text-[72px] text-center block mb-6 leading-none">{card.icon}</div>
                  <hr className="border-t-[#1E3225] mb-6" />
                  <h3 className="font-sans text-[22px] font-semibold text-cream mb-4">{card.title}</h3>
                  <p className="font-sans text-[17px] text-muted leading-[1.75] mb-6">{card.desc}</p>
                  <div className="font-data text-[11px] text-lime uppercase tracking-wider">{card.tag}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 5-node flow */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-20 flex flex-col md:flex-row items-center gap-0 md:gap-0">
            {["Pollution Detected","Sensors Fire","AI Analyzes","Dashboard Alerts","Action Deployed"].map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center justify-center p-6 bg-forest-card border border-border-forest rounded w-full md:w-[175px] h-[175px] relative z-10 transition-all duration-200 hover:border-health-green shrink-0" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                  <div className="h-9 w-9 rounded-full bg-forest-elevated border border-border-forest-light flex items-center justify-center mb-3 font-data text-lime font-bold">0{i+1}</div>
                  <span className="font-sans text-center text-sm font-semibold text-cream">{step}</span>
                </div>
                {i < 4 && <div className="hidden md:block h-[2px] flex-1 border-t-2 border-dashed border-border-forest-light" />}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats transition strip */}
      <div className="w-full bg-forest-secondary border-y border-border-forest py-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border-forest">
          {[
            { val: "6", label: "Pollutants Tracked" },
            { val: "< 30 sec", label: "Data Sync Interval" },
            { val: "3-Stage", label: "HEPA + Carbon + Algae" },
            { val: "24/7", label: "Continuous Operation" },
          ].map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
              <div className="font-data text-4xl font-bold text-lime">{s.val}</div>
              <div className="section-label justify-center pb-0">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 02 SUPER TREE ── */}
      <section id="super-tree" className="relative bg-forest-secondary py-24 px-8 md:px-16 border-b border-border-forest overflow-hidden">
        <div className="absolute -top-10 -left-5 font-data font-bold text-[240px] leading-none pointer-events-none select-none" style={{ color: "#0D1508", zIndex: 0 }}>02</div>
        <AmbientOrbs />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="section-label">02 — Super Tree Infrastructure</div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Left — editorial headline */}
            <div>
              <h2 className="font-display text-[clamp(48px,5.5vw,80px)] leading-[1.05] text-cream">
                The <em style={{ fontStyle: "italic", color: "#C6E47A" }}>tree</em> that thinks
              </h2>
              <p className="mt-6 font-sans text-lg text-muted leading-[1.75] max-w-[380px]">
                A modular urban super-organism combining sensor technology, biological filtration, and intelligent IoT telemetry into one elegant form.
              </p>
            </div>

            {/* Center — CSS tree visual */}
            <div className="flex justify-center">
              <SuperTreeVisual />
            </div>

            {/* Right — numbered list */}
            <div className="flex flex-col justify-center">
              {[
                { name: "Air Quality Sensors", desc: "Military-grade laser scattering for PM particulate detection." },
                { name: "HEPA Filtration System", desc: "H13 class mechanical particle removal for immediate purification." },
                { name: "Liquid Tree Bioreactor", desc: "Microalgae cultivation converting CO₂ into O₂ at scale." },
                { name: "Smart Airflow System", desc: "Adaptive radial fans responding to real-time density metrics." },
                { name: "IoT Cloud Module", desc: "Low-latency telemetry streaming direct to the intelligence layer." },
              ].map((item, i) => (
                <div key={i} className="border-t border-border-forest py-5 flex items-start gap-5 hover:bg-white/[0.02] transition-colors px-2 -mx-2 group cursor-default">
                  <span className="font-data text-xl font-bold text-lime mt-0.5 shrink-0">0{i+1}</span>
                  <div>
                    <h4 className="font-sans text-[18px] font-semibold text-cream">{item.name}</h4>
                    <p className="font-sans text-[14px] text-muted mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 DASHBOARDS ── */}
      <section id="dashboards" className="relative bg-forest-primary py-24 px-8 md:px-16 overflow-hidden">
        <div className="absolute -top-10 -left-5 font-data font-bold text-[240px] leading-none pointer-events-none select-none" style={{ color: "#0F1C13", zIndex: 0 }}>03</div>
        <AmbientOrbs />
        <LeafDecoration />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="section-label">03 — Dashboard Ecosystem</div>
          <h2 className="font-display text-[clamp(40px,5vw,64px)] leading-[1.05] text-cream mb-16">
            One platform. Three <em style={{ fontStyle: "italic", color: "#C6E47A" }}>perspectives.</em>
          </h2>

          {[
            {
              num: "01", accent: "#3DBFAD", accentBg: "rgba(61,191,173,0.05)", accentBorder: "rgba(61,191,173,0.3)",
              label: "CITIZEN DASHBOARD", headline: "Monitor your", em: "air.", emWord: true,
              desc: "Real-time air quality readings for your neighborhood. Submit pollution complaints, track their resolution lifecycle, and communicate directly with the field officer assigned to your case.",
              tags: ["Live AQI", "Complaint Portal", "Status Tracking", "Officer Chat"],
              cta: "View Citizen Portal →", ctaVariant: "teal" as const, path: "/citizen",
              preview: (
                <div className="w-full h-full bg-forest-primary border border-border-forest-light rounded flex overflow-hidden min-h-[280px]">
                  <div className="w-12 bg-forest-secondary border-r border-border-forest flex flex-col items-center pt-4 gap-4">
                    {[...Array(5)].map((_, i) => <div key={i} className={`w-6 h-6 rounded-sm ${i===0 ? "bg-accent-teal/30 border border-accent-teal" : "bg-forest-elevated"}`} />)}
                  </div>
                  <div className="flex-1 p-4 space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      {[["87","Amber"],["42","Lime"],["67","Amber"],["412","Lime"]].map(([v,c],i) =>(
                        <div key={i} className="bg-forest-card border border-border-forest rounded p-2 text-center">
                          <div className={`font-data text-lg font-bold ${c==="Amber"?"text-health-amber":"text-lime"}`}>{v}</div>
                          <div className="font-sans text-[8px] text-muted uppercase">AQI</div>
                        </div>
                      ))}
                    </div>
                    <div className="w-full h-24 bg-forest-card border border-border-forest rounded relative overflow-hidden">
                      <div className="absolute top-4 left-6 w-20 h-20 rounded-full" style={{ background: "radial-gradient(circle, rgba(224,82,82,0.3) 0%, transparent 70%)" }} />
                      <div className="absolute bottom-4 right-10 w-14 h-14 rounded-full" style={{ background: "radial-gradient(circle, rgba(232,168,56,0.25) 0%, transparent 70%)" }} />
                    </div>
                    <div className="bg-forest-card border border-border-forest-light rounded p-2 flex items-center justify-between">
                      <span className="font-data text-[10px] text-lime">TKN-2024-847</span>
                      <div className="px-2 py-0.5 rounded-full bg-health-amber/15 border border-health-amber text-health-amber font-sans text-[8px] uppercase">In Progress</div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              num: "02", accent: "#D4A84B", accentBg: "rgba(212,168,75,0.05)", accentBorder: "rgba(212,168,75,0.3)",
              label: "OFFICIAL DASHBOARD", headline: "Command. Assign.", em: "Resolve.", emWord: false,
              desc: "City-wide pollution command center with a live heatmap, AI-driven action recommendations, intelligent officer dispatch, and a prioritized complaint resolution queue.",
              tags: ["Heatmap", "Complaint Queue", "AI Recommendations", "Officer Dispatch"],
              cta: "Government Login", ctaVariant: "gold" as const, path: "/official",
              preview: (
                <div className="w-full h-full bg-forest-primary border border-border-forest-light rounded flex overflow-hidden min-h-[280px]">
                  <div className="flex-1 relative bg-forest-secondary">
                    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 40% 50%, rgba(224,82,82,0.25) 0%, transparent 60%)" }} />
                    <div className="absolute" style={{ top: "30%", left: "35%", width: 8, height: 8, borderRadius: "50%", background: "#D4A84B" }} />
                    <div className="absolute" style={{ top: "55%", left: "55%", width: 6, height: 6, borderRadius: "50%", background: "#E05252" }} />
                  </div>
                  <div className="w-36 bg-forest-card border-l border-border-forest p-3 space-y-2 overflow-hidden">
                    {[{color:"border-l-health-red",label:"Industrial Smoke"},{color:"border-l-health-amber",label:"Waste Burning"},{color:"border-l-health-green",label:"Dust — Resolved"}].map((c,i) => (
                      <div key={i} className={`bg-forest-elevated border-l-[3px] ${c.color} p-2 rounded`}>
                        <div className="font-data text-[8px] text-lime">TKN-{847-i}</div>
                        <div className="font-sans text-[9px] text-cream mt-0.5">{c.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            },
            {
              num: "03", accent: "#4CAF72", accentBg: "rgba(76,175,114,0.05)", accentBorder: "rgba(76,175,114,0.3)",
              label: "FIELD OFFICER DASHBOARD", headline: "On the ground.", em: "In real time.", emWord: false,
              desc: "A mobile-first operational interface for field officers to accept task assignments, submit evidence, update statuses sequentially, and communicate with command in real time.",
              tags: ["Task Updates", "Evidence Upload", "Field Chat", "Route Navigation"],
              cta: "Officer Login", ctaVariant: "primary" as const, path: "/officer",
              preview: (
                <div className="flex justify-center items-center w-full min-h-[280px]">
                  <div className="w-[200px] h-[360px] border-[5px] border-forest-elevated rounded-[2rem] bg-forest-secondary overflow-hidden relative shadow-2xl">
                    <div className="bg-[#111F16] h-10 flex items-center justify-center border-b border-border-forest">
                      <div className="w-12 h-1 bg-border-forest-light rounded-full" />
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="bg-health-red/10 border border-health-red/30 border-l-4 border-l-health-red rounded p-2">
                        <div className="font-sans text-[8px] text-health-red uppercase font-bold">⚡ High Priority</div>
                        <div className="font-data text-[9px] text-lime mt-1">TKN-2024-847</div>
                      </div>
                      {["Accept Task","Start Inspection","Action Taken"].map((b,i) => (
                        <div key={i} className={`h-7 rounded flex items-center justify-center font-sans text-[9px] font-bold uppercase ${i===0?"bg-health-green text-forest-primary":"bg-forest-elevated border border-border-forest-light text-muted"}`}>{b}</div>
                      ))}
                    </div>
                    <div className="absolute bottom-0 w-full h-10 bg-forest-primary border-t border-border-forest flex items-center justify-around px-3">
                      {["⌂","⊞","◉","✉"].map((ic,i) => <span key={i} className={`text-sm ${i===0?"text-lime":"text-muted"}`}>{ic}</span>)}
                    </div>
                  </div>
                </div>
              ),
            },
          ].map((block, bi) => (
            <motion.div
              key={bi}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              custom={bi * 0.1} variants={fadeUp}
              className="corner-bracket relative mb-12 last:mb-0 overflow-hidden"
              style={{ background: block.accentBg, border: `1px solid ${block.accentBorder}`, borderLeft: `6px solid ${block.accent}` }}
            >
              <div className={`flex flex-col ${bi % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} min-h-[500px]`}>
                {/* Text side */}
                <div className="flex-1 p-12 flex flex-col justify-center border-r border-border-forest-light">
                  <div className="relative mb-6">
                    <div className="absolute -top-2 -left-1 font-data font-bold text-[80px] leading-none pointer-events-none select-none" style={{ color: block.accent, opacity: 0.08 }}>{block.num}</div>
                    <div className="section-label pb-4 relative z-10" style={{ color: block.accent }}>{block.label}</div>
                  </div>
                  <h3 className="font-display text-[clamp(36px,4vw,56px)] leading-[1.1] text-cream mb-6">
                    {block.headline} <em style={{ fontStyle: "italic", color: block.accent }}>{block.em}</em>
                  </h3>
                  <p className="font-sans text-lg text-muted leading-[1.75] max-w-[520px] mb-8">{block.desc}</p>
                  <div className="flex flex-wrap gap-3 mb-10">
                    {block.tags.map((tag, ti) => (
                      <span key={ti} className="px-4 py-1.5 rounded-full font-sans text-xs font-semibold uppercase tracking-wider border" style={{ borderColor: block.accent, color: block.accent, background: `${block.accent}15` }}>{tag}</span>
                    ))}
                  </div>
                  <Link to={block.path}>
                    <AnimatedCTA variant={block.ctaVariant}>{block.cta}</AnimatedCTA>
                  </Link>
                </div>

                {/* Preview side */}
                <div className="flex-1 p-10 bg-forest-primary/40 backdrop-blur flex items-center justify-center">
                  {block.preview}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Detect→Resolve marquee strip */}
      <MarqueeTicker speed="fast" items={["DETECT","ANALYZE","ALERT","ASSIGN","RESOLVE","PURIFY","REGENERATE"]} className="py-5" />

      {/* ── 04 IMPACT ── */}
      <section id="impact" className="relative py-24 px-8 md:px-16 bg-forest-primary overflow-hidden">
        <div className="absolute -top-10 -left-5 font-data font-bold text-[240px] leading-none pointer-events-none select-none" style={{ color: "#0F1C13", zIndex: 0 }}>04</div>
        <AmbientOrbs />
        <LeafDecoration />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="section-label">04 — Impact</div>
          <h2 className="font-display text-[clamp(40px,5vw,64px)] leading-[1.05] text-cream mb-16">
            Numbers that <em style={{ fontStyle: "italic", color: "#C6E47A" }}>matter.</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
            {[
              { val: "< 5 min", label: "Average response time from report to officer dispatch" },
              { val: "3", label: "Interconnected dashboard portals working in real time" },
              { val: "6", label: "Real-time pollutants continuously monitored at each node" },
              { val: "100%", label: "Closed-loop from pollution detection to site resolution" },
            ].map((stat, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i*0.1} variants={fadeUp}
                className="bg-forest-card border border-border-forest-light rounded p-10 corner-bracket hover:border-health-green transition-all duration-200 group"
                style={{ background: "rgba(21,35,24,0.6)", minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div className="font-data font-bold text-lime" style={{ fontSize: "clamp(48px,6vw,80px)", lineHeight: 1 }}>{stat.val}</div>
                <p className="font-sans text-base text-muted leading-[1.75] mt-4 max-w-[420px]">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quote block */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="w-full bg-forest-secondary border-y border-border-forest py-20 px-8 md:px-20 relative overflow-hidden"
          >
            <div className="absolute -top-8 -left-4 font-display text-[220px] leading-none select-none pointer-events-none" style={{ color: "#1E3225" }}>"</div>
            <blockquote className="font-display italic text-[clamp(24px,3.5vw,40px)] text-cream text-center leading-[1.4] relative z-10 max-w-4xl mx-auto">
              PRANA-NET transforms pollution management from passive monitoring into proactive environmental regeneration.
            </blockquote>
            <p className="mt-8 text-center font-sans text-sm text-muted uppercase tracking-[0.25em]">— PRANA-NET Ecosystem Overview</p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-8 md:px-16 border-t border-border-forest overflow-hidden">
        <AmbientOrbs />
        <LeafDecoration />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="font-display text-[clamp(44px,6vw,80px)] leading-[1.05] text-cream mb-12">
            (Let's build) cleaner <em style={{ fontStyle: "italic", color: "#C6E47A" }}>air</em> together
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/citizen"><AnimatedCTA variant="teal" size="lg">Enter as Citizen</AnimatedCTA></Link>
            <Link to="/official"><AnimatedCTA variant="gold" size="lg">Government Login</AnimatedCTA></Link>
            <Link to="/officer"><AnimatedCTA variant="ghost" size="lg">Officer Access</AnimatedCTA></Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-forest-secondary border-t border-border-forest py-12 px-8 md:px-16">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-6">
          <div className="flex items-center gap-1">
            <span className="font-display text-xl italic text-cream">PRANA</span>
            <span className="h-1.5 w-1.5 rounded-full bg-lime mx-0.5" />
            <span className="font-display text-xl italic text-cream">NET</span>
          </div>
          <div className="flex gap-8">
            {["How It Works", "Super Tree", "Dashboards", "Impact"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} className="font-sans text-sm text-muted hover:text-lime transition-colors">{l}</a>
            ))}
          </div>
          <p className="font-sans text-xs text-muted">© {new Date().getFullYear()} PRANA-NET Environment Intelligence</p>
        </div>
      </footer>
    </motion.div>
  );
};
