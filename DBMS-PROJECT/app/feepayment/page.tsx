'use client'
import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/providers/db';

// Wrapper component to handle the search params
function FeePaymentContent() {
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    amount: ''
  });
  const [paymentamount, setpaymentamount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<null | 'success' | 'error'>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const appointment_id = searchParams.get('appointment_id');
  const paymentType = searchParams.get('type');
  console.log(appointment_id, paymentType);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from('bill').select('*').eq('appointment_id', appointment_id).single();
        
        if (error) {
          console.error("Error fetching bill:", error);
          return;
        }
        
        if (data) {
          setPaymentInfo(prevState => ({
            ...prevState,
            cardNumber: '',
            cardholderName: '',
            expiryDate: '',
            cvv: '',
            amount: data.amount || ''
          }));
          
          if (paymentType === 'pharmacy') {
            setpaymentamount(data.pharmacy_bill?.amount || 0);
          } else {
            setpaymentamount(data.consult_fees?.amount || 0);
          }
        }
        
        console.log(data, "im here bill");
      } catch (err) {
        console.error("Error in fetchBill:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (appointment_id) {
      fetchBill();
    }
  }, [appointment_id, paymentType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // First get the existing bill
    const { data: existingBill, error: fetchError } = await supabase
      .from('bill')
      .select('*')
      .eq('appointment_id', appointment_id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching existing bill:", fetchError);
      return;
    }
    
    // Prepare the updated bill data
    let updatedBill = { ...existingBill };
    
    if (paymentType === 'pharmacy') {
      updatedBill.pharmacy_bill = {
        ...existingBill.pharmacy_bill,
        status: 'paid'
      };
    } else {
      updatedBill.consult_fees = {
        ...existingBill.consult_fees,
        status: 'paid'
      };
    }

    // Update the bill
    const { error: updateError } = await supabase
      .from('bill')
      .update(updatedBill)
      .eq('appointment_id', appointment_id);
    
    if (updateError) {
      console.error("Error updating bill:", updateError);
      return;
    }

    console.log("Payment successful");

    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus('success');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-2">💳 Fee Payment</h1>
        <p className="text-center text-gray-600">Complete your payment securely</p>
      </div>

      {paymentStatus === 'success' ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
          <p className="text-gray-500">A receipt has been sent to your email.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  {paymentType === 'pharmacy' ? 'Pharmacy Bill:' : 'Consultation Fee:'}
                </span>
                <span className="font-bold text-blue-700">₹{paymentamount}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  name="cardholderName"
                  value={paymentInfo.cardholderName || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentInfo.cardNumber || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={paymentInfo.expiryDate || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={paymentInfo.cvv || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6"
              >
                    Pay Now ₹{paymentamount}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🔒 Your payment information is secure and encrypted</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Main component with Suspense boundary
const FeePayment = () => {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading payment details...</div>}>
      <FeePaymentContent />
    </Suspense>
  )
}

export default FeePayment