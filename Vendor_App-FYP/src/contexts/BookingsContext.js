import React, { createContext, useContext, useState } from 'react';

const BookingsContext = createContext();

export const BookingsProvider = ({ children }) => {
  const [bookings, setBookings] = useState([
    {
      id: '1',
      customerName: 'Sarah Johnson',
      eventType: 'Wedding Reception',
      date: '24 Feb 2024',
      time: '6:00 PM',
      guests: 150,
      status: 'pending',
      amount: '$2,500',
      venue: "123 Wedding Hall, New York",
      services: [
        { name: "Catering Service", price: 1500 },
        { name: "Decoration", price: 800 },
        { name: "Photography", price: 200 },
      ],
      notes: "Special dietary requirements: 5 vegetarian meals needed.",
      customer: {
        phone: "+1 234-567-8900",
        email: "sarah.j@email.com",
      },
      customerId: "sarah.j@email.com",
      customerAvatar: "https://via.placeholder.com/50",
    },
    {
      id: '2',
      customerName: 'Mike Anderson',
      eventType: 'Corporate Event',
      date: '25 Feb 2024',
      time: '2:00 PM',
      guests: 80,
      status: 'upcoming',
      amount: '$1,800',
      venue: "456 Conference Center, New York",
      services: [
        { name: "Full Catering", price: 1200 },
        { name: "AV Equipment", price: 600 },
      ],
      notes: "Requires projector setup and microphones",
      customer: {
        phone: "+1 234-567-8901",
        email: "mike.a@email.com",
      },
      customerId: "mike.a@email.com",
      customerAvatar: "https://via.placeholder.com/50",
    },
  ]);

  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: newStatus }
          : booking
      )
    );
  };

  return (
    <BookingsContext.Provider value={{ bookings, updateBookingStatus }}>
      {children}
    </BookingsContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
}; 