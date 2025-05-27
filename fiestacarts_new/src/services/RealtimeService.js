import { supabase } from '../lib/supabase';

export const RealtimeService = {
  subscribeToBookingUpdates(bookingId, callback) {
    const subscription = supabase
      .channel(`booking:${bookingId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`
      }, payload => {
        callback(payload.new);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  subscribeToVendorAvailability(vendorId, callback) {
    const subscription = supabase
      .channel(`vendor:${vendorId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'vendor_availability',
        filter: `vendor_id=eq.${vendorId}`
      }, payload => {
        callback(payload.new);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}; 