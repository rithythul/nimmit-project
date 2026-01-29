"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { FileList } from "@/components/job/file-list";
import { FileUpload } from "@/components/job/file-upload";
import type { Job, JobMessage } from "@/types";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

interface JobWithPopulated extends Omit<Job, "clientId" | "messages"> {
    clientId: {
        _id: string;
        profile: { firstName: string; lastName: string };
        email: string;
    };
    messages: Array<JobMessage & { senderRole: string }>;
}

export default function WorkerJobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [job, setJob] = useState<JobWithPopulated | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [uploadedDeliverables, setUploadedDeliverables] = useState<UploadedFile[]>([]);

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

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const response = await fetch(`/api/jobs/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "updateStatus",
                    status: newStatus,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setJob(data.data);
                toast.success("Status updated successfully");
            } else {
                toast.error(data.error?.message || "Failed to update status");
            }
        } catch (err) {
            console.error("Failed to update status:", err);
            toast.error("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

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

    const handleDeliverablesUploaded = async (files: UploadedFile[]) => {
        setUploadedDeliverables(files);
    };

    const submitDeliverables = async () => {
        if (uploadedDeliverables.length === 0) {
            toast.error("Please upload at least one deliverable");
            return;
        }

        setUpdating(true);
        try {
            // Add deliverables to job
            const response = await fetch(`/api/jobs/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "addDeliverables",
                    deliverables: uploadedDeliverables.map(f => ({
                        ...f,
                        version: 1,
                        uploadedAt: new Date(),
                    })),
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Now update status to review
                await updateStatus("review");
                setUploadedDeliverables([]);
            } else {
                toast.error(data.error?.message || "Failed to submit deliverables");
            }
        } catch (err) {
            console.error("Failed to submit deliverables:", err);
            toast.error("Failed to submit deliverables");
        } finally {
            setUpdating(false);
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

    const getNextAction = () => {
        switch (job.status) {
            case "assigned":
                return { label: "Start Working", newStatus: "in_progress" };
            case "in_progress":
                return { label: "Submit for Review", newStatus: "review" };
            case "revision":
                return { label: "Resume Work", newStatus: "in_progress" };
            default:
                return null;
        }
    };

    const nextAction = getNextAction();

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
                        ← Back to Jobs
                    </Button>
                    <h1 className="text-3xl font-bold">{job.title}</h1>
                    <p className="text-muted-foreground mt-1">
                        From {job.clientId.profile.firstName} {job.clientId.profile.lastName}
                    </p>
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

                    {/* Context from Past Work */}
                    {job.contextFromPastWork && (
                        <Card className="border-blue-200 bg-blue-50/50">
                            <CardHeader>
                                <CardTitle className="text-blue-900">Context from Previous Work</CardTitle>
                                <CardDescription>
                                    Relevant insights from this client&apos;s past jobs
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-blue-900">
                                    {job.contextFromPastWork}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Client Files */}
                    {job.files.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Reference Files</CardTitle>
                                <CardDescription>Files provided by the client</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FileList
                                    files={job.files}
                                    emptyMessage="No reference files"
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Upload Deliverables */}
                    {["in_progress", "revision"].includes(job.status) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Deliverables</CardTitle>
                                <CardDescription>Upload your completed work</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FileUpload
                                    jobId={params.id as string}
                                    onFilesUploaded={handleDeliverablesUploaded}
                                    maxFiles={10}
                                />
                                {uploadedDeliverables.length > 0 && (
                                    <Button
                                        onClick={submitDeliverables}
                                        disabled={updating}
                                        className="w-full"
                                    >
                                        {updating ? "Submitting..." : "Submit for Review"}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Existing Deliverables */}
                    {job.deliverables.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Submitted Deliverables</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FileList
                                    files={job.deliverables}
                                    emptyMessage="No deliverables yet"
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Messages */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Messages</CardTitle>
                            <CardDescription>Communication with the client</CardDescription>
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
                                            className={`p-3 rounded-lg ${msg.senderRole === "worker"
                                                    ? "bg-primary/10 ml-8"
                                                    : "bg-gray-100 mr-8"
                                                }`}
                                        >
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span className="font-medium capitalize">{msg.senderRole}</span>
                                                <span>{new Date(msg.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm">{msg.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {["assigned", "in_progress", "revision", "review"].includes(job.status) && (
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
                    {/* Actions */}
                    {nextAction && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={() => updateStatus(nextAction.newStatus)}
                                    disabled={updating}
                                    className="w-full"
                                >
                                    {updating ? "Updating..." : nextAction.label}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

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
                            {job.estimatedHours && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Estimated Hours</p>
                                    <p className="font-medium">{job.estimatedHours} hours</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Client Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Client</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">
                                {job.clientId.profile.firstName} {job.clientId.profile.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{job.clientId.email}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        assigned: "secondary",
        in_progress: "default",
        review: "outline",
        revision: "destructive",
        completed: "outline",
    };

    const labels: Record<string, string> = {
        assigned: "Assigned",
        in_progress: "In Progress",
        review: "In Review",
        revision: "Needs Revision",
        completed: "Completed",
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
