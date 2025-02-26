import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import About from "../src/header/components/About";
import Header from "./header/components/Header";
import Body from "./body/components/Body";
import Footer from "./footer/components/Footer";


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Body />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
