import { BriefingChat } from "@/components/chat/briefing-chat";

export default function BriefPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Briefing Room</h1>
        <p className="text-muted-foreground mt-1">
          Tell us what you need and we'll take care of the rest.
        </p>
      </div>
      <BriefingChat />
    </div>
  );
}
