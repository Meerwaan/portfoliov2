import React, { useCallback, useEffect, useState } from "react";
import "./SideMenu.css";
import Avatar from "../../../Assets/PhotoPro.jpeg";

const SECTIONS = ["accueil", "about", "resume", "myskills", "whatido", "portfolio", "contact"];

function SideMenu() {
    const [activeSection, setActiveSection] = useState("");

    const scrollToSection = useCallback((id) => {
        const OFFSET = 0; // si tu as un header sticky, mets sa hauteur ici (ex: 80)
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - OFFSET;
        window.scrollTo({ top, behavior: "smooth" });
        setActiveSection(id);
        // met à jour l’URL sans recharger la page
        window.history.replaceState(null, "", `#${id}`);
    }, []);

    const handleLinkClick = (e, section) => {
        e.preventDefault();              // évite le jump instantané
        scrollToSection(section);
    };

    // Au chargement: si un hash est présent, on y va
    useEffect(() => {
        const initial = window.location.hash?.slice(1);
        if (initial && SECTIONS.includes(initial)) {
            setTimeout(() => scrollToSection(initial), 0);
        }
    }, [scrollToSection]);

    // Active l’onglet au scroll (IntersectionObserver)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            {
                root: null,
                // déclenche l’activation quand ~35% de la section est visible
                threshold: 0.35,
                // rootMargin pour activer un peu avant le centre de l’écran
                rootMargin: "0px 0px -40% 0px",
            }
        );

        SECTIONS.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <aside className="side-menu">
            <div className="profile-section">
                <img src={Avatar} alt="Profile" className="profile-pic" />
                <h2>Merwan Laouini</h2>
            </div>
            <nav className="navigation">
                <ul>
                    <li>
                        <a
                            href="#accueil"
                            className={activeSection === "accueil" ? "active" : ""}
                            onClick={(e) => handleLinkClick(e, "accueil")}
                        >
                            Accueil
                        </a>
                    </li>

                    <li>
                        <a
                            href="#about"
                            className={activeSection === "about" ? "active" : ""}
                            onClick={(e) => handleLinkClick(e, "about")}
                        >
                            À propos de moi
                        </a>
                    </li>

                    <li>
                        <a
                            href="#resume"
                            className={activeSection === "resume" ? "active" : ""}
                            onClick={(e) => handleLinkClick(e, "resume")}
                        >
                            Mon parcours
                        </a>
                    </li>

                    <li>
                        <a
                            href="#myskills"
                            className={activeSection === "myskills" ? "active" : ""}
                            onClick={(e) => handleLinkClick(e, "myskills")}
                        >
                            Mes compétences
                        </a>
                    </li>

                    <li>
                        <a
                            href="#whatido"
                            className={activeSection === "whatido" ? "active" : ""}
                            onClick={(e) => handleLinkClick(e, "whatido")}
                        >
                            Mes services
                        </a>
                    </li>

                    <li>
                        <a
                            href="#portfolio"
                            className={activeSection === "portfolio" ? "active" : ""}
                            onClick={(e) => handleLinkClick(e, "portfolio")}
                        >
                            Mes Projets
                        </a>
                    </li>

                    <li>
                        <a
                            href="#contact"
                            className={activeSection === "contact" ? "active" : ""}
                            onClick={(e) => handleLinkClick(e, "contact")}
                        >
                            Contact
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}

export default SideMenu;
