"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { JobCategory, JobPriority } from "@/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  options?: { value: string; label: string }[];
}

type Step = "welcome" | "describe" | "category" | "priority" | "confirm";

const categoryLabels: Record<JobCategory, string> = {
  video: "Video Editing",
  design: "Graphic Design",
  web: "Web Development",
  social: "Social Media",
  admin: "Admin Tasks",
  other: "Other",
};

const priorityOptions = [
  { value: "standard", label: "Standard (48 hours)" },
  { value: "priority", label: "Priority (24 hours)" },
  { value: "rush", label: "Rush (12 hours)" },
];

export function BriefingChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm here to help capture your task. What do you need done today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("describe");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Collected data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<JobCategory | null>(null);
  const [priority, setPriority] = useState<JobPriority>("standard");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (msg: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: Date.now().toString() }]);
  };

  const detectCategory = (text: string): JobCategory | null => {
    const lower = text.toLowerCase();
    if (lower.includes("video") || lower.includes("edit") || lower.includes("youtube") || lower.includes("footage"))
      return "video";
    if (lower.includes("design") || lower.includes("logo") || lower.includes("graphic") || lower.includes("banner"))
      return "design";
    if (lower.includes("web") || lower.includes("site") || lower.includes("page") || lower.includes("landing"))
      return "web";
    if (lower.includes("social") || lower.includes("instagram") || lower.includes("twitter") || lower.includes("post"))
      return "social";
    if (lower.includes("data") || lower.includes("spreadsheet") || lower.includes("research") || lower.includes("admin"))
      return "admin";
    return null;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    addMessage({ role: "user", content: userMessage });
    setInput("");

    if (step === "describe") {
      // Extract title from first sentence/line
      const firstLine = userMessage.split(/[.\n]/)[0].slice(0, 100);
      setTitle(firstLine);
      setDescription(userMessage);

      const detected = detectCategory(userMessage);
      if (detected) {
        setCategory(detected);
        addMessage({
          role: "assistant",
          content: `Sounds like a **${categoryLabels[detected]}** task. Is that right?`,
          options: [
            { value: "yes", label: "Yes, that's right" },
            { value: "no", label: "No, let me pick" },
          ],
        });
        setStep("category");
      } else {
        addMessage({
          role: "assistant",
          content: "What type of task is this?",
          options: Object.entries(categoryLabels).map(([value, label]) => ({
            value,
            label,
          })),
        });
        setStep("category");
      }
    }
  };

  const handleOptionSelect = (value: string) => {
    if (step === "category") {
      if (value === "yes" && category) {
        addMessage({ role: "user", content: `Yes, it's ${categoryLabels[category]}` });
      } else if (value === "no") {
        addMessage({ role: "user", content: "Let me pick the category" });
        addMessage({
          role: "assistant",
          content: "What type of task is this?",
          options: Object.entries(categoryLabels).map(([v, label]) => ({
            value: v,
            label,
          })),
        });
        return;
      } else {
        setCategory(value as JobCategory);
        addMessage({ role: "user", content: categoryLabels[value as JobCategory] });
      }

      addMessage({
        role: "assistant",
        content: "When do you need this completed?",
        options: priorityOptions,
      });
      setStep("priority");
    } else if (step === "priority") {
      setPriority(value as JobPriority);
      const selected = priorityOptions.find((p) => p.value === value);
      addMessage({ role: "user", content: selected?.label || value });

      // Show confirmation
      const summary = `Here's what I captured:\n\n**Task:** ${title}\n**Category:** ${categoryLabels[category!]}\n**Priority:** ${selected?.label}\n\nReady to submit?`;
      addMessage({
        role: "assistant",
        content: summary,
        options: [
          { value: "submit", label: "Submit Task" },
          { value: "edit", label: "Start Over" },
        ],
      });
      setStep("confirm");
    } else if (step === "confirm") {
      if (value === "submit") {
        handleSubmit();
      } else {
        // Reset
        setMessages([
          {
            id: "1",
            role: "assistant",
            content:
              "No problem! Let's start fresh. What do you need done today?",
          },
        ]);
        setStep("describe");
        setTitle("");
        setDescription("");
        setCategory(null);
        setPriority("standard");
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    addMessage({ role: "user", content: "Submit my task" });
    addMessage({ role: "assistant", content: "Creating your task..." });

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to create task");
      }

      addMessage({
        role: "assistant",
        content: "Your task has been submitted! Redirecting...",
      });

      toast.success("Task created successfully!");

      setTimeout(() => {
        router.push(`/client/jobs/${result.data._id}`);
      }, 1000);
    } catch (error) {
      addMessage({
        role: "assistant",
        content: `Something went wrong: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-2xl mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              {msg.options && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.options.map((opt) => (
                    <Button
                      key={opt.value}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOptionSelect(opt.value)}
                      disabled={isSubmitting}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {step === "describe" && (
        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your task..."
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isSubmitting}>
              Send
            </Button>
          </form>
        </div>
      )}

      {/* Step indicator */}
      <div className="border-t p-2 flex justify-center gap-2">
        {(["describe", "category", "priority", "confirm"] as Step[]).map((s, i) => (
          <Badge
            key={s}
            variant={step === s ? "default" : "outline"}
            className="text-xs"
          >
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </Badge>
        ))}
      </div>
    </div>
  );
}
