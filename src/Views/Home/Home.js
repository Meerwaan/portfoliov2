import React from 'react';
import SideMenu from "../../Components/Home/SideMenu/SideMenu";
import './Home.css';

function Home() {
    return (
        <div className="home-container">
            <SideMenu />
            <div className="content">
                {/* Les autres sections de la page iront ici */}
                <h1>Bienvenue sur ma page d'accueil</h1>
            </div>
        </div>
    );
}

export default Home;
