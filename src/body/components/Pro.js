import { useState, useCallback } from "react";
import "../styles/Pro.css";
import Button from "./Button";
import CodeGenerator from "./CodeGenerator";
import Inner from "./Inner";

function Pro() {
    const [problemStatement, setProblemStatement] = useState("");
    const [showGenerator, setShowGenerator] = useState(false);
    const [empgen, setEmpgen] = useState("Result will be displayed here....");
    const [generatorKey, setGeneratorKey] = useState(0);
    const [codes, setCodes] = useState([]);
    const [showEmptyDiv, setShowEmptyDiv] = useState(true);

    const handleGenerateClick = () => {
        if (problemStatement.trim() === "") {
            setEmpgen("Enter a valid prompt");
            setCodes([]);
            setShowEmptyDiv(true);
            setShowGenerator(false);
            return;
        }

        setCodes([]);
        setShowEmptyDiv(true);
        setShowGenerator(false);

        setTimeout(() => {
            setShowEmptyDiv(false);
            setGeneratorKey(prevKey => prevKey + 1);
            setShowGenerator(true);
        }, 500);
    };

    const handleCopyToEditor = (code) => {
        <Inner code={code} />;
        console.log("Copied Code to Editor:", code);
    };

    const handleCopyToClipboard = (code) => {
        const firstNewLineIndex = code.indexOf("\n");
        navigator.clipboard.writeText(code.slice(firstNewLineIndex+1)).then(() => {
            alert("Code copied to clipboard!");
        }).catch(err => console.error("Failed to copy:", err));
    };

    const extractCodeBlocks = useCallback((generatedCode) => {
        console.log("Extracting code...");
        const regex = /```([\s\S]*?)```/g;
        const matches = [...generatedCode.matchAll(regex)].map(match => match[1]);
        setCodes(matches.length > 0 ? matches : ["No code found!"]);
    }, []);

    return (
        <div id="left-panel">
            <h3 id="name1">Problem Statement</h3>
            <textarea
                id="prostate"
                rows="10"
                cols="50"
                className="result"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Enter your problem statement..."
            /><br />
            <Button click={handleGenerateClick} id="generate" text="GENERATE" />
            <h3>Explanation</h3>
            {showEmptyDiv && <div className="result">{empgen}</div>}
            {showGenerator && (
                <CodeGenerator key={generatorKey} problem={problemStatement} onGenerate={extractCodeBlocks} />
            )}

            

        {codes.length > 0 && codes[0] !== "No code found!" && (
            codes.map((code, index) => {
                const firstNewLineIndex = code.indexOf("\n");
                return (
                    <div key={index}>
                        <h3>{code.slice(0, firstNewLineIndex)} Code {index + 1}</h3>
                        <div className="result">
                            <pre>{code.slice(firstNewLineIndex + 1)}</pre>
                        </div>
                        <Button text="Copy To Editor" click={() => handleCopyToEditor(code)} />
                        <Button text="Copy To Clipboard" click={() => handleCopyToClipboard(code)} />
                    </div>
                );
            })
        )}

        </div>
    );
}

export default Pro;