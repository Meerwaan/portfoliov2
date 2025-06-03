import React, { useState } from 'react';
import './Projects.css';
import HOA from '../../../Assets/projects/hallofarts.png';
import Youggy from '../../../Assets/projects/Youggy.png';
import DrinkAPP from '../../../Assets/projects/Drinkapp.png';
import WorkR from '../../../Assets/projects/workr.png';
import ScanIA from '../../../Assets/projects/IaImage.png';

function Projects() {
    const [activeFilter, setActiveFilter] = useState('TOUT');
    const [selectedProject, setSelectedProject] = useState(null);

    const projects = [
        {
            title: 'Hall Of Arts ',
            category: 'Application',
            description: 'Que vous soyez un amateur d\'art, u...ger dans l\'univers vibrant et créatif du street art parisien.',
            technologies: 'React-Native , Nest.JS',
            client: 'ESIEE IT',
            date: '2024',
            url: 'https://github.com/HallOfArt',
            images: [HOA]
        },
        {
            title: 'Youggy',
            category: 'Site web',
            description: 'Youggy est une plateforme web et mo...rtunités d\'engagement pour soutenir diverses causes sociales.',
            technologies: 'React.JS , Gatsby.js',
            client: 'YOUGGY',
            date: '2022-2023',
            url: 'youggy.com',
            images: [Youggy]
        },
        {
            title: 'Drink App',
            category: 'Application',
            description: 'Application mobile pour trouver des recettes de cocktails... tant alcoolisés que non alcoolisés',
            technologies: 'React-Native',
            client: 'Projet Personnel',
            date: '2023',
            url: 'https://github.com/merwanlaouini/DrinkApp',
            images: [DrinkAPP]
        },
        {
            title: 'Work R',
            category: 'Site web',
            description: 'WorkR est une plateforme de ...',
            technologies: 'React.JS, Firebase',
            client: 'Projet Personnel',
            date: '2022',
            url: 'https://github.com/fayssalmechmeche/Projet-Work-r',
            images: [WorkR]
        },
        {
            title: 'ScanImage IA',
            category: 'Site web',
            description: 'ScanImage IA est un site innovant q...t une photo, et notre intelligence artificielle fera le reste.',
            technologies: 'Python',
            client: 'Projet d\'études',
            date: '2022',
            url: '',
            images: [ScanIA]
        }
    ];

    const filteredProjects =
        activeFilter === 'TOUT'
            ? projects
            : projects.filter((project) => project.category === activeFilter);

    return (
        <section id="portfolio" className="projects-section">
            <div className={`container ${selectedProject ? 'blur' : ''}`}>
                <h2 className="projects-title">Mes Projets</h2>

                <div className="projects-filter">
                    <button
                        className={activeFilter === 'TOUT' ? 'active' : ''}
                        onClick={() => setActiveFilter('TOUT')}
                    >
                        TOUT
                    </button>
                    <button
                        className={activeFilter === 'Application' ? 'active' : ''}
                        onClick={() => setActiveFilter('Application')}
                    >
                        Application
                    </button>
                    <button
                        className={activeFilter === 'Site web' ? 'active' : ''}
                        onClick={() => setActiveFilter('Site web')}
                    >
                        Site web
                    </button>
                </div>

                <div className="projects-grid">
                    {filteredProjects.map((project, index) => (
                        <div
                            key={index}
                            className="project-item"
                            onClick={() => setSelectedProject(project)}
                        >
                            <img
                                src={project.images[0]}
                                alt={project.title}
                                className="project-image"
                            />
                            <div className="project-info">
                                <h3>{project.title}</h3>
                                <p>{project.category}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedProject && (
                <div className="overlay" onClick={() => setSelectedProject(null)}>
                    <div
                        className="project-popup"
                        onClick={(e) => e.stopPropagation() /* Empêche la fermeture si clic à l’intérieur */}
                    >
                        <div className="popup-main-content">
                            <img
                                src={selectedProject.images[0]}
                                alt={selectedProject.title}
                                className="popup-image"
                            />
                            <div className="project-popup-info">
                                <button
                                    className="close-btn"
                                    onClick={() => setSelectedProject(null)}
                                >
                                    X
                                </button>

                                <h3>Informations sur le projet</h3>
                                <p>{selectedProject.description}</p>

                                <h3>Détails du projet</h3>
                                <ul>
                                    <li>
                                        <strong>Client :</strong> {selectedProject.client}
                                    </li>
                                    <li>
                                        <strong>Technologies :</strong>{' '}
                                        {selectedProject.technologies}
                                    </li>
                                    <li>
                                        <strong>Date :</strong> {selectedProject.date}
                                    </li>
                                    <li>
                                        <strong>URL :</strong>{' '}
                                        {selectedProject.url ? (
                                            <a
                                                href={selectedProject.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {selectedProject.url}
                                            </a>
                                        ) : (
                                            '—'
                                        )}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Projects;
