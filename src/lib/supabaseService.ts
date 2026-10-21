import { supabase } from './supabase';
import type { Issue, IssueComment } from '../types/issue';

const DEFAULT_USER_ID = 'a1111111-1111-1111-1111-111111111111'; // Fallback mock student

const getCurrentUserId = async (): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
        throw new Error('Unauthenticated request!');
    return user.id;
}

/** Transforms raw database row to UI Issue structure */
export function mapRowToIssue(row: any, currentUserId: string = DEFAULT_USER_ID): Issue {
    const upvotesCount = Array.isArray(row.upvote) ? row.upvote.length : 0;
    const isLiked = Array.isArray(row.upvote)
        ? row.upvote.some((u: any) => u.user_id === currentUserId)
        : false;

    const comments: IssueComment[] = (row.ticket_update || []).map((u: any) => ({
        author: u.author_name || 'System Update',
        time: new Date(u.created_at).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' }),
        text: u.content,
    }));

    return {
        id: row.ticket_code || `TKT-${row.id}`,
        title: row.title,
        location: row.building ? `${row.building} - ${row.exact_location}` : row.exact_location,
        description: row.description,
        upvotes: upvotesCount,
        status: row.status,
        statusColor: row.status_color || 'rose',
        time: new Date(row.created_at).toLocaleDateString(),
        department: row.department?.name || 'Campus Infrastructure & IT',
        category: row.category?.name || 'General',
        specificIssue: row.specific_issue || 'General Issue',
        imageUrl: row.image_url || undefined,
        isLiked,
        isMine: row.user_id === currentUserId,
        currentLevel: row.current_level || 1,
        assignedAuthority: row.assigned_authority || 'Department Representative',
        isEscalated: row.is_escalated || false,
        escalatedFrom: row.escalated_from || undefined,
        escalationReason: row.escalation_reason || undefined,
        slaTimer: row.sla_due_at ? 'Active SLA' : undefined,
        isOverdue: row.sla_due_at ? new Date(row.sla_due_at) < new Date() : false,
        resolvedAt: row.resolved_at || undefined,
        comments,
    };
}

/** 1. Fetch All Tickets with joins */
export const fetchAllTickets = async (): Promise<Issue[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    const activeUserId = user?.id;

    const { data: rawTickets, error } = await supabase
        .from('ticket')
        .select(`
      *,
      department ( name ),
      category ( name ),
      upvote ( user_id ),
      ticket_update ( id, author_name, content, update_type, created_at )
    `)
        .order('created_at', { ascending: false });

    if (error || !rawTickets) return [];

    return rawTickets.map((t) => {
        const upvotesList = t.upvote || [];
        return {
            id: String(t.id),
            title: t.title,
            description: t.description,
            department: t.department?.name || 'General',
            category: t.category?.name || 'General',
            specificIssue: t.specific_issue,
            building: t.building,
            exactLocation: t.exact_location,
            imageUrl: t.image_url,
            time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: t.status || 'Not Started',
            statusColor: t.status_color || 'rose',
            currentLevel: t.current_level || 1,
            assignedAuthority: t.assigned_authority || 'Department Head',
            isEscalated: t.is_escalated || false,
            escalatedFrom: t.escalated_from,
            escalationReason: t.escalation_reason,
            slaDueAt: t.sla_due_at,
            upvotes: upvotesList.length,
            // Dynamic computation based on active logged-in user
            isMine: activeUserId ? t.user_id === activeUserId : false,
            isLiked: activeUserId ? upvotesList.some((u: any) => u.user_id === activeUserId) : false,
            updates: (t.ticket_update || []).map((u: any) => ({
                id: String(u.id),
                author: u.author_name,
                text: u.content,
                timestamp: new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: u.update_type,
            })),
        };
    });
};

/** 2. Upload Captured Camera Image to Supabase Storage */
export async function uploadEvidenceImage(base64Image: string): Promise<string | null> {
    try {
        const response = await fetch(base64Image);
        const blob = await response.blob();
        const filePath = `ticket_evidence_${Date.now()}.jpg`;

        const { data, error } = await supabase.storage
            .from('evidence')
            .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true });

        if (error) {
            console.error('Storage upload error:', error);
            return null;
        }

        const { data: publicUrlData } = supabase.storage.from('evidence').getPublicUrl(data.path);
        return publicUrlData.publicUrl;
    } catch (err) {
        console.error('Failed to process image upload:', err);
        return null;
    }
}

