"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const G   = "#00C28B";
const GL  = "#00E6A3";
const BG  = "#0f0f23";

// ─── Slides ───────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 1, layout: "cover",
    title: "Nerolia",
    subtitle: "Veille & réponse automatisée\naux appels d'offre publics",
    version: "Présentation produit — 2024",
  },
  {
    id: 2, layout: "inequality",
    tag: "Le vrai problème",
    title: "Les mêmes entreprises\ngagnent à chaque fois.",
    body: "Pas parce qu'elles sont meilleures sur le terrain.",
    points: [
      "Elles ont 1 à 3 personnes dédiées aux réponses AO",
      "Elles utilisent des outils spécialisés : Klekoon, Atexo, Deskera…",
      "Elles sous-traitent la rédaction des mémoires techniques",
      "Elles soumettent en moyenne 10× plus de dossiers que les TPE/PME",
    ],
    callout: { value: "×10", label: "plus d'AO soumis\npar les grandes structures", color: "#f87171" },
  },
  {
    id: 3, layout: "urgency",
    tag: "Ce qui est en jeu",
    title: "Si vous ne suivez pas,\nvous perdez du temps\net des chantiers.",
    statement: "Un marché public non soumis, c'est un chantier\nobtenu par un concurrent mieux équipé.",
    losses: [
      { label: "AOs invisibles",      desc: "800 marchés publiés par jour — sans outil de veille, vous en ratez la quasi-totalité.", color: "#f87171" },
      { label: "Temps gaspillé",      desc: "15 à 40h par réponse sans aide IA — sur des dossiers incomplets qui finissent disqualifiés.", color: "#fb923c" },
      { label: "Terrain perdu",       desc: "Chaque année sans outil, vos concurrents équipés consolident leurs références et creusent l'écart.", color: "#fbbf24" },
    ],
  },
  {
    id: 3.5, layout: "split",
    tag: "Le marché",
    title: "100 Md€ de marchés publics par an en France",
    body: "Collectivités, hôpitaux, universités, entreprises publiques — tous soumis à l'obligation de publication. La donnée est publique. Elle n'attend que d'être traitée.",
    bullets: [
      "130 000+ acheteurs publics actifs",
      "Marchés accessibles dès 25 000 €",
      "Tous secteurs : BTP, IT, conseil, santé, formation…",
      "3 à 8 candidats en moyenne par AO",
    ],
    accent: "100 Md€",
  },
  {
    id: 4, layout: "center",
    tag: "La solution",
    title: "Nerolia — votre copilote IA\npour les appels d'offre",
    steps: [
      { num: "01", title: "Identifie", desc: "Scraping continu de toutes les plateformes. Chaque AO est scoré selon votre profil en temps réel.", color: G },
      { num: "02", title: "Alerte",    desc: "Notification instantanée dès qu'un AO dépasse votre seuil de pertinence. Email, Slack, SMS.", color: "#667eea" },
      { num: "03", title: "Répond",    desc: "Analyse du DCE, génération de la mémoire technique, pièces admin pré-remplies — en quelques minutes.", color: "#f093fb" },
    ],
  },
  {
    id: 5, layout: "product",
    tag: "Le produit",
    title: "Un tableau de bord pensé\npour les équipes terrain",
    features: [
      { label: "Dashboard Kanban",       desc: "Vue d'ensemble de tous vos AO — Nouveau, Retenu, En cours, Soumis.", color: G },
      { label: "Score de pertinence IA", desc: "Algorithme multi-critères : secteur, montant, région, certifications, délai.", color: "#667eea" },
      { label: "Dossier de réponse",     desc: "Upload par catégorie (DCE, admin, technique, financier) + génération IA intégrée.", color: "#f093fb" },
      { label: "Bibliothèque docs",      desc: "Base centralisée des pièces récurrentes avec suivi d'expiration automatique.", color: "#fb923c" },
    ],
  },
  {
    id: 6, layout: "comparison",
    tag: "Avant / Après",
    title: "Ce qui change concrètement",
    before: [
      "Veille manuelle sur 5+ sites",
      "Excel pour trier les AO",
      "2 jours pour rédiger une réponse",
      "AOs manqués faute de temps",
      "Dossier incomplet = disqualification",
    ],
    after: [
      "Toutes les sources agrégées automatiquement",
      "Score de pertinence instantané",
      "Mémoire technique générée en 10 min",
      "Zéro AO manqué dans votre secteur",
      "Checklist des pièces complète automatiquement",
    ],
  },
  {
    id: 7, layout: "metrics",
    tag: "Impact",
    title: "Ce que ça change\nen chiffres",
    metrics: [
      { value: "−90%", label: "de temps sur la veille",       icon: "◷" },
      { value: "−70%", label: "de temps de rédaction par AO", icon: "◈" },
      { value: "×3",   label: "d'AO soumis par trimestre",    icon: "▲" },
      { value: "+38%", label: "de taux de succès",            icon: "★" },
    ],
    footnote: "Un seul AO gagné rembourse 2 ans d'abonnement.",
  },
  {
    id: 9, layout: "simplepricing",
    tag: "Tarifs",
    title: "Simple.\nTransparent.\nSans surprise.",
    installation: {
      label: "Installation",
      price: "1 500 €",
      type: "paiement unique",
      features: [
        "Intégration à votre profil entreprise",
        "Configuration des alertes secteur / région",
        "Formation & prise en main (demi-journée)",
        "Bibliothèque documentaire initialisée",
      ],
    },
    monthly: {
      label: "Abonnement mensuel",
      price: "299 €",
      type: "/ mois",
      features: [
        "Veille automatique 24/7 — toutes sources",
        "Génération IA illimitée (mémoires, DC1/DC2…)",
        "Alertes email + Slack",
        "Support inclus + mises à jour continues",
      ],
    },
    footnote: "Retour sur investissement dès le 1er marché gagné.",
  },
  {
    id: 10, layout: "cta_deal",
    tag: "La proposition",
    title: "Votre solution\nà 0 €\navec Nerolia.",
    subtitle: "Le premier mois est offert. On installe, on configure, on vous forme.",
    offer: [
      { label: "Installation offerte",    value: "1 500 € de valeur" },
      { label: "Premier mois offert",     value: "299 € de valeur" },
      { label: "Accompagnement 30 jours", value: "Dédié et inclus" },
    ],
    cta: "On en discute ?",
    contact: "contact@nerolia.fr",
    href: "/dashboard",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Image src="/nerolia-logo.jpeg" alt="Nerolia" width={size} height={size} className="rounded-lg object-cover" />
      <span className="font-extrabold text-white" style={{ fontSize: size * 0.55 }}>Nerolia</span>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="text-xs font-bold tracking-widest uppercase mb-4 block" style={{ color: G }}>
      {label}
    </span>
  );
}

