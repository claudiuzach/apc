// src/components/GoogleMapsLoader.tsx
"use client"; // Marking this component as a client component
import { useEffect, useState } from "react";

const GoogleMapsLoader = ({ onLoad }: { onLoad: () => void }) => {
  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => {
        console.log("Google Maps API loaded");
        onLoad(); // Call the onLoad function to notify when the API is ready
      };
      script.onerror = () => {
        console.error("Error loading Google Maps API");
      };
      document.body.appendChild(script);
    } else {
      onLoad(); // If already loaded, notify immediately
    }
  }, [onLoad]);

  return null; // No need to render anything from this component
};

export default GoogleMapsLoader;
