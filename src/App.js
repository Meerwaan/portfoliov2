import React, { useEffect, useState } from 'react';
import SideMenu from './Components/Home/SideMenu/SideMenu';
import BurgerMenu from './Components/Home/BurgerMenu/BurgerMenu';
import Home from "./Views/Home/Home";

function App() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 950);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call to set the correct menu on page load

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
