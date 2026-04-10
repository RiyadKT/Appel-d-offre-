"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import HowItWorks from "@/components/HowItWorks";
import { TENDERS, AI_SUMMARY, TECHNICAL_MEMO } from "@/lib/mockData";
import {
  FileText, FileSpreadsheet, AlertTriangle, Clock, Euro, MapPin,
  Sparkles, CheckCircle2, Download, Copy, ChevronLeft, Zap, Lock,
  Upload, X, FolderOpen, RotateCcw, HelpCircle,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────
function fmtAmount(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}
function fmtSize(b: number) {
  if (b < 1024) return `${b} o`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} Ko`;
  return `${(b / (1024 * 1024)).toFixed(1)} Mo`;
}

// ─── Types de documents DCE ────────────────────────────────────────────────
const DOC_TYPES = [
  { id: "rc",     label: "Règlement de Consultation",          short: "RC",    color: "#6366f1", priority: true  },
  { id: "cctp",   label: "Cahier des Clauses Techniques",      short: "CCTP",  color: "#6366f1", priority: true  },
  { id: "ccap",   label: "Cahier des Clauses Administratives", short: "CCAP",  color: "#8b5cf6", priority: false },
  { id: "dpgf",   label: "DPGF — Décomposition du prix",       short: "DPGF",  color: "#10b981", priority: false },
  { id: "bpu",    label: "BPU — Bordereau de Prix Unitaires",  short: "BPU",   color: "#10b981", priority: false },
  { id: "ae",     label: "Acte d'Engagement",                  short: "AE",    color: "#6b7280", priority: false },
  { id: "plans",  label: "Plans & annexes techniques",         short: "PLANS", color: "#f59e0b", priority: false },
  { id: "pgcsps", label: "PGCSPS",                             short: "PGC",   color: "#ef4444", priority: false },
  { id: "hse",    label: "Notice HSE",                         short: "HSE",   color: "#f97316", priority: false },
];

type DocTypeId = "rc"|"cctp"|"ccap"|"dpgf"|"bpu"|"ae"|"plans"|"pgcsps"|"hse"|"unknown";

interface UploadedDoc { uid: string; name: string; size: number; docType: DocTypeId; }

function getDocMeta(id: DocTypeId) {
  return DOC_TYPES.find(d => d.id === id) ?? { id: "unknown", label: "Document non identifié", short: "?", color: "#9ca3af", priority: false };
}

// ─── Auto-identification ───────────────────────────────────────────────────
function identifyDoc(filename: string): DocTypeId {
  const n = filename.toLowerCase().replace(/[_\-\.]/g, " ");
  if (/\brc\b|reglement.*consult/.test(n)) return "rc";
  if (/cctp|clauses? tech|cahier tech|technique/.test(n)) return "cctp";
  if (/ccap|clauses? admin|administrativ/.test(n)) return "ccap";
  if (/dpgf|decomposition|prix global/.test(n)) return "dpgf";
  if (/\bbpu\b|bordereau.*prix|prix unitaire/.test(n)) return "bpu";
  if (/\bae\b|acte.*engagement|engagement.*vierge/.test(n)) return "ae";
  if (/plan[s ]|dwg|coupe|elevation|niveau r\d/.test(n)) return "plans";
  if (/pgcsps|coordination.*secur/.test(n)) return "pgcsps";
  if (/\bhse\b|hygiene|notice.*secur|prescription/.test(n)) return "hse";
  return "unknown";
}

// ─── Steps de chargement ──────────────────────────────────────────────────
const LOADING_STEPS = [
  { label: "Lecture des pièces du DCE...",           duration: 700 },
  { label: "Identification des lots concernés...",   duration: 650 },
  { label: "Croisement avec vos attestations...",    duration: 750 },
  { label: "Analyse des critères d'attribution...",  duration: 600 },
  { label: "Rédaction de la trame technique...",     duration: 900 },
  { label: "Vérification de la conformité...",       duration: 600 },
  { label: "Finalisation du brouillon...",           duration: 500 },
];

// ─── Icône fichier ─────────────────────────────────────────────────────────
function FileIcon({ name, size = 14 }: { name: string; size?: number }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["xls","xlsx"].includes(ext)) return <FileSpreadsheet size={size} className="text-emerald-500 shrink-0" />;
  return <FileText size={size} className="text-red-400 shrink-0" />;
}

// ─── Zone de dépôt vide ────────────────────────────────────────────────────
function EmptyDropZone({ onFiles }: { onFiles: (docs: UploadedDoc[]) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (rawFiles: FileList | File[]) => {
    const docs: UploadedDoc[] = Array.from(rawFiles).map((f, i) => ({
      uid: `${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
      docType: identifyDoc(f.name),
    }));
    onFiles(docs);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-200 py-24 px-8 ${
        dragging
          ? "border-indigo-400 bg-indigo-50/80 scale-[1.01]"
          : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50/60"
      }`}
      style={{ minHeight: 320 }}
    >
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 transition-all duration-200 ${
        dragging ? "shadow-xl shadow-indigo-200 scale-110" : "shadow-md shadow-gray-200"
      }`}
        style={{ background: dragging ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "linear-gradient(135deg,#f1f5f9,#e2e8f0)" }}>
        <FolderOpen size={36} className={dragging ? "text-white" : "text-gray-400"} />
      </div>

      <h3 className={`text-xl font-bold mb-5 transition-colors ${dragging ? "text-indigo-700" : "text-gray-800"}`}>
        {dragging ? "Relâchez pour analyser" : "Déposez votre DCE ici"}
      </h3>

      <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
        dragging ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
      }`}>
        <Upload size={14} />Parcourir
      </div>

      <input ref={inputRef} type="file" multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.zip,.rar" className="hidden"
        onChange={(e) => { if (e.target.files?.length) processFiles(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
}

// ─── Liste des fichiers identifiés ────────────────────────────────────────
function IdentifiedFilesList({
  docs, onRemove, onChangeType, onAddMore,
}: {
  docs: UploadedDoc[];
  onRemove: (uid: string) => void;
  onChangeType: (uid: string, type: DocTypeId) => void;
  onAddMore: (newDocs: UploadedDoc[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const identified = docs.filter(d => d.docType !== "unknown");
  const unknown    = docs.filter(d => d.docType === "unknown");

  const addMore = (rawFiles: FileList | File[]) => {
    const newDocs: UploadedDoc[] = Array.from(rawFiles).map((f, i) => ({
      uid: `${Date.now()}-add-${i}`,
      name: f.name,
      size: f.size,
      docType: identifyDoc(f.name),
    }));
    onAddMore(newDocs);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-800">{docs.length} fichier{docs.length > 1 ? "s" : ""}</span>
          {unknown.length > 0 && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {unknown.length} à classer
            </span>
          )}
        </div>
        <button onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
          <Upload size={12} /> Ajouter
        </button>
        <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.zip"
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) addMore(e.target.files); e.target.value = ""; }}
        />
      </div>

      {/* Fichiers identifiés */}
      {identified.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {identified.map((doc) => {
            const meta = getDocMeta(doc.docType);
            return (
              <div key={doc.uid}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 group transition-colors">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 min-w-[32px] text-center"
                  style={{ background: `${meta.color}18`, color: meta.color }}>{meta.short}</span>
                <FileIcon name={doc.name} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 truncate">{doc.name}</div>
                  <div className="text-[10px] text-gray-400">{fmtSize(doc.size)}</div>
                </div>
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <button onClick={() => onRemove(doc.uid)}
                  className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-1">
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Fichiers non identifiés */}
      {unknown.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
            <span className="text-xs font-semibold text-amber-700">À classer</span>
          </div>
          {unknown.map((doc) => (
            <div key={doc.uid}
              className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 group">
              <FileIcon name={doc.name} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 truncate">{doc.name}</div>
              </div>
              <select value="" onChange={(e) => { if (e.target.value) onChangeType(doc.uid, e.target.value as DocTypeId); }}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 cursor-pointer focus:outline-none focus:border-indigo-400 shrink-0">
                <option value="" disabled>Classer…</option>
                {DOC_TYPES.map(t => <option key={t.id} value={t.id}>{t.short}</option>)}
              </select>
              <button onClick={() => onRemove(doc.uid)}
                className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Panel admin docs ──────────────────────────────────────────────────────
function AdminDocsPanel() {
  const items = [
    { label: "Kbis",         ok: true,  warn: false },
    { label: "URSSAF",       ok: true,  warn: false },
    { label: "Décennale",    ok: true,  warn: false },
    { label: "Qualibat 4131",ok: true,  warn: true  },
    { label: "Qualibat 6111",ok: true,  warn: true  },
    { label: "DGFiP",        ok: false, warn: false },
    { label: "RC Pro",       ok: false, warn: false },
  ];
  const missing = items.filter(i => !i.ok);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pièces admin</div>
      <div className="grid grid-cols-2 gap-x-4">
        {items.map(({ label, ok, warn }) => (
          <div key={label} className="flex items-center gap-1.5 py-0.5">
            {ok
              ? warn
                ? <AlertTriangle size={11} className="text-amber-400 shrink-0" />
                : <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
              : <div className="w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0" />
            }
            <span className={`text-xs ${ok ? (warn ? "text-amber-700" : "text-gray-600") : "text-gray-400 line-through"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
      {missing.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <AlertTriangle size={11} className="shrink-0" />
          {missing.map(m => m.label).join(" · ")} manquant{missing.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

// ─── État LOADING ─────────────────────────────────────────────────────────
function LoadingState({ step, progress }: { step: number; progress: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[420px] px-8">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 animate-pulse"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
        <Sparkles size={28} className="text-white" />
      </div>
      <div className="w-full mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-indigo-600">Génération en cours...</span>
          <span className="text-xs font-bold text-gray-700 tabular-nums">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)" }} />
        </div>
      </div>
      <div className="w-full space-y-2.5">
        {LOADING_STEPS.map((s, i) => (
          <div key={s.label}
            className={`flex items-center gap-3 text-sm transition-all duration-300 ${
              i < step ? "text-gray-400" : i === step ? "text-gray-900 font-medium" : "text-gray-200"
            }`}>
            <span className="w-4 shrink-0 flex justify-center">
              {i < step
                ? <CheckCircle2 size={14} className="text-emerald-500" />
                : i === step
                  ? <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse inline-block" />
                  : <span className="w-3 h-3 rounded-full border border-gray-200 inline-block" />
              }
            </span>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── État SUCCESS ─────────────────────────────────────────────────────────
function SuccessState({ tenderId }: { tenderId: number }) {
  const STORAGE_KEY = `memo_draft_${tenderId}`;
  const [copied, setCopied] = useState(false);
  const [memo, setMemo] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) ?? TECHNICAL_MEMO; } catch { return TECHNICAL_MEMO; }
  });
  const [saved, setSaved] = useState(false);

  const handleMemoChange = (val: string) => {
    setMemo(val);
    try { localStorage.setItem(STORAGE_KEY, val); } catch { /* ignore */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const copy = () => {
    navigator.clipboard.writeText(memo).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="space-y-5 p-5">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
        <div>
          <div className="text-sm font-bold text-emerald-800">Réponse générée avec succès</div>
          <div className="text-xs text-emerald-600">5 documents prêts — hors chiffrage</div>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-indigo-100"
          style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.06))" }}>
          <Sparkles size={14} className="text-indigo-500" />
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Analyse IA</span>
        </div>
        <div className="px-4 py-4 bg-white">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{AI_SUMMARY}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Documents générés</span>
        </div>
        {[
          { name: "Mémoire_technique_CPAM.docx", icon: "TEC", color: "#6366f1", size: "84 Ko" },
          { name: "DC1_SDECO_pré-rempli.pdf",    icon: "DC1", color: "#f59e0b", size: "42 Ko" },
          { name: "DC2_SDECO_pré-rempli.pdf",    icon: "DC2", color: "#f59e0b", size: "38 Ko" },
          { name: "Calendrier_previsionnel.xlsx", icon: "CAL", color: "#10b981", size: "21 Ko" },
          { name: "Checklist_CPAM.pdf",           icon: "CHK", color: "#6b7280", size: "12 Ko" },
        ].map((doc) => (
          <div key={doc.name}
            className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 group cursor-pointer transition-colors">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
              style={{ background: `${doc.color}18`, color: doc.color }}>{doc.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">{doc.name}</div>
              <div className="text-xs text-gray-400">{doc.size}</div>
            </div>
            <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 transition-all">
              <Download size={13} />
            </button>
          </div>
        ))}
      </div>

      <button className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
        <span className="flex items-center justify-center gap-2">
          <Download size={15} />Télécharger tout le dossier (.zip)
        </span>
      </button>

      <div className="px-3 py-2.5 rounded-xl bg-gray-50 border border-dashed border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-600">Chiffrage non inclus</strong> — DPGF, BPU et acte d'engagement restent à compléter par vos soins.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">Brouillon — Mémoire technique</span>
            {saved && <span className="text-[10px] text-emerald-600 font-medium">Sauvegardé</span>}
          </div>
          <button onClick={copy}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors">
            <Copy size={12} />{copied ? "Copié !" : "Copier"}
          </button>
        </div>
        <textarea value={memo} onChange={(e) => handleMemoChange(e.target.value)}
          className="w-full h-80 px-4 py-4 text-xs text-gray-700 font-mono leading-relaxed resize-none focus:outline-none bg-white"
          spellCheck={false} />
      </div>
    </div>
  );
}

// ─── Composant interne ─────────────────────────────────────────────────────
function StudioContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const tenderId = idParam ? parseInt(idParam) : 3;
  const tender = TENDERS.find((t) => t.id === tenderId) ?? TENDERS[2];

  type Phase = "upload" | "loading" | "success";
  const [phase, setPhase]     = useState<Phase>("upload");
  const [docs, setDocs]       = useState<UploadedDoc[]>([]);
  const [step, setStep]       = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addDocs  = (newDocs: UploadedDoc[]) => setDocs((prev) => [...prev, ...newDocs]);
  const removeDoc = (uid: string) => setDocs((prev) => prev.filter(d => d.uid !== uid));
  const changeType = (uid: string, type: DocTypeId) =>
    setDocs((prev) => prev.map(d => d.uid === uid ? { ...d, docType: type } : d));

  const launch = () => {
    setPhase("loading");
    setStep(0);
    setProgress(0);
    let currentStep = 0, elapsed = 0;
    const totalDuration = LOADING_STEPS.reduce((s, l) => s + l.duration, 0);
    const tick = () => {
      if (currentStep >= LOADING_STEPS.length) { setPhase("success"); return; }
      const dur = LOADING_STEPS[currentStep].duration;
      elapsed += dur;
      setStep(currentStep + 1);
      setProgress(Math.min(100, Math.round((elapsed / totalDuration) * 100)));
      currentStep++;
      timerRef.current = setTimeout(tick, dur);
    };
    timerRef.current = setTimeout(tick, 0);
  };

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);

  const hasKeyDocs = docs.some(d => d.docType === "rc" || d.docType === "cctp");
  const daysLeft   = tender.daysLeft;

  // Library warning
  const MISSING_ADMIN = ["DGFiP", "RC Pro"];
  const [libWarnShown, setLibWarnShown] = useState(false);
  const [libWarnDismissed, setLibWarnDismissed] = useState(false);

  const handleLaunch = () => {
    if (!libWarnDismissed && !libWarnShown) {
      setLibWarnShown(true); // first click: show warning
      return;
    }
    if (libWarnShown && !libWarnDismissed) {
      // second click on "Générer" while warning visible → ignore (user must click "Continuer" or "Bibliothèque")
      return;
    }
    launch();
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-auto">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100 px-8 py-4">
          <div className="flex items-center gap-4">
            <a href="/dashboard"
              className="text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1.5 text-sm shrink-0">
              <ChevronLeft size={16} />Dashboard AO
            </a>
            <span className="text-gray-200">/</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-sm font-bold text-gray-900 truncate">{tender.title}</h1>
                {tender.urgent && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 animate-pulse shrink-0">
                    <AlertTriangle size={10} /> J-{daysLeft} URGENT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400 mt-0.5">
                <span className="font-medium text-gray-600">{tender.client}</span>
                <span className="flex items-center gap-1"><Euro size={10} />{fmtAmount(tender.amount)}</span>
                {tender.location && <span className="flex items-center gap-1"><MapPin size={10} />{tender.location}</span>}
                <span className="flex items-center gap-1"><Clock size={10} />{tender.procedure}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <HowItWorks steps={[
                { title: "Déposez le DCE", desc: "Glissez tous les fichiers téléchargés sur la plateforme de l'acheteur — Nerolia identifie chaque pièce automatiquement." },
                { title: "Nerolia génère", desc: "Mémoire technique, DC1/DC2 pré-remplis et calendrier prévisionnel sont produits en quelques secondes." },
                { title: "Complétez le chiffrage", desc: "Le DPGF et l'acte d'engagement financier restent à compléter par vos soins avant soumission." },
              ]} />
              <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Score IA</div>
                <div className="text-2xl font-black" style={{ color: tender.score >= 90 ? "#10b981" : "#6366f1" }}>
                  {tender.score}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PHASE UPLOAD ────────────────────────────────────── */}
        {phase === "upload" && (
          <div className="p-6">
            {docs.length === 0 ? (
              /* Empty state — grande zone full-width */
              <div className="max-w-2xl mx-auto mt-8">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Déposez le dossier de consultation</h2>
                  <p className="text-sm text-gray-500">Nerolia identifie automatiquement chaque pièce du DCE</p>
                </div>
                <EmptyDropZone onFiles={addDocs} />
                <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-400">
                  {["RC","CCTP","CCAP","DPGF","BPU","AE","Plans","PGCSPS","HSE"].map(t => (
                    <span key={t} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />{t}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              /* Files uploaded — layout 2 colonnes */
              <div className="flex gap-5 items-start">

                {/* Gauche — fichiers identifiés */}
                <div className="flex-1 min-w-0 space-y-4">
                  <IdentifiedFilesList
                    docs={docs}
                    onRemove={removeDoc}
                    onChangeType={changeType}
                    onAddMore={addDocs}
                  />
                  <AdminDocsPanel />
                </div>

                {/* Droite — Studio IA */}
                <div className="w-72 shrink-0 space-y-4">

                  {/* AO info */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Lot ciblé</div>
                      <div className="text-xs font-semibold text-gray-800 leading-snug">{tender.lot}</div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Correspondance</span>
                      <span className="font-bold text-emerald-600">{tender.score}%</span>
                    </div>
                    {tender.urgent && (
                      <div className="flex items-center gap-2 text-xs text-red-600 font-semibold bg-red-50 rounded-lg px-2.5 py-2">
                        <AlertTriangle size={11} />Deadline dans {daysLeft} jours
                      </div>
                    )}
                  </div>

                  {/* Studio CTA */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={14} className="text-indigo-500" />
                      <span className="font-semibold text-sm text-gray-800">Studio IA</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      Mémoire technique, DC1/DC2 pré-remplis, calendrier — hors chiffrage.
                    </p>

                    {!hasKeyDocs && (
                      <div className="flex items-start gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                        <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                        Pour une réponse optimale, ajoutez le RC ou le CCTP
                      </div>
                    )}

                    {libWarnShown && !libWarnDismissed && (
                      <div className="mb-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle size={13} className="text-orange-500 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-orange-800 mb-1">Pièces admin manquantes</div>
                            <div className="text-xs text-orange-700 leading-relaxed mb-2">
                              {MISSING_ADMIN.join(" · ")} absents de votre bibliothèque — requis pour certains AO.
                            </div>
                            <div className="flex gap-2">
                              <a href="/documents"
                                className="text-xs font-semibold text-orange-800 underline underline-offset-2 hover:no-underline">
                                Compléter la bibliothèque
                              </a>
                              <span className="text-orange-300">·</span>
                              <button onClick={() => { setLibWarnDismissed(true); launch(); }}
                                className="text-xs text-orange-600 hover:text-orange-800 transition-colors">
                                Continuer quand même
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleLaunch}
                      className="w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)" }}
                    >
                      <span className="flex items-center justify-center gap-2.5">
                        <Zap size={16} />Générer la réponse
                      </span>
                    </button>

                  </div>

                  {/* Reset */}
                  <button
                    onClick={() => setDocs([])}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors py-2"
                  >
                    <RotateCcw size={12} />Recommencer le dépôt
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PHASE LOADING ────────────────────────────────────── */}
        {phase === "loading" && (
          <div className="p-6 max-w-lg mx-auto mt-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100"
                style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.04),rgba(139,92,246,0.04))" }}>
                <Sparkles size={15} className="text-indigo-500" />
                <span className="font-semibold text-sm text-gray-800">Studio IA — Nerolia</span>
                <span className="ml-auto text-xs font-semibold text-indigo-500 animate-pulse">Génération…</span>
              </div>
              <LoadingState step={step} progress={progress} />
            </div>
          </div>
        )}

        {/* ── PHASE SUCCESS ────────────────────────────────────── */}
        {phase === "success" && (
          <div className="p-6 flex gap-5 items-start">

            {/* Gauche — résumé DCE + admin */}
            <div className="w-72 shrink-0 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">DCE analysé</div>
                <div className="space-y-2">
                  {docs.map((doc) => {
                    const meta = getDocMeta(doc.docType);
                    return (
                      <div key={doc.uid} className="flex items-center gap-2.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 min-w-[32px] text-center"
                          style={{ background: `${meta.color}18`, color: meta.color }}>{meta.short}</span>
                        <span className="text-xs text-gray-600 truncate">{doc.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <AdminDocsPanel />
            </div>

            {/* Droite — résultat Studio IA */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100"
                  style={{ background: "rgba(16,185,129,0.04)" }}>
                  <Sparkles size={15} className="text-emerald-500" />
                  <span className="font-semibold text-sm text-gray-800">Studio IA — Nerolia</span>
                  <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                    ✓ Dossier prêt
                  </span>
                </div>
                <SuccessState tenderId={tender.id} />
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────
export default function ReponsesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#F6F8FA]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-400">Chargement...</div>
        </main>
      </div>
    }>
      <StudioContent />
    </Suspense>
  );
}
