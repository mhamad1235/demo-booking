import React, { useEffect, useState } from "react";
import "../booking.css";
import axiosClient from "../api/axiosClient";
function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
useEffect(() => {
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await axiosClient.get("/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Bookings API:", response.data); // 👈 Check in console

      // ✅ Fix: remove `response.data.result` condition
      if (response.data.bookings?.data) {
        setBookings(response.data.bookings.data);
      } else {
        setError("Failed to load bookings.");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Error loading bookings.");
    }
  };

  fetchBookings();
}, []);



  return (
    <div className="bookings-container">
      {bookings.map((booking) => (
        <div key={booking.id} className="booking-card">
          <div className="booking-header">
            <div className="hotel-image">
              <img
                src={
                  booking.hotel.images[0]?.url ||
                  "https://mpjourney.s3.amazonaws.com/uploads/UBhHLBQIyb7VM7w9KCAgxgavuEpu09SfObZozGtw.png"
                }
                alt={booking.hotel.name}
              />
              <span
                className={`status-tag ${
                  booking.payment_status === "paid"
                    ? "completed"
                    : "pending"
                }`}
              >
                {booking.payment_status}
              </span>
            </div>
            <div className="hotel-info">
              <h3>{booking.hotel.name}</h3>
              <p className="hotel-location">
                <i className="fa fa-map-marker"></i> {booking.hotel.city.name}
              </p>
              <p className="price">
                ${booking.room.price}
                <span>/night</span>
              </p>
            </div>
          </div>

          <div className="booking-details">
            <div className="check-info">
              <i className="fa fa-calendar"></i>
              <div>
                <p>Check in</p>
                <span>
                  {new Date(booking.start_time).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  - 8 AM
                </span>
              </div>
            </div>
            <div className="check-info">
              <i className="fa fa-calendar"></i>
              <div>
                <p>Check out</p>
                <span>
                  {new Date(booking.end_time).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  - 11 AM
                </span>
              </div>
            </div>
          </div>

          <div className="booking-footer">
            <button className="see-detail">See detail</button>
            <button
              className={`status-btn ${
                booking.payment_status === "paid"
                  ? "completed"
                  : "upcoming"
              }`}
            >
              {booking.payment_status === "paid" ? "Completed" : "Upcoming"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
export default BookingsList;
