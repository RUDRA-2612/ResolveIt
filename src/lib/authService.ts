import { type Session, type User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export const ALLOWED_DOMAIN = "jklu.edu.in";

export const isValidInstitutionEmail = (email: string): boolean => {
    if (!email || !email.includes('@'))
        return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return domain === ALLOWED_DOMAIN;
}

export const isValidInstitutionalEmail = (email: string): boolean => {
    if (!email || !email.includes('@')) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return domain === ALLOWED_DOMAIN;
};

// Explicit Student-Only Profile Sync
export const syncUserProfileAsStudent = async (authUser: User, fullNameInput?: string) => {
    const { id, email, user_metadata } = authUser;
    const fullName = fullNameInput || user_metadata?.full_name || email?.split('@')[0] || 'Student User';

    // 1. Insert or update app_user table
    await supabase.from('app_user').upsert(
        { id, email, name: fullName },
        { onConflict: 'id' }
    );

    // 2. Fetch 'student' role ID from public.role
    const { data: roleData } = await supabase
        .from('role')
        .select('id')
        .eq('name', 'student')
        .single();

    // 3. Force-assign 'student' role in user_role
    if (roleData) {
        await supabase.from('user_role').upsert(
            { user_id: id, role_id: roleData.id },
            { onConflict: 'user_id,role_id' }
        );
    }
};

export const signInWithEmail = async (email: string, password?: string) => {
    if (!isValidInstitutionalEmail(email)) {
        throw new Error(`Access restricted. Only official @${ALLOWED_DOMAIN} email addresses are allowed.`);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
    if (error) throw error;
    return data;
};

export const signUpStudentWithEmail = async (email: string, password?: string, fullName?: string) => {
    if (!isValidInstitutionalEmail(email)) {
        throw new Error(`Access restricted. Only official @${ALLOWED_DOMAIN} email addresses are allowed.`);
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password: password || '',
        options: {
            data: {
                full_name: fullName,
                role: 'student' // Hardcoded metadata role
            },
        },
    });

    if (error) throw error;
    if (data.user) {
        await syncUserProfileAsStudent(data.user, fullName);
    }
    return data;
};

// Future microsoft thingy
export const signInWithMicrosoft = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
            scopes: 'email profile openid',
            redirectTo: window.location.origin,
        },
    });
    if (error) throw error;
    return data;
};

// Common Sign Out
export const signOutUser = async () => {
    await supabase.auth.signOut();
};

export const onAuthStateChange = (callback: (session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            if (!isValidInstitutionEmail(session.user.email || '')) {
                await signOutUser();
                callback(null);
                return;
            }
            await syncUserProfileAsStudent(session.user);
        }
        callback(session);
    });
};