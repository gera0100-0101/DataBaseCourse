import Button from "./Buttons";
import "./InfoBlock.css";
import { useApp } from './useApp'
import { images } from '@/jsonData/imageRegistry';

export function InfoBlock({ infoBlocks, content, imageLeft }) {
    let isLeft

    if (imageLeft) {
        isLeft = "infoBlockImageLeft"
    } else {
        isLeft = "infoBlockImageRight"
    }

    return (
        <div className={isLeft}>
            <div className="image-wrapper">
                <img src={infoBlocks.image} alt="fireSpot" />
            </div>
            <div className="textContent">
                <h2>{infoBlocks.title}</h2>
                <h3 className="clamp">{infoBlocks.description}</h3>
                {content}
            </div>
        </div>
    )
}
export function ProjectsBlockVideo() {
    const { navigationSubmit } = useApp();

    return (
        <div className="hero">
            <video
                src={images.court}
                autoPlay
                muted
                loop
                playsInline
            />
            <div className="overlay"></div>

            <div className="content">
                <h2>УСТАНОВЛЕННЫЕ НАМИ ПАДЕЛ-КОРТЫ УЖЕ ОТКРЫТЫ ДЛЯ ИГРЫ В МОСКВЕ, САНКТ-ПЕТЕРБУГРЕ И В ДРУГИХ ГОРОДАХ РОССИИ</h2>
                <p>Каждый проект — это уникальные задачи, которые мы решаем с максимальным вниманием к деталям и пожеланиям заказчика</p>
                <Button className="sliderButton" onClick={() => navigationSubmit("projects")}>Наши готовые проекты</Button>
            </div>
        </div>
    )
}