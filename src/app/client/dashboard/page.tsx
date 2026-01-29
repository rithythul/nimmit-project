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

  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-[var(--nimmit-bg-primary)]">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-up">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-[var(--nimmit-text-primary)]">
              Welcome back, {firstName}!
            </h1>
            <p className="text-[var(--nimmit-text-secondary)] mt-2 text-lg">
              Send us your tasks before bed, wake up to completed work.
            </p>
          </div>
          <Link href="/client/jobs/new">
            <Button
              size="lg"
              className="h-12 px-6 text-base font-medium bg-[var(--nimmit-accent-primary)] 
                         hover:bg-[var(--nimmit-accent-primary-hover)] text-white
                         shadow-sm hover:shadow-md transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Request New Task
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            label="Active Tasks"
            value={activeJobs.length}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            color="primary"
            delay={0}
          />
          <StatsCard
            label="In Review"
            value={jobs.filter((j) => j.status === "review").length}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            color="info"
            delay={1}
          />
          <StatsCard
            label="Completed"
            value={jobs.filter((j) => j.status === "completed").length}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
            color="success"
            delay={2}
          />
        </div>

        {/* Recent Jobs */}
        <Card className="border-[var(--nimmit-border)] shadow-sm animate-fade-up stagger-3">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-display">Recent Tasks</CardTitle>
                <CardDescription className="text-[var(--nimmit-text-secondary)]">
                  Your latest task requests
                </CardDescription>
              </div>
              <Link href="/client/jobs">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[var(--nimmit-border)] hover:bg-[var(--nimmit-bg-secondary)]"
                >
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-[var(--nimmit-border)]">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-48 skeleton rounded" />
                      <div className="h-4 w-32 skeleton rounded" />
                    </div>
                    <div className="h-6 w-24 skeleton rounded-full" />
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job, index) => (
                  <JobCard key={job._id.toString()} job={job} index={index} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        {jobs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 animate-fade-up stagger-4">
            <TipCard
              title="💡 Pro Tip"
              description="Submit tasks by 10 PM to get them completed overnight. Our team works while you sleep!"
            />
            <TipCard
              title="📋 Need bulk work?"
              description="Contact us for enterprise plans with dedicated team members and priority support."
              action={{ label: "Learn More", href: "/pricing" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  label,
  value,
  icon,
  color,
  delay,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "primary" | "info" | "success";
  delay: number;
}) {
  const colorClasses = {
    primary: {
      bg: "bg-[var(--nimmit-accent-primary)]/10",
      text: "text-[var(--nimmit-accent-primary)]",
    },
    info: {
      bg: "bg-[var(--nimmit-info)]/10",
      text: "text-[var(--nimmit-info)]",
    },
    success: {
      bg: "bg-[var(--nimmit-success)]/10",
      text: "text-[var(--nimmit-success)]",
    },
  };

  return (
    <Card className={`border-[var(--nimmit-border)] shadow-sm animate-fade-up stagger-${delay + 1}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm font-medium text-[var(--nimmit-text-secondary)]">
            {label}
          </CardDescription>
          <div className={`p-2 rounded-lg ${colorClasses[color].bg}`}>
            <span className={colorClasses[color].text}>{icon}</span>
          </div>
        </div>
        <CardTitle className="text-4xl font-display font-semibold text-[var(--nimmit-text-primary)]">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

// Job Card Component
function JobCard({ job, index }: { job: JobWithPopulated; index: number }) {
  return (
    <Link
      href={`/client/jobs/${job._id}`}
      className="block group"
    >
      <div
        className={`flex items-center justify-between p-4 rounded-xl border border-[var(--nimmit-border)]
                    bg-[var(--nimmit-bg-elevated)] hover:border-[var(--nimmit-accent-primary)]/30
                    hover:shadow-md transition-all duration-200 animate-fade-up stagger-${index + 1}`}
      >
        <div className="space-y-1 flex-1 min-w-0">
          <p className="font-medium text-[var(--nimmit-text-primary)] truncate group-hover:text-[var(--nimmit-accent-primary)] transition-colors">
            {job.title}
          </p>
          <p className="text-sm text-[var(--nimmit-text-secondary)]">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {job.category}
            </span>
            <span className="mx-2 text-[var(--nimmit-text-tertiary)]">·</span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={job.status} />
          <svg
            className="w-5 h-5 text-[var(--nimmit-text-tertiary)] group-hover:text-[var(--nimmit-accent-primary)] transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--nimmit-accent-primary)]/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-[var(--nimmit-accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-[var(--nimmit-text-primary)] mb-2">
        No tasks yet
      </h3>
      <p className="text-[var(--nimmit-text-secondary)] mb-6 max-w-sm mx-auto">
        Submit your first task and our team will get started on it right away.
      </p>
      <Link href="/client/jobs/new">
        <Button className="bg-[var(--nimmit-accent-primary)] hover:bg-[var(--nimmit-accent-primary-hover)]">
          Create Your First Task
        </Button>
      </Link>
    </div>
  );
}

// Tip Card Component
function TipCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <Card className="border-[var(--nimmit-border)] bg-[var(--nimmit-bg-secondary)]/50">
      <CardContent className="p-5">
        <h4 className="font-medium text-[var(--nimmit-text-primary)] mb-1">{title}</h4>
        <p className="text-sm text-[var(--nimmit-text-secondary)]">{description}</p>
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-[var(--nimmit-accent-primary)] hover:underline"
          >
            {action.label}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; label: string }> = {
    pending: {
      className: "bg-[var(--nimmit-warning-bg)] text-[var(--nimmit-warning)] border-[var(--nimmit-warning)]/20",
      label: "Pending",
    },
    assigned: {
      className: "bg-[var(--nimmit-info-bg)] text-[var(--nimmit-info)] border-[var(--nimmit-info)]/20",
      label: "Assigned",
    },
    in_progress: {
      className: "bg-[var(--nimmit-accent-primary)]/10 text-[var(--nimmit-accent-primary)] border-[var(--nimmit-accent-primary)]/20",
      label: "In Progress",
    },
    review: {
      className: "bg-[var(--nimmit-info-bg)] text-[var(--nimmit-info)] border-[var(--nimmit-info)]/20",
      label: "Ready for Review",
    },
    revision: {
      className: "bg-[var(--nimmit-warning-bg)] text-[var(--nimmit-warning)] border-[var(--nimmit-warning)]/20",
      label: "Revision",
    },
    completed: {
      className: "bg-[var(--nimmit-success-bg)] text-[var(--nimmit-success)] border-[var(--nimmit-success)]/20",
      label: "Completed",
    },
    cancelled: {
      className: "bg-[var(--nimmit-error-bg)] text-[var(--nimmit-error)] border-[var(--nimmit-error)]/20",
      label: "Cancelled",
    },
  };

  const { className, label } = config[status] || config.pending;

  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 text-xs font-medium border rounded-full ${className}`}
    >
      {label}
    </Badge>
  );
}
