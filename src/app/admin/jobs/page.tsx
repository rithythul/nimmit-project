"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Job } from "@/types";

interface JobWithPopulated extends Omit<Job, "clientId" | "workerId"> {
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
}

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<JobWithPopulated[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        async function fetchJobs() {
            try {
                const url =
                    statusFilter === "all"
                        ? "/api/jobs"
                        : `/api/jobs?status=${statusFilter}`;
                const response = await fetch(url);
                const data = await response.json();
                if (data.success) {
                    setJobs(data.data.jobs);
                }
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchJobs();
    }, [statusFilter]);

    const pendingJobs = jobs.filter((j) => j.status === "pending");
    const activeJobs = jobs.filter((j) =>
        ["assigned", "in_progress", "review", "revision"].includes(j.status)
    );
    const completedJobs = jobs.filter((j) => j.status === "completed");
    const cancelledJobs = jobs.filter((j) => j.status === "cancelled");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">All Jobs</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and assign all jobs
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Jobs</SelectItem>
                        <SelectItem value="pending">Pending (Unassigned)</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">In Review</SelectItem>
                        <SelectItem value="revision">Revision</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Pending Jobs - Priority */}
            {pendingJobs.length > 0 && (
                <Card className="border-orange-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-orange-500 rounded-full" />
                            Unassigned ({pendingJobs.length})
                        </CardTitle>
                        <CardDescription>
                            Jobs waiting to be assigned to a team member
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingJobs.map((job) => (
                                <JobCard key={job._id.toString()} job={job} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Active Jobs */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Jobs ({activeJobs.length})</CardTitle>
                    <CardDescription>Jobs currently being worked on</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-muted-foreground">Loading...</p>
                    ) : activeJobs.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No active jobs</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeJobs.map((job) => (
                                <JobCard key={job._id.toString()} job={job} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Completed Jobs */}
            {completedJobs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Completed ({completedJobs.length})</CardTitle>
                        <CardDescription>Successfully delivered jobs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {completedJobs.slice(0, 10).map((job) => (
                                <JobCard key={job._id.toString()} job={job} />
                            ))}
                            {completedJobs.length > 10 && (
                                <p className="text-center text-sm text-muted-foreground">
                                    Showing 10 of {completedJobs.length} completed jobs
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Cancelled Jobs */}
            {cancelledJobs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Cancelled ({cancelledJobs.length})</CardTitle>
                        <CardDescription>Cancelled jobs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {cancelledJobs.slice(0, 5).map((job) => (
                                <JobCard key={job._id.toString()} job={job} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

interface JobCardProps {
    job: JobWithPopulated;
}

function JobCard({ job }: JobCardProps) {
    return (
        <Link href={`/admin/jobs/${job._id}`} className="block">
            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="space-y-1">
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                        {job.clientId.profile.firstName} {job.clientId.profile.lastName}{" "}
                        &middot; {job.category} &middot;{" "}
                        {new Date(job.createdAt).toLocaleDateString()}
                        {job.workerId && (
                            <>
                                {" "}
                                &middot; Assigned to {job.workerId.profile.firstName}
                            </>
                        )}
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
        </Link>
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
