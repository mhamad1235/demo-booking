import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import "../hotel.css";

const MainPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axiosClient.get("/guest/hotels");
        if (response.data.result) {
          setHotels(response.data.data);
        } else {
          setError("Failed to load hotels.");
        }
      } catch (err) {
        setError("Something went wrong while fetching hotels.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const filteredAndSortedHotels = hotels
    .filter(hotel =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "rating":
          return b.average_rating - a.average_rating;
        case "price":
          const aPrice = a.rooms?.[0]?.price || 0;
          const bPrice = b.rooms?.[0]?.price || 0;
          return aPrice - bPrice;
        default:
          return 0;
      }
    });

  if (loading) return <div className="loading-spinner">Loading hotels...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="main-container">
      <header className="main-header">
        <div className="header-content">
          <div className="brand">
            <span className="brand-icon">🏨</span>
            <h1>LuxStay Hotels</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-outline">
            Logout
          </button>
        </div>
      </header>

      <div className="content-wrapper">
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search hotels or cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="sort-filter">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>

        {filteredAndSortedHotels.length === 0 ? (
          <div className="empty-state">
            <h3>No hotels found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="hotels-grid">
            {filteredAndSortedHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const HotelCard = ({ hotel }) => (
  <div className="hotel-card">
    <div className="hotel-image">
      {hotel.images && hotel.images.length > 0 ? (
        <img src={hotel.images[0].path} alt={hotel.name} />
      ) : (
        <div className="no-image">No Image</div>
      )}
      <div className="hotel-rating">
        ⭐ {hotel.average_rating || "N/A"}
      </div>
    </div>
    
    <div className="hotel-content">
      <h3 className="hotel-name">{hotel.name}</h3>
      <p className="hotel-location">
        📍 {hotel.city?.name || "Location not specified"}
      </p>
      
      {hotel.rooms && hotel.rooms.length > 0 && (
        <div className="room-info">
          <div className="price-section">
            <span className="price-from">From</span>
            <span className="price">${Math.min(...hotel.rooms.map(r => r.price))}</span>
            <span className="price-period">/night</span>
          </div>
          
          <div className="rooms-preview">
            {hotel.rooms.slice(0, 2).map((room) => (
              <div key={room.id} className="room-tag">
                {room.name}
              </div>
            ))}
            {hotel.rooms.length > 2 && (
              <div className="room-tag more">+{hotel.rooms.length - 2} more</div>
            )}
          </div>
        </div>
      )}
      
      <a href={`/hotel/${hotel.id}`} className="view-details">
        View Details & Book
      </a>
    </div>
  </div>
);

export default MainPage;
