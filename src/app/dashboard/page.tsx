"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import HowItWorks from "@/components/HowItWorks";
import { TENDERS, Tender, TenderColumn } from "@/lib/mockData";
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  Euro,
  MapPin,
  ChevronRight,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

// ─── Config colonnes ───────────────────────────────────────────────────────
const COLUMNS: {
  id: TenderColumn;
  label: string;
  dot: string;
  accent: string;
  headerBg: string;
}[] = [
  { id: "to_study",  label: "À étudier",     dot: "bg-slate-400",   accent: "text-slate-500",   headerBg: "bg-slate-100" },
  { id: "retained",  label: "Retenus",       dot: "bg-amber-400",   accent: "text-amber-600",   headerBg: "bg-amber-50"  },
  { id: "drafting",  label: "En rédaction",  dot: "bg-indigo-500",  accent: "text-indigo-600",  headerBg: "bg-indigo-50" },
  { id: "sent",      label: "Soumis",        dot: "bg-emerald-400", accent: "text-emerald-600", headerBg: "bg-emerald-50"},
];

function fmtAmount(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: "EUR", maximumFractionDigits: 0,
  }).format(n);
}

function DeadlineBadge({ days }: { days: number }) {
  if (days < 0)
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium"><Clock size={10} /> Clôturé</span>;
  if (days <= 3)
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold animate-pulse"><AlertTriangle size={10} /> J-{days} URGENT</span>;
  if (days <= 7)
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium"><Clock size={10} /> J-{days}</span>;
  return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium"><Clock size={10} /> J-{days}</span>;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-emerald-500" : score >= 75 ? "bg-indigo-500" : "bg-amber-400";
  const textColor = score >= 90 ? "text-emerald-600" : score >= 75 ? "text-indigo-600" : "text-amber-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${textColor}`}>{score}%</span>
    </div>
  );
}

