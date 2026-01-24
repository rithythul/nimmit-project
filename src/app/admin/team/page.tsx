"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface WorkerData {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  workerProfile?: {
    skills?: string[];
    availability?: "available" | "busy" | "offline";
    currentJobCount?: number;
    maxConcurrentJobs?: number;
    stats?: {
      completedJobs?: number;
      avgRating?: number;
    };
  };
}

export default function AdminTeamPage() {
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkers();
  }, []);

  async function fetchWorkers() {
    try {
      const response = await fetch("/api/users?role=worker");
      const data = await response.json();
      if (data.success) {
        setWorkers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch workers:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }

  async function updateAvailability(
    workerId: string,
    availability: "available" | "busy" | "offline"
  ) {
    try {
      const response = await fetch(`/api/users/${workerId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      });

      const data = await response.json();
      if (data.success) {
        setWorkers((prev) =>
          prev.map((w) =>
            w._id === workerId
              ? {
                  ...w,
                  workerProfile: { ...w.workerProfile, availability },
                }
              : w
          )
        );
        toast.success("Availability updated");
      } else {
        toast.error(data.error?.message || "Failed to update availability");
      }
    } catch (error) {
      console.error("Failed to update availability:", error);
      toast.error("Failed to update availability");
    }
  }

  const availableCount = workers.filter(
    (w) => w.workerProfile?.availability === "available"
  ).length;
  const busyCount = workers.filter(
    (w) => w.workerProfile?.availability === "busy"
  ).length;
  const offlineCount = workers.filter(
    (w) => w.workerProfile?.availability === "offline"
  ).length;

  const totalCurrentJobs = workers.reduce(
    (sum, w) => sum + (w.workerProfile?.currentJobCount || 0),
    0
  );
  const totalCapacity = workers.reduce(
    (sum, w) => sum + (w.workerProfile?.maxConcurrentJobs || 3),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage your team&apos;s availability and workload
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Team Members</CardDescription>
            <CardTitle className="text-4xl">{workers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-green-500">
          <CardHeader className="pb-2">
            <CardDescription>Available</CardDescription>
            <CardTitle className="text-4xl text-green-600">
              {availableCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Busy</CardDescription>
            <CardTitle className="text-4xl text-yellow-600">{busyCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Offline</CardDescription>
            <CardTitle className="text-4xl text-gray-500">{offlineCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Workload</CardDescription>
            <CardTitle className="text-4xl">
              {totalCurrentJobs}/{totalCapacity}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Team Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            All registered workers and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : workers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No team members registered yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Workload</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker) => (
                  <TableRow key={worker._id}>
                    <TableCell className="font-medium">
                      {worker.profile.firstName} {worker.profile.lastName}
                    </TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {worker.workerProfile?.skills?.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {(worker.workerProfile?.skills?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(worker.workerProfile?.skills?.length || 0) - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          (worker.workerProfile?.currentJobCount || 0) >=
                          (worker.workerProfile?.maxConcurrentJobs || 3)
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {worker.workerProfile?.currentJobCount || 0}/
                        {worker.workerProfile?.maxConcurrentJobs || 3}
                      </span>
                    </TableCell>
                    <TableCell>
                      {worker.workerProfile?.stats?.completedJobs || 0}
                    </TableCell>
                    <TableCell>
                      {worker.workerProfile?.stats?.avgRating
                        ? `${worker.workerProfile.stats.avgRating.toFixed(1)} ⭐`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={worker.workerProfile?.availability || "offline"}
                        onValueChange={(value) =>
                          updateAvailability(
                            worker._id,
                            value as "available" | "busy" | "offline"
                          )
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-green-500" />
                              Available
                            </span>
                          </SelectItem>
                          <SelectItem value="busy">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-yellow-500" />
                              Busy
                            </span>
                          </SelectItem>
                          <SelectItem value="offline">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-gray-400" />
                              Offline
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
