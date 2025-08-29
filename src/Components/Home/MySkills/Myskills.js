import React, { useState, Suspense } from "react";
import "./Myskills.css";

// Lazy-load du globe pour ne pas alourdir le bundle initial
const GlobeSkills = React.lazy(() => import("./GlobeSkills"));

const SKILLS = [
    { label: "React JS", pct: 80, note: "Ma compétence c’est React JS. J’ai appris ce framework pour construire des interfaces rapides et modulaires." },
    { label: "React Native", pct: 65, note: "Apps mobiles iOS/Android avec React Native : navigation, API, build." },
    { label: "Flutter", pct: 50, note: "Bases solides pour prototyper des applis multi-plateformes." },
    { label: "Node JS", pct: 85, note: "APIs performantes, services, scripts, tooling." },
    { label: "Python", pct: 55, note: "Automatisation, scripts, data light." },
    { label: "JS", pct: 70, note: "Langage du quotidien pour web front/back." },
    { label: "Nest JS", pct: 55, note: "Archi modulaire, controllers/services, validation." },
    { label: "JAVA", pct: 55, note: "Fondamentaux & projets académiques." },
];

export default function MySkills() {
    const [view, setView] = useState("list"); // "list" | "globe"

    return (
        <div className="skills-section">
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
                            <GlobeSkills skills={SKILLS} />
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
