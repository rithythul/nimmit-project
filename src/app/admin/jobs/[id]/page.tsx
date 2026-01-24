"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import type { Job, JobMessage } from "@/types";
import type { IUser } from "@/lib/db/models";

interface JobWithPopulated extends Omit<Job, "clientId" | "workerId" | "messages"> {
    clientId: {
        _id: string;
        profile: { firstName: string; lastName: string };
        email: string;
    };
    workerId?: {
        _id: string;
        profile: { firstName: string; lastName: string };
        email: string;
    };
    messages: Array<JobMessage & { senderRole: string }>;
}

export default function AdminJobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState<JobWithPopulated | null>(null);
    const [workers, setWorkers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
    const [estimatedHours, setEstimatedHours] = useState<string>("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [jobRes, workersRes] = await Promise.all([
                    fetch(`/api/jobs/${params.id}`),
                    fetch("/api/users?role=worker"),
                ]);

                const [jobData, workersData] = await Promise.all([
                    jobRes.json(),
                    workersRes.json(),
                ]);

                if (jobData.success) {
                    setJob(jobData.data);
                } else {
                    setError(jobData.error?.message || "Failed to load job");
                }

                if (workersData.success) {
                    setWorkers(workersData.data);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        }
        if (params.id) {
            fetchData();
        }
    }, [params.id]);

    const assignJob = async () => {
        if (!selectedWorkerId) {
            toast.error("Please select a worker");
            return;
        }

        setAssigning(true);
        try {
            const response = await fetch(`/api/jobs/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "assign",
                    workerId: selectedWorkerId,
                    estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setJob(data.data);
                toast.success("Job assigned successfully");
                // Refresh to get populated worker data
                const refreshRes = await fetch(`/api/jobs/${params.id}`);
                const refreshData = await refreshRes.json();
                if (refreshData.success) {
                    setJob(refreshData.data);
                }
            } else {
                toast.error(data.error?.message || "Failed to assign job");
            }
        } catch (err) {
            console.error("Failed to assign job:", err);
            toast.error("Failed to assign job");
        } finally {
            setAssigning(false);
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

    const cancelJob = async () => {
        if (!confirm("Are you sure you want to cancel this job?")) return;

        try {
            const response = await fetch(`/api/jobs/${params.id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Job cancelled");
                router.push("/admin/jobs");
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

    const availableWorkers = workers.filter(
        (w) =>
            w.workerProfile?.availability !== "offline" &&
            (w.workerProfile?.currentJobCount || 0) <
            (w.workerProfile?.maxConcurrentJobs || 3)
    );

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

                    {/* Assignment Section (if pending) */}
                    {job.status === "pending" && (
                        <Card className="border-orange-500">
                            <CardHeader>
                                <CardTitle>Assign to Team Member</CardTitle>
                                <CardDescription>
                                    Select a worker to assign this job to
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="worker">Select Worker</Label>
                                    <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a worker" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableWorkers.length === 0 ? (
                                                <SelectItem value="_none" disabled>
                                                    No available workers
                                                </SelectItem>
                                            ) : (
                                                availableWorkers.map((worker) => (
                                                    <SelectItem
                                                        key={worker._id.toString()}
                                                        value={worker._id.toString()}
                                                    >
                                                        {worker.profile.firstName} {worker.profile.lastName} (
                                                        {worker.workerProfile?.currentJobCount || 0}/
                                                        {worker.workerProfile?.maxConcurrentJobs || 3} jobs)
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hours">Estimated Hours (optional)</Label>
                                    <Input
                                        id="hours"
                                        type="number"
                                        placeholder="e.g., 4"
                                        value={estimatedHours}
                                        onChange={(e) => setEstimatedHours(e.target.value)}
                                    />
                                </div>

                                <Button
                                    onClick={assignJob}
                                    disabled={assigning || !selectedWorkerId}
                                    className="w-full"
                                >
                                    {assigning ? "Assigning..." : "Assign Job"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Messages */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Messages</CardTitle>
                            <CardDescription>Communication history</CardDescription>
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
                                            className={`p-3 rounded-lg ${msg.senderRole === "admin"
                                                    ? "bg-blue-50 ml-8"
                                                    : msg.senderRole === "worker"
                                                        ? "bg-green-50"
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

                            {job.status !== "completed" && job.status !== "cancelled" && (
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
                            {job.actualHours && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Actual Hours</p>
                                    <p className="font-medium">{job.actualHours} hours</p>
                                </div>
                            )}
                            {job.rating && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Rating</p>
                                    <p className="font-medium">{job.rating}/5 ⭐</p>
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

                    {/* Worker Info */}
                    {job.workerId && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Assigned Worker</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium">
                                    {job.workerId.profile.firstName} {job.workerId.profile.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{job.workerId.email}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Admin Actions */}
                    {job.status !== "completed" && job.status !== "cancelled" && (
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
                                    Cancel Job
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
        revision: "destructive",
        completed: "outline",
        cancelled: "destructive",
    };

    const labels: Record<string, string> = {
        pending: "Unassigned",
        assigned: "Assigned",
        in_progress: "In Progress",
        review: "In Review",
        revision: "Revision",
        completed: "Completed",
        cancelled: "Cancelled",
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
