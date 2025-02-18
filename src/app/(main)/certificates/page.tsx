'use client';

import { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import domtoimage from "dom-to-image";
import { QRCodeCanvas } from "qrcode.react";
import Image from "next/image";
import logoImage from "@/assets/logo.png";
import watermark from "@/assets/apc-watermark.png";

export default function MembershipCertificate() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/get-current-user");
        if (!response.ok) throw new Error("Failed to fetch user data.");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading user data...</p>;
  if (!user) return <p className="text-center text-red-500">User not found.</p>;

  const generatePDF = async () => {
    setPdfGenerating(true);
  
    if (!badgeRef.current) {
      console.error("Badge ref is null, cannot generate PDF.");
      setPdfGenerating(false);
      return;
    }
  
    try {
      const scale = 3;
      const options = {
        quality: 1,
        width: badgeRef.current.clientWidth * scale,
        height: badgeRef.current.clientHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          backgroundColor: "transparent", // Fix for rounded edges
          borderRadius: "16px", // Ensures corners remain rounded
          clipPath: "inset(0 round 16px)", // Prevents white background cutoff
        },
      };

      const blob = await domtoimage.toBlob(badgeRef.current, options);
      const reader = new FileReader();
      
      reader.onloadend = () => {
        if (!badgeRef.current) return;
  
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [badgeRef.current.clientWidth * 0.9, badgeRef.current.clientHeight * 0.9], // Keep scale consistent
        });

        pdf.addImage(reader.result as string, "PNG", 0, 0, badgeRef.current.clientWidth * 0.9, badgeRef.current.clientHeight * 0.9);
        pdf.save(`Membership_Badge_${user.fullName}.pdf`);
      };
  
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  
    setPdfGenerating(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Badge Container */}
      <div
        ref={badgeRef}
        className="w-full max-w-sm bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg text-center border-2 border-gray-300 dark:border-gray-700 relative overflow-hidden"
      >
        {/* Watermark */}
        <img
          src={watermark.src}
          alt="Watermark"
          className="absolute inset-0 w-full h-full opacity-10"
          style={{ objectFit: "contain", borderRadius: "16px" }}
        />

        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-500 p-5 rounded-t-2xl flex items-center gap-2">
          <img src={logoImage.src} alt="APC Logo" width={50} height={50} crossOrigin="anonymous" />
          <h2 className="text-base sm:text-lg font-bold text-white whitespace-nowrap">
            Member Registration Badge
          </h2>
        </div>

        <h3 className="mt-2 text-gray-700 dark:text-white font-semibold text-sm">All Progressives Congress</h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs">Justice, Peace & Unity</p>

        {/* Profile Picture */}
        <div className="relative flex justify-center mt-6">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Profile Picture"
              width={120}
              height={120}
              className="rounded-full border-4 border-white dark:border-gray-800"
              crossOrigin="anonymous"
            />
          ) : (
            <p className="italic text-gray-500">No profile picture</p>
          )}
        </div>

        {/* User Details */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.fullName}</h2>
          <p className="text-gray-600 dark:text-gray-400">{user.phoneNumber}</p>
        </div>

        <div className="mt-4 text-left text-gray-700 dark:text-gray-300 px-6">
          <p><strong>Member No:</strong> {user.memberNumber}</p>
          <p><strong>Date Registered:</strong> {new Date(user.dateRegistered).toLocaleDateString()}</p>
        </div>

        {/* Signature */}
        <div className="mt-4">
          <p className="font-bold text-gray-900 dark:text-white">Signature:</p>
          {user.signature ? (
            <img src={user.signature} alt="Signature" width={140} height={50} className="mx-auto" crossOrigin="anonymous" />
          ) : (
            <p className="italic text-gray-500">No signature uploaded</p>
          )}
        </div>

        {/* QR Code */}
        <div className="mt-6 flex justify-center bg-white p-3 rounded-md shadow-md dark:bg-gray-800">
          <QRCodeCanvas value={`${user.memberNumber} - ${user.fullName}`} size={100} />
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={generatePDF}
        className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-900"
        disabled={pdfGenerating}
      >
        {pdfGenerating ? "Generating..." : "Download Badge"}
      </button>
    </div>
  );
}
