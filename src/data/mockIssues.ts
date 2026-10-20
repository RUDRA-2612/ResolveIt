// src/data/mockIssues.ts
import type { Issue } from '../types/issue';

export const INITIAL_ISSUES: Issue[] = [
    {
        id: 'TKT-142',
        title: 'Mess food quality issue today',
        location: 'Mess Building',
        description: 'The food quality in the main mess was severely degraded today. Several students reported finding insects and the food tasted stale.',
        upvotes: 89,
        status: 'Solved',
        statusColor: 'emerald',
        time: '1 day ago',
        department: 'Hostel, Mess & Laundry',
        category: 'Mess Food & Menu',
        specificIssue: 'Poor Food Hygiene',
        imageUrl: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&q=80&w=800',
        isLiked: false,
        isMine: true,
        currentLevel: 2,
        assignedAuthority: 'Head Warden',
        isEscalated: true,
        escalatedFrom: 'L1: Warden',
        escalationReason: 'Recurring quality complaints',
        slaTimer: 'Solved in 18h',
        isOverdue: false,
        resolvedAt: 'Yesterday, 4:00 PM',
        comments: [
            {
                author: 'Head Warden (Official Update)',
                time: '1 day ago',
                text: 'Mess supervisor inspected the kitchen and food vendor was issued a penalty warning. New hygienic batch prepared.'
            }
        ]
    },
    {
        id: 'TKT-134',
        title: 'Wi-Fi completely down in Library',
        location: 'LRC / Library',
        description: 'No one is able to connect to the Wi-Fi on the first floor of the library. It has been down since morning and is severely affecting study schedules.',
        upvotes: 45,
        status: 'In Progress',
        statusColor: 'blue',
        time: '4 hours ago',
        department: 'Campus Infrastructure & IT',
        category: 'IT, Internet & Digital Services',
        specificIssue: 'Campus Wi-Fi Not Working',
        imageUrl: 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&q=80&w=800',
        isLiked: true,
        isMine: false,
        currentLevel: 1,
        assignedAuthority: 'Maintenance Supervisor',
        isEscalated: false,
        slaTimer: '2h remaining',
        isOverdue: false,
        comments: [
            {
                author: 'Maintenance Supervisor',
                time: '2 hours ago',
                text: 'Network technician dispatched to inspect the LRC Floor 1 access points.'
            }
        ]
    },
    {
        id: 'TKT-129',
        title: 'AC not working in Room 302',
        location: 'BH1 (Boys Hostel 1)',
        description: 'The air conditioner in Room 302 of Hostel A is completely non-functional. Water is leaking from the unit and making the floor wet.',
        upvotes: 12,
        status: 'Not Started',
        statusColor: 'rose',
        time: '2 hours ago',
        department: 'Hostel, Mess & Laundry',
        category: 'Electrical & Utilities',
        specificIssue: 'AC / Cooler Issue',
        imageUrl: 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&q=80&w=800',
        isLiked: false,
        isMine: true,
        currentLevel: 1,
        assignedAuthority: 'Warden',
        isEscalated: false,
        slaTimer: 'Overdue by 14h',
        isOverdue: true,
        comments: []
    },
    {
        id: 'TKT-128',
        title: 'Broken projector in EB1 Classroom 4',
        location: 'EB1 Academic Building',
        description: 'The projector is not turning on and the HDMI cable seems to be physically damaged.',
        upvotes: 8,
        status: 'Seen',
        statusColor: 'amber',
        time: '1 hour ago',
        department: 'Campus Infrastructure & IT',
        category: 'Academic Buildings & Classrooms',
        specificIssue: 'Projector Not Working',
        imageUrl: 'https://images.unsplash.com/photo-1585507851613-2df79612ba8a?auto=format&fit=crop&q=80&w=800',
        isLiked: false,
        isMine: true,
        currentLevel: 1,
        assignedAuthority: 'Maintenance Supervisor',
        isEscalated: false,
        slaTimer: '5h remaining',
        isOverdue: false,
        comments: []
    }
];