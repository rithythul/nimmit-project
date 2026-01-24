"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { FileList } from "@/components/job/file-list";
import type { Job, JobMessage } from "@/types";

interface JobWithPopulated extends Omit<Job, "workerId" | "messages"> {
    workerId?: {
        _id: string;
        profile: { firstName: string; lastName: string };
        email: string;
    };
    messages: Array<JobMessage & { senderRole: string }>;
}

const completeJobSchema = z.object({
    rating: z.number().min(1).max(5),
    feedback: z.string().max(2000).optional(),
});

type CompleteJobInput = z.infer<typeof completeJobSchema>;

export default function ClientJobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState<JobWithPopulated | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [completing, setCompleting] = useState(false);
    const [showRating, setShowRating] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CompleteJobInput>({
        resolver: zodResolver(completeJobSchema),
    });

    const selectedRating = watch("rating");

    useEffect(() => {
        async function fetchJob() {
            try {
                const response = await fetch(`/api/jobs/${params.id}`);
                const data = await response.json();
                if (data.success) {
                    setJob(data.data);
                } else {
                    setError(data.error?.message || "Failed to load job");
                }
            } catch (err) {
                console.error("Failed to fetch job:", err);
                setError("Failed to load job");
            } finally {
                setLoading(false);
            }
        }
        if (params.id) {
            fetchJob();
        }
    }, [params.id]);

    const sendMessage = async () => {
        if (!message.trim()) return;

        try {
            const response = await fetch(`/api/jobs/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "addMessage",
                    message: message.trim(),
                }),
            });

            const data = await response.json();
            if (data.success) {
                setJob(data.data);
                setMessage("");
                toast.success("Message sent");
            } else {
                toast.error(data.error?.message || "Failed to send message");
            }
        } catch (err) {
            console.error("Failed to send message:", err);
            toast.error("Failed to send message");
        }
    };

    const requestRevision = async () => {
        if (!message.trim()) {
            toast.error("Please provide feedback for the revision");
            return;
        }

        try {
            // First add the message
            await fetch(`/api/jobs/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "addMessage",
                    message: `Revision requested: ${message.trim()}`,
                }),
            });

            // Then update status to revision
            const response = await fetch(`/api/jobs/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "updateStatus",
                    status: "revision",
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Refresh job
                const refreshRes = await fetch(`/api/jobs/${params.id}`);
                const refreshData = await refreshRes.json();
                if (refreshData.success) {
                    setJob(refreshData.data);
                }
                setMessage("");
                toast.success("Revision requested");
            } else {
                toast.error(data.error?.message || "Failed to request revision");
            }
        } catch (err) {
            console.error("Failed to request revision:", err);
            toast.error("Failed to request revision");
        }
    };

    const onCompleteSubmit = async (data: CompleteJobInput) => {
        setCompleting(true);
        try {
            const response = await fetch(`/api/jobs/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "complete",
                    rating: data.rating,
                    feedback: data.feedback,
                }),
            });

            const result = await response.json();
            if (result.success) {
                setJob(result.data);
                setShowRating(false);
                toast.success("Job completed! Thank you for your feedback.");
            } else {
                toast.error(result.error?.message || "Failed to complete job");
            }
        } catch (err) {
            console.error("Failed to complete job:", err);
            toast.error("Failed to complete job");
        } finally {
            setCompleting(false);
        }
    };

    const cancelJob = async () => {
        if (!confirm("Are you sure you want to cancel this job?")) return;

        try {
            const response = await fetch(`/api/jobs/${params.id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Job cancelled");
                router.push("/client/jobs");
            } else {
                toast.error(data.error?.message || "Failed to cancel job");
            }
        } catch (err) {
            console.error("Failed to cancel job:", err);
            toast.error("Failed to cancel job");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="max-w-2xl mx-auto py-12">
                <Alert variant="destructive">
                    <AlertDescription>{error || "Job not found"}</AlertDescription>
                </Alert>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2"
                        onClick={() => router.back()}
                    >
                        ← Back to Tasks
                    </Button>
                    <h1 className="text-3xl font-bold">{job.title}</h1>
                    {job.workerId && (
                        <p className="text-muted-foreground mt-1">
                            Assigned to {job.workerId.profile.firstName}{" "}
                            {job.workerId.profile.lastName}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {job.priority !== "standard" && (
                        <Badge variant={job.priority === "rush" ? "destructive" : "default"}>
                            {job.priority}
                        </Badge>
                    )}
                    <StatusBadge status={job.status} />
                </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{job.description}</p>
                        </CardContent>
                    </Card>

                    {/* Review Actions */}
                    {job.status === "review" && !showRating && (
                        <Card className="border-green-500">
                            <CardHeader>
                                <CardTitle>Ready for Review!</CardTitle>
                                <CardDescription>
                                    Your assistant has submitted this task for your review
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => setShowRating(true)}
                                        className="flex-1"
                                    >
                                        Approve & Complete
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={requestRevision}
                                        className="flex-1"
                                        disabled={!message.trim()}
                                    >
                                        Request Revision
                                    </Button>
                                </div>
                                <Textarea
                                    placeholder="Add feedback or revision notes..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={2}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Rating Form */}
                    {showRating && (
                        <Card className="border-green-500">
                            <CardHeader>
                                <CardTitle>Rate this Task</CardTitle>
                                <CardDescription>
                                    How would you rate the delivery?
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit(onCompleteSubmit)}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Rating</Label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setValue("rating", star)}
                                                    className={`text-3xl transition-colors ${selectedRating >= star
                                                            ? "text-yellow-400"
                                                            : "text-gray-300"
                                                        }`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                        {errors.rating && (
                                            <p className="text-sm text-red-500">Please select a rating</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="feedback">Feedback (optional)</Label>
                                        <Textarea
                                            id="feedback"
                                            placeholder="Any additional feedback for your assistant..."
                                            {...register("feedback")}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowRating(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={completing} className="flex-1">
                                            {completing ? "Submitting..." : "Complete Task"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </form>
                        </Card>
                    )}

                    {/* Completed Job Info */}
                    {job.status === "completed" && (
                        <Card className="border-green-500 bg-green-50">
                            <CardHeader>
                                <CardTitle className="text-green-800">Task Completed!</CardTitle>
                                <CardDescription>
                                    Completed on {new Date(job.completedAt!).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            {job.rating && (
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Your rating:</span>
                                        <span className="text-yellow-400 text-xl">
                                            {"★".repeat(job.rating)}{"☆".repeat(5 - job.rating)}
                                        </span>
                                    </div>
                                    {job.feedback && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            &ldquo;{job.feedback}&rdquo;
                                        </p>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    )}

                    {/* Files & Deliverables */}
                    {(job.files.length > 0 || job.deliverables.length > 0) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Files</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {job.files.length > 0 && (
                                    <FileList
                                        files={job.files}
                                        title="Reference Files"
                                        emptyMessage="No reference files"
                                    />
                                )}
                                {job.deliverables.length > 0 && (
                                    <FileList
                                        files={job.deliverables}
                                        title="Deliverables"
                                        emptyMessage="No deliverables yet"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Messages */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Messages</CardTitle>
                            <CardDescription>Communication with your assistant</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {job.messages.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">
                                    No messages yet
                                </p>
                            ) : (
                                <div className="space-y-4 max-h-80 overflow-y-auto">
                                    {job.messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`p-3 rounded-lg ${msg.senderRole === "client"
                                                    ? "bg-primary/10 ml-8"
                                                    : "bg-gray-100 mr-8"
                                                }`}
                                        >
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span className="font-medium">
                                                    {msg.senderRole === "client" ? "You" : "Assistant"}
                                                </span>
                                                <span>{new Date(msg.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm">{msg.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {job.status !== "completed" &&
                                job.status !== "cancelled" &&
                                job.status !== "pending" && (
                                    <div className="flex gap-2 pt-4 border-t">
                                        <Textarea
                                            placeholder="Type a message..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={2}
                                        />
                                        <Button onClick={sendMessage} disabled={!message.trim()}>
                                            Send
                                        </Button>
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Job Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Category</p>
                                <p className="font-medium capitalize">{job.category}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Created</p>
                                <p className="font-medium">
                                    {new Date(job.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            {job.assignedAt && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Assigned</p>
                                    <p className="font-medium">
                                        {new Date(job.assignedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {job.startedAt && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Started</p>
                                    <p className="font-medium">
                                        {new Date(job.startedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {job.completedAt && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                    <p className="font-medium">
                                        {new Date(job.completedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {job.estimatedHours && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Estimated Hours</p>
                                    <p className="font-medium">{job.estimatedHours} hours</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Assistant Info */}
                    {job.workerId && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Assistant</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium">
                                    {job.workerId.profile.firstName} {job.workerId.profile.lastName}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Cancel Option */}
                    {(job.status === "pending" || job.status === "assigned") && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={cancelJob}
                                >
                                    Cancel Task
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        pending: "secondary",
        assigned: "secondary",
        in_progress: "default",
        review: "default",
        revision: "secondary",
        completed: "outline",
        cancelled: "destructive",
    };

    const labels: Record<string, string> = {
        pending: "Pending",
        assigned: "Assigned",
        in_progress: "In Progress",
        review: "Ready for Review",
        revision: "Revision",
        completed: "Completed",
        cancelled: "Cancelled",
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
