"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema, type CreateJobInput } from "@/lib/validations/job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const categories = [
  { value: "video", label: "Video Editing" },
  { value: "design", label: "Graphic Design" },
  { value: "web", label: "Web Development" },
  { value: "social", label: "Social Media" },
  { value: "admin", label: "Admin Tasks" },
  { value: "other", label: "Other" },
];

const priorities = [
  { value: "standard", label: "Standard (48 hours)", description: "Regular delivery" },
  { value: "priority", label: "Priority (24 hours)", description: "Faster delivery" },
  { value: "rush", label: "Rush (12 hours)", description: "Urgent delivery" },
];

export default function NewJobPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      priority: "standard",
    },
  });

  const selectedCategory = watch("category");
  const selectedPriority = watch("priority");

  const onSubmit = async (data: CreateJobInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || "Failed to create task");
        return;
      }

      toast.success("Task submitted successfully!");
      router.push(`/client/jobs/${result.data._id}`);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Request New Task</h1>
        <p className="text-muted-foreground mt-1">
          Tell us what you need done. Be as detailed as possible.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>
            Describe your task and we&apos;ll assign it to the best team member.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="e.g., Edit video for YouTube"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) =>
                  setValue("category", value as CreateJobInput["category"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your task in detail. Include any specific requirements, style preferences, reference links, etc."
                rows={6}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                The more detail you provide, the better we can deliver.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="grid gap-3">
                {priorities.map((p) => (
                  <label
                    key={p.value}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPriority === p.value
                        ? "border-primary bg-primary/5"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{p.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.description}
                      </p>
                    </div>
                    <input
                      type="radio"
                      value={p.value}
                      checked={selectedPriority === p.value}
                      onChange={() =>
                        setValue("priority", p.value as CreateJobInput["priority"])
                      }
                      className="h-4 w-4"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Submitting..." : "Submit Task"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
