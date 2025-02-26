function Editor(props) {
    const [code, setCode] = useState("// Write your code here...");
    <Editor
        language={props.lang.name.toLowerCase().includes("python") ? "python" :
                 props.lang.name.toLowerCase().includes("java") ? "java" :
                 props.lang.name.toLowerCase().includes("c++") ? "cpp" :
                 props.lang.name.toLowerCase().includes("c") ? "c" :
                 props.lang.name.toLowerCase().includes("php") ? "php" :
                 props.lang.name.toLowerCase().includes("ruby") ? "ruby" :
                 "javascript"} // Map language names to Monaco editor formats
        value={code}
        onChange={(newValue) => setCode(newValue)}
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
}

export default Editor;