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

interface JobWithPopulated extends Omit<Job, "clientId"> {
    clientId: {
        _id: string;
        profile: { firstName: string; lastName: string };
        email: string;
    };
}

export default function WorkerJobsPage() {
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

    const getStatusGroup = (status: string) => {
        if (["assigned", "in_progress", "revision"].includes(status)) return "active";
        if (status === "review") return "review";
        if (status === "completed") return "completed";
        return "other";
    };

    const activeJobs = jobs.filter((j) => getStatusGroup(j.status) === "active");
    const reviewJobs = jobs.filter((j) => getStatusGroup(j.status) === "review");
    const completedJobs = jobs.filter((j) => getStatusGroup(j.status) === "completed");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Assignments</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage your assigned tasks
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
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">In Review</SelectItem>
                        <SelectItem value="revision">Needs Revision</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Active Jobs */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Jobs ({activeJobs.length})</CardTitle>
                    <CardDescription>
                        Jobs you&apos;re currently working on
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-muted-foreground">Loading...</p>
                    ) : activeJobs.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                No active jobs at the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeJobs.map((job) => (
                                <JobCard key={job._id.toString()} job={job} baseUrl="/worker" />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* In Review */}
            {reviewJobs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Awaiting Review ({reviewJobs.length})</CardTitle>
                        <CardDescription>
                            Jobs waiting for client approval
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reviewJobs.map((job) => (
                                <JobCard key={job._id.toString()} job={job} baseUrl="/worker" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Completed Jobs */}
            {completedJobs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Completed ({completedJobs.length})</CardTitle>
                        <CardDescription>
                            Successfully delivered jobs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {completedJobs.slice(0, 10).map((job) => (
                                <JobCard key={job._id.toString()} job={job} baseUrl="/worker" />
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
        </div>
    );
}

interface JobCardProps {
    job: JobWithPopulated;
    baseUrl: string;
}

function JobCard({ job, baseUrl }: JobCardProps) {
    return (
        <Link href={`${baseUrl}/jobs/${job._id}`} className="block">
            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="space-y-1">
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                        {job.clientId.profile.firstName} {job.clientId.profile.lastName}{" "}
                        &middot; {job.category} &middot;{" "}
                        {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {job.priority !== "standard" && (
                        <Badge
                            variant={job.priority === "rush" ? "destructive" : "default"}
                        >
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
