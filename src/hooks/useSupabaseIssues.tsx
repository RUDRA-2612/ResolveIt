import { useState, useEffect, useCallback } from 'react';
import type { Issue } from '../types/issue';
import { fetchTicketsFromSupabase } from '../lib/supabaseIssues';
import { supabase } from '../lib/supabase';

export function useSupabaseIssues(currentUserId?: string) {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTickets = useCallback(async () => {
        setLoading(true);
        const data = await fetchTicketsFromSupabase(currentUserId);
        setIssues(data);
        setLoading(false);
    }, [currentUserId]);

    useEffect(() => {
        void loadTickets();

        // Subscribe to real-time changes on the ticket table
        const subscription = supabase
            .channel('public:ticket')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket' }, () => {
                void loadTickets();
            })
            .subscribe();

        return () => {
            void supabase.removeChannel(subscription);
        };
    }, [loadTickets]);

    return { issues, loading, refetch: loadTickets, setIssues };
}