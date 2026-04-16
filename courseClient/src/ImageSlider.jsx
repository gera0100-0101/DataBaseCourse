import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from 'swiper/modules';
import { useApp } from './useApp';
import { images } from '@/jsonData/imageRegistry';
import "swiper/css";
import "./ImageSlider.css";
import "./ProjectElement.css";
import Button from "./Buttons";
import { ArrowBigRight, ArrowBigLeft } from 'lucide-react';

export function Slider() {
    const { navigationSubmit } = useApp();
    return (
        <div className="slider-wrapper">
            <Swiper modules={[Navigation]}
                navigation={{
                    prevEl: '.slider-prev',
                    nextEl: '.slider-next',
                }}
                spaceBetween={20} slidesPerView={1} loop>

                <SwiperSlide>
                    <div className="slide">
                        <img className="desktopElement" src={images.slide1} alt="" />
                        <video className="mobileElement"
                            src={images.sliderVideo}
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                        <div className="slide-text">
                            <h2>МОНТАЖ<br />ПАДЕЛ-КОРТОВ</h2>
                            <p>Где рождается характер каждой подачи</p>
                            <Button className="sliderButton" onClick={() => navigationSubmit("contact")}>Связаться</Button>
                        </div>
                    </div>
                </SwiperSlide>

                <SwiperSlide>
                    <div className="slide">
                        <img className="desktopElement" src={images.slide3} alt="" />
                        <video className="mobileElement"
                            src={images.sliderVideo1}
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                        <div className="slide-text">
                            <h2>БОЛЕЕ 150 УСТАНОВЛЕННЫХ КОРТОВ</h2>
                            <p>Мы уже успели зарекомендовать себя на рынке</p>
                            <Button className="sliderButton" onClick={() => navigationSubmit("projects")}>Проекты</Button>
                        </div>
                    </div>
                </SwiperSlide>

                <SwiperSlide>
                    <div className="slide">
                        <img className="desktopElement" src={images.slide2} alt="" />
                        <img className="mobileElement" src={images.slide2} alt="" />
                        <div className="slide-text">
                            <h2>УСЛУГА В ЛЮБОЙ ТОЧКЕ РОССИИ</h2>
                            <p>А так же в других странах СНГ</p>
                            <Button className="sliderButton" onClick={() => navigationSubmit("services")}>Наши услуги</Button>  
                        </div>
                    </div>
                </SwiperSlide>
            </Swiper>

            <button className="slider-prev"><ArrowBigLeft size={40} /></button>
            <button className="slider-next"><ArrowBigRight size={40} /></button>
        </div>
    );
}

export function ProjectSlider({ images }) {
    return (
        <div>
            <Swiper modules={[Autoplay]}
                autoplay={{ delay: 4000 }} spaceBetween={30} slidesPerView={1} loop>
                {images.map((img, index) => (
                    <SwiperSlide key={index}>
                        <img className="projectSlider" src={img} alt={`slide-${index}`} />
                    </SwiperSlide>
                ))}
        </Swiper>
        </div>
    );

}
