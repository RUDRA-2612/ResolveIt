import { supabase } from './supabase';
import type { Issue, IssueComment } from '../types/issue';

/** Helper to convert raw database row into UI Issue model */
export function formatSupabaseTicket(row: any, currentUserId?: string): Issue {
    const upvotesCount = row.upvote ? row.upvote.length : 0;
    const isLikedByUser = currentUserId && row.upvote
        ? row.upvote.some((u: any) => u.user_id === currentUserId)
        : false;

    const comments: IssueComment[] = (row.ticket_update || []).map((u: any) => ({
        author: u.author_name,
        time: new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        isLiked: isLikedByUser,
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

/** Fetch all tickets from Supabase */
export async function fetchTicketsFromSupabase(currentUserId?: string): Promise<Issue[]> {
    const { data, error } = await supabase
        .from('ticket')
        .select(`
      *,
      department (name),
      category (name),
      upvote (user_id),
      ticket_update (*)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tickets:', error);
        return [];
    }

    return (data || []).map((row) => formatSupabaseTicket(row, currentUserId));
}

/** Upload base64/dataURL camera capture to Supabase Storage bucket */
export async function uploadCameraEvidence(dataUrl: string, ticketCode: string): Promise<string | null> {
    try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const fileName = `evidence_${ticketCode}_${Date.now()}.jpg`;

        const { data, error } = await supabase.storage
            .from('evidence')
            .upload(fileName, blob, { contentType: 'image/jpeg' });

        if (error) {
            console.error('Image upload failed:', error);
            return null;
        }

        const { data: publicUrlData } = supabase.storage.from('evidence').getPublicUrl(data.path);
        return publicUrlData.publicUrl;
    } catch (err) {
        console.error('Error uploading image:', err);
        return null;
    }
}

/** Insert new ticket into Supabase */
export async function createSupabaseTicket(ticketData: {
    userId: string;
    departmentId: number;
    categoryId?: number;
    specificIssue?: string;
    title: string;
    description: string;
    building?: string;
    exactLocation: string;
    imageUrl?: string;
    isConfidential?: boolean;
    assignedAuthority: string;
}) {
    const { data, error } = await supabase
        .from('ticket')
        .insert([
            {
                user_id: ticketData.userId,
                department_id: ticketData.departmentId,
                category_id: ticketData.categoryId,
                specific_issue: ticketData.specificIssue,
                title: ticketData.title,
                description: ticketData.description,
                building: ticketData.building,
                exact_location: ticketData.exactLocation,
                image_url: ticketData.imageUrl,
                is_confidential: ticketData.isConfidential || false,
                assigned_authority: ticketData.assignedAuthority,
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

/** Toggle upvote record */
export async function toggleSupabaseUpvote(ticketNumericId: number, userId: string, currentlyLiked: boolean) {
    if (currentlyLiked) {
        await supabase
            .from('upvote')
            .delete()
            .match({ ticket_id: ticketNumericId, user_id: userId });
    } else {
        await supabase
            .from('upvote')
            .insert([{ ticket_id: ticketNumericId, user_id: userId }]);
    }
}

/** Add comment or update record */
export async function postTicketUpdate(
    ticketNumericId: number,
    userId: string,
    authorName: string,
    content: string,
    updateType: 'comment' | 'acknowledgement' | 'official_update' | 'escalation' | 'resolution' = 'comment'
) {
    const { data, error } = await supabase
        .from('ticket_update')
        .insert([
            {
                ticket_id: ticketNumericId,
                user_id: userId,
                author_name: authorName,
                content,
                update_type: updateType,
            },
        ]);

    if (error) console.error('Error posting update:', error);
    return data;
}