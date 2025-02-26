import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "../styles/CodeGenerator.css";

function CodeGenerator(props) { 
    const [ans, setAns] = useState(["Generating....."]);
    const genAI = new GoogleGenerativeAI("AIzaSyBBelllFr5OZqNnMUgx9h6FC-5QXGTtmkU");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await model.generateContent(props.problem);
                const response = await result.response;
                const text = await response.text();
                const lines = text.split("\n");

                console.log(lines);
                setAns(lines);

                if (typeof props.onGenerate === "function") { 
                    props.onGenerate(text); 
                } else {
                    console.error("props.onGenerate is not a function");
                }
            } catch (error) {
                console.error("Error:", error);
                setAns(["Error generating content"]);
            }
        }

        if (props.problem) { 
            fetchData();
        }
    }, [props.onGenerate]); 

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
