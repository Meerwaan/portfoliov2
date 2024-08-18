import React, { useState } from 'react';
import './SideMenu.css';
import Avatar from '../../../Assets/AvatarDarkMode.jpeg';
import LinkedInIcon from '../../../Assets/icons/linkedin.svg';
import GitHubIcon from '../../../Assets/icons/github.svg';

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
                            href="#hero"
                            className={activeSection === 'hero' ? 'active' : ''}
                            onClick={() => handleLinkClick('hero')}
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
            <div className="social-icons">
                <a href="https://www.linkedin.com/in/merwan-laouini-4b5688204/" target="_blank" rel="noopener noreferrer">
                    <img src={LinkedInIcon} alt="LinkedIn" className="social-icon"/>
                </a>
                <a href="https://github.com/Meerwaan" target="_blank" rel="noopener noreferrer">
                    <img src={GitHubIcon} alt="GitHub" className="social-icon"/>
                </a>
            </div>
        </aside>
    );
}

export default SideMenu;
