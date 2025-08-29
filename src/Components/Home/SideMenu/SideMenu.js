import React, { useState } from 'react';
import './SideMenu.css';
import Avatar from '../../../Assets/PhotoPro.jpeg';

function SideMenu() {
    const [activeSection, setActiveSection] = useState('');

    const handleLinkClick = (section) => {
        setActiveSection(section);
    };

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
                            className={activeSection === 'accueil' ? 'active' : ''}
                            onClick={() => handleLinkClick('accueil')}
                        >
                            Accueil
                        </a>
                    </li>

                    <li>
                        <a
                            href="#about"
                            className={activeSection === 'about' ? 'active' : ''}
                            onClick={() => handleLinkClick('about')}
                        >
                            À propos de moi
                        </a>
                    </li>
                    <li>
                        <a
                            href="#resume"
                            className={activeSection === 'resume' ? 'active' : ''}
                            onClick={() => handleLinkClick('resume')}
                        >
                            Mon parcours
                        </a>
                    </li>
                    <li>
                        <a
                            href="#myskills"
                            className={activeSection === 'myskills' ? 'active' : ''}
                            onClick={() => handleLinkClick('myskills')}
                        >
                            Mes compétences
                        </a>
                    </li>
                    <li>
                        <a
                            href="#whatido"
                            className={activeSection === 'whatido' ? 'active' : ''}
                            onClick={() => handleLinkClick('whatido')}
                        >
                            Mes services
                        </a>
                    </li>
                    <li>
                        <a
                            href="#portfolio"
                            className={activeSection === 'portfolio' ? 'active' : ''}
                            onClick={() => handleLinkClick('portfolio')}
                        >
                            Mes Projets
                        </a>
                    </li>
                    <li>
                        <a
                            href="#contact"
                            className={activeSection === 'contact' ? 'active' : ''}
                            onClick={() => handleLinkClick('contact')}
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
