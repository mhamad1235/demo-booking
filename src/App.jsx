import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import HotelDetail from "./pages/HotelDetail";
import MainPage from "./pages/MainPage";

function App() {
  return (
     <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/hotel/:id" element={<HotelDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
