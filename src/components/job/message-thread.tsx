"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { JobMessage, UserRole } from "@/types";

interface MessageWithSender extends JobMessage {
  senderName?: string;
}

interface MessageThreadProps {
  messages: MessageWithSender[];
  currentUserId: string;
}

const roleColors: Record<UserRole, string> = {
  client: "bg-blue-100 text-blue-800",
  worker: "bg-green-100 text-green-800",
  admin: "bg-purple-100 text-purple-800",
};

function formatTimestamp(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto p-4">
      {messages.map((msg) => {
        const isOwn = msg.senderId.toString() === currentUserId;
        return (
          <div
            key={msg.id}
            className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">
                {getInitials(msg.senderName)}
              </AvatarFallback>
            </Avatar>
            <div
              className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">
                  {msg.senderName || "Unknown"}
                </span>
                <Badge variant="outline" className={`text-xs ${roleColors[msg.senderRole]}`}>
                  {msg.senderRole}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
              <div
                className={`rounded-2xl px-4 py-2 max-w-md ${
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
