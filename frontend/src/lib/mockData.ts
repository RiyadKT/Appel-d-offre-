// ─── Profil entreprise — S DECO (données réelles) ─────────────────────────
export const COMPANY = {
  name: "S DECO",
  owner: "El Sharef",
  siret: "49521941200030",
  siren: "495219412",
  tva: "FR12495219412",
  forme_juridique: "SARL",
  capital: "30 000 €",
  adresse: "1 Rue Jouet, 94700 Maisons-Alfort",
  naf: "4120A",
  activite: "Construction, décoration & rénovation artisanale",
  date_creation: "02/04/2007",
  size: "TPE",
  employees: 5,
  revenue: 650_000,
  sector: "BTP — Peinture, Plâtrerie & Décoration",
  certifications: ["Qualibat 4131", "Qualibat 6111"],
  regions: ["IDF"],
  min_tender: 50_000,
  max_tender: 200_000,
};

// ─── Profil matching (alimente la page Paramètres) ─────────────────────────
export const MOCK_PROFILE = {
  name: "S DECO",
  siret: "49521941200030",
  size: "TPE",
  revenue_range: "< 1M",
  regions: ["IDF"],
  sectors: ["45441000", "45432100", "45442100"], // CPV peinture, placo, revêtements
  keywords: [
    "peinture",
    "plâtrerie",
    "cloisons",
    "faux-plafonds",
    "BA13",
    "placo",
    "enduit",
    "revêtements muraux",
    "ravalement",
    "finitions intérieures",
  ],
  certifications: ["Qualibat 4131", "Qualibat 6111"],
  max_tender_value: 200_000,
  min_tender_value: 50_000,
  lots_desired: ["Cloisons / Faux-plafonds", "Peinture / Finitions", "Revêtements sols"],
  allotissement: "alloti" as "alloti" | "global" | "indifferent",
  market_types: ["Travaux"],
  procedures: ["MAPA", "Appel d'offres ouvert"],
  moa_types: [
    "Collectivité (mairie, dept, région)",
    "Établissement public (hôpital, école)",
    "Bailleur social (HLM, OPH)",
  ],
};

// ─── Mock compat (anciennes pages) ─────────────────────────────────────────
export const MOCK_TENDERS = [] as any[];

// ─── Bibliothèque de documents ─────────────────────────────────────────────
export type DocStatus = "valid" | "expiring" | "expired" | "missing";

export interface CompanyDoc {
  id: string;
  label: string;
  category: string;
  status: DocStatus;
  filename: string | null;
  expires: string | null;
  uploadedAt: string | null;
}

export const DOCUMENTS: CompanyDoc[] = [
  {
    id: "kbis",
    label: "Extrait KBIS",
    category: "Juridique",
    status: "valid",
    filename: "KBIS_SDECO_fev2026.pdf",
    expires: "2026-07-15",
    uploadedAt: "2026-02-10",
  },
  {
    id: "urssaf",
    label: "Attestation de vigilance URSSAF",
    category: "Social",
    status: "valid",
    filename: "Attestation_URSSAF_Q1_2026.pdf",
    expires: "2026-09-30",
    uploadedAt: "2026-02-01",
  },
  {
    id: "dgfip",
    label: "Attestation fiscale DGFiP",
    category: "Fiscal",
    status: "missing",
    filename: null,
    expires: null,
    uploadedAt: null,
  },
  {
    id: "decennale",
    label: "Assurance Décennale",
    category: "Assurance",
    status: "valid",
    filename: "Decennale_SDECO_2026.pdf",
    expires: "2026-12-31",
    uploadedAt: "2026-01-03",
  },
  {
    id: "rcpro",
    label: "RC Professionnelle",
    category: "Assurance",
    status: "missing",
    filename: null,
    expires: null,
    uploadedAt: null,
  },
  {
    id: "qualibat4131",
    label: "Qualibat 4131 — Peinture intérieure",
    category: "Certification",
    status: "expiring",
    filename: "Qualibat_4131_SDECO.pdf",
    expires: "2026-05-09",
    uploadedAt: "2022-05-09",
  },
  {
    id: "qualibat6111",
    label: "Qualibat 6111 — Plâtrerie / Placo",
    category: "Certification",
    status: "expiring",
    filename: "Qualibat_6111_SDECO.pdf",
    expires: "2026-05-09",
    uploadedAt: "2022-05-09",
  },
];

// ─── Appels d'offres IDF réalistes ─────────────────────────────────────────
export type TenderColumn = "to_study" | "retained" | "drafting" | "sent";

export interface TenderLot {
  label: string;
  match: boolean;
  reason?: string;
}

