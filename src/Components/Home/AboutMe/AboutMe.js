import React from 'react';

import './AboutMe.css';

function AboutMe() {
    return (
        <section id="about" className="about-me-section">
            <div className="container">
                <h2 className="about-title">En savoir plus sur moi</h2>
                <div className="row">
                    <div className="col-left">
                        <h3>Je suis <span className="highlight">Merwan Laouini</span>, un Développeur Web</h3>
                        <p>
                            Actuellement étudiant en cinquième année en Master Lead Développeur, je suis passionné par
                            le développement web et les nouvelles technologies. Mon parcours académique et mes
                            expériences professionnelles m'ont permis d'acquérir une solide maîtrise des langages de
                            programmation et des frameworks modernes, tels que React, Node.js, et bien d'autres.
                        </p>
                        <p>
                            En 2025, je serai diplômé et j'ai pour ambition de me spécialiser en tant que Lead
                            Développeur, où je pourrai mettre à profit mes compétences techniques et mon esprit
                            d'innovation pour accompagner les entreprises dans leurs projets digitaux. <strong>Je suis
                            actuellement à la recherche d'une alternance pour ma dernière année d'études</strong>, afin
                            de consolider mes connaissances et de préparer mon intégration dans le monde professionnel.
                        </p>
                        <p>
                            Ma capacité à travailler en équipe, à résoudre des problèmes complexes et à apprendre
                            rapidement de nouvelles technologies me rend particulièrement apte à relever les défis du
                            secteur du développement web. Je suis déterminé à contribuer à des projets ambitieux et à
                            jouer un rôle clé dans la réussite des missions qui me seront confiées.
                        </p>

                    </div>
                    <div className="col-right">
                        <ul className="personal-info">
                            <li><strong>Nom:</strong> Merwan Laouini</li>
                            <li><strong>Email:</strong> Merwanlaouini@gmail.com</li>
                            <li><strong>Âge:</strong> 23</li>
                            <li><strong>Localisation:</strong> Île-de-France, disponible en remote</li>
                        </ul>
                        <a href="/CV_MerwanLaouini.pdf" className="download-cv-btn">Télécharger CV</a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutMe;
