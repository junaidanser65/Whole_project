import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);

  const addBooking = (booking) => {
    setBookings(prev => [...prev, booking]);
  };

  const updateBooking = (updatedBooking) => {
    setBookings(prev => prev.map(booking => 
      booking.id === updatedBooking.id ? updatedBooking : booking
    ));
  };

  const removeBooking = (bookingId) => {
    setBookings(prev => prev.filter(booking => booking.id !== bookingId));
  };

  const modifyBooking = (bookingId, updatedBooking) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, ...updatedBooking } : booking
    ));
  };

  const clearBookings = () => {
    setBookings([]);
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      addBooking,
      updateBooking,
      removeBooking,
      modifyBooking,
      clearBookings,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
} 