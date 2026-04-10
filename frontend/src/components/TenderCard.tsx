import { Tender, TenderStatus } from "@/lib/api";

const STATUS_LABELS: Record<TenderStatus, string> = {
  new: "Nouveau",
  reviewed: "Vu",
  shortlisted: "Retenu",
  responding: "En cours",
  submitted: "Soumis",
  won: "Gagné",
  lost: "Perdu",
  ignored: "Ignoré",
};

const SOURCE_COLOR: Record<string, string> = {
  boamp: "bg-violet-50 text-violet-700",
  place: "bg-teal-50 text-teal-700",
  ted: "bg-orange-50 text-orange-700",
  nerolia: "bg-emerald-50 text-emerald-700",
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const pct = Math.round(score * 100);
  const ring = pct >= 70 ? "ring-red-400 text-red-600" : pct >= 50 ? "ring-yellow-400 text-yellow-600" : "ring-gray-300 text-gray-500";
  return (
    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full ring-2 text-sm font-bold flex-shrink-0 ${ring}`}>
      {pct}%
    </span>
  );
}

function DeadlineBadge({ deadline }: { deadline: string | null }) {
  if (!deadline) return null;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  const color = days <= 7 ? "bg-red-50 text-red-600" : days <= 14 ? "bg-yellow-50 text-yellow-700" : "bg-gray-50 text-gray-500";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {days < 0 ? "Clôturé" : `J-${days}`}
    </span>
  );
}

interface Props {
  tender: Tender;
  onStatusChange?: (id: number, status: TenderStatus) => void;
}

export default function TenderCard({ tender, onStatusChange }: Props) {
  const valueStr = tender.estimated_value
    ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(tender.estimated_value)
    : "Montant N/C";

  const deadlineStr = tender.deadline
    ? new Date(tender.deadline).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
      <div className="flex gap-3">
        <ScoreBadge score={tender.match_score} />
        <div className="flex-1 min-w-0">
          {tender.url && tender.url !== "#" ? (
            <a
              href={tender.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 mb-2 hover:text-blue-700 hover:underline transition-colors cursor-pointer block"
            >
              {tender.title}
            </a>
          ) : (
            <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 mb-2">
              {tender.title}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="font-medium text-gray-700">{tender.buyer?.split("—")[0].trim()}</span>
            <span>{tender.location?.split("(")[0].trim()}</span>
            <span className="font-semibold text-gray-700">{valueStr}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLOR[tender.source] || "bg-gray-50 text-gray-500"}`}>
                {tender.source.toUpperCase()}
              </span>
              {deadlineStr && <DeadlineBadge deadline={tender.deadline} />}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={tender.status}
                onChange={(e) => onStatusChange?.(tender.id, e.target.value as TenderStatus)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 cursor-pointer bg-white hover:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
              >
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
