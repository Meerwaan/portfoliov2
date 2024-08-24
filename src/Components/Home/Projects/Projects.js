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
            description: 'Que vous soyez un amateur d\'art, un touriste curieux ou un habitant désireux de redécouvrir votre ville sous un nouvel angle, Hall of Arts vous invite à plonger dans l\'univers vibrant et créatif du street art parisien.',
            technologies: 'React-Native , Nest.JS',
            client: 'ESIEE IT',
            date: '2024',
            url: 'https://github.com/HallOfArt',
            images: [HOA]
        },
        {
            title: 'Youggy',
            category: 'Site web',
            description: 'Youggy est une plateforme web et mobile qui met en relation les bénévoles avec des associations, simplifiant la recherche d\'opportunités d\'engagement pour soutenir diverses causes sociales.',
            technologies: 'React.JS , Gatsby.js',
            client: 'YOUGGY',
            date: '2022-2023',
            url: 'youggy.com',
            images: [Youggy]
        },
        {
            title: 'Drink APP',
            category: 'Application',
            description: 'Drink App vous permet de découvrir et de préparer une grande variété de cocktails, avec ou sans alcool. Explorez des recettes adaptées à tous les goûts et occasions, et devenez un expert en mixologie depuis votre smartphone.',
            technologies: 'Swift',
            client: 'Projet d\'études',
            date: '2022',
            url: '',
            images: [DrinkAPP]
        },
        {
            title: 'WorkR',
            category: 'Application',
            description: 'WorkR connecte particuliers et artisans pour réaliser vos travaux, avec un suivi en temps réel directement via l\'application. Trouvez rapidement le professionnel qu\'il vous faut et gérez vos projets en toute simplicité.',
            technologies: 'Flutter , MongoDB',
            client: 'Projet d\'études',
            date: '2022',
            url: '',
            images: [WorkR]
        },
        {
            title: 'ScanImage IA',
            category: 'Site web',
            description: 'ScanImage IA est un site innovant qui analyse vos images pour déterminer si elles représentent du street art. Chargez simplement une photo, et notre intelligence artificielle fera le reste.',
            technologies: 'Python',
            client: 'Projet d\'études',
            date: '2022',
            url: '',
            images: [ScanIA]
        },
    ];

    const filteredProjects = activeFilter === 'TOUT' ? projects : projects.filter(project => project.category === activeFilter);

    return (
        <section id="portfolio" className="projects-section">
            <div className={`container ${selectedProject ? 'blur' : ''}`}>
                <h2 className="projects-title">Mes Projets</h2>
                <div className="projects-filter">
                    <button className={activeFilter === 'TOUT' ? 'active' : ''} onClick={() => setActiveFilter('TOUT')}>TOUT</button>
                    <button className={activeFilter === 'Application' ? 'active' : ''} onClick={() => setActiveFilter('Application')}>Application</button>
                    <button className={activeFilter === 'Site web' ? 'active' : ''} onClick={() => setActiveFilter('Site web')}>Site web</button>
                </div>
                <div className="projects-grid">
                    {filteredProjects.map((project, index) => (
                        <div key={index} className="project-item" onClick={() => setSelectedProject(project)}>
                            <img src={project.images[0]} alt={project.title} className="project-image" />
                            <div className="project-info">
                                <h3>{project.title}</h3>
                                <p>{project.category}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedProject && (
                <div className="overlay">
                    <div className="project-popup">
                        <div className="popup-main-content">
                            <img src={selectedProject.images[0]} alt={selectedProject.title} className="popup-image" />
                            <div className="project-popup-info">
                                <button className="close-btn" onClick={() => setSelectedProject(null)}>X</button>
                                <h3>Informations sur le projet</h3>
                                <p>{selectedProject.description}</p>
                                <h3>Détails du projet</h3>
                                <ul>
                                    <li><strong>Client :</strong> {selectedProject.client}</li>
                                    <li><strong>Technologies :</strong> {selectedProject.technologies}</li>
                                    <li><strong>Date :</strong> {selectedProject.date}</li>
                                    <li><strong>URL :</strong> <a href={selectedProject.url} target="_blank" rel="noopener noreferrer">{selectedProject.url}</a></li>
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
