import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "../Booking.css";

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
  const [selectedRoom, setSelectedRoom] = useState(null);
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

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const calculateNights = () => {
    if (!form.check_in || !form.check_out) return 0;
    const checkIn = new Date(form.check_in);
    const checkOut = new Date(form.check_out);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const handlePayment = async () => {
    if (!selectedRoom) {
      alert("Please select a room first!");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await axiosClient.post(
        `/fib/hotel/${id}/${selectedRoom.id}`,
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

  const nights = calculateNights();
  const totalPrice = selectedRoom ? selectedRoom.price * nights * form.rooms : 0;

  return (
    <div className="hotel-detail-container">
      <div className="hotel-header">
        <h1>{hotel.name}</h1>
        <p className="hotel-location">📍 {hotel.city?.name}</p>
        <div className="hotel-rating">
          ⭐ {hotel.average_rating || "No ratings yet"}
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
        <div className="hotel-info">
          <div className="description-section">
            <h3>Description</h3>
            <p>{hotel.description || "No description available."}</p>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="booking-sidebar">
            <div className="booking-card">
              <h4>Book Your Stay</h4>
              
              <div className="booking-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Check-in</label>
                    <input
                      type="date"
                      name="check_in"
                      value={form.check_in}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
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
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Guests</label>
                    <select name="guests" value={form.guests} onChange={handleChange}>
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Rooms</label>
                    <select name="rooms" value={form.rooms} onChange={handleChange}>
                      {[1,2,3,4].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Available Rooms */}
              <div className="rooms-section">
                <h5>Available Rooms</h5>
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
                        isSelected={selectedRoom?.id === room.id}
                        onSelect={handleRoomSelect}
                        nights={nights}
                        roomCount={form.rooms}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="info-text">
                    Please select dates to see available rooms
                  </div>
                )}
              </div>

              {/* Booking Summary */}
              {selectedRoom && (
                <div className="booking-summary">
                  <h5>Booking Summary</h5>
                  <div className="summary-line">
                    <span>${selectedRoom.price} × {nights} nights × {form.rooms} rooms</span>
                    <span>${totalPrice}</span>
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                  <button onClick={handlePayment} className="btn btn-primary book-now-btn">
                    Book Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoomCard = ({ room, isSelected, onSelect, nights, roomCount }) => (
  <div
    className={`room-card ${isSelected ? 'selected' : ''}`}
    onClick={() => onSelect(room)}
  >
    <div className="room-header">
      <h6>{room.name}</h6>
      <div className="room-price">
        ${room.price} <span>/night</span>
      </div>
    </div>
    
    <div className="room-features">
      <span>🛏️ {room.beds} Beds</span>
      <span>🛁 {room.bath} Bath</span>
      <span>👥 Up to {room.guest} Guests</span>
    </div>
    
    <div className="room-availability">
      <span className="available-badge">
        {room.available_units_count} Units Available
      </span>
    </div>

    {isSelected && nights > 0 && (
      <div className="room-total">
        Total: ${room.price * nights * roomCount} for {nights} nights
      </div>
    )}
  </div>
);

export default HotelDetailPage;