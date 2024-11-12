import React from 'react';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <p>
                Copyright © {new Date().getFullYear()} <span className="footer-name">Merwan</span>. All Rights Reserved.
            </p>
        </footer>
    );
}

export default Footer;
