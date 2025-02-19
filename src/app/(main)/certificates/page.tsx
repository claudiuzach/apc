'use client';

import { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import Image from "next/image";
import logoImage from "@/assets/logo.png";
import watermark from "@/assets/apc-watermark.png";
// @ts-ignore
import domtoimage from "dom-to-image-more";
import { Download } from "lucide-react";

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
  
    if (typeof window === "undefined") {
      console.error("Window is not available. This function should only run on the client.");
      setPdfGenerating(false);
      return;
    }
  
    const badgeElement = badgeRef.current;
    if (!badgeElement) {
      console.error("Badge ref is null, cannot generate PDF.");
      setPdfGenerating(false);
      return;
    }
  
    try {
      const scale = 3;
      const options = {
        quality: 1,
        width: badgeElement.clientWidth * scale,
        height: badgeElement.clientHeight * scale,
        style: {
          transform: "scale(3)",
          transformOrigin: "top left",
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
          boxShadow: "none",
          clipPath: "inset(0 round 16px)",
        },
      };
  
      const blob = await domtoimage.toBlob(badgeElement, options);
      const reader = new FileReader();
  
      reader.onloadend = () => {
        if (!reader.result) return;
  
        const width = badgeElement.clientWidth * 0.9;
        const height = badgeElement.clientHeight * 0.9;
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [width, height],
        });
  
        pdf.addImage(reader.result as string, "PNG", 0, 0, width, height);
  
        // ✅ Convert PDF to Blob
        const pdfBlob = pdf.output("blob");
        const pdfURL = URL.createObjectURL(pdfBlob);
  
        // ✅ Instead of using <a> tag, directly open the file
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          setTimeout(() => {
            window.open(pdfURL, "_blank"); // Opens in a new tab
          }, 500);
        } else {
          const link = document.createElement("a");
          link.href = pdfURL;
          link.download = `Membership_Badge_${user.fullName}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
  
        // ✅ Cleanup the blob URL
        setTimeout(() => {
          URL.revokeObjectURL(pdfURL);
        }, 1000);
      };
  
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  
    setPdfGenerating(false);
  };
  

  

  return (
    
    <div className="flex flex-col items-center w-full ">
      {/* Badge Container */}
      <div
        ref={badgeRef}
        className="w-full md:w-full max-w-sm bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg text-center border-2 border-gray-300 dark:border-gray-700 relative overflow-hidden"
      >
        {/* Watermark */}
        <img
          src={watermark.src}
          alt="Watermark"
          className="absolute inset-0 w-full h-full opacity-10"
          style={{ objectFit: "contain", borderRadius: "16px" }}
        />

        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-500 p-5 rounded-t-2xl flex items-center gap-1 border-none">
          <img className="border-none" src={logoImage.src} alt="APC Logo" width={50} height={50} crossOrigin="anonymous" />
          <h2 className="text-base sm:text-lg font-bold text-white whitespace-nowrap border-none">
            Member Registration Badge
          </h2>
        </div>

        <h3 className="mt-2 text-gray-700 dark:text-white font-semibold text-sm border-none">All Progressives Congress</h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs border-none">Justice, Peace & Unity</p>

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
            <p className="italic text-gray-500 border-none">No profile picture</p>
          )}
        </div>

        {/* User Details */}
        <div className="mt-4 border-none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white border-none">{user.fullName}</h2>
          <p className="text-gray-600 dark:text-gray-400 border-none">{user.phoneNumber}</p>
        </div>

        <div className="mt-4 text-left text-gray-700 dark:text-gray-300 px-6 border-none">
          <p className="border-none"><strong className="border-none">Member No:</strong> {user.memberNumber}</p>
          <p className="border-none"><strong className="border-none">Date Registered:</strong> {new Date(user.dateRegistered).toLocaleDateString()}</p>
        </div>

        {/* Signature */}
        <div className="mt-4 border-none">
          <p className="font-bold text-gray-900 dark:text-white border-none">Signature:</p>
          {user.signature ? (
            <img src={user.signature} alt="Signature" width={140} height={50} className="mx-auto border-none" crossOrigin="anonymous" />
          ) : (
            <p className="italic text-gray-500 border-none">No signature uploaded</p>
          )}
        </div>

        {/* QR Code */}
        {/* QR Code Container */}
<div className="mt-6 flex justify-center">
  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
    <QRCodeCanvas
      value={`${user.memberNumber} - ${user.fullName}`}
      size={80} // Increased size for better scanning
      bgColor="transparent"
      fgColor="#0f172a" // Dark blue-gray for professional contrast
      className="rounded-md"
    />
  </div>
</div>
{/* Disclaimer Text */}
<div className="mt-4 px-4 text-center text-xs text-gray-500 dark:text-gray-400 italic">
  This badge is non-transferable. It is only valid for the individual whose name and photo appear on it.
</div>

      </div>

      {/* Download Button */}
    {/* Download Button */}
<button
  onClick={generatePDF}
  className="mt-6 flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
  disabled={pdfGenerating}
>
  {pdfGenerating ? (
    "Generating..."
  ) : (
    <>
      <Download size={18} /> {/* Download Icon */}
      Download Badge
    </>
  )}
</button>
    </div>
  );
}
