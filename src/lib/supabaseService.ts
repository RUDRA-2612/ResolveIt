import { supabase } from './supabase';
import type { Issue, IssueComment } from '../types/issue';

const DEFAULT_USER_ID = 'a1111111-1111-1111-1111-111111111111'; // Fallback mock student

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
export async function fetchAllTickets(currentUserId: string = DEFAULT_USER_ID): Promise<Issue[]> {
    try {
        const { data, error } = await supabase
            .from('ticket')
            .select(`
        *,
        department (id, name),
        category (id, name),
        upvote (user_id),
        ticket_update (*)
      `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase query error:', error.message, error.details);
            return [];
        }

        if (!data) return [];

        return data.map((row) => mapRowToIssue(row, currentUserId));
    } catch (err) {
        console.error('Failed to connect to Supabase:', err);
        return [];
    }
}

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
export async function submitNewTicket(formData: {
    departmentName: string;
    categoryName?: string;
    specificIssue?: string;
    title: string;
    building?: string;
    exactLocation: string;
    description: string;
    isConfidential?: boolean;
    imageUrl?: string | null;
    userId?: string;
    assignedAuthority: string;
}) {
    const userId = formData.userId || DEFAULT_USER_ID;

    // Resolve Department ID
    const { data: deptData } = await supabase
        .from('department')
        .select('id')
        .eq('name', formData.departmentName)
        .single();

    const departmentId = deptData?.id || 2;

    // Resolve Category ID
    let categoryId: number | null = null;
    if (formData.categoryName) {
        const { data: catData } = await supabase
            .from('category')
            .select('id')
            .eq('department_id', departmentId)
            .eq('name', formData.categoryName)
            .single();
        categoryId = catData?.id || null;
    }

    const { data, error } = await supabase
        .from('ticket')
        .insert([
            {
                user_id: userId,
                department_id: departmentId,
                category_id: categoryId,
                specific_issue: formData.specificIssue || 'General Issue',
                title: formData.title,
                description: formData.description,
                building: formData.building,
                exact_location: formData.exactLocation,
                image_url: formData.imageUrl || null,
                is_confidential: formData.isConfidential || false,
                assigned_authority: formData.assignedAuthority,
                status: 'Not Started',
                status_color: 'rose',
                current_level: 1,
            },
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** 4. Toggle Upvote */
export async function toggleUpvoteRecord(ticketCode: string, currentlyLiked: boolean, userId: string = DEFAULT_USER_ID) {
    const numericId = parseInt(ticketCode.replace('TKT-', ''), 10);
    if (isNaN(numericId)) return;

    if (currentlyLiked) {
        await supabase.from('upvote').delete().match({ ticket_id: numericId, user_id: userId });
    } else {
        await supabase.from('upvote').insert([{ ticket_id: numericId, user_id: userId }]);
    }
}

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
export async function postCommentToDb(
    ticketCode: string,
    authorName: string,
    content: string,
    userId: string = DEFAULT_USER_ID
) {
    const numericId = parseInt(ticketCode.replace('TKT-', ''), 10);

    await supabase.from('ticket_update').insert([
        {
            ticket_id: numericId,
            user_id: userId,
            author_name: authorName,
            content,
            update_type: 'comment',
        },
    ]);
}