import "../styles/About.css";

function About() {
    return (
        <div id="para">
            <h2>Integrated Development Environment (IDE)</h2>
            <p>
                An <strong>Integrated Development Environment (IDE)</strong> is a software application 
                that provides developers with tools to write, test, and debug their code efficiently. 
                IDEs often come with a range of features that streamline the development process.
            </p>

            <h3>1. Auto-Completion / Code Suggestions</h3>
            <ul>
                <li><strong>Auto-completion</strong> speeds up coding by suggesting possible completions for variable names, functions, or methods as you type.</li>
                <li><strong>Intelligent suggestions:</strong> Advanced algorithms offer context-aware suggestions.</li>
                <li>Many IDEs provide <strong>parameter hints</strong> and <strong>documentation on hover</strong>.</li>
            </ul>

            <h3>2. Debugging Support</h3>
            <ul>
                <li><strong>Breakpoints:</strong> Pause execution to inspect variables and call stacks.</li>
                <li><strong>Watch variables:</strong> Track variable values in real-time.</li>
                <li><strong>Step through code:</strong> Move through code line by line for debugging.</li>
            </ul>

            <h3>3. Code Formatting & Linting</h3>
            <p>Most IDEs can <strong>auto-format</strong> code and integrate with <strong>linters</strong> to maintain coding standards.</p>

            <h3>4. Refactoring Tools</h3>
            <p>Refactoring support helps rename variables, extract methods, and restructure code safely.</p>

            <h3>5. Code Navigation</h3>
            <p>Features like <strong>Go to Definition</strong> and <strong>Find References</strong> allow easy code exploration.</p>

            <h3>6. Integrated Version Control</h3>
            <p>Many IDEs integrate with <strong>Git</strong> for version control, allowing commits, branching, and merging.</p>

            <h3>7. Testing Support</h3>
            <p>Support for frameworks like <strong>JUnit</strong>, <strong>PyTest</strong>, and <strong>Mocha</strong> allows easy test execution.</p>

            <h3>Popular IDEs with Auto-Completion and Debugging Features</h3>
            <ul>
                <li><strong>Visual Studio Code (VSCode):</strong> Lightweight, highly customizable, and feature-rich.</li>
                <li><strong>JetBrains IntelliJ IDEA:</strong> Excellent for Java development.</li>
                <li><strong>PyCharm:</strong> Great for Python development.</li>
                <li><strong>Eclipse:</strong> Popular for Java and plugin support.</li>
                <li><strong>Microsoft Visual Studio:</strong> Powerful for .NET and C++.</li>
            </ul>
        </div>
    );
}

export default About;
