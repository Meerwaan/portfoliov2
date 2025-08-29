import React, { useState, Suspense } from "react";
import "./Myskills.css";

// Lazy-load du globe pour ne pas alourdir le bundle initial
const GlobeSkills = React.lazy(() => import("./GlobeSkills"));

const SKILLS = [
    // Frontend cœur
    { label: "JavaScript", pct: 95, note: "ES202x, async/await, patterns modernes. J’optimise le rendu et le bundle pour des interfaces réactives et stables." },
    { label: "TypeScript", pct: 85, note: "Typage strict, DX améliorée, contrats d’API robustes. Moins de bugs en prod et meilleure maintenabilité." },
    { label: "React JS", pct: 95, note: "Hooks, Context, performance (memo, suspense) et bonnes pratiques. Interfaces modulaires et scalables (Lighthouse 90+)." },
    { label: "HTML5", pct: 95, note: "Sémantique, SEO & accessibilité (a11y). Structure propre pour de meilleures bases produit." },
    { label: "CSS3 (Sass/Tailwind)", pct: 90, note: "Responsive design au pixel près, Flex/Grid, design system, thèmes dark/light." },
    { label: "GSAP", pct: 75, note: "Micro-interactions, timelines et animations fluides (ScrollTrigger, entrée de pages) pour une UX premium." },
    { label: "Three.js", pct: 70, note: "Scènes 3D et visualisations interactives. Optimisations perfs (matériaux, géométries, contrôles)." },

    // Mobile
    { label: "React Native", pct: 80, note: "Apps iOS/Android : navigation, API, stockage local, build et publication." },
    { label: "Flutter", pct: 60, note: "Prototypage multi-plateformes rapide et UI réactive." },

    // Backend & data
    { label: "Node JS", pct: 85, note: "APIs REST/GraphQL performantes, streaming, jobs, sécurité et logs." },
    { label: "Nest JS", pct: 80, note: "Architecture modulaire, validation, guards/interceptors, tests. Code maintenable et clair." },
    { label: "Express", pct: 75, note: "Middlewares, auth JWT, rate-limit & best practices pour APIs fiables." },
    { label: "MongoDB", pct: 70, note: "Modélisation de schémas, agrégations, indexes. Rapidité sur les reads." },
    { label: "PostgreSQL", pct: 60, note: "Schemas relationnels, requêtes optimisées, transactions." }
];


export default function MySkills() {
    const [view, setView] = useState("list"); // "list" | "globe"
    const isGlobe = view === "globe";         // <<< NEW

    return (
        <div className={`skills-section ${isGlobe ? "is-globe" : ""}`}> {/* <<< NEW */}
            <h3 className="skills-title">Mes Compétences</h3>

            {/* Toggle simple, centré, sans casser ta DA */}
            <div className="skills-toggle">
                <button
                    className={`skills-toggle-btn ${view === "list" ? "active" : ""}`}
                    onClick={() => setView("list")}
                    aria-pressed={view === "list"}
                >
                    Liste
                </button>
                <button
                    className={`skills-toggle-btn ${view === "globe" ? "active" : ""}`}
                    onClick={() => setView("globe")}
                    aria-pressed={view === "globe"}
                >
                    Globe 3D
                </button>
            </div>

            {view === "list" ? (
                <>
                    <div className="skills-row">
                        {SKILLS.map((s) => (
                            <div className="skill-item" key={s.label}>
                                <span>{s.label}</span>
                                <div className="skill-bar">
                                    <div className="skill-level" style={{ width: `${s.pct}%` }} />
                                </div>
                                <span className="skill-percent">{s.pct}%</span>
                            </div>
                        ))}
                    </div>

                    <div className="skills-btn-section">
                        <a href="/CV_MerwanLaouini.pdf" className="skills-download-cv-btn">
                            Télécharger CV
                        </a>
                    </div>
                </>
            ) : (
                <>
                    <div className="skills-globe-wrap">
                        <Suspense fallback={<div className="skills-globe-fallback">Chargement du globe…</div>}>
                            <GlobeSkills
                                skills={SKILLS}
                                sizing={{ heightScale: 0.75, min: 520, max: 720 }} // <<< NEW (plus haut en mode globe)
                            />
                        </Suspense>
                    </div>

                    <div className="skills-btn-section">
                        <a href="/CV_MerwanLaouini.pdf" className="skills-download-cv-btn">
                            Télécharger CV
                        </a>
                    </div>
                </>
            )}
        </div>
    );
}
