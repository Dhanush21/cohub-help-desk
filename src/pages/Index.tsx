import { Header } from "@/components/Header";
import { IssueForm } from "@/components/IssueForm";
import { IssueCard } from "@/components/IssueCard";
import { StatsOverview } from "@/components/StatsOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIssues, type NewIssue } from "@/hooks/useIssues";

const Index = () => {
  const { issues, loading, error, createIssue } = useIssues();

  const handleNewIssue = async (newIssue: NewIssue) => {
    await createIssue(newIssue);
  };

  const filterIssuesByStatus = (status?: string) => {
    if (!status || status === "all") return issues;
    return issues.filter(issue => issue.status === status);
  };

  const pendingCount = issues.filter(issue => issue.status === "pending").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header pendingCount={0} />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading issues...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header pendingCount={0} />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-destructive">Error loading issues: {error}</p>
          </div>
        </main>
      </div>
    );
  }

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
        
        {issues.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No issues reported yet. Use the form above to report your first issue.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
