"use client";
import Sidebar from "@/components/Sidebar";
import HowItWorks from "@/components/HowItWorks";
import { COMPANY } from "@/lib/mockData";
import {
  Building2,
  MapPin,
  Hash,
  Euro,
  Calendar,
  BadgeCheck,
  Target,
  Globe,
  Tag,
  Settings,
} from "lucide-react";

function Row({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      {Icon && <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 mb-0.5">{label}</div>
        <div className="text-sm font-semibold text-gray-800">{value}</div>
      </div>
    </div>
  );
}

function Chip({ label, color = "indigo" }: { label: string; color?: "indigo" | "emerald" | "amber" | "slate" }) {
  const cls = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber:   "bg-amber-50  text-amber-700  border-amber-100",
    slate:   "bg-slate-100 text-slate-600  border-slate-200",
  }[color];
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-[#F6F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-auto">

        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Paramètres — Profil entreprise</h1>
              <p className="text-xs text-gray-400 mt-0.5">Informations utilisées par le moteur de matching Nerolia</p>
            </div>
            <HowItWorks steps={[
              { title: "Profil de matching", desc: "Nerolia utilise votre métier, zone, certifications et fourchette de prix pour scorer chaque AO." },
              { title: "Mise à jour", desc: "Actualisez vos certifications et votre CA pour affiner la qualité du matching." },
              { title: "Pièces admin", desc: "Les documents de votre bibliothèque sont auto-joints aux dossiers de réponse." },
            ]} />
          </div>
        </div>

        <div className="px-8 py-6 max-w-4xl grid grid-cols-2 gap-5">

          {/* Identité légale */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} className="text-indigo-500" />
              <h2 className="font-semibold text-gray-800">Identité légale</h2>
            </div>
            <div className="grid grid-cols-3 gap-x-8">
              <Row label="Raison sociale"       value={COMPANY.name}            />
              <Row label="Forme juridique"       value={COMPANY.forme_juridique} />
              <Row label="Date de création"      value={COMPANY.date_creation}   />
              <Row label="SIRET"                 value={COMPANY.siret}           />
              <Row label="SIREN"                 value={COMPANY.siren}           />
              <Row label="N° TVA intracommunautaire" value={COMPANY.tva}         />
              <Row label="Capital social"        value={COMPANY.capital}         />
              <Row label="Code NAF / APE"        value={`${COMPANY.naf} — ${COMPANY.activite}`} />
              <Row label="Gérant"                value={COMPANY.owner}           />
            </div>
            <div className="flex items-start gap-2 mt-2 pt-3 border-t border-gray-50">
              <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Adresse du siège</div>
                <div className="text-sm font-semibold text-gray-800">{COMPANY.adresse}</div>
              </div>
            </div>
          </section>

          {/* Profil de matching */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-indigo-500" />
              <h2 className="font-semibold text-gray-800">Profil de matching</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 mb-2">Taille</div>
                <Chip label={`${COMPANY.size} — ${COMPANY.employees} salariés`} color="slate" />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Fourchette d'AO ciblée</div>
                <div className="text-sm font-semibold text-gray-800">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(COMPANY.min_tender)}
                  {" → "}
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(COMPANY.max_tender)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Zone d'intervention</div>
                <div className="flex flex-wrap gap-1.5">
                  {COMPANY.regions.map((r) => <Chip key={r} label={r} color="slate" />)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Types de marché</div>
                <Chip label="Travaux" color="indigo" />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Procédures</div>
                <div className="flex flex-wrap gap-1.5">
                  {["MAPA", "Appel d'offres ouvert"].map((p) => <Chip key={p} label={p} color="slate" />)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Maîtres d'ouvrage cibles</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Collectivités", "Établissements publics", "Bailleurs sociaux (HLM, OPH)"].map((m) => (
                    <Chip key={m} label={m} color="slate" />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Corps d'état + certifications */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <BadgeCheck size={16} className="text-indigo-500" />
              <h2 className="font-semibold text-gray-800">Corps d'état & certifications</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 mb-2">Lots soumissionnés</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Cloisons / Faux-plafonds", "Peinture / Finitions", "Revêtements sols"].map((l) => (
                    <Chip key={l} label={l} color="indigo" />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Qualifications Qualibat</div>
                <div className="flex flex-wrap gap-1.5">
                  <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Qualibat 4131 — Peinture (expire J+30)
                  </div>
                  <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Qualibat 6111 — Plâtrerie (expire J+30)
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Mots-clés métier (matching)</div>
                <div className="flex flex-wrap gap-1.5">
                  {["peinture", "plâtrerie", "cloisons", "BA13", "faux-plafonds", "placo", "enduit", "revêtements muraux"].map((k) => (
                    <span key={k} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Avertissement */}
          <section className="col-span-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <BadgeCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-amber-800">Action requise avant soumission</div>
                <div className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Vos qualifications Qualibat 4131 et 6111 expirent le 09/05/2026 — soit dans environ 30 jours.
                  Elles sont exigées sur 2 AO actuellement en cours (CPAM IDF et Paris Habitat).
                  Engagez le renouvellement auprès de Qualibat dès maintenant pour ne pas bloquer vos dépôts.
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
