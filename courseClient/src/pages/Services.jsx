import '../App.css';
import Header from '../Header';
import { infoBlocks } from '../jsonData/infoBlockData';
import { InfoBlock } from '../InfoBlock';
import { MetalMount } from '../AdditionalData';
import { Footer } from '../Footer';

export default function Services() {
    return (
        <div>
            <Header></Header>
            <InfoBlock infoBlocks={infoBlocks.filling} imageLeft={true}></InfoBlock>
            <InfoBlock infoBlocks={infoBlocks.repair} imageLeft={false}></InfoBlock>
            <InfoBlock infoBlocks={infoBlocks.technicalService} imageLeft={true}></InfoBlock>
            <InfoBlock infoBlocks={infoBlocks.metal} imageLeft={false}></InfoBlock>
            <InfoBlock infoBlocks={infoBlocks.grass} imageLeft={true}></InfoBlock>
            <Footer></Footer>
        </div>
    );
}