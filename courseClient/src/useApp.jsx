import { useContext } from "react";
import { AppContext } from "./AppContext"; // 🔥 ИМЕННО ТАК

export function useApp() {
    return useContext(AppContext);
}

