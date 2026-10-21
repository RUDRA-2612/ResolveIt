export type UserRole = 'student' | 'authority';
export type IssueSourceView = 'dashboard' | 'authority-dashboard' | 'recent-reported';
export type IssueSortMode = 'Top' | 'New';

export interface IssueComment {
    author: string;
    time: string;
    text: string;
}

export interface IssueNotification {
    id: number;
    title: string;
    message: string;
    time: string;
    timestamp?: string;
    isRead?: boolean;
    unread?: boolean;
}

export interface Issue {
    id: string;
    title: string;
    location: string;
    description: string;
    upvotes: number;
    status: 'Not Started' | 'Seen' | 'In Progress' | 'Solved';
    statusColor: 'emerald' | 'blue' | 'amber' | 'rose';
    time: string;
    department: string;
    category: string;
    specificIssue: string;
    imageUrl?: string;
    isLiked: boolean;
    isMine: boolean;
    currentLevel: number;
    assignedAuthority: string;
    isEscalated: boolean;
    escalatedFrom?: string;
    escalationReason?: string;
    slaTimer?: string;
    isOverdue?: boolean;
    resolvedAt?: string;
    comments: IssueComment[];
}

export interface DuplicateCheckInput {
    department: string;
    category?: string;
    specificIssue?: string;
    building?: string;
    title?: string;
}