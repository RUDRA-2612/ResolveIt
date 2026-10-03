<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { fade, scale, slide } from "svelte/transition";
  import { beforeNavigate } from "$app/navigation";
  import { 
    Building2, BookOpen, Users, MoreHorizontal,
    Utensils, Droplets, MonitorPlay, Wifi, Book,
    AlertCircle, Clock, CheckSquare, Filter,
    ChevronLeft, X, MessageSquare, ShieldCheck, User, Layers, ShieldAlert, CheckCircle2, ChevronUp
  } from "lucide-svelte";

  let dept = $derived(page.url.searchParams.get("dept"));
  let sub = $derived(page.url.searchParams.get("sub"));
  let sortBy = $state('popular'); // 'popular' or 'recent'

  const departments = [
    { id: 'all', name: 'All Issues', icon: Layers, desc: 'Overview of all tickets', activeBg: 'bg-teal-600 border-teal-600 shadow-teal-600/30 ring-teal-600 text-white', iconBg: 'bg-teal-500 text-white' },
    { id: 'hostel', name: 'Hostel', icon: Building2, desc: 'Housing, mess, and laundry', activeBg: 'bg-emerald-600 border-emerald-600 shadow-emerald-600/30 ring-emerald-600 text-white', iconBg: 'bg-emerald-500 text-white' },
    { id: 'academics', name: 'Academics', icon: BookOpen, desc: 'Classrooms, labs, library', activeBg: 'bg-orange-500 border-orange-500 shadow-orange-500/30 ring-orange-500 text-white', iconBg: 'bg-orange-400 text-white' },
    { id: 'student_affairs', name: 'Student Affairs', icon: Users, desc: 'Clubs and welfare', activeBg: 'bg-amber-500 border-amber-500 shadow-amber-500/30 ring-amber-500 text-white', iconBg: 'bg-amber-400 text-white' },
    { id: 'others', name: 'Others', icon: MoreHorizontal, desc: 'Miscellaneous issues', activeBg: 'bg-cyan-600 border-cyan-600 shadow-cyan-600/30 ring-cyan-600 text-white', iconBg: 'bg-cyan-500 text-white' }
  ];

  const subDepartments: Record<string, any[]> = {
    hostel: [
      { id: 'building', name: 'Hostel Building', icon: Building2 },
      { id: 'mess', name: 'Mess', icon: Utensils },
      { id: 'laundry', name: 'Laundry', icon: Droplets }
    ],
    academics: [
      { id: 'classroom', name: 'Classrooms', icon: MonitorPlay },
      { id: 'it', name: 'IT & WiFi', icon: Wifi },
      { id: 'library', name: 'Library', icon: Book }
    ],
    student_affairs: [
      { id: 'events', name: 'Events', icon: Users },
      { id: 'sports', name: 'Sports', icon: BookOpen }
    ],
    others: [
      { id: 'general', name: 'General', icon: MoreHorizontal }
    ]
  };

  // Mock tickets (Expanded for better filtering logic)
  let mockTickets = $state([
    { id: 'TKT-108', dept: 'hostel', sub: 'building', title: 'AC completely dead in Room 302', time: '10 mins ago', status: 'pending', upvotes: 24, reporter: 'Rahul Sharma', desc: 'The AC is completely dead since yesterday. We have tried everything but it won\'t turn on.' },
    { id: 'TKT-107', dept: 'academics', sub: 'it', title: 'Wi-Fi not working in LRC 1st Floor', time: '1 hour ago', status: 'pending', upvotes: 45, reporter: 'Aditi Verma', desc: 'None of the students can connect to the JKLU-Student network in the library.' },
    { id: 'TKT-106', dept: 'hostel', sub: 'mess', title: 'Stale paneer served in dinner', time: '3 hours ago', status: 'acknowledged', upvotes: 89, reporter: 'Vikram Singh', desc: 'Multiple students complained of stomach ache after eating the paneer.' },
    { id: 'TKT-105', dept: 'hostel', sub: 'building', title: 'Water leakage in Washroom', time: '5 hours ago', status: 'acknowledged', upvotes: 5, reporter: 'Amit Patel', desc: 'Continuous leakage from the third sink in the ground floor washroom.' },
    { id: 'TKT-104', dept: 'academics', sub: 'classroom', title: 'Projector cable broken in EB-201', time: '1 day ago', status: 'resolved', upvotes: 12, reporter: 'Sneha Gupta', desc: 'The HDMI cable is completely mangled.' },
  ]);

  let filteredTickets = $derived.by(() => {
    let t = [...mockTickets];
    if (dept && dept !== 'all') {
      t = t.filter(ticket => ticket.dept === dept);
    }
    if (sub) {
      t = t.filter(ticket => ticket.sub === sub);
    }
    
    if (sortBy === 'popular') {
      return t.sort((a, b) => b.upvotes - a.upvotes);
    } else {
      // For 'recent', mock data is already somewhat chronological, 
      // but we can ensure it's sorted by ID descending as a proxy for newest
      return t.sort((a, b) => b.id.localeCompare(a.id)); 
    }
  });

  let selectedTicket: any = $state(null);
  let editStatus: string = $state("");

  beforeNavigate(({ cancel }) => {
    if (selectedTicket) {
      cancel();
      closeTicketModal();
    }
  });

  function selectDept(id: string) {
    if (id === 'all') goto('/authority');
    else goto(`/authority?dept=${id}`);
  }

  function selectSub(id: string) {
    if (sub === id) {
      goto(`/authority?dept=${dept}`); // Toggle off
    } else {
      goto(`/authority?dept=${dept}&sub=${id}`);
    }
  }

  function openTicketModal(ticket: any) {
    goto(`/authority/ticket/${ticket.id}`);
  }

  function closeTicketModal() {
    if (typeof window !== 'undefined' && window.history.state?.modal) {
      window.history.back();
    } else {
      selectedTicket = null;
    }
  }

  function handlePopState() {
    selectedTicket = null;
  }

  function updateStatus() {
    const index = mockTickets.findIndex(t => t.id === selectedTicket.id);
    if (index !== -1) {
      mockTickets[index].status = editStatus;
    }
    closeTicketModal();
  }