function Check({ text, color = G }: { text: string; color?: string }) {
  return (
    <li className="flex items-start gap-3 text-white/80 text-sm">
      <span className="mt-0.5 shrink-0 font-bold" style={{ color }}>✓</span>
      {text}
    </li>
  );
}

// ─── Slide layouts ─────────────────────────────────────────────────────────────

function SlideCover({ s }: { s: any }) {
  return (
    <div className="relative flex flex-col items-center justify-center w-full text-center overflow-hidden rounded-3xl" style={{ minHeight: 480 }}>
      {/* photo de fond */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80" alt=""
        className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.22 }} />
      <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(to bottom, rgba(15,15,35,0.55), rgba(15,15,35,0.92))" }} />
      {/* contenu */}
      <div className="relative z-10 py-14">
        <Image src="/nerolia-logo.jpeg" alt="Nerolia" width={72} height={72} className="rounded-2xl object-cover mb-8 mx-auto" />
        <h1 className="text-8xl font-black text-white mb-4" style={{ letterSpacing: "-3px" }}>{s.title}</h1>
        <p className="text-xl text-white/40 whitespace-pre-line mb-10">{s.subtitle}</p>
        <div className="w-16 h-0.5 mb-10 mx-auto" style={{ background: `linear-gradient(90deg, ${G}, ${GL})` }} />
        <p className="text-xs text-white/20 tracking-widest uppercase">{s.version}</p>
      </div>
    </div>
  );
}

