"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { TENDERS, TenderColumn } from "@/lib/mockData";
import {
  ChevronLeft, Euro, MapPin, Clock, AlertTriangle,
  ExternalLink, CheckCircle2, XCircle, Sparkles, Zap,
  Hash, Building2, FileText, Archive, Trophy, X, Ban,
  ChevronRight, Info,
} from "lucide-react";

function fmtAmount(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function DeadlineBadge({ days }: { days: number }) {
  if (days < 0)
    return <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-400 font-medium"><Clock size={13} />Clôturé</span>;
  if (days <= 3)
    return <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-red-100 text-red-600 font-bold animate-pulse"><AlertTriangle size={13} />J-{days} — URGENT</span>;
  if (days <= 7)
    return <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-orange-100 text-orange-600 font-medium"><Clock size={13} />J-{days}</span>;
  return <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-medium"><Clock size={13} />J-{days}</span>;
}

// ─── Modal d'archivage ─────────────────────────────────────────────────────
function ArchiveModal({ tender, onClose }: { tender: (typeof TENDERS)[0]; onClose: () => void }) {
  const router = useRouter();

  const archive = (result: "won" | "lost" | "dismissed") => {
    const existing = JSON.parse(localStorage.getItem("archived_aos") || "[]");
    localStorage.setItem("archived_aos", JSON.stringify([
      ...existing,
      {
        id: `local-${tender.id}`,
        title: tender.title,
        client: tender.client,
        lot: tender.lot,
        amount: tender.amount,
        result,
        archivedAt: new Date().toISOString().split("T")[0],
        procedure: tender.procedure,
        location: tender.location,
        reference: tender.reference,
      },
    ]));
    router.push("/archive");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Archiver cet AO</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{tender.client} — {tender.lot}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-5">Quel est le résultat ?</p>

        <div className="space-y-2">
          <button
            onClick={() => archive("won")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-all group"
          >
            <Trophy size={18} className="text-emerald-500 shrink-0" />
            <div className="text-left">
              <div className="text-sm font-bold text-emerald-700">Marché gagné</div>
              <div className="text-xs text-emerald-600/70">Offre retenue par l'acheteur</div>
            </div>
          </button>
          <button
            onClick={() => archive("lost")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all group"
          >
            <XCircle size={18} className="text-gray-400 shrink-0" />
            <div className="text-left">
              <div className="text-sm font-bold text-gray-600">Non retenu</div>
              <div className="text-xs text-gray-400">Offre soumise mais non sélectionnée</div>
            </div>
          </button>
          <button
            onClick={() => archive("dismissed")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all group"
          >
            <Ban size={18} className="text-gray-300 shrink-0" />
            <div className="text-left">
              <div className="text-sm font-bold text-gray-500">Pas intéressant</div>
              <div className="text-xs text-gray-400">On ne répond pas à cet AO</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AODetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const tender = TENDERS.find(t => t.id === parseInt(id)) ?? TENDERS[0];
  const [showArchive, setShowArchive] = useState(false);
  const [currentColumn, setCurrentColumn] = useState<TenderColumn>(tender.column);
  const [scoreTooltip, setScoreTooltip] = useState(false);

  useEffect(() => {
    try {
      const overrides = JSON.parse(localStorage.getItem("ao_column_overrides") || "{}");
      if (overrides[tender.id]) setCurrentColumn(overrides[tender.id]);
    } catch { /* ignore */ }
  }, [tender.id]);

  const advanceColumn = (col: TenderColumn) => {
    const overrides = JSON.parse(localStorage.getItem("ao_column_overrides") || "{}");
    localStorage.setItem("ao_column_overrides", JSON.stringify({ ...overrides, [tender.id]: col }));
    setCurrentColumn(col);
  };

  const matchingLots = tender.lots.filter(l => l.match);
  const boampUrl = `https://www.boamp.fr/avis/detail/${tender.boampRef}`;

  const COLUMN_LABELS: Record<TenderColumn, string> = {
    to_study:  "À étudier",
    retained:  "Retenu",
    drafting:  "En rédaction",
    sent:      "Soumis",
  };
  const COLUMN_ORDER: TenderColumn[] = ["to_study", "retained", "drafting", "sent"];
  const currentIdx = COLUMN_ORDER.indexOf(currentColumn);
  const nextCol = currentIdx < COLUMN_ORDER.length - 1 ? COLUMN_ORDER[currentIdx + 1] : null;
  const NEXT_LABEL: Partial<Record<TenderColumn, string>> = {
    to_study: "Retenir cet AO",
    retained: "Passer en rédaction",
    drafting: "Marquer comme soumis",
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FA]">
      <Sidebar />
      {showArchive && <ArchiveModal tender={tender} onClose={() => setShowArchive(false)} />}
      <main className="flex-1 overflow-auto">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/dashboard"
              className="text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1.5 text-sm">
              <ChevronLeft size={16} />Dashboard AO
            </Link>
            <span className="text-gray-200">/</span>
            <span className="text-sm text-gray-500 truncate">{tender.client}</span>
          </div>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 leading-snug mb-1">{tender.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                  <Building2 size={13} className="text-gray-400" />{tender.client}
                </span>
                <span className="flex items-center gap-1.5">
                  <Hash size={12} className="text-gray-400" />{tender.reference}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-gray-400" />{tender.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText size={12} className="text-gray-400" />{tender.procedure}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0 relative">
              <div className="flex items-center justify-end gap-1 mb-1">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Score IA</div>
                <button
                  onMouseEnter={() => setScoreTooltip(true)}
                  onMouseLeave={() => setScoreTooltip(false)}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <Info size={12} />
                </button>
              </div>
              <div className="text-3xl font-black" style={{ color: tender.score >= 90 ? "#10b981" : "#6366f1" }}>
                {tender.score}%
              </div>
              {scoreTooltip && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl z-20 text-left leading-relaxed">
                  <div className="font-semibold mb-1.5">Comment le score est calculé</div>
                  <div className="space-y-1 text-gray-300">
                    <div className="flex justify-between"><span>Secteur d'activité</span><span className="font-semibold text-white">30%</span></div>
                    <div className="flex justify-between"><span>Zone géographique</span><span className="font-semibold text-white">20%</span></div>
                    <div className="flex justify-between"><span>Montant cible</span><span className="font-semibold text-white">20%</span></div>
                    <div className="flex justify-between"><span>Délai de réponse</span><span className="font-semibold text-white">15%</span></div>
                    <div className="flex justify-between"><span>Certifications</span><span className="font-semibold text-white">15%</span></div>
                  </div>
                  <div className="absolute right-4 -top-1.5 w-3 h-3 bg-gray-900 rotate-45" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 flex gap-5 items-start">

          {/* ── Gauche ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Résumé de la consultation</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">{tender.description}</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Montant estimé</div>
                  <div className="text-lg font-bold text-gray-900">{fmtAmount(tender.amount)}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Procédure</div>
                  <div className="text-sm font-semibold text-gray-900">{tender.procedure}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Échéance</div>
                  <DeadlineBadge days={tender.daysLeft} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-indigo-500" />
                  <h2 className="font-semibold text-gray-800">Lots de la consultation</h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {matchingLots.length} lot{matchingLots.length > 1 ? "s" : ""} correspondant{matchingLots.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {tender.lots.map((lot) => (
                  <div key={lot.label}
                    className={`flex items-start gap-4 px-6 py-4 ${lot.match ? "bg-emerald-50/40" : ""}`}>
                    {lot.match
                      ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      : <XCircle size={18} className="text-gray-300 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${lot.match ? "text-gray-900" : "text-gray-400"}`}>
                        {lot.label}
                      </div>
                      {lot.reason && (
                        <div className={`text-xs mt-0.5 ${lot.match ? "text-emerald-700" : "text-gray-400"}`}>
                          {lot.reason}
                        </div>
                      )}
                    </div>
                    {lot.match && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                        Votre périmètre
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Droite ─────────────────────────────────────────── */}
          <div className="w-64 shrink-0 space-y-4">

            {tender.daysLeft >= 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-indigo-500" />
                  <span className="font-semibold text-sm text-gray-800">Studio IA</span>
                </div>
                <Link href={`/reponses?id=${tender.id}`}>
                  <button className="w-full py-3 rounded-2xl font-bold text-sm text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)" }}>
                    <span className="flex items-center justify-center gap-2">
                      <Zap size={15} />Préparer la réponse
                    </span>
                  </button>
                </Link>
              </div>
            )}

            {/* Source BOAMP */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Source officielle</div>
              <div className="text-xs text-gray-500 mb-1">Référence</div>
              <div className="text-sm font-mono font-semibold text-gray-800 mb-4">{tender.reference}</div>
              <a href={boampUrl} target="_blank" rel="noopener noreferrer">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition-all">
                  <ExternalLink size={14} />Voir sur BOAMP
                </button>
              </a>
            </div>

            {/* Lot correspondant */}
            {matchingLots.length > 0 && (
              <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Votre lot</div>
                {matchingLots.map(l => (
                  <div key={l.label} className="text-xs font-semibold text-emerald-800 leading-snug">{l.label}</div>
                ))}
              </div>
            )}

            {/* Kanban status + avancement */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Étape actuelle</div>
              <div className="flex gap-1 mb-4">
                {COLUMN_ORDER.map((col, i) => (
                  <div key={col} className={`flex-1 h-1.5 rounded-full transition-all ${
                    i <= currentIdx ? "bg-indigo-500" : "bg-gray-100"
                  }`} />
                ))}
              </div>
              <div className="text-sm font-bold text-gray-800 mb-4">{COLUMN_LABELS[currentColumn]}</div>
              {nextCol && (
                <button
                  onClick={() => advanceColumn(nextCol)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                >
                  <ChevronRight size={15} />{NEXT_LABEL[currentColumn]}
                </button>
              )}
              {currentColumn === "sent" && (
                <div className="text-xs text-center text-emerald-600 font-medium py-1">
                  ✓ Dossier soumis
                </div>
              )}
            </div>

            {/* Archiver */}
            <button
              onClick={() => setShowArchive(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Archive size={14} />Archiver cet AO
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
