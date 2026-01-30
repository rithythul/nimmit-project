"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema, ApplicationFormData } from "@/lib/validations/application";
import { SKILL_CATEGORIES, STANDARDIZED_SKILLS } from "@/lib/constants/skills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ApplyPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<ApplicationFormData>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            selectedSkills: [],
            experienceYears: 0,
        },
    });

    const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
    const selectedSkills = watch("selectedSkills");
    const primaryCategory = watch("primaryCategory");

    async function onSubmit(data: ApplicationFormData) {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to submit application");
            }

            setIsSuccess(true);
            toast.success("Application submitted successfully!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    const toggleSkill = (skillId: string) => {
        const current = selectedSkills || [];
        if (current.includes(skillId)) {
            setValue("selectedSkills", current.filter((id) => id !== skillId));
        } else {
            setValue("selectedSkills", [...current, skillId]);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--nimmit-bg-primary)] p-4">
                <Card className="max-w-md w-full border-[var(--nimmit-border)] shadow-lg animate-fade-up">
                    <CardHeader>
                        <div className="w-12 h-12 rounded-full bg-[var(--nimmit-success-bg)] flex items-center justify-center mb-4 text-[var(--nimmit-success)]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <CardTitle className="font-display text-2xl">Application Received</CardTitle>
                        <CardDescription>
                            Thank you for applying to Nimmit. Our AI team is reviewing your profile and will match you with potential roles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/">
                            <Button className="w-full bg-[var(--nimmit-accent-primary)] hover:bg-[var(--nimmit-accent-primary-hover)]">
                                Back to Home
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--nimmit-bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-display font-medium text-[var(--nimmit-text-primary)] mb-4">
                        Join the Nimmit Pro Team
                    </h1>
                    <p className="text-lg text-[var(--nimmit-text-secondary)]">
                        We are building the operating system for virtual work. Join an elite team of specialists serving top US clients.
                    </p>
                </div>

                <Card className="border-[var(--nimmit-border)] shadow-sm">
                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium font-display">Personal Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" {...register("firstName")} className="bg-[var(--nimmit-bg-secondary)]" />
                                        {errors.firstName && <p className="text-sm text-[var(--nimmit-error)]">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" {...register("lastName")} className="bg-[var(--nimmit-bg-secondary)]" />
                                        {errors.lastName && <p className="text-sm text-[var(--nimmit-error)]">{errors.lastName.message}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" {...register("email")} className="bg-[var(--nimmit-bg-secondary)]" />
                                        {errors.email && <p className="text-sm text-[var(--nimmit-error)]">{errors.email.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" {...register("phone")} className="bg-[var(--nimmit-bg-secondary)]" />
                                        {errors.phone && <p className="text-sm text-[var(--nimmit-error)]">{errors.phone.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Links */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium font-display">Professional Presence</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                                        <Input id="linkedinUrl" {...register("linkedinUrl")} placeholder="https://linkedin.com/in/..." className="bg-[var(--nimmit-bg-secondary)]" />
                                        {errors.linkedinUrl && <p className="text-sm text-[var(--nimmit-error)]">{errors.linkedinUrl.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                                        <Input id="portfolioUrl" {...register("portfolioUrl")} placeholder="https://..." className="bg-[var(--nimmit-bg-secondary)]" />
                                        {errors.portfolioUrl && <p className="text-sm text-[var(--nimmit-error)]">{errors.portfolioUrl.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium font-display">Expertise</h3>

                                <div className="space-y-2">
                                    <Label>Primary Category</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {Object.entries(SKILL_CATEGORIES).map(([key, label]) => (
                                            <div
                                                key={key}
                                                className={`cursor-pointer rounded-lg border p-3 text-center text-sm transition-all ${primaryCategory === label
                                                        ? "border-[var(--nimmit-accent-primary)] bg-[var(--nimmit-accent-primary)]/5 text-[var(--nimmit-accent-primary)]"
                                                        : "border-[var(--nimmit-border)] hover:border-[var(--nimmit-border-hover)]"
                                                    }`}
                                                onClick={() => setValue("primaryCategory", label)}
                                            >
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.primaryCategory && <p className="text-sm text-[var(--nimmit-error)]">{errors.primaryCategory.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Skills (Select all that apply)</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {STANDARDIZED_SKILLS.filter(s => !primaryCategory || s.category === primaryCategory).map((skill) => (
                                            <div key={skill.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={skill.id}
                                                    checked={selectedSkills?.includes(skill.id)}
                                                    onCheckedChange={() => toggleSkill(skill.id)}
                                                />
                                                <label
                                                    htmlFor={skill.id}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {skill.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.selectedSkills && <p className="text-sm text-[var(--nimmit-error)]">{errors.selectedSkills.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="experienceYears">Years of Experience</Label>
                                    <Input
                                        id="experienceYears"
                                        type="number"
                                        min="0"
                                        {...register("experienceYears", { valueAsNumber: true })}
                                        className="bg-[var(--nimmit-bg-secondary)] w-32"
                                    />
                                    {errors.experienceYears && <p className="text-sm text-[var(--nimmit-error)]">{errors.experienceYears.message}</p>}
                                </div>
                            </div>

                            {/* Bio & Motivation */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium font-display">About You</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us about your background and key achievements..."
                                        className="bg-[var(--nimmit-bg-secondary)] min-h-[100px]"
                                        {...register("bio")}
                                    />
                                    {errors.bio && <p className="text-sm text-[var(--nimmit-error)]">{errors.bio.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="motivation">Why Nimmit?</Label>
                                    <Textarea
                                        id="motivation"
                                        placeholder="Why do you want to join our team?"
                                        className="bg-[var(--nimmit-bg-secondary)] min-h-[100px]"
                                        {...register("motivation")}
                                    />
                                    {errors.motivation && <p className="text-sm text-[var(--nimmit-error)]">{errors.motivation.message}</p>}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[var(--nimmit-accent-primary)] hover:bg-[var(--nimmit-accent-primary-hover)] text-white text-lg h-12"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Application"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
