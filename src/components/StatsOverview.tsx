import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import type { Issue } from "./IssueCard";

interface StatsOverviewProps {
  issues: Issue[];
}

export const StatsOverview = ({ issues }: StatsOverviewProps) => {
  const pendingCount = issues.filter(issue => issue.status === "pending").length;
  const inProgressCount = issues.filter(issue => issue.status === "in-progress").length;
  const resolvedCount = issues.filter(issue => issue.status === "resolved").length;
  const highPriorityCount = issues.filter(issue => issue.priority === "high").length;

  const stats = [
    {
      title: "Pending Issues",
      value: pendingCount,
      icon: AlertTriangle,
      color: "text-warning"
    },
    {
      title: "In Progress",
      value: inProgressCount,
      icon: Clock,
      color: "text-primary"
    },
    {
      title: "Resolved",
      value: resolvedCount,
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "High Priority",
      value: highPriorityCount,
      icon: TrendingUp,
      color: "text-destructive"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};