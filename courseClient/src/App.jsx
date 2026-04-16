import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Services from './pages/Services';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/services" element={<Services />} />
        </Routes>
    );
}