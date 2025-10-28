import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
    const refresh_token = localStorage.getItem("refresh_token");

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
    if (err.response && err.response.status === 401) {
      try {
        // 👇 Proper refresh call
        const refreshResponse = await axiosClient.post(
          "/refresh-token",
          {}, // empty body
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("refresh_token")}` },
          }
        );

        if (refreshResponse.data.result && refreshResponse.data.data?.access_token) {
          // save new tokens
          localStorage.setItem("access_token", refreshResponse.data.data.access_token);
          localStorage.setItem("refresh_token", refreshResponse.data.data.refresh_token);

          // retry the original request
          const retryResponse = await axiosClient.post(`/book/hotel/${id}`, form, {
            headers: { Authorization: `Bearer ${refreshResponse.data.data.access_token}` },
          });

          if (retryResponse.data.result) {
            setAvailableRooms(retryResponse.data.data.rooms);
          } else {
            setAvailableRooms([]);
            setRoomError("No rooms available for selected dates.");
          }
          return;
        } else {
          navigate("/");
        }
      } catch (refreshErr) {
        console.error("Refresh token failed:", refreshErr);
        navigate("/");
      }
    }

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
            navigate("/booking");

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
  <div className="hotel-detail-page">
    {/* Hero Image */}
    <div className="hero-image">
      <img
        src={hotel.images?.[activeImage]?.path || "/placeholder.jpg"}
        alt={hotel.name}
      />
      
      <div className="image-counter">
        {activeImage + 1} / {hotel.images?.length || 1}
      </div>
    </div>

    {/* Hotel Info */}
    <div className="hotel-info">
      <h2 className="hotel-name">{hotel.name}</h2>
      <div className="hotel-meta">
        <span className="rating">⭐ 4.5 <small>(127)</small></span>
        <span className="dot">•</span>
        <span className="location">📍 {hotel.city?.name || "Sulaymaniyah"}</span>
        <span className="dot">•</span>
        <span className="open">Open 24/7</span>
      </div>

      {/* Amenities */}
      <h3 className="section-title">Amenities</h3>
      <div className="amenities">
        {["Free Wi-Fi", "Parking", "Pool", "Fitness Center"].map((a, i) => (
          <div key={i} className="amenity">{a}</div>
        ))}
      </div>

      {/* About */}
      <h3 className="section-title">About</h3>
      <p className="about-text">
        {hotel.description ||
          "Nestled in the serene hills, Serene Valley Villa offers a tranquil mountain view experience, perfect for family vacations or romantic getaways."}
      </p>

      {/* Date Selection */}
      <h3 className="section-title">How long do you want to stay?</h3>
      <div className="date-box">
        <span className="calendar-icon"></span>
        <input
          type="date"
          name="check_in"
          value={form.check_in}
          onChange={handleChange}
        />
        <span> - </span>
        <input
          type="date"
          name="check_out"
          value={form.check_out}
          onChange={handleChange}
        />
      </div>

      {/* Room Types */}
      <div className="room-types">
        {["King Bed", "Queen Bed", "Sofa Bed", "Double"].map((type) => (
          <button
            key={type}
            className={`room-type ${selectedRoomType === type ? "active" : ""}`}
            onClick={() => handleRoomTypeSelect(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Available Rooms */}
      <div className="room-list">
        {fetchingRooms ? (
          <div className="loading-text">Checking availability...</div>
        ) : roomError ? (
          <div className="error-text">{roomError}</div>
        ) : availableRooms.length > 0 ? (
          availableRooms.map((room) => (
            <div key={room.id} className="room-card">
          
              <div className="room-content">
                <div className="room-desc">
                  <p className="room-title">
                    {room.guest || 2} Guests • 1 Bedroom • {room.beds || 2} Beds • {room.bath || 1} Bath
                  </p>
                  <p className="room-sub">
                    {room.name.includes("Breakfast")
                      ? "2 King Beds, Breakfast"
                      : "2 King Beds"}
                  </p>
                  {room.name.includes("Breakfast") && (
                    <p className="room-note">
                      Free cancellation 48 hours before check-in date
                    </p>
                  )}
                </div>
                <div className="room-action">
                  <div className="room-price">
                    ${room.price || 99}
                    <span>/night</span>
                  </div>
                  <button className="book-btn" onClick={() => handlePayment(room)}>
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="info-text">
            Please select dates to see available rooms
          </div>
        )}
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