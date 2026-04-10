import Link from "next/link";
import Image from "next/image";

const G = "#00C28B";
const GL = "#00E6A3";
const BG = "#0f0f23";

const STATS = [
  { value: "4 200+", label: "Appels d'offre analysés/mois" },
  { value: "73%",    label: "Taux de pertinence moyen" },
  { value: "−12h",   label: "Gagné par AO répondu" },
  { value: "38%",    label: "Taux de succès clients" },
];

const FEATURES = [
  { icon: "▦", title: "Veille automatique 24/7",       desc: "BOAMP, PLACE, TED — tous les marchés agrégés et filtrés selon votre profil en temps réel." },
  { icon: "◎", title: "Score de pertinence IA",         desc: "Chaque AO est scoré selon votre secteur, CA, certifications, région et capacité financière." },
  { icon: "◈", title: "Réponse semi-automatique",       desc: "Mémoire technique, DC1/DC2, calendrier — générés en quelques secondes." },
  { icon: "◉", title: "Alertes instantanées",           desc: "Email, Slack ou SMS dès qu'un AO à fort score est détecté." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Satoshi, sans-serif" }}>
      {/* Nav */}
      <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/nerolia-logo.jpeg" alt="Nerolia" width={32} height={32} className="rounded-lg object-cover" />
          <span className="font-extrabold text-gray-900">Nerolia</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">Dashboard</Link>
          <Link href="/profile"   className="text-sm text-gray-500 hover:text-gray-900">Profil</Link>
          <Link href="/pricing"   className="text-sm text-gray-500 hover:text-gray-900">Tarifs</Link>
          <Link href="/deck"      className="text-sm text-gray-500 hover:text-gray-900">Présentation</Link>
          <Link href="/dashboard" className="text-sm text-white px-4 py-2 rounded-xl font-semibold" style={{ background: `linear-gradient(135deg, ${G}, ${GL})` }}>
            Voir la démo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6" style={{ background: "rgba(0,194,139,0.1)", color: G }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: G }} />
          Nouveau : analyse DCE par IA en 30 secondes
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Gagnez les appels d'offre<br />
          <span style={{ background: `linear-gradient(135deg, ${G}, ${GL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            avant vos concurrents
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Veille automatisée sur tous les marchés publics + réponses générées par IA adaptées à votre profil.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard" className="px-8 py-4 text-white rounded-2xl font-bold shadow-lg transition-opacity hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${G}, ${GL})`, boxShadow: "0 8px 32px rgba(0,194,139,0.3)", color: "#0f0f23" }}>
            Voir le dashboard →
          </Link>
          <Link href="/deck" className="px-8 py-4 border border-gray-200 rounded-2xl font-semibold hover:bg-gray-50 text-gray-700">
            Voir la présentation
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 py-12" style={{ background: "#fafafa" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black mb-1" style={{ color: G }}>{s.value}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-extrabold text-center mb-12">Comment ça fonctionne</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-6 border border-gray-100 rounded-2xl hover:border-transparent transition-all hover:shadow-lg group"
              style={{ borderRadius: 20 }}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-white py-16 text-center" style={{ background: BG }}>
        <Image src="/nerolia-logo.jpeg" alt="Nerolia" width={48} height={48} className="rounded-xl object-cover mx-auto mb-4" />
        <h2 className="text-3xl font-extrabold mb-4">Prêt à gagner plus d'appels d'offre ?</h2>
        <p className="mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
          Configurez votre profil en 2 minutes. Les premiers résultats arrivent en quelques heures.
        </p>
        <Link href="/dashboard" className="px-8 py-4 rounded-2xl font-bold transition-opacity hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${G}, ${GL})`, color: BG }}>
          Accéder au dashboard →
        </Link>
      </section>

      <footer className="text-center text-xs text-gray-300 py-6">
        Nerolia — Démo produit — Données fictives à titre illustratif
      </footer>
    </div>
  );
}
