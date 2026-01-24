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
import type { Job } from "@/types";
import type { IUser } from "@/lib/db/models";

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

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<JobWithPopulated[]>([]);
  const [workers, setWorkers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsRes, workersRes] = await Promise.all([
          fetch("/api/jobs"),
          fetch("/api/users?role=worker"),
        ]);

        const [jobsData, workersData] = await Promise.all([
          jobsRes.json(),
          workersRes.json(),
        ]);

        if (jobsData.success) setJobs(jobsData.data.jobs);
        if (workersData.success) setWorkers(workersData.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const pendingJobs = jobs.filter((j) => j.status === "pending");
  const activeJobs = jobs.filter((j) =>
    ["assigned", "in_progress", "review", "revision"].includes(j.status)
  );
  const availableWorkers = workers.filter(
    (w) => w.workerProfile?.availability === "available"
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage jobs and team assignments.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={pendingJobs.length > 0 ? "border-orange-500" : ""}>
          <CardHeader className="pb-2">
            <CardDescription>Unassigned Jobs</CardDescription>
            <CardTitle className="text-4xl">{pendingJobs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Jobs</CardDescription>
            <CardTitle className="text-4xl">{activeJobs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available Workers</CardDescription>
            <CardTitle className="text-4xl">{availableWorkers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Workers</CardDescription>
            <CardTitle className="text-4xl">{workers.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Unassigned Jobs Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Unassigned Jobs</CardTitle>
              <CardDescription>Jobs waiting for assignment</CardDescription>
            </div>
            <Link href="/admin/jobs">
              <Button variant="outline" size="sm">
                View All Jobs
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : pendingJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                All jobs have been assigned!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingJobs.slice(0, 5).map((job) => (
                <Link
                  key={job._id.toString()}
                  href={`/admin/jobs/${job._id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="space-y-1">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.clientId.profile.firstName}{" "}
                        {job.clientId.profile.lastName} &middot; {job.category}
                        &middot; {new Date(job.createdAt).toLocaleDateString()}
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
                      <Badge variant="secondary">Unassigned</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Status</CardTitle>
              <CardDescription>Worker availability and workload</CardDescription>
            </div>
            <Link href="/admin/team">
              <Button variant="outline" size="sm">
                Manage Team
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : workers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No workers registered yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workers.slice(0, 5).map((worker) => (
                <div
                  key={worker._id.toString()}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {worker.profile.firstName} {worker.profile.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {worker.workerProfile?.skills?.slice(0, 3).join(", ") ||
                        "No skills listed"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {worker.workerProfile?.currentJobCount || 0} /{" "}
                        {worker.workerProfile?.maxConcurrentJobs || 3}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        current jobs
                      </p>
                    </div>
                    <AvailabilityBadge
                      availability={worker.workerProfile?.availability || "offline"}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AvailabilityBadge({ availability }: { availability: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    available: "default",
    busy: "secondary",
    offline: "outline",
  };

  return <Badge variant={variants[availability]}>{availability}</Badge>;
}
