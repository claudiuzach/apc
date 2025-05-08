"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SignatureCanvas from "react-signature-canvas";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { signUp } from "./actions";
import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import { useUploadThing } from "@/lib/uploadthing";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [step, setStep] = useState(1);
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
      memberNumber: "",
      signature: "",
      existingMember: undefined,
      gender: undefined,           
      ward: "",                     
      localGovernment: "",    
      dateOfBirth: undefined, // ➕ Add this line
      
    },
  });

  const generateMemberNumber = async (fullName: string, state: string) => {
    if (!fullName || !state) return "";
    const stateAbbr = STATES.find((s) => s.name === state)?.code || "XX";
    const namePart = fullName.substring(0, 2).toUpperCase();
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(-2);
    const datePart = `${day}${month}${year}`;
    const lastUserResponse = await fetch("/api/last-user-number");
    const lastNumber = await lastUserResponse.json();
    const nextNumber = lastNumber ? lastNumber : 1;
    return `${stateAbbr}/${namePart}/${datePart}${String(nextNumber).padStart(4, "0")}`;
  };

  const { startUpload } = useUploadThing("attachment", {
    onClientUploadComplete(res) {
      if (res.length > 0) {
        form.setValue("signature", res[0].serverData.mediaId);
      }
    },
    onUploadError(e) {
      setError("Failed to upload signature: " + e.message);
    },
  });

  const handleSignatureUpload = async (fullName: string) => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const canvas = signatureRef.current.getCanvas();
      const signatureData = canvas.toDataURL("image/png");
      const blob = await fetch(signatureData).then((res) => res.blob());
      const file = new File([blob], `${fullName.replace(/\s+/g, "_")}_signature.png`, { type: "image/png" });
      await startUpload([file]);
    }
  };
  const fullName = form.watch("fullName");
  const state = form.watch("state");
  
  useEffect(() => {
    const updateMemberNumber = async () => {
      if (fullName && state) {
        const generatedNumber = await generateMemberNumber(fullName, state);
        form.setValue("memberNumber", generatedNumber);
      }
    };
  
    const timeout = setTimeout(updateMemberNumber, 500);
    const interval = setInterval(updateMemberNumber, 10000);
  
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fullName, state]);
  
  

  async function onSubmit(values: SignUpValues) {
    setError(undefined);
    setIsLoading(true);

    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      try {
        const canvas = signatureRef.current.getCanvas();
        values.signature = canvas.toDataURL("image/png");
        await handleSignatureUpload(values.fullName);
      } catch (error) {
        setError("Failed to process signature.");
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
      signatureRef.current?.clear();
    }

    setIsLoading(false);
  }

  // 🔹 STEP 1: Existing Member Choice
  if (step === 1) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6">
        <h2 className="text-xl font-semibold">Are you an existing member?</h2>
        <div className="flex flex-col gap-4">
          <Button
            onClick={() => {
              form.setValue("existingMember", true);
              setStep(2);
            }}
            className="w-full"
          >
Yes, I&rsquo;m an existing member
</Button>
          <Button
            variant="outline"
            onClick={() => {
              form.setValue("existingMember", false);
              setStep(2);
            }}
            className="w-full"
          >
            🚀 No, I’m a new member
          </Button>
        </div>
      </div>
    );
  }

  // 🔹 STEP 2: Form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="text-red-600 text-center">{error}</p>}

        <FormField name="username" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl><Input {...field} /></FormControl>
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
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="nin" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>NIN</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="phoneNumber" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

<FormField name="dateOfBirth" control={form.control} render={({ field }) => (
  <FormItem>
    <FormLabel>Date of Birth</FormLabel>
    <FormControl>
      <Input
        type="date"
        {...field}
        value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
        onChange={(e) => field.onChange(new Date(e.target.value))}
        max={new Date().toISOString().split("T")[0]} // Prevent future dates
      />
    </FormControl>
    <FormMessage />
  </FormItem>
)} />


<FormField name="gender" control={form.control} render={({ field }) => (
  <FormItem>
    <FormLabel>Gender</FormLabel>
    <FormControl>
      <select {...field} className="w-full p-2 border rounded bg-background text-foreground">
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
    </FormControl>
    <FormMessage />
  </FormItem>
)} />

<FormField name="ward" control={form.control} render={({ field }) => (
  <FormItem>
    <FormLabel>Ward</FormLabel>
    <FormControl><Input {...field} /></FormControl>
    <FormMessage />
  </FormItem>
)} />

<FormField name="localGovernment" control={form.control} render={({ field }) => (
  <FormItem>
    <FormLabel>Local Government</FormLabel>
    <FormControl><Input {...field} /></FormControl>
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
            <FormLabel>Member Number</FormLabel>
            <FormControl><Input {...field} readOnly /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="signature" control={form.control} render={() => (
          <FormItem>
            <FormLabel>Signature</FormLabel>
            <SignatureCanvas ref={signatureRef} canvasProps={{ className: "border w-full h-24" }} />
            <button type="button" onClick={() => signatureRef.current?.clear()} className="text-sm text-blue-500 mt-1">
              Clear
            </button>
          </FormItem>
        )} />

        <LoadingButton loading={isLoading} type="submit" className="w-full">
          Create Account
        </LoadingButton>
      </form>
    </Form>
  );
}
