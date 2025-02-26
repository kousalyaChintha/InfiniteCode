import "../styles/Footer.css"
function Footer(){
    const currentYear = new Date().getFullYear();
    return(
        <div id="footer">
            <footer>
                <span id="foot">&copy; {currentYear} Kousalya, Inc. All Rights Reserved.</span>
            </footer>
        </div>
    );
}

export default Footer;