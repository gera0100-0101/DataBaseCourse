import Button from "./Buttons";
import "./Header.css"
import { useState, useEffect } from "react";
import { useApp } from './useApp'
import { Mail, Phone } from 'lucide-react';
import { FaTelegramPlane } from "react-icons/fa";
import BurgerMenu from './BurgerMenu';
import { images } from '@/jsonData/imageRegistry';

export default function Header() {
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [ticking, setTicking] = useState(false);
    const { navigationSubmit } = useApp();

    useEffect(() => {
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;

                    if (currentScrollY < 50) {
                        setVisible(true); // если почти наверху, показываем всегда
                    } else if (currentScrollY > lastScrollY + 10) {
                        setVisible(false); // скролл вниз >10px → скрыть
                    } else if (currentScrollY < lastScrollY - 10) {
                        setVisible(true); // скролл вверх >10px → показать
                    }

                    setLastScrollY(currentScrollY);
                    setTicking(false);
                });

                setTicking(true);
            }
        };
        
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY, ticking]);

    return (
        <header className={`header ${visible ? "visible" : "hidden"}`}>
            <div className="commercialName">
                <img src={images.padelMountLogo} className="logo" />
                <h2> Padel Mount</h2>
            </div>
            <div className = "nav">
                <Button className="headerButton" onClick={() => navigationSubmit("")}>Главная</Button>
                <Button className = "headerButton" onClick={() => navigationSubmit("services")}>Услуги</Button>
                <Button className="headerButton" onClick={() => navigationSubmit("projects")}>Портфолио</Button>
                <Button className="headerButton" onClick={() => navigationSubmit("contact")}>Контакты</Button>
                <div className="contactInfo">
                    <div className="cont">
                        <span>test@mail.ru</span><Mail></Mail>
                    </div>
                    <div className="cont">
                        <span>+7(999)555-2433</span><Phone></Phone>
                    </div>
                </div>
                <button className="telegramButton" onClick={() => window.open("https://t.me/v_gerich", "_blank")}><FaTelegramPlane size={30} /></button>
            </div>
            <div className="mobileDiv">
                <BurgerMenu></BurgerMenu>
            </div>
        </header>
    );
}