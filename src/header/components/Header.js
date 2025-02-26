import { useEffect, useState } from "react";
import "../styles/Header.css";
import Navbar from "./Navbar";

function Header() {
    const [headerHeight, setHeaderHeight] = useState("10vh");

    useEffect(() => {
        const updateSize = () => {
            setHeaderHeight(window.innerWidth < 600 ? "8vh" : "10vh");
        };

        window.addEventListener("resize", updateSize);
        updateSize(); // Set initial size

        return () => window.removeEventListener("resize", updateSize);
    }, []);

    return (
        <div id="head" style={{ height: headerHeight }}>
            <Navbar />
        </div>
    );
}

export default Header;
