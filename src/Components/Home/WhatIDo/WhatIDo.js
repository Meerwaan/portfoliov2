import React from 'react';
import './WhatIDo.css';
import SeoIcon from '../../../Assets/icons/seo-50.png'; // Remplace par le bon chemin vers l'icône SEO
import WebdevIC from '../../../Assets/icons/Webdev-50.png';
import BlogIcon from '../../../Assets/icons/blog-50.png'; // Remplace par le bon chemin vers l'icône Blog
import EcommerceIcon from '../../../Assets/icons/e-commerce-50.png'; // Remplace par le bon chemin vers l'icône E-commerce
import MaintenanceIcon from '../../../Assets/icons/wrench-50.png'; // Remplace par le bon chemin vers l'icône Maintenance

function WhatIDo() {
    const services = [
        {
            title: 'SEO',
            description: 'Optimisation de votre site pour améliorer sa visibilité sur les moteurs de recherche.',
            icon: SeoIcon
        },
        {
            title: 'Site Vitrine',
            description: 'Création de sites vitrines pour présenter votre entreprise et vos services en ligne.',
            icon: WebdevIC
        },
        {
            title: 'Blog',
            description: 'Développement de blogs personnalisés pour partager vos idées et contenus.',
            icon: BlogIcon
        },
        {
            title: 'Site E-commerce',
            description: 'Mise en place de sites E-commerce pour vendre vos produits en ligne.',
            icon: EcommerceIcon
        },
        {
            title: 'Maintenance de Site',
            description: 'Service de maintenance pour assurer la sécurité et la mise à jour de votre site.',
            icon: MaintenanceIcon
        }
    ];

    return (
        <section id="whatido" className="what-i-do-section">
            <div className="container">
                <h2 className="whatido-title">Mes prestations</h2>
                <div className="services-grid">
                    {services.map((service, index) => (
                        <div key={index} className="service-item">
                            <img src={service.icon} alt={`${service.title} Icon`} className="service-icon" />
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default WhatIDo;
