"use client";
import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import HowItWorks from "@/components/HowItWorks";
import { DOCUMENTS, CompanyDoc } from "@/lib/mockData";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Upload,
  FileText,
  Shield,
  BadgeCheck,
  Briefcase,
  Plus,
  RefreshCw,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────
function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR");
}

// ─── Badge statut ─────────────────────────────────────────────────────────
function StatusBadge({ doc }: { doc: CompanyDoc }) {
  const days = daysUntil(doc.expires);

  if (doc.status === "missing")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-400">
        <XCircle size={12} /> Manquant
      </span>
    );
  if (doc.status === "expired" || (days !== null && days < 0))
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-600">
        <XCircle size={12} /> Expiré
      </span>
    );
  if (doc.status === "expiring" || (days !== null && days <= 30))
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 animate-pulse">
        <AlertTriangle size={12} /> Expire dans {days}j
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
      <CheckCircle2 size={12} /> Valide
    </span>
  );
}

// ─── Icône par catégorie ───────────────────────────────────────────────────
function CategoryIcon({ cat }: { cat: string }) {
  const map: Record<string, React.ElementType> = {
    Juridique: Briefcase,
    Social: Shield,
    Assurance: Shield,
    Certification: BadgeCheck,
  };
  const Icon = map[cat] ?? FileText;
  return <Icon size={16} className="text-gray-400 shrink-0" />;
}

// ─── Ligne document ───────────────────────────────────────────────────────
function DocRow({
  doc,
  onReplace,
}: {
  doc: CompanyDoc;
  onReplace: (id: string, file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const days = daysUntil(doc.expires);
  const isWarn = doc.status === "expiring" || (days !== null && days !== null && days <= 30 && days >= 0);

  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 group transition-colors hover:bg-gray-50/60 ${
        isWarn ? "bg-orange-50/40" : ""
      }`}
    >
      <CategoryIcon cat={doc.category} />

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800">{doc.label}</div>
        {doc.filename && (
          <div className="text-xs text-gray-400 mt-0.5 truncate">{doc.filename}</div>
        )}
      </div>

      <div className="text-xs text-gray-400 shrink-0 hidden sm:block">
        {doc.expires ? `Valide jusqu'au ${fmtDate(doc.expires)}` : "Permanent"}
      </div>

      <StatusBadge doc={doc} />

      <button
        onClick={() => inputRef.current?.click()}
        className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-1.5 opacity-0 group-hover:opacity-100"
      >
        <RefreshCw size={11} />
        {doc.filename ? "Remplacer" : "Déposer"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onReplace(doc.id, f);
        }}
      />
    </div>
  );
}

