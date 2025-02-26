import { useState, useEffect } from "react";
import "../styles/CodeGenerator.css";
import { GoogleGenerativeAI } from "@google/generative-ai";

function CodeGenerator({ problem, onGenerate }) { // Renamed setCode to onGenerate
    const [ans, setAns] = useState(["Generating....."]);
    const genAI = new GoogleGenerativeAI("AIzaSyBBelllFr5OZqNnMUgx9h6FC-5QXGTtmkU");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await model.generateContent(problem);
                const response = await result.response;
                const text = await response.text();
                const lines = text.split("\n");

                console.log(lines);
                setAns(lines);

                if (typeof onGenerate === "function") { // Ensure onGenerate is a function
                    onGenerate(text); 
                } else {
                    console.error("onGenerate is not a function");
                }
            } catch (error) {
                console.error("Error:", error);
                setAns(["Error generating content"]);
            }
        }

        if (problem) { // Only run if problem is not empty
            fetchData();
        }
    }, [onGenerate]); // Add problem dependency

    return (
        <div className="result">
            <ul type="none">
                {ans.map((item, index) => (
                    <li className="it" key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

export default CodeGenerator;
