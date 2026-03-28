import { cn } from "@/lib/utils";

export interface CivicProblem {
  id: string;
  icon: string;
  title: string;
  short: string;
  severity: "HIGH" | "MED" | "LOW";
  prompt: string;
}

interface ProblemCardProps {
  problem: CivicProblem;
  isActive: boolean;
  onSelect: (problem: CivicProblem) => void;
}

const severityConfig = {
  HIGH: {
    label: "HIGH",
    className: "bg-health-red/15 text-health-red border border-health-red/25",
  },
  MED: {
    label: "MED",
    className: "bg-health-amber/15 text-health-amber border border-health-amber/25",
  },
  LOW: {
    label: "LOW",
    className: "bg-health-green/12 text-health-green border border-health-green/20",
  },
};

export const CIVIC_PROBLEMS: CivicProblem[] = [
  {
    id: "dust",
    icon: "🌫️",
    title: "Air Pollution & Dust",
    short: "Construction dust, AQI spike, garbage burning",
    severity: "HIGH",
    prompt: `PROBLEM SCENARIO — Air Pollution & Dust Emergency:\nAQI in the ward has crossed 350 (Severe+ category) today. Citizen complaints received on Delhi 311 app: 14 in the last 6 hours. Identified pollution sources:\n- Open construction site (approx 2 acres) operating WITHOUT anti-smog nets or water sprinkling, violating GRAP Stage III norms.\n- 400-meter stretch of unpaved road generating heavy road dust, no mechanical sweeping done in 3 days.\n- Garbage burning spotted at two locations despite prohibition.\n- A diesel generator (250 KVA) running without a valid DG permit near a school.\nResidents near the school are reporting respiratory complaints. A local NGO has threatened to file an NGT petition tomorrow if no action is taken.\nWard details: Population 52,000. School is within 100m of construction site. CAQM enforcement team visited once last week.\nAs the MCD officer-in-charge for this ward, provide your full decision and action plan.`,
  },
  {
    id: "garbage",
    icon: "🗑️",
    title: "Garbage & Solid Waste Failure",
    short: "Uncollected waste, overflowing dump, contractor default",
    severity: "HIGH",
    prompt: `PROBLEM SCENARIO — Solid Waste Management Breakdown:\nGarbage has NOT been collected in Colony Block C and D for 5 consecutive days. Situation on ground:\n- Secondary garbage collection point has overflowed onto the road — waste pile is approximately 8 feet high, blocking a lane.\n- Stench and rodent sightings reported by 3 RWA members in formal written complaints.\n- 4 out of 7 safai karamcharis were absent without prior leave this week.\n- The private sanitation contractor (M/s GreenWaste Pvt Ltd) has not responded to 3 phone calls and 1 WhatsApp message.\n- One MCD garbage collection vehicle (compactor) broke down yesterday, second vehicle deployed elsewhere.\n- A local TV journalist is scheduled to visit the site at 4 PM today for a story.\nWard population: 45,000. Ward has a contractual obligation with the contractor under SWM Rules 2016. The contractor's agreement has a penalty clause (Clause 12B) for missed collection — ₹5,000 per day.\nWhat should you do RIGHT NOW and over the next week?`,
  },
  {
    id: "flood",
    icon: "🌊",
    title: "Waterlogging & Flood Damage",
    short: "Road flooding, choked drains, monsoon breach",
    severity: "HIGH",
    prompt: `PROBLEM SCENARIO — Severe Waterlogging Emergency:\nHeavy rainfall of 94mm occurred in 4 hours today. Current ground situation:\n- Two underpasses submerged — traffic completely blocked, police managing diversion.\n- Main arterial road has 2.5 feet standing water over 300-meter stretch.\n- MCD storm drain has breached at one point — water entering a low-lying residential colony with ~800 residents.\n- Electricity supply to one transformer cut by BSES as precaution.\n- Storm drains on 4 roads are choked with silt and plastic waste — pre-monsoon de-silting was only 55% completed (budget constraint reason on file).\n- 1 elderly woman reportedly stranded in ground-floor flat.\n- 2 JCBs available on rent basis. MCD has 3 dewatering pumps — 1 operational, 2 need fuel and minor repair.\nWhich actions are within MCD authority? What must be coordinated with BSES, PWD, Delhi Police, and DDMA? What is the priority sequence?`,
  },
  {
    id: "encroach",
    icon: "🏗️",
    title: "Illegal Construction & Encroachment",
    short: "Unauthorized building, footpath encroachment",
    severity: "MED",
    prompt: `PROBLEM SCENARIO — Dual Encroachment Complaint:\nTwo formal written complaints received this week:\nCASE 1: Shopkeeper at Plot No. 34, Main Market has constructed a permanent concrete extension of 8 feet onto the public footpath. This blocks pedestrian movement, forces pedestrians onto the road. Shopkeeper claims a "verbal permission" was given by a previous JE. No written record exists.\nCASE 2: Residential building at House No. 78, Sector 11 has constructed an unauthorized 3rd floor + additional room on terrace without building plan approval.\nAdditional facts:\n- Shopkeeper is the President of the Local Traders' Association and has approached the ward councillor's office.\n- One prior legal notice for Case 1 was served 8 months ago — no compliance, no follow-up by previous officer.\n- MCD has one demolition squad available for 2 days this week.\n- Building Bye-laws 2016 apply. Sealing and demolition authority under Section 343 and 461 of DMC Act.\nWhat is the correct procedure, legal basis, documentation required, and enforcement action for both cases?`,
  },
  {
    id: "stray",
    icon: "🐕",
    title: "Stray Animals & Dog Menace",
    short: "Dog bites, ABC programme, RWA conflict",
    severity: "MED",
    prompt: `PROBLEM SCENARIO — Stray Dog Attack & Community Conflict:\nA stray dog pack (approximately 18 dogs) in Colony Sector 4 has caused 4 dog-bite incidents in 10 days:\n- 2 children (ages 7 and 11) bitten, one hospitalized.\n- 1 elderly man bitten while walking in the morning.\n- 1 cyclist attacked, fell and sustained injuries.\nRWA President has sent a written complaint demanding "immediate removal and elimination" of all stray dogs. Simultaneously, a local animal welfare NGO has written to MCD citing Supreme Court order (W.P. 19821/2004) prohibiting killing or permanent relocation of community dogs.\nMCD dog squad available: 2 catchers, 1 catching van. ABC sterilization partner NGO has a 3-week waiting list.\nHow do you legally, ethically, and practically resolve this situation?`,
  },
  {
    id: "road",
    icon: "🛣️",
    title: "Pothole & Road Damage",
    short: "Accident risk, contractor liability, monsoon repair",
    severity: "HIGH",
    prompt: `PROBLEM SCENARIO — Critical Pothole Complaint with Legal Threat:\nA 1.4 km ward road has 23 documented potholes, some 8–12 inches deep. Situation:\n- A motorcycle accident occurred yesterday — a father and son fell into a large pothole at night. Son sustained a fracture. Family has engaged a lawyer and sent legal notice to MCD claiming ₹5 lakh compensation for negligence.\n- The affected road section was relaid only 9 months ago. The contractor's Defect Liability Period (DLP) is 24 months.\n- Contractor has been contacted — they say their crew is busy on another site for 10 more days.\n- It is currently monsoon season — fresh hot-mix bitumen laying is not ideal. Cold mix (temporary) repair material available.\n- Media has published the accident story.\nWhat immediate actions protect MCD from legal liability? How do you enforce the DLP? What is the documentation strategy?`,
  },
  {
    id: "sewage",
    icon: "💧",
    title: "Sewage Overflow & Water Contamination",
    short: "Pipe crack, DJB coordination, contamination risk",
    severity: "HIGH",
    prompt: `PROBLEM SCENARIO — Sewage Overflow & Drinking Water Risk:\nA cracked MCD-maintained sewer pipe in Sector 8 is causing raw sewage to overflow onto the road and into a storm drain. The storm drain outlet is near a water supply line access point.\nSituation:\n- Residents report foul smell for 4 days and yellowish/discolored water from taps for 2 days.\n- One family has already reported gastroenteritis — 3 members fell sick.\n- Water testing has not been done — DJB lab must be used.\n- MCD Jetting Machine (sewer cleaning) is available but operator was absent yesterday.\n- 3 safai karamcharis are available — cannot be deployed for manual sewer entry per Supreme Court order (manual scavenging prohibition — SC 2014 judgment).\n- DJB supplies water in this area; MCD only maintains the sewage network.\nWhat is MCD's role vs DJB's role? What are the emergency steps to prevent disease outbreak?`,
  },
  {
    id: "noise",
    icon: "📢",
    title: "Noise & Industrial Pollution",
    short: "Illegal factory, night operations, NGT risk",
    severity: "LOW",
    prompt: `PROBLEM SCENARIO — Illegal Night-Time Industrial Noise:\nA small factory (metal fabrication unit) in a residential zone has been running noisy operations from 10 PM to 6 AM for the past 3 weeks.\nComplaints received:\n- 8 written complaints from residents on MCD portal + 5 on Delhi 311 app.\n- Noise measured at 74 dB at 1 AM (residential night limit is 45 dB under Noise Pollution Rules 2000).\n- Diesel generator running at site produces visible black smoke.\nThe factory owner has a valid MCD trade license (issued 2019, not renewed since 2022 — flagged in system).\nAdditional risks:\n- A resident has already drafted an NGT petition which she plans to file in 48 hours if no action.\n- DPCC (Delhi Pollution Control Committee) regulates air/noise pollution — MCD must coordinate.\n- MCD has authority to seal premises under Section 461 DMC Act for trade license violations.\nWhat are MCD's powers here? What is the fastest legal path to stop night operations?`,
  },
  {
    id: "dengue",
    icon: "🦟",
    title: "Dengue / Vector Disease Outbreak",
    short: "Breeding sites, fogging, ABC programme",
    severity: "HIGH",
    prompt: `PROBLEM SCENARIO — Ward-Level Dengue Outbreak Alert:\nDelhi Health Department has issued a ward-specific dengue outbreak alert. Data for the past 2 weeks:\n- 18 confirmed dengue cases, 7 suspected — 3 patients hospitalized.\n- 2 malaria cases also reported.\nMCD Health Inspector survey (50 houses sampled):\n- Larvae found in 24 houses (48% positivity rate — extremely high).\n- Construction site with 12 open water tanks found positive.\n- Ward park has a permanently waterlogged depression — breeding ground confirmed.\nResident demands: Emergency fogging IMMEDIATELY.\nMCD situation:\n- The ward's fogging machine is under scheduled maintenance for 3 more days.\n- Neighbouring ward's fogging machine is available to borrow through Zone office approval.\n- 2 health inspectors + 5 safai karamcharis available for ground operations.\n- House owners can be fined under Section 371A of DMC Act (₹500 per violation for mosquito breeding).\nWhat is the scientifically correct and legally sound action plan?`,
  },
];

export const ProblemCard = ({ problem, isActive, onSelect }: ProblemCardProps) => {
  const sev = severityConfig[problem.severity];

  return (
    <button
      type="button"
      onClick={() => onSelect(problem)}
      className={cn(
        "w-full text-left border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 group relative",
        isActive
          ? "border-accent-gold bg-forest-elevated shadow-[0_0_0_1px_theme(colors.accent-gold/0.4)]"
          : "border-border-forest-light bg-forest-card hover:border-accent-gold/40 hover:bg-forest-elevated"
      )}
    >
      <div className="flex items-center gap-3 p-2.5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 bg-forest-elevated border border-border-forest-light">
          {problem.icon}
        </div>
        <div className="flex-1 min-w-0 pr-10">
          <div className="font-sans text-[12.5px] font-semibold text-cream leading-tight mb-0.5">{problem.title}</div>
          <div className="font-data text-[10px] text-muted leading-tight truncate">{problem.short}</div>
        </div>
      </div>
      <span className={cn("absolute top-2 right-2 font-data text-[8.5px] px-1.5 py-0.5 rounded uppercase tracking-wider", sev.className)}>
        {sev.label}
      </span>
    </button>
  );
};
