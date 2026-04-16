import '../App.css';
import Header from '../Header';
import { Slider } from '../ImageSlider';
import {InfoBlock, ProjectsBlockVideo } from '../InfoBlock';
import { infoBlocks } from '../jsonData/infoBlockData';
import { AboutUsAdditional } from '../AdditionalData';
import Button from "../Buttons";
import { Footer } from '../Footer';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useApp } from '../useApp'

export default function Home() {
    const { navigationSubmit } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.scrollTo === "contact") {
            setTimeout(() => {
                document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
            }, 100);

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    return (
        <div>
            <Header></Header>
            <Slider></Slider>
            <InfoBlock infoBlocks={infoBlocks.aboutUs} content={<AboutUsAdditional></AboutUsAdditional>} imageLeft={false}></InfoBlock>
            <InfoBlock infoBlocks={infoBlocks.ourPast} imageLeft={true}></InfoBlock>
            <InfoBlock infoBlocks={infoBlocks.coaches} content={<Button className="infoBlockButton" onClick={() => navigationSubmit("services")}>Наши услуги</Button>} imageLeft={false}></InfoBlock>
            <ProjectsBlockVideo></ProjectsBlockVideo>
            <Footer></Footer>
        </div>
    );
}