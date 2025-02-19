'use client'
import { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas"; // ✅ Replace domtoimage
import { Download } from "lucide-react";
import Image from "next/image";
import logoImage from "@/assets/logo.png";
import watermark from "@/assets/apc-watermark.png";
import { QRCodeCanvas } from "qrcode.react";

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

    const badgeElement = badgeRef.current;
    if (!badgeElement) {
      console.error("Badge ref is null, cannot generate PDF.");
      setPdfGenerating(false);
      return;
    }

    try {
      // ✅ Use html2canvas for cross-browser support
      const canvas = await html2canvas(badgeElement, { scale: 3 });
      const imageData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width * 0.5, canvas.height * 0.5], // Scale PDF properly
      });

      pdf.addImage(imageData, "PNG", 0, 0, canvas.width * 0.5, canvas.height * 0.5);

      // ✅ Convert PDF to Blob
      const pdfBlob = pdf.output("blob");
      const pdfURL = URL.createObjectURL(pdfBlob);

      // ✅ iOS Safari Fix
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        setTimeout(() => {
          window.open(pdfURL, "_blank"); // ✅ Opens in a new tab instead of download
        }, 500);
      } else {
        const link = document.createElement("a");
        link.href = pdfURL;
        link.download = `Membership_Badge_${user.fullName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // ✅ Cleanup after download
      setTimeout(() => {
        URL.revokeObjectURL(pdfURL);
      }, 1000);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }

    setPdfGenerating(false);
};


  return (
    <div className="flex flex-col items-center w-full">
      {/* Badge Container */}
      <div
        ref={badgeRef}
        className="w-full md:w-full max-w-sm bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg text-center border-2 border-gray-300 dark:border-gray-700 relative overflow-hidden"
      >
        {/* Watermark */}
        <img src={watermark.src} alt="Watermark" className="absolute inset-0 w-full h-full opacity-10" style={{ objectFit: "contain", borderRadius: "16px" }} />

        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-500 p-5 rounded-t-2xl flex items-center gap-1">
          <img src={logoImage.src} alt="APC Logo" width={50} height={50} />
          <h2 className="text-base sm:text-lg font-bold text-white whitespace-nowrap">Member Registration Badge</h2>
        </div>

        <h3 className="mt-2 text-gray-700 dark:text-white font-semibold text-sm">All Progressives Congress</h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs">Justice, Peace & Unity</p>

        {/* Profile Picture */}
        <div className="relative flex justify-center mt-6">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile Picture" width={120} height={120} className="rounded-full border-4 border-white dark:border-gray-800" />
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
          <p>
            <strong>Member No:</strong> {user.memberNumber}
          </p>
          <p>
            <strong>Date Registered:</strong> {new Date(user.dateRegistered).toLocaleDateString()}
          </p>
        </div>

        {/* Signature */}
        <div className="mt-4">
          <p className="font-bold text-gray-900 dark:text-white">Signature:</p>
          {user.signature ? <img src={user.signature} alt="Signature" width={140} height={50} className="mx-auto" /> : <p className="italic text-gray-500">No signature uploaded</p>}
        </div>

        {/* QR Code */}
        <div className="mt-6 flex justify-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
            <QRCodeCanvas value={`${user.memberNumber} - ${user.fullName}`} size={80} bgColor="transparent" fgColor="#0f172a" className="rounded-md" />
          </div>
        </div>

        {/* Disclaimer Text */}
        <div className="mt-4 px-4 text-center text-xs text-gray-500 dark:text-gray-400 italic">This badge is non-transferable. It is only valid for the individual whose name and photo appear on it.</div>
      </div>

      {/* Download Button */}
      <button
        onClick={generatePDF}
        className="mt-6 flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={pdfGenerating}
      >
        {pdfGenerating ? "Generating..." : <><Download size={18} /> Download Badge</>}
      </button>
    </div>
  );
}
