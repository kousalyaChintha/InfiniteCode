import "../styles/Button.css"
function Button(props) {
    return(
        <button onClick={props.click} className="btn" id={props.id}>{props.text}</button>
    )
}

export default Button;