import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "../booking.css";

const HotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [form, setForm] = useState({
    check_in: "",
    check_out: "",
    rooms: 1,
    guests_count: 1,
    guests: [], // image files
  });
  const [loading, setLoading] = useState(true);
  const [fetchingRooms, setFetchingRooms] = useState(false);
  const [error, setError] = useState("");
  const [roomError, setRoomError] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("King Bed");
  const [activeImage, setActiveImage] = useState(0);

  // Fetch hotel details
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

  // Fetch available rooms when check_in/out changes
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
  }, [form.check_in, form.check_out, form.rooms, form.guests_count]);

  const fetchAvailableRooms = async () => {
    setFetchingRooms(true);
    setRoomError("");
    try {
      const token = localStorage.getItem("access_token");
      const response = await axiosClient.post(`/book/hotel/${id}`, {
        check_in: form.check_in,
        check_out: form.check_out,
        rooms: form.rooms,
        guests: form.guests_count,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.result) {
        setAvailableRooms(response.data.data.rooms);
      } else {
        setAvailableRooms([]);
        setRoomError("No rooms available for selected dates.");
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setAvailableRooms([]);
      setRoomError("Error fetching room availability.");
    } finally {
      setFetchingRooms(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuestFiles = (e) => {
    const files = Array.from(e.target.files);
    setForm({ ...form, guests: files });
  };

  const handleRoomTypeSelect = (roomType) => {
    setSelectedRoomType(roomType);
  };

  const handlePayment = async (room) => {
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();

      formData.append("check_in", form.check_in);
      formData.append("check_out", form.check_out);
      formData.append("rooms", form.rooms);
      formData.append("guests_count", form.guests_count);

      form.guests.forEach((file, index) => {
        formData.append(`guests[${index}]`, file);
      });

      const response = await axiosClient.post(
        `/fib/hotel/${id}/${room.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.message?.paymentId) {
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
      console.error("Payment error:", err);
      alert("Payment error: " + (err.response?.data?.message || "Please try again."));
    }
  };

  if (loading) return <div className="loading-spinner">Loading hotel details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!hotel) return <div className="error-message">Hotel not found</div>;

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

        {/* Dates */}
        <h3 className="section-title">Select Dates</h3>
        <div className="date-box">
          <input type="date" name="check_in" value={form.check_in} onChange={handleChange} />
          <span> - </span>
          <input type="date" name="check_out" value={form.check_out} onChange={handleChange} />
        </div>

        {/* Guests */}
     {/* Guests Section */}
<h3 className="section-title">Guests</h3>
<div className="guest-table-container">
  <div className="guest-header">
    <label>Number of Guests</label>
    <input
      type="number"
      name="guests_count"
      value={form.guests_count}
      onChange={(e) => {
        const value = Math.max(1, parseInt(e.target.value || "1"));
        const newGuests = [...form.guests];
        // Resize guests array dynamically
        if (value > newGuests.length) {
          while (newGuests.length < value) newGuests.push(null);
        } else {
          newGuests.length = value;
        }
        setForm({ ...form, guests_count: value, guests: newGuests });
      }}
      min="1"
      className="guest-count-input"
    />
  </div>

  <div className="guest-upload-grid">
    {Array.from({ length: form.guests_count }).map((_, index) => (
      <div key={index} className="guest-upload-card">
        <p className="guest-label">Guest {index + 1}</p>
        <label htmlFor={`guest-${index}`} className="upload-box">
          {form.guests[index] ? (
            <img
              src={URL.createObjectURL(form.guests[index])}
              alt={`Guest ${index + 1}`}
              className="guest-preview-img"
            />
          ) : (
            <span className="upload-placeholder">Upload ID</span>
          )}
          <input
            type="file"
            id={`guest-${index}`}
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const newGuests = [...form.guests];
                newGuests[index] = file;
                setForm({ ...form, guests: newGuests });
              }
            }}
          />
        </label>
      </div>
    ))}
  </div>
</div>


        {/* Room List */}
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
                    <p className="room-sub">{room.name}</p>
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
            <div className="info-text">Please select dates to see available rooms</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;
