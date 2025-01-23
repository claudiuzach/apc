import EventEditor from "@/components/events/editor/EventEditor";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventFeed from "../EventFeed";

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <EventEditor />
        <Tabs defaultValue="for-you">
          <EventFeed/>
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}
