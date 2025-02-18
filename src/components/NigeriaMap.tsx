"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Dynamic Import to Fix "window is not defined" Error
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });

// ✅ Fix Default Marker Icon
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// ✅ Nigeria GeoJSON Data
const NIGERIA_GEOJSON =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/nigeria/nigeria-states.json";

// ✅ Nigeria State Abbreviations
const STATE_ABBREVIATIONS: { [key: string]: string } = {
  "Abia": "AB", "Adamawa": "AD", "Akwa Ibom": "AK", "Anambra": "AN",
  "Bauchi": "BA", "Bayelsa": "BY", "Benue": "BE", "Borno": "BO",
  "Cross River": "CR", "Delta": "DE", "Ebonyi": "EB", "Edo": "ED",
  "Ekiti": "EK", "Enugu": "EN", "Gombe": "GO", "Imo": "IM",
  "Jigawa": "JI", "Kaduna": "KD", "Kano": "KN", "Katsina": "KT",
  "Kebbi": "KE", "Kogi": "KO", "Kwara": "KW", "Lagos": "LA",
  "Nasarawa": "NA", "Niger": "NI", "Ogun": "OG", "Ondo": "ON",
  "Osun": "OS", "Oyo": "OY", "Plateau": "PL", "Rivers": "RI",
  "Sokoto": "SO", "Taraba": "TA", "Yobe": "YO", "Zamfara": "ZA",
  "Federal Capital Territory": "FC"
};

// ✅ Nigeria State Coordinates
const STATE_COORDINATES: { [key: string]: [number, number] } = {
  "Abia": [5.4527, 7.5248], "Adamawa": [9.3265, 12.3984], "Akwa Ibom": [4.9057, 7.8537],
  "Anambra": [6.2209, 6.9366], "Bauchi": [10.3142, 9.8462], "Bayelsa": [4.7719, 6.0699],
  "Benue": [7.1904, 8.1340], "Borno": [11.8333, 13.1510], "Cross River": [5.8880, 8.5469],
  "Delta": [5.7047, 5.9330], "Ebonyi": [6.2518, 8.0820], "Edo": [6.5244, 5.8000],
  "Ekiti": [7.6238, 5.2199], "Enugu": [6.5244, 7.3223], "Gombe": [10.2897, 11.1716],
  "Imo": [5.4763, 7.0259], "Jigawa": [12.0840, 9.5098], "Kaduna": [10.6093, 7.4295],
  "Kano": [11.9964, 8.5167], "Katsina": [12.9881, 7.6170], "Kebbi": [11.3628, 4.2108],
  "Kogi": [7.8023, 6.7333], "Kwara": [8.4790, 4.5418], "Lagos": [6.5244, 3.3792],
  "Nasarawa": [8.4904, 7.2886], "Niger": [9.0813, 5.6118], "Ogun": [6.9070, 3.5814],
  "Ondo": [7.2508, 5.2103], "Osun": [7.5629, 4.5624], "Oyo": [7.9519, 3.9323],
  "Plateau": [9.2182, 9.5176], "Rivers": [4.8671, 6.9935], "Sokoto": [13.0544, 5.3224],
  "Taraba": [7.9233, 10.8325], "Yobe": [12.1820, 11.7066], "Zamfara": [12.1702, 6.6646],
  "Federal Capital Territory": [9.0578, 7.4951]
};

interface StateData {
  state: string;
  count: number;
}

interface NigeriaMapProps {
  stateCounts: StateData[];
}

export default function NigeriaMap({ stateCounts }: NigeriaMapProps) {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    async function fetchGeoJSON() {
      try {
        const response = await fetch(NIGERIA_GEOJSON);
        if (!response.ok) throw new Error("Failed to fetch geojson");
        const data = await response.json();
        setGeoData(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchGeoJSON();
  }, []);

  const stateCountsMap = Object.fromEntries(
    stateCounts.map((s) => [STATE_ABBREVIATIONS[s.state] || s.state, s.count])
  );

  return (
    <div className="mt-6 relative z-0">
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white text-center">
        User Distribution Map
      </h2>
      <div className="w-full flex justify-center relative">
        <MapContainer 
          center={[9.082, 8.6753]} 
          zoom={6} 
          className="w-full max-w-[1200px] h-[70vh] md:h-[500px] rounded-xl shadow-lg border relative z-0"
          style={{ maxWidth: "100%", zIndex: 0 }}
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {geoData && <GeoJSON data={geoData} style={{ color: "#007bff", weight: 1.5 }} />}

          {Object.entries(STATE_COORDINATES).map(([state, coordinates]) => {
            const abbreviation = STATE_ABBREVIATIONS[state] || "N/A";
            const count = stateCountsMap[abbreviation] || 0;

            return (
              <Marker 
                key={state} 
                position={coordinates}
                icon={L.divIcon({
                  className: "custom-marker",
                  html: `<div style="background: #4CAF50; color: white; padding: 6px; border-radius: 50%; font-weight: bold; text-align: center; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;">
                          ${count}
                         </div>`,
                })}
              >
                <Popup>
                  <strong>{state} ({abbreviation})</strong> <br />
                  Members: <strong>{count}</strong>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
