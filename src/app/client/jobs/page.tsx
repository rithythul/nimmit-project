"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

interface JobWithPopulated extends Omit<Job, "workerId"> {
  workerId?: {
    _id: string;
    profile: { firstName: string; lastName: string };
  };
}

export default function ClientJobsPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your task requests
          </p>
        </div>
        <Link href="/client/jobs/new">
          <Button>New Task</Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">In Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            {jobs.length} task{jobs.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No tasks found</p>
              <Link href="/client/jobs/new">
                <Button>Create Your First Task</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link
                  key={job._id.toString()}
                  href={`/client/jobs/${job._id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="space-y-1">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.category} &middot;{" "}
                        {new Date(job.createdAt).toLocaleDateString()}
                        {job.workerId && (
                          <>
                            {" "}
                            &middot; Assigned to{" "}
                            {job.workerId.profile.firstName}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.priority !== "standard" && (
                        <Badge
                          variant={
                            job.priority === "rush" ? "destructive" : "default"
                          }
                        >
                          {job.priority}
                        </Badge>
                      )}
                      <StatusBadge status={job.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
