// src/components/NearbyUsers.tsx
'use client'; // Ensure this component is a client component

import { useEffect, useState } from 'react';
import NearbyUsersMap from '@/components/NearbyUsersMap'; // Adjust the path as necessary
import GoogleMapsLoader from '@/components/GoogleMapsLoader'; // Ensure this is imported
import { User } from '@/lib/types'; // Import the User type

export default function NearbyUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null); // Error handling state
  const [loading, setLoading] = useState<boolean>(true); // Loading state for fetching users
  const [isMapsLoaded, setIsMapsLoaded] = useState(false); // Track if Google Maps is loaded

  const fetchNearbyUsers = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `/api/nearbyusers?latitude=${latitude}&longitude=${longitude}&radius=10`
      );
      const data = await res.json();
      console.log("Nearby users data:", data); // Log the response data
      setUsers(data);
    } catch (fetchError) {
      console.error("Error fetching nearby users:", fetchError);
      setError("Failed to fetch nearby users.");
    } finally {
      setLoading(false); // Set loading to false after fetch attempt
    }
  };

  useEffect(() => {
    // Get current location using geolocation API
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          await fetchNearbyUsers(latitude, longitude); // Fetch nearby users after getting location
        },
        (error) => {
          console.error("Geolocation error:", error); // Log detailed error
          setError(`Error getting location: ${error.message}`); // Set error message
          setLoading(false); // Set loading to false in case of error
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.'); // Handle case where geolocation is not available
      setLoading(false); // Set loading to false if geolocation is not supported
    }
  }, []);

  if (loading) return <p>Loading location and nearby users...</p>; // Improved loading message
  if (error) return <p>{error}</p>; // Display error if present
  if (!location) return <p>Loading...</p>; // This case shouldn't generally occur due to loading state

  return (
    <>
      <GoogleMapsLoader onLoad={() => setIsMapsLoaded(true)} /> {/* Ensure the Google Maps API is loaded */}
      {isMapsLoaded && <NearbyUsersMap users={users} location={location} />} {/* Render map only if Google Maps is loaded */}
    </>
  );
}
