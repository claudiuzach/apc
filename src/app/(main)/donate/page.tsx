'use client';

import React, { useState } from 'react';

export default function DonatePage() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cardError, setCardError] = useState('');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ''); // remove non-digits
    if (input.length <= 16) {
      setCardNumber(input);
      if (input.length < 16) {
        setCardError('Card number must be 16 digits.');
      } else {
        setCardError('');
      }
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^\d]/g, '');
    if (input.length > 4) input = input.slice(0, 4);
    if (input.length >= 3) {
      input = input.slice(0, 2) + '/' + input.slice(2);
    }
    setExpiry(input);
  };

  return (
    <div className="flex flex-col items-center w-full px-4 pt-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg text-center border border-gray-300 dark:border-gray-700 relative">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Donate to APC
        </h2>

        <form className="space-y-5 text-left">
          {/* Card Number */}
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Card Number
            </label>
            <input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className={`mt-1 block w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border ${
                cardError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500`}
            />
            {cardError && <p className="text-sm text-red-500 mt-1">{cardError}</p>}
          </div>

          {/* CVV and Expiry */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                CVV
              </label>
              <input
                id="cvv"
                type="text"
                maxLength={4}
                placeholder="123"
                className="mt-1 block w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="w-1/2">
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Expiration Date
              </label>
              <input
                id="expiry"
                type="text"
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                className="mt-1 block w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount (₦)
            </label>
            <input
              id="amount"
              type="number"
              placeholder="5000"
              className="mt-1 block w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition"
          >
            Donate Now
          </button>
        </form>
      </div>
    </div>
  );
}
