import type {
    DuplicateCheckInput,
    Issue,
    IssueComment,
    IssueSortMode,
} from '../types/issue';

/** Converts the UI's relative-time labels to minutes for newest-first sorting. */
export function getIssueAgeMinutes(time: string): number {
    const value = Number.parseInt(time, 10);

    if (!Number.isFinite(value)) return 9_999;
    if (time.includes('min')) return value;
    if (time.includes('hour')) return value * 60;
    if (time.includes('day')) return value * 60 * 24;

    // Labels such as "Just now" are not parseable and fall back to 9,999,
    // matching the original UI's behaviour rather than silently changing it.
    return 9_999;
}

export interface FilterIssuesOptions {
    department?: string;
    searchQuery?: string;
}

/** Applies the same department and title/description search used by the feed. */
export function filterIssues(
    issues: readonly Issue[],
    { department = 'All Departments', searchQuery = '' }: FilterIssuesOptions = {},
): Issue[] {
    const query = searchQuery.trim().toLowerCase();

    return issues.filter((issue) => {
        const matchesDepartment =
            department === 'All Departments' ||
            issue.department === department ||
            (department.includes('Health') && issue.department.includes('Health'));

        const matchesQuery =
            query.length === 0 ||
            issue.title.toLowerCase().includes(query) ||
            issue.description.toLowerCase().includes(query);

        return matchesDepartment && matchesQuery;
    });
}

/** Returns a new array sorted according to the dashboard's selected tab. */
export function sortIssues(
    issues: readonly Issue[],
    mode: IssueSortMode,
): Issue[] {
    return [...issues].sort((a, b) => {
        if (mode === 'Top') return b.upvotes - a.upvotes;
        return getIssueAgeMinutes(a.time) - getIssueAgeMinutes(b.time);
    });
}

/** Finds the first existing issue matching the report form's duplicate rules. */
export function findDuplicateIssue(
    issues: readonly Issue[],
    input: DuplicateCheckInput,
): Issue | undefined {
    const specificIssue = input.specificIssue ?? '';
    const category = input.category ?? '';
    const building = input.building ?? '';
    const title = (input.title ?? '').trim();

    return issues.find((issue) =>
        issue.department === input.department &&
        (
            (specificIssue.length > 0 && issue.specificIssue === specificIssue) ||
            (
                category.length > 0 &&
                issue.category === category &&
                building.length > 0 &&
                issue.location.toLowerCase().includes(building.toLowerCase())
            ) ||
            (title.length > 3 && issue.title.toLowerCase().includes(title.toLowerCase()))
        ),
    );
}

/** Toggles the current user's upvote. Solved issues have voting closed. */
export function toggleIssueUpvote(issue: Issue): Issue {
    if (issue.status === 'Solved') return issue;

    const isLiked = !issue.isLiked;
    return {
        ...issue,
        isLiked,
        upvotes: issue.upvotes + (isLiked ? 1 : -1),
    };
}

/** Adds a comment without mutating the original issue or comments array. */
export function appendIssueComment(
    issue: Issue,
    comment: IssueComment,
): Issue {
    return {
        ...issue,
        comments: [...issue.comments, comment],
    };
}

/** Pure state transition for the authority's acknowledge action. */
export function acknowledgeIssue(
    issue: Issue,
    handlerTitle: string,
    time = 'Just now',
): Issue {
    const update: IssueComment = {
        author: handlerTitle,
        time,
        text: `Ticket acknowledged by ${handlerTitle}. Investigation and remediation have commenced.`,
    };

    return {
        ...issue,
        status: 'In Progress',
        statusColor: 'blue',
        comments: [...issue.comments, update],
    };
}

/** Pure state transition for the authority's solve action. */
export function solveIssue(
    issue: Issue,
    handlerTitle: string,
    time = 'Just now',
): Issue {
    const resolvedLog: IssueComment = {
        author: `${handlerTitle} (Resolution)`,
        time,
        text: `Ticket marked as Solved and verified by ${handlerTitle}.`,
    };

    return {
        ...issue,
        status: 'Solved',
        statusColor: 'emerald',
        isOverdue: false,
        slaTimer: 'Solved',
        resolvedAt: time,
        comments: [...issue.comments, resolvedLog],
    };
}
