import React from 'react';
import SideMenu from "../../Components/Home/SideMenu/SideMenu";
import './Home.css';
import HeroSection from "../../Components/Home/HeroSection/HeroSection";
import AboutMe from "../../Components/Home/AboutMe/AboutMe";
import Resume from "../../Components/Home/Resume/Resume";
import { Parallax } from 'react-parallax';


function Home() {
    return (
        <div className="home-container">
            <SideMenu />
            <Parallax className="content">
                <HeroSection />
                <AboutMe />
                <Resume />
            </Parallax>
        </div>
    );
}

export default Home;
