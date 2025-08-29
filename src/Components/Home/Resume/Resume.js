import React from 'react';
import './Resume.css';

function Resume() {
    return (
        <section id="resume" className="resume-section">
            <div className="resume-container">
                <h2 className="resume-title">Mon Parcours</h2>

                <div className="resume-row">
                    <div className="resume-col-left">
                        <h3 className="resume-h3">Mes Formations</h3>

                        <div className="resume-item">
                            <h4 className="resume-h4">Programme en business et entrepreneuriat international</h4>
                            <h5 className="resume-h5">2025</h5>
                            <p className="resume-p"><em>Université Laval, Québec, Canada</em></p>
                        </div>

                        <div className="resume-item">
                            <h4 className="resume-h4">Master Manager en Ingénierie Informatique</h4>
                            <h5 className="resume-h5">2023 - 2025</h5>
                            <p className="resume-p"><em>ESIEE IT Coding Factory, Cergy</em></p>
                        </div>

                        <div className="resume-item">
                            <h4 className="resume-h4">Licence en Ingénierie Informatique</h4>
                            <h5 className="resume-h5">2020 - 2023</h5>
                            <p className="resume-p"><em>ESIEE IT Coding Factory, Paris</em></p>
                        </div>
                    </div>

                    <div className="resume-col-right">
                        <h3 className="resume-h3">Mon Expérience</h3>

                        <div className="resume-item">
                            <h4 className="resume-h4">Développeur Full-Stack en alternance</h4>
                            <h5 className="resume-h5">En poste actuellement</h5>
                            <p className="resume-p">
                                <em>Neocortex, Paris - Maison Alfort - Aix En Provence</em>
                            </p>
                            <ul className="resume-ul">
                                <li>Développement d'un outil interne en utilisant Electron Js</li>
                                <li>Centralisation des outils utilisés par les neuropsychologues</li>
                            </ul>
                        </div>

                        <div className="resume-item">
                            <h4 className="resume-h4">Développeur Full-Stack en alternance</h4>
                            <h5 className="resume-h5">10/2022 - 02/2024</h5>
                            <p className="resume-p"><em>YOUGGY, Paris</em></p>
                            <ul className="resume-ul">
                                <li>Développement du site internet en React JS</li>
                                <li>Conception de l'application YOUGGY pour iOS</li>
                                <li>Maintenance continue de l'application</li>
                                <li>Optimisation des performances</li>
                            </ul>
                        </div>

                        <div className="resume-item">
                            <h4 className="resume-h4">Développeur WordPress en stage</h4>
                            <h5 className="resume-h5">04/2022 - 06/2022</h5>
                            <p className="resume-p"><em>SIPP, Paris</em></p>
                            <ul className="resume-ul">
                                <li>Développement du site de l’entreprise</li>
                                <li>Création de la maquette sur Figma</li>
                                <li>Maintien et suivi du site</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Resume;
