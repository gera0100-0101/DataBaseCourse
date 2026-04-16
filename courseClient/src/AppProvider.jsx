import { useNavigate } from "react-router";
import { AppContext } from "./AppContext";

export function AppProvider({ children }) {
    const navigate = useNavigate();

    const navigationSubmit = (route) => {
        if (route === "contact") {
            navigate(`/`, {
                state: { scrollTo: "contact" }
            });
        }
        else {
            navigate(`/${route}`);
        }
    };

    return (
        <AppContext.Provider value={{ navigationSubmit }}>
            {children}
        </AppContext.Provider>
    );
}