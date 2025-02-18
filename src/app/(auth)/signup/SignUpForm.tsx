"use client";

import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { signUp } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SignatureCanvas from "react-signature-canvas";
import { useUploadThing } from "@/lib/uploadthing";

// 🔹 List of Nigerian States & their abbreviations
const STATES = [
  { name: "Abia", code: "AB" },
  { name: "Adamawa", code: "AD" },
  { name: "Akwa Ibom", code: "AK" },
  { name: "Anambra", code: "AN" },
  { name: "Bauchi", code: "BA" },
  { name: "Bayelsa", code: "BY" },
  { name: "Benue", code: "BE" },
  { name: "Borno", code: "BO" },
  { name: "Cross River", code: "CR" },
  { name: "Delta", code: "DE" },
  { name: "Ebonyi", code: "EB" },
  { name: "Edo", code: "ED" },
  { name: "Ekiti", code: "EK" },
  { name: "Enugu", code: "EN" },
  { name: "Gombe", code: "GO" },
  { name: "Imo", code: "IM" },
  { name: "Jigawa", code: "JI" },
  { name: "Kaduna", code: "KD" },
  { name: "Kano", code: "KN" },
  { name: "Katsina", code: "KT" },
  { name: "Kebbi", code: "KE" },
  { name: "Kogi", code: "KO" },
  { name: "Kwara", code: "KW" },
  { name: "Lagos", code: "LA" },
  { name: "Nasarawa", code: "NA" },
  { name: "Niger", code: "NI" },
  { name: "Ogun", code: "OG" },
  { name: "Ondo", code: "ON" },
  { name: "Osun", code: "OS" },
  { name: "Oyo", code: "OY" },
  { name: "Plateau", code: "PL" },
  { name: "Rivers", code: "RI" },
  { name: "Sokoto", code: "SO" },
  { name: "Taraba", code: "TA" },
  { name: "Yobe", code: "YO" },
  { name: "Zamfara", code: "ZA" },
  { name: "Federal Capital Territory", code: "FC" },
];

export default function SignUpForm() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const signatureRef = useRef<SignatureCanvas | null>(null);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      fullName: "",
      nin: "",
      phoneNumber: "",
      email: "",
      password: "",
      state: "",
      memberNumber: "", // Editable member number
      signature: "", // Base64 signature data
    },
  });

  // 🔹 Generate Membership Number
  const generateMemberNumber = async (fullName: string, state: string) => {
    if (!fullName || !state) return "";

    const stateAbbr = STATES.find((s) => s.name === state)?.code || "XX";
    const namePart = fullName.substring(0, 2).toUpperCase();
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(-2); // Get last 2 digits of year
    const datePart = `${day}${month}${year}`;

    // Fetch latest membership number from our new API
    const lastUserResponse = await fetch("/api/last-user-number");
    const lastNumber = await lastUserResponse.json();
    const nextNumber = lastNumber ? lastNumber : 1;

    return `${stateAbbr}/${namePart}/${datePart}${String(nextNumber).padStart(4, "0")}`;
  };


  // ✅ Upload Signature with UploadThing
  const { startUpload } = useUploadThing("attachment", {
    onClientUploadComplete(res) {
      if (res.length > 0) {
        form.setValue("signature", res[0].serverData.mediaId); // Save uploaded signature URL
      }
    },
    onUploadError(e) {
      setError("Failed to upload signature: " + e.message);
    },
  });

  const handleSignatureUpload = async (fullName: string) => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      try {
        const canvas = signatureRef.current.getCanvas();
        if (!canvas) {
          console.error("Canvas is not available.");
          return;
        }
        const signatureData = canvas.toDataURL("image/png");
  
        // Convert base64 to File
        const blob = await fetch(signatureData).then((res) => res.blob());
        const file = new File([blob], `${fullName.replace(/\s+/g, "_")}_signature.png`, { type: "image/png" });
  
        // Upload File
        await startUpload([file]);
      } catch (error) {
        console.error("Error processing signature: ", error);
      }
    }
  };
  
 // 🔹 useEffect - Run Only Every 10 Seconds
useEffect(() => {
  const interval = setInterval(() => {
    const { fullName, state } = form.getValues();
    if (fullName && state) {
      generateMemberNumber(fullName, state).then((generatedNumber) => {
        form.setValue("memberNumber", generatedNumber);
      });
    }
  }, 10000); // ✅ Run every 10 seconds

  return () => clearInterval(interval);
}, [form]);

async function onSubmit(values: SignUpValues) {
  setError(undefined);
  setIsLoading(true);

  // ✅ Ensure signature is not empty before converting it
  if (signatureRef.current && !signatureRef.current.isEmpty()) {
    try {
      const canvas = signatureRef.current.getCanvas(); // ✅ Correct function
      values.signature = canvas.toDataURL("image/png"); // ✅ Convert to Base64

      // ✅ Upload Signature Before Submitting Form
      await handleSignatureUpload(values.fullName);
    } catch (error) {
      console.error("Error processing signature: ", error);
      setError("Failed to process signature. Please try again.");
      setIsLoading(false);
      return;
    }
  }

  const result = await signUp(values);

  if (result.error) {
    setError(result.error);
  } else {
    setIsSuccess(true);
    form.reset();
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  }

  setIsLoading(false);
}


  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {error && <p className="text-center text-destructive">{error}</p>}

          <FormField name="username" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl><Input placeholder="Username" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="password" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><PasswordInput {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="fullName" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input placeholder="Full Name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

        <FormField name="nin" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>National Insurance Number</FormLabel>
              <FormControl><Input placeholder="NIN" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

        <FormField name="phoneNumber" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl><Input placeholder="Enter your phone number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="state" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <select {...field} className="w-full p-2 border rounded bg-background text-foreground">
                  {STATES.map((state) => (
                    <option key={state.code} value={state.name}>{state.name}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="memberNumber" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Membership Number</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

            <FormField name="signature" control={form.control} render={() => (
            <FormItem>
              <FormLabel>Signature</FormLabel>
              <SignatureCanvas ref={signatureRef} canvasProps={{ className: "border w-full h-24" }} />
              <button type="button" onClick={() => signatureRef.current?.clear()} className="text-sm text-blue-500">
                Clear
              </button>
            </FormItem>
          )} />

          <LoadingButton loading={isLoading} type="submit" className="w-full">Create Account</LoadingButton>
        </form>
      </Form>
    </>
  );
}
