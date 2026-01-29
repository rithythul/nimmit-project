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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type SkillLevel = "junior" | "mid" | "senior";

const skillLevelLabels: Record<SkillLevel, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
};

const skillLevelColors: Record<SkillLevel, string> = {
  junior: "bg-blue-100 text-blue-800",
  mid: "bg-yellow-100 text-yellow-800",
  senior: "bg-green-100 text-green-800",
};

interface WorkerData {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  workerProfile?: {
    skills?: string[];
    skillLevels?: Record<string, SkillLevel>;
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
  const [editingWorker, setEditingWorker] = useState<WorkerData | null>(null);
  const [editingSkillLevels, setEditingSkillLevels] = useState<Record<string, SkillLevel>>({});
  const [savingSkills, setSavingSkills] = useState(false);

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

  function openSkillLevelEditor(worker: WorkerData) {
    const skillLevels: Record<string, SkillLevel> = {};
    worker.workerProfile?.skills?.forEach((skill) => {
      skillLevels[skill] = worker.workerProfile?.skillLevels?.[skill] || "mid";
    });
    setEditingSkillLevels(skillLevels);
    setEditingWorker(worker);
  }

  async function saveSkillLevels() {
    if (!editingWorker) return;

    setSavingSkills(true);
    try {
      const response = await fetch(`/api/users/${editingWorker._id}/skills`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillLevels: editingSkillLevels }),
      });

      const data = await response.json();
      if (data.success) {
        setWorkers((prev) =>
          prev.map((w) =>
            w._id === editingWorker._id
              ? {
                  ...w,
                  workerProfile: {
                    ...w.workerProfile,
                    skillLevels: editingSkillLevels,
                  },
                }
              : w
          )
        );
        toast.success("Skill levels updated");
        setEditingWorker(null);
      } else {
        toast.error(data.error?.message || "Failed to update skill levels");
      }
    } catch (error) {
      console.error("Failed to update skill levels:", error);
      toast.error("Failed to update skill levels");
    } finally {
      setSavingSkills(false);
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
                      <div className="flex flex-wrap gap-1 items-center">
                        {worker.workerProfile?.skills?.slice(0, 3).map((skill) => {
                          const level = worker.workerProfile?.skillLevels?.[skill] || "mid";
                          return (
                            <Badge
                              key={skill}
                              className={`text-xs ${skillLevelColors[level]}`}
                              title={`${skill} - ${skillLevelLabels[level]}`}
                            >
                              {skill}
                            </Badge>
                          );
                        })}
                        {(worker.workerProfile?.skills?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(worker.workerProfile?.skills?.length || 0) - 3}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => openSkillLevelEditor(worker)}
                        >
                          Edit
                        </Button>
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

      {/* Skill Level Editor Dialog */}
      <Dialog open={!!editingWorker} onOpenChange={() => setEditingWorker(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit Skill Levels - {editingWorker?.profile.firstName}{" "}
              {editingWorker?.profile.lastName}
            </DialogTitle>
            <DialogDescription>
              Set the proficiency level for each skill
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingWorker?.workerProfile?.skills?.map((skill) => (
              <div key={skill} className="flex items-center justify-between gap-4">
                <span className="font-medium">{skill}</span>
                <Select
                  value={editingSkillLevels[skill] || "mid"}
                  onValueChange={(value) =>
                    setEditingSkillLevels((prev) => ({
                      ...prev,
                      [skill]: value as SkillLevel,
                    }))
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Junior
                      </span>
                    </SelectItem>
                    <SelectItem value="mid">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        Mid
                      </span>
                    </SelectItem>
                    <SelectItem value="senior">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Senior
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingWorker(null)}>
              Cancel
            </Button>
            <Button onClick={saveSkillLevels} disabled={savingSkills}>
              {savingSkills ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
