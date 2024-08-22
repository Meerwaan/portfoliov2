import React from 'react';
import SideMenu from "../../Components/Home/SideMenu/SideMenu";
import './Home.css';
import HeroSection from "../../Components/Home/HeroSection/HeroSection";

function Home() {
    return (
        <div className="home-container">
            <SideMenu />
            <div className="content">
            <HeroSection />
            </div>
        </div>
    );
}

export default Home;
