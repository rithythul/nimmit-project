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

const STATUS_OPTIONS = [
  { value: "all", label: "All Tasks", icon: "📋" },
  { value: "pending", label: "Pending", icon: "⏳" },
  { value: "assigned", label: "Assigned", icon: "👤" },
  { value: "in_progress", label: "In Progress", icon: "🔄" },
  { value: "review", label: "Ready for Review", icon: "👀" },
  { value: "completed", label: "Completed", icon: "✅" },
  { value: "cancelled", label: "Cancelled", icon: "❌" },
];

export default function ClientJobsPage() {
  const [jobs, setJobs] = useState<JobWithPopulated[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
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
    <div className="min-h-screen bg-[var(--nimmit-bg-primary)]">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-up">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-[var(--nimmit-text-primary)]">
              My Tasks
            </h1>
            <p className="text-[var(--nimmit-text-secondary)] mt-2">
              View and manage all your task requests
            </p>
          </div>
          <Link href="/client/jobs/new">
            <Button
              className="h-11 px-5 text-base font-medium bg-[var(--nimmit-accent-primary)] 
                         hover:bg-[var(--nimmit-accent-primary-hover)] text-white
                         shadow-sm hover:shadow-md transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 animate-fade-up stagger-1">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] h-11 bg-[var(--nimmit-bg-elevated)] border-[var(--nimmit-border)] hover:border-[var(--nimmit-border-hover)]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--nimmit-bg-elevated)] border-[var(--nimmit-border)]">
              {STATUS_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer hover:bg-[var(--nimmit-bg-secondary)]"
                >
                  <span className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {statusFilter !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="text-[var(--nimmit-text-secondary)] hover:text-[var(--nimmit-text-primary)]"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filter
            </Button>
          )}
        </div>

        {/* Jobs Card */}
        <Card className="border-[var(--nimmit-border)] shadow-sm animate-fade-up stagger-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-display">Tasks</CardTitle>
                <CardDescription className="text-[var(--nimmit-text-secondary)]">
                  {loading ? "Loading..." : `${jobs.length} task${jobs.length !== 1 ? "s" : ""} found`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-[var(--nimmit-border)]">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-64 skeleton rounded" />
                      <div className="h-4 w-48 skeleton rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 skeleton rounded-full" />
                      <div className="h-6 w-24 skeleton rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState filter={statusFilter} onClearFilter={() => setStatusFilter("all")} />
            ) : (
              <div className="space-y-3">
                {jobs.map((job, index) => (
                  <JobCard key={job._id.toString()} job={job} index={index} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
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
                    hover:shadow-md transition-all duration-200 animate-fade-up`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="space-y-1 flex-1 min-w-0">
          <p className="font-medium text-[var(--nimmit-text-primary)] truncate group-hover:text-[var(--nimmit-accent-primary)] transition-colors">
            {job.title}
          </p>
          <p className="text-sm text-[var(--nimmit-text-secondary)] flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {job.category}
            </span>
            <span className="text-[var(--nimmit-text-tertiary)]">·</span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
            {job.workerId && (
              <>
                <span className="text-[var(--nimmit-text-tertiary)]">·</span>
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {job.workerId.profile.firstName}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {job.priority !== "standard" && <PriorityBadge priority={job.priority} />}
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
function EmptyState({ filter, onClearFilter }: { filter: string; onClearFilter: () => void }) {
  const isFiltered = filter !== "all";

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--nimmit-bg-secondary)] flex items-center justify-center">
        {isFiltered ? (
          <svg className="w-8 h-8 text-[var(--nimmit-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-[var(--nimmit-accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-medium text-[var(--nimmit-text-primary)] mb-2">
        {isFiltered ? "No matching tasks" : "No tasks yet"}
      </h3>
      <p className="text-[var(--nimmit-text-secondary)] mb-6 max-w-sm mx-auto">
        {isFiltered
          ? "Try adjusting your filter or create a new task."
          : "Submit your first task and our team will get started right away."
        }
      </p>
      <div className="flex items-center justify-center gap-3">
        {isFiltered && (
          <Button
            variant="outline"
            onClick={onClearFilter}
            className="border-[var(--nimmit-border)]"
          >
            Clear Filter
          </Button>
        )}
        <Link href="/client/jobs/new">
          <Button className="bg-[var(--nimmit-accent-primary)] hover:bg-[var(--nimmit-accent-primary-hover)]">
            {isFiltered ? "New Task" : "Create Your First Task"}
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Priority Badge Component
function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { className: string; label: string }> = {
    rush: {
      className: "bg-[var(--nimmit-error)]/10 text-[var(--nimmit-error)] border-[var(--nimmit-error)]/20",
      label: "Rush",
    },
    express: {
      className: "bg-[var(--nimmit-warning-bg)] text-[var(--nimmit-warning)] border-[var(--nimmit-warning)]/20",
      label: "Express",
    },
  };

  const { className, label } = config[priority] || { className: "", label: priority };

  return (
    <Badge
      variant="outline"
      className={`px-2 py-0.5 text-xs font-medium border rounded-full ${className}`}
    >
      {label}
    </Badge>
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