</script>

<svelte:window onpopstate={handlePopState} />

<!-- Main Container with subtle gradient background to avoid dullness -->
<div class="min-h-full bg-gradient-to-br from-slate-50 via-[#f4f9f8] to-teal-50/30">
  <div class="p-4 md:p-8 max-w-6xl mx-auto flex flex-col w-full animate-in fade-in duration-500">
    
    <!-- Animated Header Title (Always on Home Page) -->
    <div class="text-center mt-6 mb-12">
      <p class="text-slate-500 font-semibold mb-2 text-sm uppercase tracking-widest">Authority Command Center</p>
      <div class="inline-block resolveit-wrapper">
        <h1 class="text-5xl md:text-7xl font-black mb-3 tracking-tighter cursor-default inline-block resolveit-wave">
          {#each 'ResolveIt'.split('') as char, i}
            <span class="resolveit-char" style="--delay: {i * 0.08}s">{char}</span>
          {/each}
        </h1>
      </div>
      <p class="text-slate-600 font-medium">Manage, track, and resolve campus issues dynamically.</p>
    </div>

    <!-- Departments Grid (Visible Everywhere as a Top Navigation) -->
    <div class="mb-10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-slate-800">Departments</h2>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {#each departments as d}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div 
            onclick={() => selectDept(d.id)} 
            class="relative rounded-2xl p-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group border shadow-sm {dept === d.id || (!dept && d.id === 'all') ? `ring-2 ring-offset-2 ${d.activeBg}` : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-md'}"
          >
            <div class="flex flex-col items-center text-center">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300 {dept === d.id || (!dept && d.id === 'all') ? d.iconBg : 'bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700'}">
                <d.icon size={24} />
              </div>
              <h3 class="font-bold text-sm {dept === d.id || (!dept && d.id === 'all') ? 'text-white' : 'text-slate-800'}">{d.name}</h3>
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Sub-Categories Pill Filter (If a specific dept is selected) -->
    {#if dept && dept !== 'all' && subDepartments[dept]}
      <div class="mb-8" transition:slide={{duration: 300}}>
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-bold text-slate-500 uppercase tracking-wider mr-2">Filter by:</span>
          {#each subDepartments[dept] as s}
            <button 
              onclick={() => selectSub(s.id)}
              class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm {sub === s.id ? 'bg-slate-800 text-white shadow-slate-800/30 ring-2 ring-slate-800 ring-offset-2' : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50'}"
            >
              <s.icon size={16} />
              {s.name}
            </button>
          {/each}
          {#if sub}
            <button onclick={() => selectSub(sub)} class="text-xs font-bold text-red-500 hover:text-red-700 ml-2 underline underline-offset-2">Clear Filter</button>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Dynamic Ticket Feed -->
    <div class="flex-1 flex flex-col" in:fade={{ duration: 200, delay: 100 }}>
      <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">
            {#if !dept || dept === 'all'}
              Campus Issues
            {:else}
              {departments.find(d => d.id === dept)?.name} Queue
            {/if}
          </h2>
          <p class="text-slate-500 font-medium">Viewing {filteredTickets.length} active tickets.</p>
        </div>

        <!-- Sort Toggle (Recent / Popular) -->
        <div class="flex bg-slate-200/50 p-1 rounded-xl shadow-inner shrink-0 self-start sm:self-auto">
          <button 
            onclick={() => sortBy = 'recent'} 
            class="px-4 py-2 text-sm font-bold rounded-lg transition-all {sortBy === 'recent' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
          >
            Recent
          </button>
          <button 
            onclick={() => sortBy = 'popular'} 
            class="px-4 py-2 text-sm font-bold rounded-lg transition-all {sortBy === 'popular' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
          >
            Popular
          </button>
        </div>
      </div>

      <!-- Ticket List (Card based like Student UI but with Manage Buttons) -->
      <div class="space-y-4">
        {#if filteredTickets.length === 0}
          <div class="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm">
            <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <CheckCircle2 size={40} />
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">All Caught Up!</h3>
            <p class="text-slate-500">No issues found in this category.</p>
          </div>
        {/if}

        {#each filteredTickets as ticket}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div onclick={() => openTicketModal(ticket)} class="bg-white/90 backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/60 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 group cursor-pointer flex flex-col sm:flex-row gap-4 md:gap-6 relative overflow-hidden">
            
            <!-- Upvote Left -->
            <div class="hidden sm:flex flex-col items-center gap-1 min-w-[50px] justify-center bg-slate-50 rounded-xl p-2 border border-slate-100">
              <ChevronUp size={28} class="text-orange-500 drop-shadow-sm" strokeWidth={3}/>
              <span class="font-black text-slate-800 text-lg">{ticket.upvotes}</span>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-2">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">{ticket.id}</span>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{departments.find(d => d.id === ticket.dept)?.name}</span>
                  </div>
                  <h4 class="font-black text-slate-800 text-lg md:text-xl group-hover:text-teal-700 transition-colors leading-tight">{ticket.title}</h4>
                </div>
                
                <div class="shrink-0 flex items-center gap-3">
                  {#if ticket.status === 'pending'}
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-200 shadow-sm"><ShieldAlert size={14} /> Critical / Pending</span>
                  {:else if ticket.status === 'acknowledged'}
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 shadow-sm"><Clock size={14} /> In Progress</span>
                  {:else}
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"><CheckSquare size={14} /> Resolved</span>
                  {/if}
                </div>
              </div>

              <p class="text-slate-600 text-sm line-clamp-2 mt-2 leading-relaxed">{ticket.desc}</p>
              
              <div class="flex items-center justify-between mt-4">
                <div class="flex items-center gap-3 text-xs font-semibold text-slate-500">
                  <span class="flex items-center gap-1"><User size={14} class="text-slate-400" /> {ticket.reporter}</span>
                  <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span class="flex items-center gap-1"><Clock size={14} class="text-slate-400" /> {ticket.time}</span>
                </div>
                
                <button class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-800/20 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  Manage Ticket
                </button>
              </div>
            </div>
            
            <!-- Mobile Upvotes -->
            <div class="sm:hidden flex items-center gap-2 mt-2 pt-3 border-t border-slate-100">
              <ChevronUp size={20} class="text-orange-500"/>
              <span class="font-black text-slate-800">{ticket.upvotes} Upvotes</span>
            </div>

          </div>
        {/each}
      </div>
    </div>
  </div>
</div>



<style>
  .resolveit-char {
    display: inline-block;
    color: #0f766e;
    animation: pulse-shine 3s ease-in-out infinite;
    animation-delay: var(--delay);
  }

  .resolveit-wrapper:hover .resolveit-char {
    animation: stylish-wave 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    animation-delay: var(--delay);
  }

  @keyframes pulse-shine {
    0%, 100% {
      color: #0f766e;
      text-shadow: 1px 1px 2px rgba(15, 118, 110, 0.2);
    }
    50% {
      color: #2dd4bf;
      text-shadow: 0px 0px 15px rgba(45, 212, 191, 0.6), -1px -1px 2px rgba(255,255,255,0.9);
    }
  }

  @keyframes stylish-wave {
    0% {
      transform: translateY(0) scale(1) rotate(0deg);
      color: #0f766e;
    }
    40% {
      transform: translateY(-15px) scale(1.1) rotate(-3deg);
      color: #14b8a6;
      text-shadow: 0px 8px 15px rgba(20, 184, 166, 0.4);
    }
    100% {
      transform: translateY(0) scale(1) rotate(0deg);
      color: #0f766e;
    }
  }
</style>
