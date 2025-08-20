import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "resolved";
  submitted_by: string;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface NewIssue {
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  submitted_by: string;
  unit: string;
}

export const useIssues = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('issues')
        .select(`
          id,
          title,
          description,
          priority,
          status,
          created_at,
          updated_at,
          profiles!submitted_by(full_name),
          units!unit_id(unit_number),
          issue_categories!category_id(name)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to match the expected format
      const transformedData: Issue[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.issue_categories?.name || 'Other',
        priority: item.priority,
        status: item.status,
        submitted_by: item.profiles?.full_name || 'Unknown',
        unit: item.units?.unit_number || 'N/A',
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setIssues(transformedData);
    } catch (err: any) {
      console.error('Error fetching issues:', err);
      setError(err.message || 'Failed to fetch issues');
      toast({
        title: "Error",
        description: "Failed to load issues. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (newIssue: NewIssue) => {
    try {
      // For now, we'll create a simplified issue without all the foreign key relationships
      // This will work even without authentication for demo purposes
      const { data, error: insertError } = await supabase
        .from('issues')
        .insert([{
          title: newIssue.title,
          description: newIssue.description,
          priority: newIssue.priority,
          status: 'pending' as const,
          // We'll use placeholder values for now since we don't have auth/full relationships set up
          submitted_by: null, // This would normally be auth.uid()
          category_id: null, // This would be looked up from issue_categories
          unit_id: null, // This would be looked up from units
          building_id: null, // This would be set based on user's building
        }])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Add the new issue to local state with the format expected by the UI
      const newIssueFormatted: Issue = {
        id: data.id,
        title: data.title,
        description: data.description,
        category: newIssue.category,
        priority: data.priority,
        status: data.status,
        submitted_by: newIssue.submitted_by,
        unit: newIssue.unit,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setIssues(prev => [newIssueFormatted, ...prev]);

      toast({
        title: "Success",
        description: "Issue created successfully!",
      });

      return data;
    } catch (err: any) {
      console.error('Error creating issue:', err);
      toast({
        title: "Error", 
        description: "Failed to create issue. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateIssueStatus = async (issueId: string, status: "pending" | "in-progress" | "resolved") => {
    try {
      const { error: updateError } = await supabase
        .from('issues')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', issueId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setIssues(prev => prev.map(issue => 
        issue.id === issueId 
          ? { ...issue, status, updated_at: new Date().toISOString() }
          : issue
      ));

      toast({
        title: "Success",
        description: "Issue status updated successfully!",
      });
    } catch (err: any) {
      console.error('Error updating issue status:', err);
      toast({
        title: "Error",
        description: "Failed to update issue status. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  return {
    issues,
    loading,
    error,
    createIssue,
    updateIssueStatus,
    refetch: fetchIssues,
  };
};