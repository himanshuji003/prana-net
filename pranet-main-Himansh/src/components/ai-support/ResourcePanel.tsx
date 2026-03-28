interface ResourcePanelProps {
  staffRef: React.RefObject<HTMLDivElement | null>;
  vehicleRef: React.RefObject<HTMLDivElement | null>;
  budgetRef: React.RefObject<HTMLDivElement | null>;
  casesRef: React.RefObject<HTMLDivElement | null>;
}

const ResourceTile = ({
  label,
  defaultValue,
  sub,
  barPct,
  barColor,
  contentRef,
}: {
  label: string;
  defaultValue: string;
  sub: string;
  barPct: number;
  barColor: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
}) => (
  <div className="bg-forest-card border border-border-forest-light rounded-lg p-2.5">
    <div className="font-data text-[8.5px] uppercase tracking-[0.1em] text-muted mb-1">{label}</div>
    <div
      ref={contentRef}
      contentEditable
      suppressContentEditableWarning
      className="font-data text-[15px] font-bold text-accent-gold outline-none cursor-text"
    >
      {defaultValue}
    </div>
    <div className="font-sans text-[9.5px] text-muted mt-0.5">{sub}</div>
    <div className="h-[3px] bg-forest-elevated rounded-full mt-2 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${barPct}%`, background: barColor }}
      />
    </div>
  </div>
);

export const ResourcePanel = ({ staffRef, vehicleRef, budgetRef, casesRef }: ResourcePanelProps) => (
  <div>
    <div className="font-data text-[9px] uppercase tracking-[0.18em] text-muted mb-2.5">
      ⚖ Resources (click to edit)
    </div>
    <div className="grid grid-cols-2 gap-2">
      <ResourceTile label="Field Staff" defaultValue="42" sub="on duty today" barPct={60} barColor="#3DBFAD" contentRef={staffRef} />
      <ResourceTile label="Vehicles" defaultValue="8" sub="available" barPct={40} barColor="#D4A84B" contentRef={vehicleRef} />
      <ResourceTile label="Budget Rem." defaultValue="₹1.2L" sub="this quarter" barPct={25} barColor="#E8A838" contentRef={budgetRef} />
      <ResourceTile label="Pending Cases" defaultValue="87" sub="in queue" barPct={78} barColor="#E05252" contentRef={casesRef} />
    </div>
    <p className="font-data text-[9px] text-muted/70 leading-relaxed mt-2">
      ⚠ These values are sent to the AI in every query. Edit to reflect your actual situation.
    </p>
  </div>
);
