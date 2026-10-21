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
        id: String(row.ticket_code || row.id || 'TKT-unknown'),
        title: row.title,
        location: row.building ? `${row.building} - ${row.exact_location || 'Campus location'}` : (row.exact_location || 'Campus location'),
        description: row.description,
        upvotes: upvotesCount,
        status: row.status || 'Not Started',
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
export const fetchAllTickets = async (activeUserId: string): Promise<Issue[]> => {
    const { data: rawTickets, error } = await supabase
        .from('ticket')
        .select(`
      id, user_id, title, building, exact_location, description, status, status_color,
      created_at, current_level, assigned_authority, is_escalated, escalated_from,
      escalation_reason, sla_due_at, image_url, specific_issue,
      department ( name ),
      category ( name ),
      upvote ( user_id ),
      ticket_update ( id, author_name, content, update_type, created_at, app_user ( name, email ) )
    `)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Could not fetch reports: ${error.message}`);
    if (!rawTickets) return [];

    return rawTickets.map((t) => {
        const upvotesList = Array.isArray(t.upvote) ? t.upvote : [];
        const comments = (t.ticket_update || []).map((u: any) => {
            const profile = u.app_user?.[0];
            const profileName = profile?.name || profile?.email?.split('@')[0];
            const savedAuthor = u.author_name?.trim();
            const author = !savedAuthor || savedAuthor === 'Student' || savedAuthor === 'Authority Representative'
                ? profileName || savedAuthor || 'System Update'
                : savedAuthor;

            return {
                author,
                time: new Date(u.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit' }),
                text: u.content,
            };
        });

        return {
            id: String(t.id),
            title: t.title,
            location: t.building ? `${t.building} - ${t.exact_location || 'Campus location'}` : (t.exact_location || 'Campus location'),
            description: t.description,
            upvotes: upvotesList.length,
            status: t.status || 'Not Started',
            statusColor: t.status_color || 'rose',
            time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            department: t.department?.[0]?.name || 'General',
            category: t.category?.[0]?.name || 'General',
            specificIssue: t.specific_issue || 'General Issue',
            imageUrl: t.image_url || undefined,
            isLiked: activeUserId ? upvotesList.some((u: any) => u.user_id === activeUserId) : false,
            isMine: activeUserId ? t.user_id === activeUserId : false,
            currentLevel: t.current_level || 1,
            assignedAuthority: t.assigned_authority || 'Department Head',
            isEscalated: t.is_escalated || false,
            escalatedFrom: t.escalated_from || undefined,
            escalationReason: t.escalation_reason || undefined,
            slaTimer: t.sla_due_at ? 'Active SLA' : undefined,
            isOverdue: t.sla_due_at ? new Date(t.sla_due_at) < new Date() : false,
            comments,
        };
    });
};
/** 2. Upload Captured Camera Image to Supabase Storage */
export async function uploadEvidenceImage(dataUrl: string): Promise<string> {
    const userId = await getCurrentUserId();
    const response = await fetch(dataUrl);
    if (!response.ok) {
        throw new Error(`Could not read captured image (HTTP ${response.status}).`);
    }

    const blob = await response.blob();
    if (blob.size === 0 || !blob.type.startsWith('image/')) {
        throw new Error('The captured evidence is empty or is not a valid image.');
    }

    const filePath = `${userId}/${crypto.randomUUID()}.jpg`;
    const { data, error } = await supabase.storage
        .from('evidence')
        .upload(filePath, blob, { contentType: blob.type, upsert: false });

    if (error) {
        throw new Error(`Evidence upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from('evidence').getPublicUrl(data.path);
    if (!publicUrlData.publicUrl) {
        throw new Error('Evidence uploaded, but Supabase did not return a public URL.');
    }
    return publicUrlData.publicUrl;
}

/** 3. Submit New Ticket */
export const submitNewTicket = async (payload: any) => {
    const userId = await getCurrentUserId();

    const departmentAliases: Record<string, string> = {
        'Hostel, Mess & Laundry': payload.categoryName?.startsWith('Mess ')
            ? 'Mess & Dining Services'
            : 'Hostel & Residential Services',
        'Academics & Library': payload.categoryName === 'Library Services'
            ? 'Library & Resource Center'
            : 'Academic & Exam Cell',
        'Student Life & Sports': 'Sports & Student Activities',
        'Health, Well-being & Safety': 'Health & Wellness',
    };
    const departmentName = departmentAliases[payload.departmentName] || payload.departmentName;

    let { data: dept, error: departmentError } = await supabase
        .from('department')
        .select('id')
        .eq('name', departmentName)
        .maybeSingle();

    if (departmentError) throw departmentError;
    if (!dept) {
        const { data, error } = await supabase
            .from('department')
            .insert({ name: departmentName })
            .select('id')
            .single();

        if (error) throw new Error(`Could not resolve department "${payload.departmentName}": ${error.message}`);
        dept = data;
    }

    let { data: cat, error: categoryError } = await supabase
        .from('category')
        .select('id')
        .eq('department_id', dept.id)
        .eq('name', payload.categoryName)
        .limit(1)
        .maybeSingle();

    if (categoryError) throw categoryError;
    if (!cat) {
        const { data, error } = await supabase
            .from('category')
            .insert({ department_id: dept.id, name: payload.categoryName })
            .select('id')
            .single();

        if (error) throw new Error(`Could not resolve category "${payload.categoryName}": ${error.message}`);
        cat = data;
    }

    const { data, error } = await supabase
        .from('ticket')
        .insert({
            user_id: userId,
            department_id: dept.id,
            category_id: cat.id,
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

export const deleteTicketInDb = async (ticketId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthenticated');

    const numericTicketId = parseInt(ticketId, 10);
    if (!Number.isSafeInteger(numericTicketId) || numericTicketId <= 0) {
        throw new Error('Invalid ticket ID.');
    }

    // Verify ownership before touching either the ticket or its evidence.
    const { data: ticket, error: fetchError } = await supabase
        .from('ticket')
        .select('image_url, user_id')
        .eq('id', numericTicketId)
        .single();

    if (fetchError) throw fetchError;
    if (!ticket || ticket.user_id !== user.id) {
        throw new Error('Only the person who posted this issue can delete it.');
    }

    // Remove the owner's evidence file if it exists.
    if (ticket.image_url) {
        try {
            const urlParts = ticket.image_url.split('/evidence/');
            if (urlParts.length > 1) {
                const filePath = decodeURIComponent(urlParts[1]);
                await supabase.storage.from('evidence').remove([filePath]);
            }
        } catch (err) {
            console.warn('Could not remove storage attachment:', err);
        }
    }

    const { error } = await supabase
        .from('ticket')
        .delete()
        .eq('id', numericTicketId)
        .eq('user_id', user.id);

    if (error) throw error;
};