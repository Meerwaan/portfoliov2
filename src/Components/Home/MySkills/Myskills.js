import React from "react";
import "./Myskills.css"; // <- styles propres au composant

const SKILLS = [
    { label: "React JS", pct: 80 },
    { label: "React Native", pct: 65 },
    { label: "Flutter", pct: 50 },
    { label: "Node JS", pct: 85 },
    { label: "Python", pct: 55 },
    { label: "JS", pct: 70 },
    { label: "Nest JS", pct: 55 },
    { label: "JAVA", pct: 55 },
];

export default function MySkills() {
    return (
        <section id="myskills" className="myskills-section">
        <div className="skills-section">
            <h3 className="skills-title">Mes Compétences</h3>

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
        </div>
        </section>
    );
}