export interface Tender {
  id: number;
  column: TenderColumn;
  title: string;
  client: string;
  lot: string;
  amount: number;
  score: number;
  daysLeft: number;
  urgent?: boolean;
  procedure: string;
  location: string;
  reference: string;
  description: string;
  lots: TenderLot[];
  boampRef: string;
}

export const TENDERS: Tender[] = [
  {
    id: 1,
    column: "to_study",
    title: "Rénovation de la salle polyvalente et des sanitaires — Groupe scolaire Anatole France",
    client: "Mairie de Vincennes",
    lot: "Lot 4 — Peinture & revêtements muraux",
    amount: 22_000,
    score: 94,
    daysLeft: 21,
    procedure: "MAPA",
    location: "Vincennes (94)",
    reference: "VIN-2026-0214",
    boampRef: "VIN-2026-0214",
    description: "Travaux de rénovation de la salle polyvalente et des sanitaires du groupe scolaire Anatole France à Vincennes. Intervention en milieu scolaire occupé, travaux à réaliser pendant les vacances scolaires. Surface totale : environ 320 m².",
    lots: [
      { label: "Lot 1 — Démolition / Gros œuvre", match: false, reason: "Hors périmètre métier" },
      { label: "Lot 2 — Plomberie / Sanitaires",  match: false, reason: "Hors périmètre métier" },
      { label: "Lot 3 — Carrelage / Faïence",     match: false, reason: "Hors périmètre métier" },
      { label: "Lot 4 — Peinture & revêtements muraux", match: true, reason: "Qualibat 4131, zone IDF, montant dans fourchette" },
      { label: "Lot 5 — Menuiseries intérieures", match: false, reason: "Hors périmètre métier" },
    ],
  },
  {
    id: 2,
    column: "retained",
    title: "Réhabilitation résidence Les Lilas — 48 logements sociaux — Opération ANRU",
    client: "Paris Habitat (OPH)",
    lot: "Lot 5 — Plâtrerie / Faux-plafonds BA13",
    amount: 45_000,
    score: 85,
    daysLeft: 12,
    procedure: "Appel d'offres ouvert",
    location: "Paris 20e (75)",
    reference: "PH-2026-1134",
    boampRef: "PH-2026-1134",
    description: "Réhabilitation complète de 48 logements sociaux dans le cadre du programme ANRU. Travaux en site occupé, relogement partiel des locataires. Les lots plâtrerie et peinture concernent les parties communes et les logements vacants uniquement.",
    lots: [
      { label: "Lot 1 — Gros œuvre / Maçonnerie",      match: false, reason: "Hors périmètre métier" },
      { label: "Lot 2 — Charpente / Couverture",        match: false, reason: "Hors périmètre métier" },
      { label: "Lot 3 — Menuiseries extérieures",       match: false, reason: "Hors périmètre métier" },
      { label: "Lot 4 — Électricité",                   match: false, reason: "Hors périmètre métier" },
      { label: "Lot 5 — Plâtrerie / Faux-plafonds BA13", match: true, reason: "Qualibat 6111, site occupé maîtrisé, zone IDF" },
      { label: "Lot 6 — Peinture parties communes",     match: true, reason: "Qualibat 4131, références bailleurs sociaux" },
      { label: "Lot 7 — Revêtements de sols",           match: false, reason: "Hors périmètre métier" },
    ],
  },
  {
    id: 3,
    column: "drafting",
    title: "Aménagement et rénovation des plateaux de bureaux — Direction Régionale CPAM Île-de-France",
    client: "CPAM Île-de-France",
    lot: "Lot 2 — Cloisons amovibles, plâtrerie et peinture",
    amount: 38_000,
    score: 98,
    daysLeft: 3,
    urgent: true,
    procedure: "MAPA",
    location: "Paris 10e (75)",
    reference: "CPAM-IDF-2026-018",
    boampRef: "CPAM-IDF-2026-018",
    description: "Aménagement et rénovation des plateaux de bureaux de la Direction Régionale CPAM Île-de-France. Travaux en milieu occupé (~120 agents), 3 niveaux (R1, R2, R3). Dépose cloisons existantes, création cloisons BA13 phonique renforcée, peinture deux couches. Délai d'exécution : 6 semaines.",
    lots: [
      { label: "Lot 1 — Électricité / Courants faibles", match: false, reason: "Hors périmètre métier" },
      { label: "Lot 2 — Cloisons, plâtrerie, peinture",  match: true,  reason: "Qualibat 4131 + 6111, site occupé, zone IDF — score 98%" },
      { label: "Lot 3 — Menuiseries intérieures",        match: false, reason: "Hors périmètre métier" },
      { label: "Lot 4 — Revêtements de sols souples",    match: false, reason: "Hors périmètre métier" },
    ],
  },
  {
    id: 4,
    column: "sent",
    title: "Travaux de réfection des circulations communes — Résidence Belleville",
    client: "RIVP (Régie Immobilière Ville de Paris)",
    lot: "Lot 3 — Peinture parties communes",
    amount: 28_500,
    score: 88,
    daysLeft: -5,
    procedure: "MAPA",
    location: "Paris 19e (75)",
    reference: "RIVP-2026-0087",
    boampRef: "RIVP-2026-0087",
    description: "Réfection des circulations communes d'une résidence gérée par la RIVP à Paris 19e. Peinture des halls d'entrée, cages d'escalier et couloirs des 8 bâtiments. Travaux en site occupé, accès maintenu aux parties communes à tout moment.",
    lots: [
      { label: "Lot 1 — Nettoyage / Préparation supports", match: false, reason: "Hors périmètre métier" },
      { label: "Lot 2 — Carrelage hall d'entrée",          match: false, reason: "Hors périmètre métier" },
      { label: "Lot 3 — Peinture parties communes",        match: true,  reason: "Qualibat 4131, référence RIVP existante, zone IDF" },
      { label: "Lot 4 — Signalétique",                     match: false, reason: "Hors périmètre métier" },
    ],
  },
];

