import "./Footer.css"

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-left">
                    <h3 className="footer-logo">Padel Mount</h3>
                    <p className="footer-text">
                        Монтаж и обслуживание теннисных кортов
                    </p>
                </div>

                <div className="footer-right">
                    <a href="mailto:test@mail.ru">test@mail.ru</a>
                    <a href="tel:+79995552433">+7 (999) 555-24-33</a>
                    <a href="https://t.me/v_gerich">Телеграм</a>
                    <a href="https://github.com/gera0100-0101">Разработчик</a>
                </div>
            </div>

            <div className="footer-bottom">
                © {new Date().getFullYear()} Padel Mount. Все права защищены
            </div>
        </footer>
    );
}
