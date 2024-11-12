// BurgerMenu.js
import React, { useState } from 'react';
import './BurgerMenu.css';

function BurgerMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <header className="top-bar">
                <div className="name">Merwan Laouini</div>
                <div className="burger-icon" onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </header>

            {isMenuOpen && (
                <div className="overlay-menu">
                    <div className="close-btn" onClick={toggleMenu}>✕</div>
                    <nav className="navigation">
                        <ul>
                            <li><a href="#accueil" onClick={toggleMenu}>Accueil</a></li>
                            <li><a href="#about" onClick={toggleMenu}>À propos de moi</a></li>
                            <li><a href="#resume" onClick={toggleMenu}>Mon parcours</a></li>
                            <li><a href="#whatido" onClick={toggleMenu}>Mes services</a></li>
                            <li><a href="#portfolio" onClick={toggleMenu}>Mes Projets</a></li>
                            <li><a href="#contact" onClick={toggleMenu}>Contact</a></li>
                        </ul>
                    </nav>
                </div>
            )}
        </>
    );
}

export default BurgerMenu;