// ─── AO archivés (historique) ──────────────────────────────────────────────
export type ArchiveResult = "won" | "lost" | "dismissed";

export interface ArchivedTender {
  id: string;
  title: string;
  client: string;
  lot: string;
  amount: number;
  result: ArchiveResult;
  archivedAt: string;
  procedure: string;
  location: string;
  reference: string;
}

export const ARCHIVED_TENDERS: ArchivedTender[] = [
  {
    id: "arch-1",
    title: "Rénovation des salles de classe — École primaire Jules Ferry",
    client: "Mairie de Montreuil",
    lot: "Lot 3 — Peinture intérieure",
    amount: 34_000,
    result: "won",
    archivedAt: "2026-02-18",
    procedure: "MAPA",
    location: "Montreuil (93)",
    reference: "MON-2025-0891",
  },
  {
    id: "arch-2",
    title: "Réhabilitation résidence Les Acacias — 62 logements",
    client: "OPHM Seine-et-Marne",
    lot: "Lot 5 — Plâtrerie / Faux-plafonds",
    amount: 52_000,
    result: "lost",
    archivedAt: "2026-02-05",
    procedure: "Appel d'offres ouvert",
    location: "Melun (77)",
    reference: "OPHM-2025-0334",
  },
  {
    id: "arch-3",
    title: "Travaux de finitions — Centre culturel Pablo Neruda",
    client: "Ville de Créteil",
    lot: "Lot 4 — Peinture & enduits décoratifs",
    amount: 28_500,
    result: "lost",
    archivedAt: "2026-01-22",
    procedure: "MAPA",
    location: "Créteil (94)",
    reference: "CRT-2025-0712",
  },
  {
    id: "arch-4",
    title: "Aménagement plateaux de bureaux — Siège social",
    client: "Paris Habitat (OPH)",
    lot: "Lot 2 — Cloisons / Plâtrerie",
    amount: 41_000,
    result: "lost",
    archivedAt: "2026-01-10",
    procedure: "MAPA",
    location: "Paris 13e (75)",
    reference: "PH-2025-0987",
  },
  {
    id: "arch-5",
    title: "Rénovation thermique et ravalement — Résidence Les Pins",
    client: "RIVP",
    lot: "Lot 6 — Peinture façades & parties communes",
    amount: 67_000,
    result: "lost",
    archivedAt: "2025-12-14",
    procedure: "Appel d'offres ouvert",
    location: "Paris 20e (75)",
    reference: "RIVP-2025-0654",
  },
  {
    id: "arch-6",
    title: "Remise en état logements vacants — Programme ANRU",
    client: "Plaine Commune Habitat",
    lot: "Lot 3 — Peinture & revêtements muraux",
    amount: 38_500,
    result: "lost",
    archivedAt: "2025-11-28",
    procedure: "MAPA",
    location: "Saint-Denis (93)",
    reference: "PCH-2025-0421",
  },
];

// ─── DCE CPAM IDF (id: 3) ──────────────────────────────────────────────────
export const CPAM_DCE_FILES = [
  { name: "RC_Consultation_CPAM-IDF-2026-018.pdf",  size: "420 Ko",  type: "PDF" },
  { name: "CCTP_Lot2_Cloisons_Peinture.pdf",         size: "1.4 Mo",  type: "PDF" },
  { name: "DPGF_Lot2_CPAM-IDF.xlsx",                 size: "92 Ko",   type: "XLS" },
  { name: "Plans_Niveaux_R1_R2_R3.pdf",              size: "4.1 Mo",  type: "PDF" },
  { name: "AE_Acte_Engagement_vierge.docx",          size: "210 Ko",  type: "DOC" },
  { name: "Annexe_Prescriptions_HSE.pdf",            size: "310 Ko",  type: "PDF" },
];