/** 3. Submit New Ticket */
export const submitNewTicket = async (payload: any) => {
    const userId = await getCurrentUserId();

    // Resolve Department & Category IDs
    const { data: dept } = await supabase.from('department').select('id').eq('name', payload.departmentName).single();
    const { data: cat } = await supabase.from('category').select('id').eq('name', payload.categoryName).single();

    const { data, error } = await supabase
        .from('ticket')
        .insert({
            user_id: userId,
            department_id: dept?.id || 1,
            category_id: cat?.id || 1,
            specific_issue: payload.specificIssue,
            title: payload.title,
            description: payload.description,
            building: payload.building,
            exact_location: payload.exactLocation,
            image_url: payload.imageUrl,
            assigned_authority: payload.assignedAuthority,
            status: 'Not Started',
            status_color: 'rose',
            current_level: 1,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/** 4. Toggle Upvote */
export const toggleUpvoteRecord = async (ticketId: string, currentlyLiked: boolean) => {
    const userId = await getCurrentUserId();
    const numericTicketId = parseInt(ticketId, 10);

    if (currentlyLiked) {
        await supabase.from('upvote').delete().eq('user_id', userId).eq('ticket_id', numericTicketId);
    } else {
        await supabase.from('upvote').insert({ user_id: userId, ticket_id: numericTicketId });
    }
};

/** 5. Acknowledge Ticket */
export async function acknowledgeTicketInDb(ticketCode: string, handlerTitle: string, userId: string = DEFAULT_USER_ID) {
    const numericId = parseInt(ticketCode.replace('TKT-', ''), 10);

    await supabase
        .from('ticket')
        .update({ status: 'In Progress', status_color: 'blue' })
        .eq('id', numericId);

    await supabase.from('ticket_update').insert([
        {
            ticket_id: numericId,
            user_id: userId,
            author_name: handlerTitle,
            content: `Ticket acknowledged by ${handlerTitle}. Investigation and remediation have commenced.`,
            update_type: 'acknowledgement',
            old_status: 'Not Started',
            new_status: 'In Progress',
        },
    ]);
}

/** 6. Escalate Ticket Level */
export async function escalateTicketInDb(
    ticketCode: string,
    nextLevel: number,
    nextTitle: string,
    prevTitle: string,
    reason: string,
    note?: string,
    userId: string = DEFAULT_USER_ID
) {
    const numericId = parseInt(ticketCode.replace('TKT-', ''), 10);

    await supabase
        .from('ticket')
        .update({
            current_level: nextLevel,
            assigned_authority: nextTitle,
            is_escalated: true,
            escalated_from: `L${nextLevel - 1}: ${prevTitle}`,
            escalation_reason: reason,
        })
        .eq('id', numericId);

    await supabase.from('ticket_update').insert([
        {
            ticket_id: numericId,
            user_id: userId,
            author_name: 'Hierarchy Escalation Engine',
            content: `Escalated to Level ${nextLevel} (${nextTitle}). Reason: ${reason}${note ? ` - Note: "${note}"` : ''}.`,
            update_type: 'escalation',
        },
    ]);
}

/** 7. Solve Ticket */
export async function solveTicketInDb(ticketCode: string, handlerTitle: string, userId: string = DEFAULT_USER_ID) {
    const numericId = parseInt(ticketCode.replace('TKT-', ''), 10);

    await supabase
        .from('ticket')
        .update({
            status: 'Solved',
            status_color: 'emerald',
            resolved_at: new Date().toISOString(),
        })
        .eq('id', numericId);

    await supabase.from('ticket_update').insert([
        {
            ticket_id: numericId,
            user_id: userId,
            author_name: `${handlerTitle} (Resolution)`,
            content: `Ticket marked as Solved and verified by ${handlerTitle}.`,
            update_type: 'resolution',
            old_status: 'In Progress',
            new_status: 'Solved',
        },
    ]);
}

/** 8. Add Public Comment or Official Update */
export const postCommentToDb = async (ticketId: string, authorName: string, content: string) => {
    const userId = await getCurrentUserId();
    await supabase.from('ticket_update').insert({
        ticket_id: parseInt(ticketId, 10),
        user_id: userId,
        author_name: authorName,
        content,
        update_type: 'official_update',
    });
};