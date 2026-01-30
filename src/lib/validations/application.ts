import { z } from "zod";
import { STANDARDIZED_SKILLS } from "@/lib/constants/skills";

const phoneRegex = new RegExp(
    /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

export const applicationSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(phoneRegex, "Invalid phone number"),
    portfolioUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),

    // The crucial part for AI matching
    primaryCategory: z.string().min(1, "Please select a category"),
    selectedSkills: z.array(z.string()).min(1, "Select at least one skill"),

    experienceYears: z.number().min(0).max(50),
    bio: z.string().min(50, "Tell us a bit more about yourself (min 50 chars)"),

    // "Why should we hire you?"
    motivation: z.string().min(50, "Please explain your motivation (min 50 chars)"),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
