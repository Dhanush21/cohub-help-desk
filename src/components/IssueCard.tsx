import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "resolved";
  submittedBy: string;
  submittedAt: Date;
  unit?: string;
};

interface IssueCardProps {
  issue: Issue;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "destructive";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "secondary";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "resolved":
      return <CheckCircle className="h-4 w-4" />;
    case "in-progress":
      return <Clock className="h-4 w-4" />;
    case "pending":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};

export const IssueCard = ({ issue }: IssueCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(issue.status)}
            <h3 className="font-semibold text-sm">{issue.title}</h3>
          </div>
          <Badge variant={getPriorityColor(issue.priority) as any}>
            {issue.priority}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {issue.submittedBy}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {issue.submittedAt.toLocaleDateString()}
          </div>
          {issue.unit && <span>Unit {issue.unit}</span>}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
        <div className="flex items-center justify-between">
          <Badge variant="outline">{issue.category}</Badge>
          <Badge 
            variant={issue.status === "resolved" ? "default" : "secondary"}
            className="capitalize"
          >
            {issue.status.replace("-", " ")}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};