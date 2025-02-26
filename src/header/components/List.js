import "../styles/List.css";

function List() {
    return(
        <ul type="none" id="nav">
            <li id="name">InfinteCode</li>
            <li id = "home" ><a href = "/home">HOME</a></li>
            <li><a href = "/about">ABOUT IDE</a></li>
        </ul>
    );
}

export default List;