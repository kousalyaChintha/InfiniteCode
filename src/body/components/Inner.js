import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Button from "./Button";
import "../styles/Inner.css"

function Inner({ copiedCode }) {
    const [languages, setLanguages] = useState([]); 
    const [selectedLanguage, setSelectedLanguage] = useState({ id: 63, name: "JavaScript" });
    const [editorCode, setEditorCode] = useState("// Write your code here...");
    const [input, setInput] = useState(""); 
    const [output, setOutput] = useState("");

    const API_URL = "https://judge0-ce.p.rapidapi.com";
    const RAPIDAPI_KEY = "a113292f9fmsh370dd7eee0ae80bp140bbdjsn7c2e9a1bb54c";

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await fetch(`${API_URL}/languages`, {
                    method: "GET",
                    headers: {
                        "x-rapidapi-key": RAPIDAPI_KEY,
                        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                    },
                });

                if (!response.ok) throw new Error(`Error fetching languages: ${response.status}`);

                const data = await response.json();
                setLanguages(data);
                setSelectedLanguage(data.find((lang) => lang.id === 63) || data[0]);
            } catch (error) {
                console.error(error);
            }
        };

        fetchLanguages();
    }, []);

    // Update editor when `copiedCode` changes
    useEffect(() => {
        if (copiedCode) setEditorCode(copiedCode);
    }, [copiedCode]);

    // Function to execute the code
    const runCode = async () => {
        setOutput("Running...");

        try {
            const response = await fetch(`${API_URL}/submissions?base64_encoded=true&wait=true`, {
                method: "POST",
                headers: {
                    "x-rapidapi-key": RAPIDAPI_KEY,
                    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    language_id: selectedLanguage.id,
                    source_code: btoa(editorCode),
                    stdin: btoa(input),
                }),
            });

            if (!response.ok) throw new Error(`Error executing code: ${response.status}`);

            const result = await response.json();
            setOutput(result.stderr ? "Error: " + atob(result.stderr) : atob(result.stdout) || "No output");
        } catch (error) {
            console.error("Execution failed:", error.message);
            setOutput("Execution failed: " + error.message);
        }
    };

    return (
        <div id="inner">
            <h2>Online Code Editor</h2>
            <select
                onChange={(e) => setSelectedLanguage(languages.find(lang => lang.id === parseInt(e.target.value)))}
                value={selectedLanguage.id}
                style={{ marginBottom: "10px", padding: "5px" }}
            >
                {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                        {lang.name}
                    </option>
                ))}
            </select>

            {/* Monaco Code Editor */}
            <Editor
                height="400px"
                width="100%"
                theme="vs-dark"
                language={selectedLanguage.name.toLowerCase().includes("python") ? "python" :
                        selectedLanguage.name.toLowerCase().includes("java") ? "java" :
                        selectedLanguage.name.toLowerCase().includes("c++") ? "cpp" :
                        selectedLanguage.name.toLowerCase().includes("c") ? "c" :
                        selectedLanguage.name.toLowerCase().includes("php") ? "php" :
                        selectedLanguage.name.toLowerCase().includes("ruby") ? "ruby" :
                        "javascript"}
                value={editorCode}
                onChange={(newValue) => setEditorCode(newValue)}
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    lineNumbers: "on",
                    autoIndent: "full",
                    formatOnType: true,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: { other: true, comments: true, strings: true },
                }}
            />

            {/* Input Field */}
            <h3>Input:</h3>
            <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input here..."
                className="inout"
            />

            {/* Run Code Button */}
            <Button click={runCode} text="Run Code" />

            {/* Output Display */}
            <h3>Output:</h3>
            <pre className="inout">
                {output}
            </pre>
        </div>
    );
}

export default Inner;
