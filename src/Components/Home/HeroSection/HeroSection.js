import React from 'react';
import { Parallax } from 'react-parallax';
import {ReactTyped} from 'react-typed';
import './HeroSection.css';
import BackgroundImage from '../../../Assets/heroBg.jpg';

function HeroSection() {
    return (
        <Parallax bgImage={BackgroundImage} strength={200}>
            <div className="hero-section" id="accueil">
                <div className="content">
                    <h1>Bienvenue</h1>
                    <h2>
                        <ReactTyped
                        strings={[
                            "Je suis Merwan Laouini",
                            "Vous avez besoin d'un développeur Front-end",
                            "Vous avez besoin d'un développeur Back-end",
                            "Vous avez besoin d'un développeur Full-stack !"
                        ]}
                        typeSpeed={70}
                        backSpeed={60}
                        loop
                    />
                    </h2>
                    <p>Basé en iles de France et disponible en remote</p>
                    <a href="#contact" className="Btn-contact">Embauchez-moi ! </a>
                </div>
            </div>
        </Parallax>
    );
}

export default HeroSection;