// ─── Dropzone ajout document ──────────────────────────────────────────────
function AddDropzone({ onFile }: { onFile: (f: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl px-6 py-10 cursor-pointer transition-all ${
        drag
          ? "border-indigo-400 bg-indigo-50"
          : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
        drag ? "bg-indigo-100" : "bg-gray-100"
      }`}>
        <Upload size={22} className={drag ? "text-indigo-600" : "text-gray-400"} />
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-700">
          {drag ? "Déposez le fichier ici" : "Ajouter un document"}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          PDF, DOC, DOCX — glissez ou cliquez pour parcourir
        </div>
      </div>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [docs, setDocs] = useState<CompanyDoc[]>(DOCUMENTS);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReplace = (id: string, file: File) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, filename: file.name, status: "valid", uploadedAt: new Date().toISOString().slice(0, 10) }
          : d
      )
    );
    showToast(`✓ ${file.name} déposé`);
  };

  const handleAdd = (file: File) => {
    const newDoc: CompanyDoc = {
      id: `custom-${Date.now()}`,
      label: file.name.replace(/\.[^.]+$/, ""),
      category: "Autre",
      status: "valid",
      filename: file.name,
      expires: null,
      uploadedAt: new Date().toISOString().slice(0, 10),
    };
    setDocs((prev) => [...prev, newDoc]);
    showToast(`✓ ${file.name} ajouté`);
  };

  const valid = docs.filter((d) => d.status === "valid").length;
  const expiring = docs.filter((d) => d.status === "expiring").length;
  const missing = docs.filter((d) => d.status === "missing" || !d.filename).length;

  return (
    <div className="flex min-h-screen bg-[#F6F8FA]">
      <Sidebar />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl transition-all">
          {toast}
        </div>
      )}

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Bibliothèque d'Entreprise</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Déposez vos documents une fois — réutilisés automatiquement pour chaque dossier
              </p>
            </div>
            <div className="flex items-center gap-3">
              {expiring > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-orange-100 text-orange-700">
                  <AlertTriangle size={13} />
                  {expiring} expire{expiring > 1 ? "nt" : ""} bientôt
                </div>
              )}
              <HowItWorks steps={[
                { title: "Déposez une fois", desc: "Vos documents sont stockés dans votre bibliothèque Nerolia." },
                { title: "Réutilisation auto", desc: "Nerolia les joint automatiquement à chaque dossier de réponse." },
                { title: "Alertes expiration", desc: "Vous êtes averti avant qu'un document devienne invalide." },
              ]} />
            </div>
          </div>
        </div>

        <div className="px-8 py-6 flex gap-6 items-start">
          {/* Colonne principale */}
          <div className="flex-1 space-y-5">

            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Documents valides",      value: valid,    color: "text-emerald-600", bg: "bg-emerald-50",  icon: CheckCircle2 },
                { label: "Expirent dans < 30 j",   value: expiring, color: "text-orange-600",  bg: "bg-orange-50",   icon: AlertTriangle },
                { label: "Manquants",              value: missing,  color: "text-gray-400",    bg: "bg-gray-50",     icon: XCircle },
              ].map(({ label, value, color, bg, icon: Icon }) => (
                <div key={label} className={`${bg} rounded-xl px-5 py-4 border border-gray-100`}>
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={color} />
                    <span className="text-xs font-medium text-gray-500">{label}</span>
                  </div>
                  <div className={`text-2xl font-bold mt-2 ${color}`}>{value}</div>
                </div>
              ))}
            </div>

            {/* Alerte Qualibat */}
            {expiring > 0 && (
              <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4">
                <AlertTriangle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-orange-800">
                    Renouvellement Qualibat requis avant soumission
                  </div>
                  <div className="text-xs text-orange-600 mt-0.5">
                    Qualibat 4131 & 6111 expirent dans 30 jours. Ces certifications sont exigées sur 2 AO en cours.
                  </div>
                </div>
              </div>
            )}

            {/* Liste documents */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-800">Documents de l'entreprise</span>
                <span className="text-xs text-gray-400">{docs.filter(d => d.filename).length} / {docs.length} déposés</span>
              </div>

              {docs.map((doc) => (
                <DocRow key={doc.id} doc={doc} onReplace={handleReplace} />
              ))}
            </div>

            {/* Dropzone ajout */}
            <AddDropzone onFile={handleAdd} />
          </div>

          {/* Panneau droit — guide */}
          <div className="w-72 shrink-0 space-y-4">
            {/* Docs requis sur AO urgents */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-sm text-gray-800 mb-3">Requis — CPAM (J-3)</h2>
              {[
                { label: "DC1", ok: true },
                { label: "DC2", ok: true },
                { label: "Kbis", ok: true },
                { label: "URSSAF", ok: true },
                { label: "Décennale", ok: true },
                { label: "Qualibat 4131", ok: true, warn: true },
                { label: "Mémoire technique", ok: false },
              ].map(({ label, ok, warn }) => (
                <div key={label} className="flex items-center gap-2.5 py-1.5 border-b border-gray-50 last:border-0">
                  {ok ? (
                    warn
                      ? <AlertTriangle size={13} className="text-orange-500 shrink-0" />
                      : <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-gray-200 shrink-0" />
                  )}
                  <span className={`text-xs ${ok ? (warn ? "text-orange-700 font-medium" : "text-gray-700") : "text-gray-400"}`}>
                    {label}
                  </span>
                  {warn && <span className="ml-auto text-[10px] text-orange-500">expire J+30</span>}
                  {!ok && <span className="ml-auto text-[10px] text-gray-300">À générer</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
