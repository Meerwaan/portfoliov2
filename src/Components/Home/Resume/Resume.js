import React from 'react';
import { Parallax } from 'react-parallax';

import './Resume.css';

function Resume() {
    return (
        <section id="resume" className="resume-section">
            <div className="resume-container">
                <h2 className="resume-title">Mon Parcours</h2>
                <div className="resume-row">
                    <div className="resume-col-left">
                        <h3 className="resume-h3">Ma Formation</h3>
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
                            <h5 className="resume-h5">10/2022 - 02/2024</h5>
                            <p className="resume-p"><em>YOUGGY, Paris</em></p>
                            <ul className="resume-ul">
                                <li>Développement du site internet en utilisant React Js</li>
                                <li>Conception de l'application YOUGGY pour iOS</li>
                                <li>Maintenance continue de l'application</li>
                                <li>Optimisation des performances de l'application existante</li>
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

                <div className="skills-section">
                    <h3 className="skills-title">Mes Compétences</h3>
                    <div className="skills-row">
                        <div className="skill-item">
                            <span>React JS</span>
                            <div className="skill-bar">
                                <div className="skill-level" style={{width: '80%'}}></div>
                            </div>
                            <span className="skill-percent">80%</span>
                        </div>
                        <div className="skill-item">
                            <span>React Native</span>
                            <div className="skill-bar">
                                <div className="skill-level" style={{width: '65%'}}></div>
                            </div>
                            <span className="skill-percent">65%</span>
                        </div>
                        <div className="skill-item">
                            <span>Flutter</span>
                            <div className="skill-bar">
                                <div className="skill-level" style={{width: '50%'}}></div>
                            </div>
                            <span className="skill-percent">50%</span>
                        </div>
                        <div className="skill-item">
                            <span>Node JS</span>
                            <div className="skill-bar">
                                <div className="skill-level" style={{width: '85%'}}></div>
                            </div>
                            <span className="skill-percent">85%</span>
                        </div>
                        <div className="skill-item">
                            <span>Python</span>
                            <div className="skill-bar">
                                <div className="skill-level" style={{width: '55%'}}></div>
                            </div>
                            <span className="skill-percent">55%</span>
                        </div>
                        <div className="skill-item">
                            <span>JS</span>
                            <div className="skill-bar">
                                <div className="skill-level" style={{width: '70%'}}></div>
                            </div>
                            <span className="skill-percent">70%</span>
                        </div>
                        <div className="skill-item">
                            <span>Nest JS</span>
                            <div className="skill-bar">
                                <div className="skill-level" style={{width: '45%'}}></div>
                            </div>
                            <span className="skill-percent">45%</span>
                        </div>
                        <div className="skill-item">
                            <span>JAVA</span>
                            <div className="skill-bar">
                                <div className="skill-level" style={{width: '45%'}}></div>
                            </div>
                            <span className="skill-percent">35%</span>
                        </div>
                    </div>
                    <div className="skills-btn-section">
                    <a href="/CV_MerwanLaouini.pdf" className="skills-download-cv-btn">
                        Télécharger CV
                    </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Resume;
