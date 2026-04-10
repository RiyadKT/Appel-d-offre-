export default function ScoreIndicator({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400">N/A</span>;

  const pct = Math.round(score * 100);
  const color =
    pct >= 70 ? "text-red-600 bg-red-50" :
    pct >= 50 ? "text-yellow-600 bg-yellow-50" :
    "text-green-700 bg-green-50";

  return (
    <span className={`px-2 py-0.5 rounded text-sm font-semibold ${color}`}>
      {pct}%
    </span>
  );
}
