import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';
import './Contact.css';

function Contact() {
    const form = useRef();

    const sendEmail = (e) => {
        e.preventDefault();

        // Envoi du message principal
        emailjs.sendForm(
            process.env.REACT_APP_EMAILJS_SERVICE_ID,
            process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
            form.current,
            { publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY }
        )
            .then((result) => {
                console.log("Message principal envoyé :", result.text);

                // Envoi de la réponse automatique
                emailjs.send(
                    process.env.REACT_APP_EMAILJS_SERVICE_ID,
                    process.env.REACT_APP_EMAILJS_RESPONSE_ID, // Utilise la variable pour le template de réponse
                    {
                        from_name: form.current.from_name.value,
                        email: form.current.email.value,
                    },
                    { publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY }
                )
                    .then((result) => {
                        alert("Votre message a été envoyé avec succès et une réponse automatique vous a été adressée.");
                        console.log("Réponse automatique envoyée :", result.text);
                    })
                    .catch((error) => {
                        console.log("Erreur lors de l'envoi de la réponse automatique :", error.text);
                    });
            })
            .catch((error) => {
                alert("Une erreur est survenue. Veuillez réessayer.");
                console.log("Erreur lors de l'envoi du message principal :", error.text);
            });
    };

    return (
        <section id="contact" className="contact-section">
            <h2 className="contact-title">Contactez-moi</h2>
            <div className="contact-content">
                <div className="contact-form">
                    <h3>ÉCRIVEZ-NOUS</h3>
                    <form ref={form} onSubmit={sendEmail}>
                        <div className="form-group">
                            <input type="text" name="from_name" placeholder="Nom" required />
                            <input type="email" name="email" placeholder="Email" required />
                        </div>
                        <textarea name="message" placeholder="Dites-nous en plus sur vos besoins..." required></textarea>
                        <button type="submit" className="send-message-btn">Envoyer le message</button>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default Contact;
