import "./Form.css";
import { Mail, Phone, Clock } from 'lucide-react';
import { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Button from "./Buttons";

export default function ContactForm() {
    const captchaRef = useRef(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const siteKey = import.meta.env.VITE_HCAPTCHA_SITEKEY;

    const [loading, setLoading] = useState(false)

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [succesMessage, setSuccesMessage] = useState("");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");

    const sendForm = async (e) => {
        e.preventDefault();
        setLoading(true)

        if (!captchaToken) {
            alert("Пожалуйста, подтвердите, что вы не робот!");
            setLoading(false)
            return;
        }

        if (name.length === 0 || email.length === 0 || phone.length === 0) {
            if (name.length === 0) {
                setNameError("Введите имя");
            }
            if (email.length === 0) {
                setEmailError("Введите почту");
            }
            if (phone.length === 0) {
                setPhoneError("Введите телефон");
            }

            setErrorMessage("Некорректный ввод");
            setLoading(false)
            return
        }
        const data = {
            name: name,
            phone: phone,
            email: email,
            message: message,
            captchaToken: captchaToken
        }

        const res = await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            if (result) {
                setErrorMessage("");
                setSuccesMessage("Форма успешно отправлена, ожидайте звонка");
            }
            else
            {
                setSuccesMessage("");
                setErrorMessage("Ошибка проверки валидации, убедитесь, что почта и телефон были введены корректно");
            }
        }

        captchaRef.current.resetCaptcha();
        setCaptchaToken(null);
        setLoading(false)
    };

    return (
        <section className="contact" id="contact">
            <h2>Связаться с нами</h2>
            <p className="subtitle">
                Остались вопросы? Свяжитесь с нами и мы поможем вам!
            </p>
            <div className="desktopErrorMessages">
                <p className="errorMessage">{errorMessage}</p>
                <p className="succesMessage">{succesMessage}</p>
            </div>
            <div className="contact-grid">
                {/* Левая колонка */}
                <div className="contact-info">
                    <h4>Контактная информация</h4>

                    <div className="info-item">
                        <span><Phone></Phone></span>
                        <div>
                            <strong>Телефон</strong>
                            <p>+7(999)123-4567</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <span><Mail></Mail></span>
                        <div>
                            <strong>Email</strong>
                            <p>pochta@mail.ru</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <span><Clock></Clock></span>
                        <div>
                            <strong>Рабочее время(МСК)</strong>
                            <p>Пн – Сб: 6:00 – 22:00</p>
                        </div>
                    </div>
                </div>

                {/* Правая колонка */}
                <form className="contact-form">
                    <div className="mobileErrorMessages">
                        <p className="errorMessage">{errorMessage}</p>
                        <p className="succesMessage">{succesMessage}</p>
                    </div>

                    <label>Ваше имя</label>
                    <input type="text" placeholder={nameError} onChange={(e) => setName(e.target.value)} />

                    <label>Email</label>
                    <input type="email" placeholder={emailError} onChange={(e) => setEmail(e.target.value)} />

                    <label>Телефон</label>
                    <input type="tel" placeholder={phoneError} onChange={(e) => setPhone(e.target.value)} />

                    <label>Сообщение(Не обязательно)</label>
                    <textarea rows="4" onChange={(e) => setMessage(e.target.value)}></textarea>

                    <button type="submit" onClick={sendForm} disabled={loading}>
                        {loading ? 'Отправка...' : 'Отправить'}
                    </button>
                    <div className="recaptcha-wrapper">
                        <HCaptcha
                            ref={captchaRef}
                            sitekey={siteKey}
                            onVerify={setCaptchaToken}
                            onExpire={() => setCaptchaToken(null)}
                        />
                    </div>
                </form>
            </div>
        </section>
    );
}
