"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import HowItWorks from "@/components/HowItWorks";
import { ARCHIVED_TENDERS, ArchivedTender } from "@/lib/mockData";
import { Trophy, XCircle, Euro, MapPin, TrendingUp, BarChart2, Filter, Ban } from "lucide-react";

function fmtAmount(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

const HELP_STEPS = [
  { title: "Archivez vos AO", desc: "Depuis la page d'un AO, cliquez sur 'Archiver' et indiquez si le marché a été gagné ou perdu." },
  { title: "Suivez votre taux de réussite", desc: "Les statistiques se mettent à jour automatiquement pour refléter votre historique." },
  { title: "Améliorez votre sélection", desc: "Analysez les marchés gagnés pour affiner les critères de matching Nerolia." },
];

type FilterType = "all" | "won" | "lost" | "dismissed";

export default function ArchivePage() {
  const [localArchived, setLocalArchived] = useState<ArchivedTender[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("archived_aos") || "[]");
      setLocalArchived(stored);
    } catch { /* ignore */ }
  }, []);

  const all        = [...localArchived, ...ARCHIVED_TENDERS];
  const won        = all.filter(a => a.result === "won");
  const lost       = all.filter(a => a.result === "lost");
  const dismissed  = all.filter(a => a.result === "dismissed");
  const submitted  = [...won, ...lost]; // AO effectivement soumis
  const winRate    = submitted.length > 0 ? Math.round((won.length / submitted.length) * 100) : 0;
  const wonVolume  = won.reduce((s, a) => s + a.amount, 0);

  const filtered = filter === "won" ? won : filter === "lost" ? lost : filter === "dismissed" ? dismissed : all;

  return (
    <div className="flex min-h-screen bg-[#F6F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-auto">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">Archives & Statistiques</h1>
            <HowItWorks steps={HELP_STEPS} />
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "AO soumis",       value: String(all.length),        icon: BarChart2,   color: "bg-indigo-500" },
              { label: "Marchés gagnés",  value: String(won.length),        icon: Trophy,      color: "bg-emerald-500" },
              { label: "Taux de réussite",value: `${winRate}%`,             icon: TrendingUp,  color: "bg-violet-500" },
              { label: "CA remporté",     value: fmtAmount(wonVolume),      icon: Euro,        color: "bg-amber-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500">{label}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon size={14} className="text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
              </div>
            ))}
          </div>

          {/* Barre de réussite visuelle */}
          {all.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Répartition Gagné / Perdu</span>
                <span className="text-xs text-gray-400">{won.length} gagné{won.length > 1 ? "s" : ""} · {lost.length} perdu{lost.length > 1 ? "s" : ""}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                <div
                  className="bg-emerald-400 transition-all duration-700"
                  style={{ width: `${winRate}%` }}
                />
                <div
                  className="bg-gray-300 transition-all duration-700"
                  style={{ width: `${100 - winRate}%` }}
                />
              </div>
              <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />Gagnés ({winRate}%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />Perdus ({100 - winRate}%)</span>
              </div>
            </div>
          )}

          {/* Filtres + liste */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-gray-400" />
              {([
                { id: "all",       label: "Tous",             active: "bg-indigo-100 text-indigo-700" },
                { id: "won",       label: "Gagnés",           active: "bg-emerald-100 text-emerald-700" },
                { id: "lost",      label: "Non retenus",      active: "bg-gray-200 text-gray-700" },
                { id: "dismissed", label: "Pas intéressants", active: "bg-gray-100 text-gray-500" },
              ] as { id: FilterType; label: string; active: string }[]).map(f => (
                <button key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    filter === f.id ? f.active : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>
                  {f.label}
                </button>
              ))}
              <span className="ml-auto text-xs text-gray-400">{filtered.length} AO</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">Aucun AO archivé pour le moment</div>
              ) : (
                filtered.map((ao, idx) => (
                  <div key={ao.id}
                    className={`flex items-center gap-4 px-6 py-4 ${idx < filtered.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50/60 transition-colors`}>
                    {ao.result === "won"
                      ? <Trophy size={16} className="text-emerald-500 shrink-0" />
                      : ao.result === "dismissed"
                      ? <Ban size={16} className="text-gray-300 shrink-0" />
                      : <XCircle size={16} className="text-gray-300 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{ao.title}</div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span>{ao.client}</span>
                        <span className="flex items-center gap-1"><MapPin size={10} />{ao.location}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-gray-800">{fmtAmount(ao.amount)}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{ao.archivedAt}</div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      ao.result === "won" ? "bg-emerald-100 text-emerald-700"
                      : ao.result === "dismissed" ? "bg-gray-100 text-gray-400"
                      : "bg-gray-100 text-gray-500"
                    }`}>
                      {ao.result === "won" ? "Gagné" : ao.result === "dismissed" ? "Pas intéressant" : "Non retenu"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
