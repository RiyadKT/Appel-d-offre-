import Link from "next/link";

const PLANS = [
  {
    name: "Starter",
    price: "149",
    period: "/mois",
    desc: "Pour les TPE qui veulent démarrer la veille AO sans effort.",
    highlight: false,
    features: [
      "Scraping BOAMP + PLACE quotidien",
      "Jusqu'à 50 AO analysés/mois",
      "Score de pertinence automatique",
      "Alertes email (1 adresse)",
      "Dashboard Kanban",
      "Profil entreprise basique",
    ],
    cta: "Commencer",
    ctaHref: "/dashboard",
  },
  {
    name: "Pro",
    price: "399",
    period: "/mois",
    desc: "Pour les PME BTP qui veulent répondre plus vite et mieux.",
    highlight: true,
    features: [
      "Tout Starter +",
      "Scraping toutes les 2h",
      "AO illimités analysés",
      "Analyse DCE par IA (Claude)",
      "Génération mémoire technique",
      "Pré-remplissage DC1 / DC2",
      "Alertes email + Slack",
      "Matching sémantique (embeddings)",
    ],
    cta: "Essai 14 jours gratuit",
    ctaHref: "/dashboard",
  },
  {
    name: "Entreprise",
    price: "Sur devis",
    period: "",
    desc: "ETI et grandes structures avec des besoins spécifiques.",
    highlight: false,
    features: [
      "Tout Pro +",
      "Multi-profils / multi-entités",
      "Assembly dossier complet (PDF)",
      "Intégration signature électronique",
      "API privée + webhooks",
      "Onboarding dédié",
      "SLA 99,9% + support prioritaire",
    ],
    cta: "Nous contacter",
    ctaHref: "#",
  },
];

const COSTS = [
  {
    category: "Infrastructure",
    items: [
      { label: "PostgreSQL + Redis (Render / Railway)", monthly: "25", note: "ou gratuit en self-hosted" },
      { label: "Hébergement backend (FastAPI)", monthly: "15", note: "Render free tier possible" },
      { label: "Hébergement frontend (Vercel)", monthly: "0", note: "Gratuit jusqu'à usage pro" },
    ],
  },
  {
    category: "APIs tierces",
    items: [
      { label: "BOAMP API", monthly: "0", note: "Publique et gratuite" },
      { label: "PLACE scraping", monthly: "0", note: "Publique" },
      { label: "Resend (emails)", monthly: "0", note: "Gratuit jusqu'à 3 000 emails/mois" },
    ],
  },
  {
    category: "IA (Claude — coût variable)",
    items: [
      { label: "Scoring / NLP léger", monthly: "~5", note: "Embeddings text-embedding-3-small" },
      { label: "Analyse DCE (50 docs/mois)", monthly: "~120", note: "~100k tokens / DCE × 50 = $2.40 each" },
      { label: "Génération mémoire technique", monthly: "~80", note: "~8k tokens output × 50 AO" },
    ],
  },
];

export default function PricingPage() {
  const infraTotal = 40;
  const aiLow = 5;
  const aiHigh = 200;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold">AO</div>
          <span className="font-semibold text-gray-900">AppelOffre.io</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Accueil</Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tarifs clairs, sans surprise</h1>
          <p className="text-gray-500 text-lg">Un AO gagné rembourse l'abonnement annuel entier.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-7 flex flex-col ${
                plan.highlight
                  ? "border-blue-500 bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105"
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan.highlight && (
                <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full w-fit mb-4">
                  Recommandé
                </span>
              )}
              <div className="mb-1 font-bold text-lg">{plan.name}</div>
              <div className="mb-3">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? "text-blue-200" : "text-gray-400"}`}>{plan.period}</span>
              </div>
              <p className={`text-sm mb-6 leading-relaxed ${plan.highlight ? "text-blue-100" : "text-gray-500"}`}>
                {plan.desc}
              </p>
              <ul className="flex-1 space-y-2 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 shrink-0 ${plan.highlight ? "text-blue-200" : "text-green-500"}`}>✓</span>
                    <span className={plan.highlight ? "text-blue-50" : "text-gray-700"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaHref}
                className={`text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Coûts d'exploitation */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coûts d'exploitation réels</h2>
          <p className="text-gray-500 text-sm mb-8">
            Transparence totale sur ce que coûte faire tourner la plateforme — pour 1 entreprise cliente.
          </p>

          <div className="space-y-6">
            {COSTS.map((section) => (
              <div key={section.category} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-3 bg-gray-100 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{section.category}</span>
                </div>
                <table className="w-full">
                  <tbody>
                    {section.items.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="px-6 py-3 text-sm text-gray-700">{item.label}</td>
                        <td className="px-6 py-3 text-sm text-gray-400 text-center">{item.note}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-right text-gray-800 whitespace-nowrap">
                          {item.monthly === "0" ? (
                            <span className="text-green-600">Gratuit</span>
                          ) : (
                            `~${item.monthly} €/mois`
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Résumé */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">~{infraTotal} €</div>
                <div className="text-sm text-gray-500 mt-1">Infrastructure fixe/mois</div>
              </div>
              <div className="border-x border-gray-100 px-6">
                <div className="text-2xl font-bold text-orange-500">
                  ~{aiLow}–{aiHigh} €
                </div>
                <div className="text-sm text-gray-500 mt-1">IA variable selon usage</div>
                <div className="text-xs text-gray-400 mt-0.5">Le gros poste si volume élevé de DCE</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">~{infraTotal + aiLow}–{infraTotal + aiHigh} €</div>
                <div className="text-sm text-gray-500 mt-1">Coût total opérateur/mois</div>
                <div className="text-xs text-gray-400 mt-0.5">Marge nette forte sur le plan Pro</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ rapide */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Questions fréquentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: "Comment est calculé le coût IA ?",
                a: "Chaque analyse de DCE coûte ~$2.40 (100k tokens Claude Opus). En filtrant en amont par score, on n'analyse que les AO pertinents — en pratique 10-20 docs/mois max.",
              },
              {
                q: "Peut-on réduire les coûts IA ?",
                a: "Oui : utiliser Claude Haiku pour le pré-filtrage (10x moins cher) et réserver Claude Opus pour la génération finale de la mémoire technique.",
              },
              {
                q: "Les données BOAMP sont-elles fiables ?",
                a: "BOAMP est le journal officiel des marchés publics français — source légale et exhaustive, mise à jour quotidiennement.",
              },
              {
                q: "La réponse générée est-elle directement envoyable ?",
                a: "Elle sert de base de travail (80% du contenu). Un expert valide et personalise avant envoi — gain estimé : 12h par AO.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="font-semibold text-sm text-gray-900 mb-2">{q}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