// ─── Résumé IA CPAM ────────────────────────────────────────────────────────
export const AI_SUMMARY = `MAPA — Marché de travaux en milieu occupé (bureaux administratifs actifs, ~120 agents).

Prestations : dépose cloisons existantes (150 m²), création cloisons BA13 isolation phonique renforcée (200 m²), peinture deux couches (450 m²), 3 niveaux (R1, R2, R3). Délai d'exécution : 6 semaines.

Critères d'attribution : Prix 40 %, Valeur technique 60 %. Note HSE exigée — travaux en site occupé.

⚠ Qualibat 4131 & 6111 expirent dans 30 jours — renouvellement impératif avant remise de l'offre le ${(() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toLocaleDateString("fr-FR"); })()}.

Vos atouts : score 98 % — profil parfaitement aligné, références en milieu occupé valorisables, zone géographique (Paris 10e) dans votre secteur d'intervention.`;

// ─── Brouillon mémoire technique ──────────────────────────────────────────
export const TECHNICAL_MEMO = `MÉMOIRE TECHNIQUE — CPAM ÎLE-DE-FRANCE
Lot 2 : Cloisons amovibles, plâtrerie et peinture
Réf. consultation : CPAM-IDF-2026-018
Déposant : S DECO — SARL — SIRET 495 219 412 00030
Gérant : El Sharef — 1 Rue Jouet, 94700 Maisons-Alfort

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PRÉSENTATION DE L'ENTREPRISE

S DECO est une SARL spécialisée dans les travaux de peinture intérieure (Qualibat 4131) et de plâtrerie / cloisons sèches (Qualibat 6111), fondée en 2017, intervenant principalement en Île-de-France.

Siège : 1 Rue Jouet, 94700 Maisons-Alfort
CA 2024 : ~650 000 €  |  Effectif : 5 collaborateurs qualifiés
Gérant : El Sharef

Qualifications détenues :
• Qualibat 4131 — Peinture intérieure (en cours de renouvellement)
• Qualibat 6111 — Plâtrerie, plaques de plâtre

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. COMPRÉHENSION DU PROJET

Nous avons pris connaissance de l'ensemble des pièces du DCE (RC, CCTP, DPGF, plans R1/R2/R3, annexe HSE).

Prestations attendues :
• Dépose et évacuation des cloisons existantes — 150 m²
• Création de cloisons BA13 avec isolation phonique renforcée Phonique 45 dB — 200 m²
• Peinture deux couches, support préparé (rebouchage, enduit, ponçage) — 450 m²
• Intervention sur 3 niveaux, bureaux actifs en site occupé

Contrainte principale identifiée : continuité d'activité des 120 agents CPAM.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. MÉTHODOLOGIE — ORGANISATION CHANTIER

Phasage proposé (6 semaines) :
→ Phase 1 (S1-S2) : Niveau R1 — travaux hors heures de bureau (7h-9h / 18h-20h)
→ Phase 2 (S3-S4) : Niveau R2 — intervention en journée, zone balisée
→ Phase 3 (S5-S6) : Niveau R3 + finitions peinture ensemble

Chef de chantier désigné : M. El Sharef (joignable 6j/7, 07 XX XX XX XX)
Réunion de chantier : chaque lundi 8h avec le MOE désigné

Gestion des nuisances : aspirateur industriel HEPA, confinement par film polyane, évacuation déchets J+1 max.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. RÉFÉRENCES EN MILIEU OCCUPÉ

• Rénovation plateaux de bureaux URSSAF — Paris 12e (2024) — 34 000 € — en site occupé
  Attestation MOA disponible sur demande
• Plâtrerie/peinture parties communes — RIVP Belleville (2023) — 28 500 €
• Cloisons et peinture groupe scolaire — Mairie du 19e (2023) — 19 800 €

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. MOYENS HUMAINS ET MATÉRIELS

Équipe mobilisée :
• 1 chef de chantier expérimenté (15 ans d'expérience BTP IDF)
• 2 plaquistes Qualibat 6111
• 2 peintres Qualibat 4131

Matériels : nacelle 6m, aspirateur HEPA, outillage électroportatif, véhicule utilitaire 20m³

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Section 6 — Plan QSE à compléter]
[Section 7 — Planning Gantt à joindre en annexe]`;