function TenderCard({ tender, col, onDismiss }: { tender: Tender; col: (typeof COLUMNS)[0]; onDismiss: (id: number) => void }) {
  return (
    <div className="relative group/card">
      {/* Bouton rejet rapide */}
      <button
        onClick={(e) => { e.preventDefault(); onDismiss(tender.id); }}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-300 hover:text-red-400 hover:border-red-200 opacity-0 group-hover/card:opacity-100 transition-all shadow-sm"
        title="Pas intéressant"
      >
        <X size={11} />
      </button>
    <Link href={(tender.column === "drafting" || tender.column === "retained") ? `/reponses?id=${tender.id}` : `/ao/${tender.id}`}>
      <div className={`bg-white rounded-xl border p-4 transition-all group cursor-pointer ${
        tender.urgent
          ? "border-red-200 shadow-sm shadow-red-50 hover:shadow-md hover:shadow-red-100 hover:border-red-300"
          : "border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100"
      }`}>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-indigo-700 transition-colors">
              {tender.title}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{tender.client}</div>
          </div>
          {tender.column === "drafting" && (
            <Sparkles size={14} className="text-indigo-400 shrink-0 mt-0.5" />
          )}
        </div>

        <div className={`text-xs px-2 py-0.5 rounded-md font-medium mb-3 inline-block ${col.headerBg} ${col.accent}`}>
          {tender.lot}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1 font-bold text-gray-800">
            <Euro size={11} />{fmtAmount(tender.amount)}
          </span>
          {tender.location && (
            <span className="flex items-center gap-1 text-gray-400">
              <MapPin size={10} />{tender.location}
            </span>
          )}
        </div>

        <div className="mb-3">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1 mb-1">
            <TrendingUp size={9} /> Score IA
          </div>
          <ScoreBar score={tender.score} />
        </div>

        <div className="flex items-center justify-between">
          <DeadlineBadge days={tender.daysLeft} />
          {(tender.column === "drafting" || tender.column === "retained") ? (
            <span className="text-xs text-indigo-500 font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Zap size={11} />Studio IA
            </span>
          ) : (
            <span className="text-xs text-gray-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Voir <ChevronRight size={12} />
            </span>
          )}
        </div>
      </div>
    </Link>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, colorClass }: {
  label: string; value: string;
  icon: React.ElementType; colorClass: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon size={14} className="text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

const HELP_STEPS = [
  { title: "Veille automatique", desc: "Nerolia scanne BOAMP et les plateformes acheteurs et détecte les AO correspondant à votre profil." },
  { title: "Score IA", desc: "Chaque AO reçoit un score de pertinence basé sur votre métier, zone, certifications et montant cible." },
  { title: "Pipeline de suivi", desc: "Faites progresser vos AO de 'À étudier' jusqu'à 'Soumis', puis archivez le résultat." },
];

export default function DashboardPage() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [colOverrides, setColOverrides] = useState<Record<number, TenderColumn>>({});

  useEffect(() => {
    try {
      setColOverrides(JSON.parse(localStorage.getItem("ao_column_overrides") || "{}"));
      const dis = JSON.parse(localStorage.getItem("ao_dismissed") || "[]");
      setDismissed(dis);
    } catch { /* ignore */ }
  }, []);

  const dismiss = (id: number) => {
    const tender = TENDERS.find(t => t.id === id);
    if (!tender) return;
    const existing = JSON.parse(localStorage.getItem("archived_aos") || "[]");
    localStorage.setItem("archived_aos", JSON.stringify([
      ...existing,
      { id: `local-${id}`, title: tender.title, client: tender.client, lot: tender.lot,
        amount: tender.amount, result: "dismissed", archivedAt: new Date().toISOString().split("T")[0],
        procedure: tender.procedure, location: tender.location, reference: tender.reference },
    ]));
    const newDis = [...dismissed, id];
    setDismissed(newDis);
    localStorage.setItem("ao_dismissed", JSON.stringify(newDis));
  };

  const allTenders = TENDERS.map(t => colOverrides[t.id] ? { ...t, column: colOverrides[t.id] } : t);
  const visibleTenders = allTenders.filter(t => !dismissed.includes(t.id));
  const priorityAO = visibleTenders.find(t => t.urgent && t.daysLeft >= 0 && t.daysLeft <= 5);
  const totalAmount = visibleTenders.reduce((s, t) => s + t.amount, 0);
  const avgScore = visibleTenders.length > 0 ? Math.round(visibleTenders.reduce((s, t) => s + t.score, 0) / visibleTenders.length) : 0;
  const urgent = visibleTenders.filter((t) => t.daysLeft >= 0 && t.daysLeft <= 7).length;

  return (
    <div className="flex min-h-screen bg-[#F6F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">Dashboard AO</h1>
            <HowItWorks steps={HELP_STEPS} />
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* Bandeau priorité */}
          {priorityAO && (
            <Link href={`/ao/${priorityAO.id}`}>
              <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 cursor-pointer hover:border-red-300 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-200">
                  <AlertTriangle size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-0.5">Priorité — J-{priorityAO.daysLeft}</div>
                  <div className="text-sm font-bold text-gray-900 truncate">{priorityAO.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{priorityAO.client} · {fmtAmount(priorityAO.amount)}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-2xl font-black text-emerald-600">{priorityAO.score}%</div>
                  <Link href={`/reponses?id=${priorityAO.id}`} onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-indigo-200 hover:shadow-lg transition-all"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                      <Zap size={12} />Studio IA
                    </div>
                  </Link>
                  <ChevronRight size={16} className="text-red-300 group-hover:text-red-500 transition-colors" />
                </div>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-4 gap-4">
            <StatCard label="AO en cours"    value={String(TENDERS.length)}  icon={TrendingUp}    colorClass="bg-indigo-500" />
            <StatCard label="Volume total"   value={fmtAmount(totalAmount)}  icon={Euro}          colorClass="bg-emerald-500" />
            <StatCard label="Score IA moyen" value={`${avgScore}%`}          icon={Sparkles}      colorClass="bg-violet-500" />
            <StatCard label="À traiter"      value={String(urgent)}          icon={AlertTriangle} colorClass="bg-red-500" />
          </div>

          <div className="grid grid-cols-4 gap-5 items-start">
            {COLUMNS.map((col) => {
              const cards = visibleTenders.filter((t) => t.column === col.id);
              return (
                <div key={col.id}>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${col.accent}`}>
                      {col.label}
                    </span>
                    <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center">
                      {cards.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {cards.map((t) => <TenderCard key={t.id} tender={t} col={col} onDismiss={dismiss} />)}
                    {cards.length === 0 && (
                      <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-xs text-gray-300">
                        Aucun AO
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
