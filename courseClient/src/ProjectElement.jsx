import "./ProjectElement.css"
import { ProjectSlider } from "./ImageSlider";
import cards from "./jsonData/ProjectCardData";
import { MapPin, Calendar, SquareCheckBig } from 'lucide-react';

export default function ProjectElement() {
    return (
        <div className="cards-grid">
            {cards.map((card, i) => (
                <div key={i} className="card">
                    <ProjectSlider images={card.images} ></ProjectSlider>
                    <div className="card-content">
                        <h3 className="card-title">{card.title}</h3>
                        <div className="card-meta">
                            <MapPin size={20} />
                            <span>{card.location}</span>
                            <Calendar size={20} />
                            <span>{card.year}</span>
                        </div>
                        {/*<p className="card-desc">{card.description}</p>*/}
                        <ul className="card-list">
                            {card.features.map((f, idx) => (
                                <li key={idx} className="card-item"><SquareCheckBig size={20} color="#5DD62C" />{f}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}
