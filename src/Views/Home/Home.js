import React from 'react';
import SideMenu from "../../Components/Home/SideMenu/SideMenu";
import './Home.css';
import HeroSection from "../../Components/Home/HeroSection/HeroSection";
import AboutMe from "../../Components/Home/AboutMe/AboutMe";
import Resume from "../../Components/Home/Resume/Resume";
import { Parallax } from 'react-parallax';
import WhatIDo from "../../Components/Home/WhatIDo/WhatIDo";
import Projects from "../../Components/Home/Projects/Projects";
import Contact from "../../Components/Home/Contact/Contact";
import Footer from "../../Components/Home/Footer/Footer";


function Home() {
    return (
        <div className="home-container">
            <SideMenu />
            <Parallax className="content">
                <HeroSection />
                <AboutMe />
                <Resume />
                <WhatIDo />
                <Projects/>
                <Contact />
                <Footer />
            </Parallax>
        </div>
    );
}

export default Home;
