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
  <div className="destination-container">
    <header className="destination-header">
      <div className="header-title">
        <span className="back-arrow">←</span>
        <h2>All Destinations</h2>
      </div>
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search zones, food, stays, or attractions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filter-buttons">
        <button className="filter-btn active">All</button>
        <button className="filter-btn">Restaurants</button>
        <button className="filter-btn">Cabin</button>
        <button className="filter-btn">Lake</button>
      </div>

      <div className="filter-tags">
        <span className="tag">Availability ✕</span>
        <span className="tag">Nearby ✕</span>
        <button className="dropdown-btn">Filters ▼</button>
        <button className="dropdown-btn">Price ▼</button>
      </div>
    </header>

    <main className="cards-container">
      {filteredAndSortedHotels.length === 0 ? (
        <div className="empty-state">
          <h3>No hotels found</h3>
        </div>
      ) : (
        filteredAndSortedHotels.map((hotel) => (
          <div key={hotel.id} className="hotel-card">
            <div className="card-image">
              <img
                src={hotel.images?.[0]?.path || "https://via.placeholder.com/400x250"}
                alt={hotel.name}
              />
              <div className="favorite-icon">♡</div>
            </div>
            <div className="card-content">
              <h3 className="card-title">{hotel.name}</h3>
              <p className="card-location">📍 {hotel.city?.name}</p>
              <div className="card-rating">
                ⭐ {hotel.average_rating || 4.8}
              </div>
              <div className="card-price">
                <span className="old-price">$87</span>
                <span className="new-price">
                  ${Math.min(...hotel.rooms.map(r => r.price)) || 50}
                </span>
                <span className="per-night">/night</span>
              </div>
            </div>
             <a href={`/hotel/${hotel.id}`} className="view-details">
        View Details & Book
      </a>
          </div>
        ))
      )}
    </main>
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
      
     
    </div>
  </div>
);

export default MainPage;
