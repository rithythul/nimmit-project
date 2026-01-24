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

interface JobWithPopulated extends Omit<Job, "clientId"> {
  clientId: {
    _id: string;
    profile: { firstName: string; lastName: string };
    email: string;
  };
}

export default function WorkerDashboard() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<JobWithPopulated[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/jobs");
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

  const activeJobs = jobs.filter((j) =>
    ["assigned", "in_progress", "revision"].includes(j.status)
  );
  const inReview = jobs.filter((j) => j.status === "review");
  const completedThisWeek = jobs.filter((j) => {
    if (j.status !== "completed" || !j.completedAt) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(j.completedAt) > weekAgo;
  });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome, {session?.user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your current workload.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Jobs</CardDescription>
            <CardTitle className="text-4xl">{activeJobs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Awaiting Review</CardDescription>
            <CardTitle className="text-4xl">{inReview.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed This Week</CardDescription>
            <CardTitle className="text-4xl">
              {completedThisWeek.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Completed</CardDescription>
            <CardTitle className="text-4xl">
              {jobs.filter((j) => j.status === "completed").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Assignments</CardTitle>
              <CardDescription>Jobs you&apos;re working on</CardDescription>
            </div>
            <Link href="/worker/jobs">
              <Button variant="outline" size="sm">
                View All Jobs
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : activeJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No active assignments. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <Link
                  key={job._id.toString()}
                  href={`/worker/jobs/${job._id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="space-y-1">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.clientId.profile.firstName}{" "}
                        {job.clientId.profile.lastName} &middot; {job.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={job.status} />
                      {job.priority !== "standard" && (
                        <Badge
                          variant={
                            job.priority === "rush" ? "destructive" : "default"
                          }
                        >
                          {job.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* In Review */}
      {inReview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Awaiting Client Review</CardTitle>
            <CardDescription>Jobs you&apos;ve submitted for review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inReview.map((job) => (
                <Link
                  key={job._id.toString()}
                  href={`/worker/jobs/${job._id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="space-y-1">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted{" "}
                        {new Date(job.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">In Review</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    assigned: "secondary",
    in_progress: "default",
    revision: "destructive",
  };

  const labels: Record<string, string> = {
    assigned: "New",
    in_progress: "In Progress",
    revision: "Needs Revision",
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
