import "../styles/Code.css";
import Inner from "./Inner";

import { useState } from "react";

function Code(props) {
    const [code, setCode] = useState("");

    // Update the editor only when props.code is received
    useState(() => {
        if (props.onCodeGenerated) {
            setCode(props.onCodeGenerated);
        }
    }, [props.onCodeGenerated]);
    return (
        <div id="second">
            <h1 id="code">Write Your Code Here</h1>
            <Inner />
        </div>
    )
}

export default Code;