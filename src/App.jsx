import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";

import Login from "./pages/Login";
import MainPage from "./pages/MainPage";
import HotelDetail from "./pages/HotelDetail";
import BookingsList from "./pages/Booking";
import BottomNav from "./components/BottomNav/BottomNav";

function AppWrapper() {
  const location = useLocation();
  const hideNavOn = ["/"]; // hide nav on login page
  const shouldShowNav = !hideNavOn.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <BookingsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/:id"
          element={
            <ProtectedRoute>
              <HotelDetail />
            </ProtectedRoute>
          }
        />
      </Routes>

      {shouldShowNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </Router>
  );
}

export default App;
