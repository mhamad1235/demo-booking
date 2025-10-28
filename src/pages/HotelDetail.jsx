import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "../booking.css";

const HotelDetailPage = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [form, setForm] = useState({
    check_in: "",
    check_out: "",
    guests: 1,
    rooms: 1,
  });
  const [loading, setLoading] = useState(true);
  const [fetchingRooms, setFetchingRooms] = useState(false);
  const [error, setError] = useState("");
  const [roomError, setRoomError] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("King Bed");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await axiosClient.get(`/guest/hotel/${id}`);
        if (response.data.result) setHotel(response.data.data);
        else setError("Failed to load hotel details.");
      } catch (err) {
        setError("Error loading hotel details.");
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  useEffect(() => {
    if (!form.check_in || !form.check_out) {
      setAvailableRooms([]);
      setRoomError("");
      return;
    }
    
    const timer = setTimeout(() => {
      fetchAvailableRooms();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [form.check_in, form.check_out, form.guests, form.rooms]);

  const fetchAvailableRooms = async () => {
    setFetchingRooms(true);
    setRoomError("");
    try {
      const token = localStorage.getItem("access_token");
      const response = await axiosClient.post(`/book/hotel/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.result) {
        setAvailableRooms(response.data.data.rooms);
      } else {
        setAvailableRooms([]);
        setRoomError("No rooms available for selected dates.");
      }
    } catch (err) {
      setAvailableRooms([]);
      setRoomError("Error fetching room availability.");
    } finally {
      setFetchingRooms(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoomTypeSelect = (roomType) => {
    setSelectedRoomType(roomType);
  };

  const handlePayment = async (room) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axiosClient.post(
        `/fib/hotel/${id}/${room.id}`,
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message && response.data.message.paymentId) {
        const personalAppLink = response.data.message.personalAppLink;
        if (personalAppLink) {
          window.open(personalAppLink, "_blank");
          alert("Payment initiated. Please complete the transaction in the new window.");
        } else {
          alert("Payment process initiated, but no link was returned.");
        }
      } else {
        alert("Payment failed: " + (response.data.message || "No details provided"));
      }
    } catch (err) {
      alert("Payment error: " + (err.response?.data?.message || "Please try again."));
    }
  };

  if (loading) return <div className="loading-spinner">Loading hotel details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!hotel) return <div className="error-message">Hotel not found</div>;

  // Mock amenities data - you can replace with actual data from your API
  const amenities = ["Free Wi-Fi", "Parking", "Pool", "Fitness Center"];
  const roomTypes = ["King Bed", "Queen Bed", "Sofa Bed", "Double"];

  return (
    <div className="hotel-detail-container">
      {/* Hotel Header */}
      <div className="hotel-header">
        <h1 className="hotel-title">{hotel.name}</h1>
        <div className="hotel-meta">
          <div className="rating">
            <span className="stars">⭐</span>
            <span className="rating-value">4.5</span>
            <span className="rating-count">(127)</span>
          </div>
          <div className="location">
            <span className="location-icon">📍</span>
            {hotel.city?.name || "Sulaymaniyah"}
          </div>
          <div className="open-hours">Open 24/7</div>
        </div>
      </div>

      {/* Image Gallery */}
      {hotel.images?.length > 0 && (
        <div className="image-gallery">
          <div className="main-image">
            <img src={hotel.images[activeImage].path} alt={`${hotel.name} ${activeImage + 1}`} />
          </div>
          {hotel.images.length > 1 && (
            <div className="image-thumbnails">
              {hotel.images.map((img, index) => (
                <img
                  key={index}
                  src={img.path}
                  alt={`Thumbnail ${index + 1}`}
                  className={activeImage === index ? "active" : ""}
                  onClick={() => setActiveImage(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="hotel-content">
        <div className="main-content">
          {/* Amenities Section */}
          <div className="section">
            <h3 className="section-title">Amenities</h3>
            <div className="amenities-grid">
              {amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div className="section">
            <h3 className="section-title">About</h3>
            <p className="about-text">
              {hotel.description || "Nestled in the serene hills, this hotel offers a tranquil experience, perfect for family vacations or romantic getaways."}
            </p>
          </div>

          {/* Booking Section */}
          <div className="section">
            <h3 className="section-title">How long do you want to stay?</h3>
            
            {/* Date Selection */}
            <div className="date-selection">
              <div className="date-input-group">
                <div className="date-input">
                  <label>Check-in</label>
                  <input
                    type="date"
                    name="check_in"
                    value={form.check_in}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="date-input">
                  <label>Check-out</label>
                  <input
                    type="date"
                    name="check_out"
                    value={form.check_out}
                    onChange={handleChange}
                    min={form.check_in || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Room Type Selection */}
            <div className="room-type-selection">
              <h4 className="room-type-title">Room Type</h4>
              <div className="room-type-buttons">
                {roomTypes.map((type) => (
                  <button
                    key={type}
                    className={`room-type-btn ${selectedRoomType === type ? 'active' : ''}`}
                    onClick={() => handleRoomTypeSelect(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Rooms */}
            <div className="available-rooms-section">
              <h4 className="rooms-title">Available Rooms</h4>
              
              {fetchingRooms ? (
                <div className="loading-text">Checking availability...</div>
              ) : roomError ? (
                <div className="error-text">{roomError}</div>
              ) : availableRooms.length > 0 ? (
                <div className="rooms-list">
                  {availableRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onBook={handlePayment}
                    />
                  ))}
                </div>
              ) : (
                <div className="info-text">
                  Please select dates to see available rooms
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoomCard = ({ room, onBook }) => {
  // Mock features - you can replace with actual room data
  const roomFeatures = [
    `${room.guest || 2} Guests`,
    '1 Bedroom',
    `${room.beds || 2} Beds`,
    `${room.bath || 1} Bath`
  ];

  const specialFeatures = room.name.includes('Breakfast') 
    ? ['2 King Beds, Breakfast', 'Free cancellation 48 hours before check-in date']
    : ['2 King Beds'];

  return (
    <div className="room-card">
      <div className="room-info">
        <div className="room-features">
          {roomFeatures.map((feature, index) => (
            <span key={index} className="feature">
              {feature}
            </span>
          ))}
        </div>
        
        <div className="room-details">
          {specialFeatures.map((detail, index) => (
            <div key={index} className="room-detail">
              {detail}
            </div>
          ))}
        </div>
      </div>
      
      <div className="room-action">
        <div className="room-price">
          ${room.price || 99} <span>/night</span>
        </div>
        <button 
          className="book-btn"
          onClick={() => onBook(room)}
        >
          Book
        </button>
      </div>
    </div>
  );
};

export default HotelDetailPage;