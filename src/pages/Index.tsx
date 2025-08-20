import { useState } from "react";
import { Header } from "@/components/Header";
import { IssueForm } from "@/components/IssueForm";
import { IssueCard, type Issue } from "@/components/IssueCard";
import { StatsOverview } from "@/components/StatsOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data for demonstration
const sampleIssues: Issue[] = [
  {
    id: "1",
    title: "Broken washing machine in laundry room",
    description: "The washing machine in the ground floor laundry room is not working. It stops mid-cycle and displays error code E3.",
    category: "Maintenance",
    priority: "high",
    status: "pending",
    submittedBy: "Sarah Chen",
    submittedAt: new Date("2024-01-15"),
    unit: "A3"
  },
  {
    id: "2", 
    title: "WiFi connection issues in common area",
    description: "The WiFi in the main common area keeps disconnecting. Multiple residents have reported this issue.",
    category: "Utilities",
    priority: "medium",
    status: "in-progress",
    submittedBy: "Mike Johnson",
    submittedAt: new Date("2024-01-14"),
    unit: "B1"
  },
  {
    id: "3",
    title: "Kitchen refrigerator temperature too warm",
    description: "The shared kitchen refrigerator is not keeping food cold enough. Temperature seems to be around 50°F instead of the usual 37°F.",
    category: "Maintenance",
    priority: "medium",
    status: "resolved",
    submittedBy: "Emily Rodriguez",
    submittedAt: new Date("2024-01-12"),
    unit: "A1"
  }
];

const Index = () => {
  const [issues, setIssues] = useState<Issue[]>(sampleIssues);

  const handleNewIssue = (newIssue: Omit<Issue, "id" | "submittedAt" | "status">) => {
    const issue: Issue = {
      ...newIssue,
      id: Date.now().toString(),
      submittedAt: new Date(),
      status: "pending"
    };
    setIssues([issue, ...issues]);
  };

  const filterIssuesByStatus = (status?: string) => {
    if (!status || status === "all") return issues;
    return issues.filter(issue => issue.status === status);
  };

  const pendingCount = issues.filter(issue => issue.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <Header pendingCount={pendingCount} />
      
      <main className="container mx-auto px-4 py-6">
        <StatsOverview issues={issues} />
        
        <IssueForm onSubmit={handleNewIssue} />
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Issues</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 mt-6">
            {filterIssuesByStatus("all").map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4 mt-6">
            {filterIssuesByStatus("pending").map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </TabsContent>
          
          <TabsContent value="in-progress" className="space-y-4 mt-6">
            {filterIssuesByStatus("in-progress").map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </TabsContent>
          
          <TabsContent value="resolved" className="space-y-4 mt-6">
            {filterIssuesByStatus("resolved").map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </TabsContent>
        </Tabs>
        
        {issues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No issues reported yet. Use the form above to report your first issue.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
