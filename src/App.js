import React, { useEffect, useState } from 'react';
import Home from './Views/Home/Home';
import SideMenu from './Components/Home/SideMenu/SideMenu';
import BurgerMenu from './Components/Home/BurgerMenu/BurgerMenu';

function App() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Appelle initiale pour définir l'état lors du chargement de la page

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="App">
            {isMobile ? <BurgerMenu /> : <SideMenu />}
            <Home />
        </div>
    );
}

export default App;
