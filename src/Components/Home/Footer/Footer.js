import React from 'react';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <p>
                Copyright © {new Date().getFullYear()} <span className="footer-name">MWN-TECH </span>, tous droits réservés.
            </p>
        </footer>
    );
}

export default Footer;
