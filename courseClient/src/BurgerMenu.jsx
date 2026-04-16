import { useState, useEffect } from "react";
import { useApp } from './useApp';
import "./BurgerMenu.css";
import Button from "./Buttons";
import { Menu, X } from 'lucide-react';
import { createPortal } from "react-dom";
import { FaTelegramPlane } from "react-icons/fa";

const BurgerMenu = () => {
    const [open, setOpen] = useState(false);
    const { navigationSubmit } = useApp();

    const buttonSubmit = (navStr) => {
        setOpen(false);
        navigationSubmit(navStr);
    }

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
    }, [open]);

    return (
        <>
            <button
                className={`burger ${open ? "active" : ""}`}
                onClick={() => setOpen(!open)}
            >
                <Menu size={40}></Menu>
            </button>

            {open && (
                createPortal(
            <div className="burgerOverlay" onClick={() => setOpen(false)}>
                <nav
                    className="menu-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="XCross"
                        onClick={() => setOpen(false)}><X size={45}></X></button>
                    <Button className="burgerButton" onClick={() => buttonSubmit("")} >Главная</Button>
                    <Button className="burgerButton" onClick={() => buttonSubmit("services")} >Услуги</Button>
                    <Button className="burgerButton" onClick={() => buttonSubmit("projects")} >Портфолио</Button>
                            <Button className="burgerButton" onClick={() => buttonSubmit("contact")}>Контакты</Button>
                            <Button className="burgerButton" onClick={() => window.open("https://t.me/v_gerich", "_blank")}><FaTelegramPlane size={30}></FaTelegramPlane>Telegram</Button>
                </nav>
            </div>,
            document.body
            ))}
        </>
    );
};

export default BurgerMenu;
