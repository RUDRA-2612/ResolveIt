import { useCallback, useEffect, useRef, useState } from 'react';
import type { Issue } from '../types/issue';

/**
 * Owns the issue collection and common immutable updates.
 * Pass the existing seed data from data/mockIssues.ts into this hook.
 */
export function useIssues(initialIssues: Issue[]) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const issuesRef = useRef(issues);

  useEffect(() => {
    issuesRef.current = issues;
  }, [issues]);

  const findIssue = useCallback((id: string) => {
    return issuesRef.current.find((issue) => issue.id === id);
  }, []);

  const addIssue = useCallback((issue: Issue) => {
    setIssues((current) => [issue, ...current]);
  }, []);

  const updateIssue = useCallback(
    (id: string, update: (issue: Issue) => Issue) => {
      setIssues((current) =>
        current.map((issue) => (issue.id === id ? update(issue) : issue)),
      );
    },
    [],
  );

  const removeIssue = useCallback((id: string) => {
    setIssues((current) => current.filter((issue) => issue.id !== id));
  }, []);

  return {
    issues,
    setIssues,
    issuesRef,
    findIssue,
    addIssue,
    updateIssue,
    removeIssue,
  };
}
