-- ==========================================
-- 1. SEED DEPARTMENTS
-- ==========================================
insert into public.department (id, name, description) values
(1, 'Hostel, Mess & Laundry', 'Hostel accommodations, dining hall food quality, cleanliness, and laundry services'),
(2, 'Campus Infrastructure & IT', 'Network connectivity, classroom AV equipment, electrical utilities, and building maintenance'),
(3, 'Academics & Examination', 'Course scheduling, exam seating, marksheet queries, and faculty coordination'),
(4, 'Sports & Student Life', 'Gym facilities, sports grounds, club events, and recreational spaces'),
(5, 'Health & Wellness', 'Medical center, ambulance dispatch, first aid, and student counseling')
on conflict (name) do nothing;

-- Ensure auto-increment sequences start after inserted IDs
select setval(pg_get_serial_sequence('department', 'id'), coalesce(max(id), 1)) from public.department;

-- ==========================================
-- 2. SEED CATEGORIES
-- ==========================================
insert into public.category (department_id, name) values
-- Hostel, Mess & Laundry (Dept 1)
(1, 'Mess Food & Menu'),
(1, 'Hostel Room Maintenance'),
(1, 'Electrical & Utilities'),
(1, 'Laundry Services'),

-- Campus Infrastructure & IT (Dept 2)
(2, 'IT, Internet & Digital Services'),
(2, 'Academic Buildings & Classrooms'),
(2, 'Campus Lighting & Public Areas'),
(2, 'Water & Sanitation'),

-- Academics & Examination (Dept 3)
(3, 'Examination & Timetable'),
(3, 'Grade Sheets & Certificates'),

-- Sports & Student Life (Dept 4)
(4, 'Gym & Fitness Equipment'),
(4, 'Sports Ground Maintenance'),

-- Health & Wellness (Dept 5)
(5, 'Medical Center & Pharmacy')
on conflict (department_id, name) do nothing;

-- ==========================================
-- 3. SEED DUMMY USERS (Auth + App User Sync)
-- ==========================================
-- Fixed UUIDs for test users
do $$
declare
    student_uuid uuid := 'a1111111-1111-1111-1111-111111111111';
    authority_uuid uuid := 'b2222222-2222-2222-2222-222222222222';
begin
    -- Seed Auth Users
    insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
    values
    (student_uuid, '00000000-0000-0000-0000-000000000000', 'hritvikavashistha@jklu.edu.in', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"full_name": "Hritvika Vashistha"}', 'authenticated', 'authenticated', now(), now()),
    (authority_uuid, '00000000-0000-0000-0000-000000000000', 'rohit@jklu.edu.in', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"full_name": "Rohit Sir"}', 'authenticated', 'authenticated', now(), now())
    on conflict (id) do nothing;

    -- Seed App Users
    insert into public.app_user (id, name, email) values
    (student_uuid, 'Hritvika Vashistha', 'hritvikavashistha@jklu.edu.in'),
    (authority_uuid, 'Rohit Sir', 'rohit@jklu.edu.in')
    on conflict (id) do nothing;

    -- Map User Roles
    insert into public.user_role (user_id, role_id)
    select student_uuid, id from public.role where name = 'student'
    on conflict do nothing;

    insert into public.user_role (user_id, role_id)
    select authority_uuid, id from public.role where name = 'authority'
    on conflict do nothing;

    -- Map User Department for Authority
    insert into public.user_department (user_id, department_id) values
    (authority_uuid, 2) -- Campus Infrastructure & IT
    on conflict do nothing;
end $$;

-- ==========================================
-- 4. SEED TICKETS
-- ==========================================
insert into public.ticket (
    id, user_id, department_id, category_id, specific_issue, title, description, 
    building, exact_location, image_url, status, status_color, current_level, 
    assigned_authority, is_escalated, escalated_from, escalation_reason, 
    sla_due_at, resolved_at, created_at
) values
(
    142, 
    'a1111111-1111-1111-1111-111111111111', 
    1, 1, 'Poor Food Hygiene', 
    'Mess food quality issue today', 
    'The food quality in the main mess was severely degraded today. Several students reported finding insects and the food tasted stale.',
    'Mess Building', 'Main Dining Hall', 
    'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&q=80&w=800',
    'Solved', 'emerald', 2, 'Head Warden', true, 'L1: Warden', 'Recurring quality complaints',
    now() - interval '1 day', now() - interval '4 hours', now() - interval '1 day'
),
(
    134, 
    'a1111111-1111-1111-1111-111111111111', 
    2, 5, 'Campus Wi-Fi Not Working', 
    'Wi-Fi completely down in Library', 
    'No one is able to connect to the Wi-Fi on the first floor of the library. It has been down since morning and is severely affecting study schedules.',
    'LRC / Library', 'Floor 1 Reading Room', 
    'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&q=80&w=800',
    'In Progress', 'blue', 1, 'Maintenance Supervisor', false, null, null,
    now() + interval '2 hours', null, now() - interval '4 hours'
),
(
    129, 
    'a1111111-1111-1111-1111-111111111111', 
    1, 3, 'AC / Cooler Issue', 
    'AC not working in Room 302', 
    'The air conditioner in Room 302 of Hostel A is completely non-functional. Water is leaking from the unit and making the floor wet.',
    'BH1 (Boys Hostel 1)', 'Room 302', 
    'https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&q=80&w=800',
    'Not Started', 'rose', 1, 'Warden', false, null, null,
    now() - interval '14 hours', null, now() - interval '2 hours'
),
(
    128, 
    'a1111111-1111-1111-1111-111111111111', 
    2, 6, 'Projector Not Working', 
    'Broken projector in EB1 Classroom 4', 
    'The projector is not turning on and the HDMI cable seems to be physically damaged.',
    'EB1 Academic Building', 'Classroom 4', 
    'https://images.unsplash.com/photo-1585507851613-2df79612ba8a?auto=format&fit=crop&q=80&w=800',
    'Seen', 'amber', 1, 'Maintenance Supervisor', false, null, null,
    now() + interval '5 hours', null, now() - interval '1 hour'
)
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('ticket', 'id'), coalesce(max(id), 143)) from public.ticket;

-- ==========================================
-- 5. SEED INITIAL UPVOTES & COMMENTS
-- ==========================================
insert into public.upvote (user_id, ticket_id) values
('a1111111-1111-1111-1111-111111111111', 134)
on conflict do nothing;

insert into public.ticket_update (ticket_id, user_id, author_name, content, update_type) values
(142, 'b2222222-2222-2222-2222-222222222222', 'Head Warden (Official Update)', 'Mess supervisor inspected the kitchen and food vendor was issued a penalty warning. New hygienic batch prepared.', 'official_update'),
(134, 'b2222222-2222-2222-2222-222222222222', 'Maintenance Supervisor', 'Network technician dispatched to inspect the LRC Floor 1 access points.', 'acknowledgement')
on conflict do nothing;