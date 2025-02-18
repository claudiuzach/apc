import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required");

export const signUpSchema = z.object({
  fullName: requiredString.min(3, "Full name must be at least 3 characters"),
  nin: requiredString.regex(/^\d{11}$/, "NIN must be exactly 11 digits"), // Only 11-digit numbers
  phoneNumber: requiredString.regex(
    /^\+?\d{10,15}$/,
    "Invalid phone number format"
  ),
  email: requiredString.email("Invalid email address"),
  memberNumber: requiredString.regex(
    /^[a-zA-Z0-9_/-]+$/,
    "Only letters, numbers, /, - and _ allowed"
  ),
  
  username: requiredString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, - and _ allowed"
  ),
  password: requiredString.min(8, "Must be at least 8 characters"),
  state: requiredString.min(2, "State must be at least 2 characters"), // State validation
  signature: z.string().optional(), // Optional signature (Base64 or URL)
  dateRegistered: z.date().optional(), // Optional date (default to now)
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: requiredString,
  password: requiredString,
});

export type LoginValues = z.infer<typeof loginSchema>;

export const createPostSchema = z.object({
  content: requiredString,
  mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments"),
});

export const updateUserProfileSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(1000, "Must be at most 1000 characters"),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

export const createCommentSchema = z.object({
  content: requiredString,
});

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  content: z.string().min(1, "Content is required"),
  date: z.string().refine(
    (value) => !isNaN(Date.parse(value)),
    "Invalid date format"
  ),
  mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments"),
});
