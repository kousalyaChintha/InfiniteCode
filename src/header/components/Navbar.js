import { useState, useEffect } from "react";
import "../styles/Navbar.css";
import { Link } from "react-router-dom";


function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsOpen(false); // Close menu when resizing back to large screen
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <nav className="navbar navbar-expand-md  p-3">
            {/* Logo */}
            <Link className="nav-link" to="/">
                <img src="logo.jpg" alt="logo" margin-right = "2px" width="50px" height="50px" className="me-2" />
                InfiniteCode
            </Link>

            {/* Hamburger Icon */}
            <button
                className="navbar-toggler"
                type="button"
                onClick={() => setIsOpen(!isOpen)}
            >
                ☰
            </button>

            {/* Navigation Links */}
            <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
                <ul className="navbar-nav ms-auto">
                <li><Link className="nav-link" to="/">Home</Link></li>
                <li><Link className="nav-link" to="/about">About</Link></li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
