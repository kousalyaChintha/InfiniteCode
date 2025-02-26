import "../styles/Body.css";
import {useState } from "react";
import Pro from "./Pro";
import Inner from "./Inner";

function Body() {
  const [copiedCode, setCopiedCode] = useState("");

  return (
    <div className="container-fluid">
        <div className="row">
            <div className="col-12 col-md-4 p-3 border-end" id="left-panel">
                <Pro setCopiedCode={setCopiedCode} />   
            </div>

            <div className="col-12 col-md-8 p-3" style={{backgroundColor:"#9984d4"}}>
                <Inner copiedCode={copiedCode} />
            </div>
        </div>
    </div>
  );
}

export default Body;