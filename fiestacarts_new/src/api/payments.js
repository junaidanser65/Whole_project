import { supabase } from '../lib/supabase';

export const PaymentService = {
  async processPayment(paymentDetails) {
    try {
      // Payment gateway integration
      const { data, error } = await supabase
        .from('payments')
        .insert({
          booking_id: paymentDetails.bookingId,
          amount: paymentDetails.amount,
          payment_method_id: paymentDetails.paymentMethodId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Payment processing failed: ' + error.message);
    }
  },

  async getPaymentMethods(userId) {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch payment methods: ' + error.message);
    }
  }
}; 