function SlideHero({ s }: { s: any }) {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
      <div className="flex-1">
        <Tag label={s.tag} />
        <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.08] whitespace-pre-line mb-6">{s.title}</h1>
        <p className="text-lg text-white/50 whitespace-pre-line leading-relaxed">{s.body}</p>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          {s.stats?.map((st: any) => (
            <div key={st.label} className="rounded-2xl p-5 text-center border"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="text-2xl font-black mb-1" style={{ color: st.color }}>{st.value}</div>
              <div className="text-xs text-white/40 leading-tight">{st.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideSplit({ s }: { s: any }) {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-16 w-full">
      <div className="flex-1">
        <Tag label={s.tag} />
        <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">{s.title}</h2>
        <p className="text-white/50 leading-relaxed mb-8">{s.body}</p>
        <ul className="space-y-3">
          {s.bullets?.map((b: string) => <Check key={b} text={b} />)}
        </ul>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="relative rounded-3xl overflow-hidden w-full" style={{ minHeight: 300 }}>
          {/* photo infrastructure publique */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80" alt=""
            className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.3 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,194,139,0.08), rgba(15,15,35,0.75))" }} />
          <div className="relative z-10 p-10 text-center">
            <div className="text-8xl xl:text-9xl font-black"
              style={{ background: `linear-gradient(135deg, ${G}, ${GL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {s.accent}
            </div>
            <div className="text-white/40 text-sm mt-3">de marchés publics / an</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideCenter({ s }: { s: any }) {
  return (
    <div className="flex flex-col items-center w-full">
      <Tag label={s.tag} />
      <h2 className="text-4xl xl:text-5xl font-extrabold text-white text-center whitespace-pre-line mb-12 leading-tight">{s.title}</h2>
      <div className="grid grid-cols-3 gap-6 w-full max-w-4xl">
        {s.steps?.map((step: any) => (
          <div key={step.num} className="rounded-2xl p-6 flex flex-col gap-4 border"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: step.color }}>{step.num}</div>
            <div>
              <div className="text-white font-bold text-lg mb-2">{step.title}</div>
              <div className="text-white/50 text-sm leading-relaxed">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideInequality({ s }: { s: any }) {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
      <div className="flex-1">
        <Tag label={s.tag} />
        <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.08] whitespace-pre-line mb-3">{s.title}</h1>
        <p className="text-white/40 text-lg mb-8 italic">{s.body}</p>
        <ul className="space-y-3">
          {s.points?.map((p: string) => (
            <li key={p} className="flex items-start gap-3 text-white/70 text-sm">
              <span className="mt-0.5 shrink-0 font-bold" style={{ color: "#f87171" }}>—</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="relative rounded-3xl overflow-hidden w-full" style={{ minHeight: 300 }}>
          {/* photo chantier */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80" alt=""
            className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.35 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,15,35,0.5), rgba(248,113,113,0.12))" }} />
          <div className="relative z-10 p-10 text-center">
            <div className="text-8xl font-black mb-3" style={{ color: s.callout?.color }}>{s.callout?.value}</div>
            <div className="text-white/60 text-sm whitespace-pre-line leading-relaxed">{s.callout?.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideUrgency({ s }: { s: any }) {
  return (
    <div className="flex flex-col w-full">
      <Tag label={s.tag} />
      <h2 className="text-4xl xl:text-5xl font-extrabold text-white whitespace-pre-line mb-5 leading-tight">{s.title}</h2>
      <p className="text-white/35 text-base whitespace-pre-line mb-8 italic border-l-2 pl-4" style={{ borderColor: "#f87171" }}>
        {s.statement}
      </p>
      <div className="grid grid-cols-3 gap-5">
        {s.losses?.map((l: any) => (
          <div key={l.label} className="rounded-2xl p-5 border flex flex-col gap-3"
            style={{ background: `${l.color}08`, borderColor: `${l.color}25` }}>
            <div className="text-sm font-bold" style={{ color: l.color }}>{l.label}</div>
            <div className="text-white/50 text-sm leading-relaxed">{l.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideProduct({ s }: { s: any }) {
  return (
    <div className="flex flex-col w-full">
      <Tag label={s.tag} />
      <h2 className="text-4xl font-extrabold text-white whitespace-pre-line mb-8 leading-tight">{s.title}</h2>
      <div className="grid grid-cols-2 gap-5">
        {s.features?.map((f: any) => (
          <div key={f.label} className="rounded-2xl p-5 border flex flex-col gap-3"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="w-1 h-6 rounded-full" style={{ background: f.color }} />
            <div className="font-bold text-white text-base">{f.label}</div>
            <div className="text-white/50 text-sm leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideComparison({ s }: { s: any }) {
  return (
    <div className="flex flex-col w-full">
      <Tag label={s.tag} />
      <h2 className="text-4xl font-extrabold text-white mb-8">{s.title}</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 border" style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#f87171" }}>Avant</div>
          <ul className="space-y-3">
            {s.before?.map((b: string) => (
              <li key={b} className="flex items-start gap-3 text-white/50 text-sm">
                <span className="shrink-0 mt-0.5" style={{ color: "#f87171" }}>✕</span>{b}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl p-6 border" style={{ background: "rgba(0,194,139,0.06)", borderColor: "rgba(0,194,139,0.25)" }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: G }}>Avec Nerolia</div>
          <ul className="space-y-3">
            {s.after?.map((a: string) => <Check key={a} text={a} />)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SlideMetrics({ s }: { s: any }) {
  return (
    <div className="flex flex-col items-center w-full">
      <Tag label={s.tag} />
      <h2 className="text-4xl xl:text-5xl font-extrabold text-white text-center whitespace-pre-line mb-12 leading-tight">{s.title}</h2>
      <div className="grid grid-cols-4 gap-5 w-full max-w-4xl mb-8">
        {s.metrics?.map((m: any) => (
          <div key={m.label} className="rounded-2xl p-6 text-center border"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="text-2xl text-white/25 mb-3">{m.icon}</div>
            <div className="text-3xl font-black mb-2" style={{ color: G }}>{m.value}</div>
            <div className="text-white/40 text-xs leading-snug">{m.label}</div>
          </div>
        ))}
      </div>
      {s.footnote && <p className="text-white/25 text-sm italic">{s.footnote}</p>}
    </div>
  );
}

function SlidePersonas({ s }: { s: any }) {
  return (
    <div className="flex flex-col w-full">
      <Tag label={s.tag} />
      <h2 className="text-4xl font-extrabold text-white whitespace-pre-line mb-8 leading-tight">{s.title}</h2>
      <div className="grid grid-cols-3 gap-5">
        {s.personas?.map((p: any) => (
          <div key={p.type} className="rounded-2xl p-5 flex flex-col border"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: `${p.color}30` }}>
            <div className="font-bold text-base mb-3" style={{ color: p.color }}>{p.type}</div>
            <p className="text-white/50 text-sm leading-relaxed flex-1 mb-4">{p.desc}</p>
            <div className="space-y-2">
              <div className="text-xs rounded-xl p-2.5" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171" }}>
                <span className="font-semibold">Douleur — </span>{p.pain}
              </div>
              <div className="text-xs rounded-xl p-2.5" style={{ background: `${p.color}15`, color: p.color }}>
                <span className="font-semibold">Gain — </span>{p.gain}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlidePricing({ s }: { s: any }) {
  return (
    <div className="flex flex-col w-full">
      <Tag label={s.tag} />
      <h2 className="text-4xl font-extrabold text-white mb-8">{s.title}</h2>
      <div className="grid grid-cols-3 gap-5">
        {s.plans?.map((plan: any) => (
          <div key={plan.name} className="rounded-2xl p-6 flex flex-col border relative"
            style={{
              background: plan.highlight ? `${plan.color}0F` : "rgba(255,255,255,0.04)",
              borderColor: plan.highlight ? `${plan.color}50` : "rgba(255,255,255,0.08)",
            }}>
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full text-white whitespace-nowrap"
                style={{ background: plan.color }}>
                Recommandé
              </div>
            )}
            <div className="font-bold text-white text-lg mb-0.5">{plan.name}</div>
            <div className="text-white/30 text-xs mb-4">{plan.desc}</div>
            <div className="mb-5">
              <span className="text-3xl font-black" style={{ color: plan.color }}>{plan.price}</span>
              {plan.period && <span className="text-white/30 text-sm ml-1">{plan.period}</span>}
            </div>
            <ul className="space-y-2.5">
              {plan.features?.map((f: string) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="shrink-0 mt-0.5 font-bold" style={{ color: plan.color }}>✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {s.footnote && <p className="text-white/20 text-xs mt-5 text-center">{s.footnote}</p>}
    </div>
  );
}

function SlideClosing({ s }: { s: any }) {
  return (
    <div className="flex flex-col items-center justify-center w-full text-center" style={{ minHeight: 400 }}>
      <Tag label={s.tag} />
      <h2 className="text-5xl xl:text-6xl font-extrabold text-white whitespace-pre-line mb-6 leading-tight">{s.title}</h2>
      <p className="text-white/50 text-lg max-w-xl mb-10">{s.body}</p>
      <div className="flex gap-4 mb-8">
        {s.ctas?.map((cta: any) => (
          <a key={cta.label} href={cta.href}
            className="px-8 py-4 rounded-2xl font-bold text-sm transition-all"
            style={cta.primary
              ? { background: `linear-gradient(135deg, ${G}, ${GL})`, color: BG }
              : { border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }
            }>
            {cta.label}
          </a>
        ))}
      </div>
      {s.contact && <p className="text-white/30 text-sm mb-2">{s.contact}</p>}
      {s.footnote && <p className="text-white/15 text-xs">{s.footnote}</p>}
    </div>
  );
}

function SlideSimpricePricing({ s }: { s: any }) {
  return (
    <div className="flex flex-col lg:flex-row gap-10 w-full items-center">
      {/* Texte gauche */}
      <div className="lg:w-64 shrink-0">
        <Tag label={s.tag} />
        <h2 className="text-4xl xl:text-5xl font-extrabold text-white whitespace-pre-line leading-tight">{s.title}</h2>
      </div>

      {/* Installation */}
      <div className="flex-1 rounded-2xl p-7 border flex flex-col gap-4"
        style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="text-xs font-bold uppercase tracking-widest text-white/30">{s.installation?.label}</div>
        <div>
          <span className="text-5xl font-black text-white">{s.installation?.price}</span>
          <span className="text-white/30 text-sm ml-2">{s.installation?.type}</span>
        </div>
        <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
        <ul className="space-y-2.5">
          {s.installation?.features?.map((f: string) => (
            <li key={f} className="flex items-start gap-2 text-sm text-white/60">
              <span className="shrink-0 mt-0.5 font-bold text-white/25">–</span>{f}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-white/20 text-2xl shrink-0 font-light">+</div>

      {/* Mensuel */}
      <div className="flex-1 rounded-2xl p-7 border flex flex-col gap-4 relative"
        style={{ background: `${G}0D`, borderColor: `${G}40` }}>
        <div className="absolute -top-3 left-6 text-xs font-bold px-3 py-1 rounded-full text-white"
          style={{ background: G }}>Récurrent</div>
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: G }}>{s.monthly?.label}</div>
        <div>
          <span className="text-5xl font-black" style={{ color: G }}>{s.monthly?.price}</span>
          <span className="text-white/30 text-sm ml-2">{s.monthly?.type}</span>
        </div>
        <div className="w-8 h-px" style={{ background: `${G}40` }} />
        <ul className="space-y-2.5">
          {s.monthly?.features?.map((f: string) => (
            <li key={f} className="flex items-start gap-2 text-sm text-white/70">
              <span className="shrink-0 mt-0.5 font-bold" style={{ color: G }}>✓</span>{f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SlideCtaDeal({ s }: { s: any }) {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-16 w-full">
      {/* Gauche */}
      <div className="flex-1">
        <Tag label={s.tag} />
        <h2 className="text-5xl xl:text-6xl font-extrabold text-white whitespace-pre-line leading-tight mb-6">{s.title}</h2>
        <p className="text-white/40 text-lg mb-10">{s.subtitle}</p>
        <a href={s.href}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm"
          style={{ background: `linear-gradient(135deg, ${G}, ${GL})`, color: BG }}>
          {s.cta} →
        </a>
        {s.contact && <p className="text-white/25 text-sm mt-5">{s.contact}</p>}
      </div>

      {/* Droite — offre */}
      <div className="flex-1 rounded-3xl p-8 border space-y-4"
        style={{ background: `${G}08`, borderColor: `${G}30` }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: G }}>Ce que vous obtenez</div>
        {s.offer?.map((item: any) => (
          <div key={item.label} className="flex items-center justify-between gap-6 py-3 border-b border-white/5 last:border-0">
            <div>
              <div className="text-white font-semibold text-sm">{item.label}</div>
            </div>
            <div className="text-xs font-bold px-3 py-1.5 rounded-xl shrink-0"
              style={{ background: `${G}20`, color: G }}>
              {item.value}
            </div>
          </div>
        ))}
        <div className="pt-4 border-t border-white/10">
          <div className="text-4xl font-black text-white">0 €</div>
          <div className="text-white/30 text-sm mt-1">pour démarrer — engagement mensuel résiliable</div>
        </div>
      </div>
    </div>
  );
}

function renderSlide(slide: (typeof SLIDES)[number]) {
  switch (slide.layout) {
    case "cover":       return <SlideCover s={slide} />;
    case "hero":        return <SlideHero s={slide} />;
    case "inequality":  return <SlideInequality s={slide} />;
    case "urgency":     return <SlideUrgency s={slide} />;
    case "split":       return <SlideSplit s={slide} />;
    case "center":      return <SlideCenter s={slide} />;
    case "product":     return <SlideProduct s={slide} />;
    case "comparison":  return <SlideComparison s={slide} />;
    case "metrics":     return <SlideMetrics s={slide} />;
    case "personas":    return <SlidePersonas s={slide} />;
    case "pricing":        return <SlidePricing s={slide} />;
    case "simplepricing":  return <SlideSimpricePricing s={slide} />;
    case "cta_deal":       return <SlideCtaDeal s={slide} />;
    case "closing":        return <SlideClosing s={slide} />;
    default:               return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Deck() {
  const [current, setCurrent] = useState(0);
  const [pdfMode, setPdfMode] = useState(false);
  const total = SLIDES.length;

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent((c) => Math.min(total - 1, c + 1)), [total]);

  useEffect(() => {
    if (pdfMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", " "].includes(e.key)) next();
      if (["ArrowLeft", "ArrowUp"].includes(e.key)) prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, pdfMode]);

  // ── PDF mode ────────────────────────────────────────────────────────────────
  if (pdfMode) {
    return (
      <>
        <style>{`
          @page { size: A4 landscape; margin: 0; }
          @media print {
            .no-print { display: none !important; }
            .pdf-slide { break-after: page; page-break-after: always; }
            .pdf-slide:last-child { break-after: avoid; page-break-after: avoid; }
          }
        `}</style>

        {/* Floating controls */}
        <div className="no-print fixed bottom-6 right-6 z-50 flex gap-2 shadow-2xl">
          <button onClick={() => setPdfMode(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border"
            style={{ background: BG, color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.15)" }}>
            ← Retour
          </button>
          <button onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: G }}>
            Imprimer / Sauvegarder PDF
          </button>
        </div>

        {/* All slides stacked */}
        <div style={{ background: BG, fontFamily: "Satoshi, sans-serif" }}>
          {SLIDES.map((slide, i) => (
            <div key={i} className="pdf-slide" style={{
              width: "100%",
              minHeight: "100vh",
              padding: "40px 64px 48px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              borderBottom: i < SLIDES.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}>
              {/* Slide header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
                <Logo size={26} />
                <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>
                  {i + 1} / {total}
                </span>
              </div>
              {/* Content */}
              <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                <div style={{ width: "100%" }}>
                  {renderSlide(slide)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // ── Presentation mode ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col select-none" style={{ background: BG, fontFamily: "Satoshi, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-10 pt-7 pb-0">
        <Logo size={36} />
        <div className="flex items-center gap-4">
          <button onClick={() => setPdfMode(true)}
            className="text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all hover:border-white/20"
            style={{ color: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.1)" }}>
            Export PDF
          </button>
          <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.2)" }}>
            {current + 1} / {total}
          </span>
        </div>
      </div>

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center px-14 py-8">
        <div className="w-full max-w-5xl">{renderSlide(SLIDES[current])}</div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-10 pb-8">
        <div className="flex gap-2 items-center">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className="rounded-full transition-all duration-300"
              style={{ width: i === current ? 24 : 8, height: 8, background: i === current ? G : "rgba(255,255,255,0.15)" }} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={prev} disabled={current === 0}
            className="w-10 h-10 rounded-xl border text-white/50 hover:text-white transition-all disabled:opacity-20"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}>←</button>
          <button onClick={next} disabled={current === total - 1}
            className="w-10 h-10 rounded-xl font-bold transition-all disabled:opacity-20"
            style={current === total - 1
              ? { border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }
              : { background: `linear-gradient(135deg, ${G}, ${GL})`, color: BG }
            }>→</button>
        </div>
      </div>

      <div className="text-center pb-4 text-xs" style={{ color: "rgba(255,255,255,0.1)" }}>
        ← → pour naviguer · Espace pour avancer
      </div>
    </div>
  );
}
