import React from "react";
import { NavLink } from "react-router-dom";
import { House, Map, Plus, Briefcase, Person } from "react-bootstrap-icons";
import "./BottomNav.css";

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/main" className="nav-item">
        <House />
        <span>Home</span>
      </NavLink>

      <NavLink to="/main" className="nav-item">
        <Map />
        <span>Map</span>
      </NavLink>

      <NavLink to="/main" className="nav-item center-btn">
        <Plus className="plus-icon" />
      </NavLink>

      <NavLink to="/booking" className="nav-item">
        <Briefcase />
        <span>Trips</span>
      </NavLink>

      <NavLink to="/main" className="nav-item">
        <Person />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
