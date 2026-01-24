"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import type { Job } from "@/types";

interface JobWithPopulated extends Omit<Job, "workerId"> {
  workerId?: {
    _id: string;
    profile: { firstName: string; lastName: string };
    email: string;
  };
}

export default function ClientDashboard() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<JobWithPopulated[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/jobs?limit=5");
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
  }, []);

  const activeJobs = jobs.filter(
    (j) => !["completed", "cancelled"].includes(j.status)
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {session?.user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Send us your tasks before bed, wake up to completed work.
          </p>
        </div>
        <Link href="/client/jobs/new">
          <Button size="lg">Request New Task</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Tasks</CardDescription>
            <CardTitle className="text-4xl">{activeJobs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Review</CardDescription>
            <CardTitle className="text-4xl">
              {jobs.filter((j) => j.status === "review").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-4xl">
              {jobs.filter((j) => j.status === "completed").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Your latest task requests</CardDescription>
            </div>
            <Link href="/client/jobs">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t submitted any tasks yet.
              </p>
              <Link href="/client/jobs/new">
                <Button>Create Your First Task</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 5).map((job) => (
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
                      </p>
                    </div>
                    <StatusBadge status={job.status} />
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
