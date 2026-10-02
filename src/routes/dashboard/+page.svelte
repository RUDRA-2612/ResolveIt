<script lang="ts">
  import { PlusCircle, MapPin, Clock, CheckCircle2, AlertCircle, X, ChevronUp, MessageSquare, ThumbsUp } from 'lucide-svelte';
  import { searchStore } from '../../lib/store.svelte';
  import { beforeNavigate } from '$app/navigation';
  import { fade, scale } from 'svelte/transition';

  const tickets = [
    { id: 'TKT-104', title: 'AC not working in Room 302', category: 'Maintenance', location: 'Hostel A', time: '2 hours ago', status: 'pending', votes: 12, desc: 'The AC is completely dead since yesterday. We have tried everything but it won\'t turn on.' },
    { id: 'TKT-103', title: 'Wi-Fi completely down in Library', category: 'IT', location: 'Library', time: '4 hours ago', status: 'acknowledged', votes: 45, desc: 'No one is able to connect to the Wi-Fi on the first floor of the library.' },
    { id: 'TKT-102', title: 'Mess food quality issue today', category: 'Food', location: 'Main Mess', time: '1 day ago', status: 'resolved', votes: 89, desc: 'The paneer served today was extremely oily and stale. Multiple students reported stomach aches.' },
  ];

  let currentFilter = $state('Top');
  let selectedTicket: any = $state(null);

  beforeNavigate(({ cancel }) => {
    if (selectedTicket) {
      cancel();
      closeTicketModal();
    }
  });

  function openTicketModal(ticket: any) {
    if (typeof window !== 'undefined') window.history.pushState({ modal: true }, '');
    selectedTicket = ticket;
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

  let filteredTickets = $derived(
    tickets
      .filter(t => 
        t.title.toLowerCase().includes(searchStore.query.toLowerCase()) || 
        t.location.toLowerCase().includes(searchStore.query.toLowerCase())
      )
      .sort((a, b) => {
        if (currentFilter === 'Top') {
          return b.votes - a.votes;
        } else {
          // Sort chronologically by ID for 'New' (TKT-104 > TKT-103)
          return b.id.localeCompare(a.id);
        }
      })
  );
</script>

<svelte:window onpopstate={handlePopState} />

<main class="max-w-4xl mx-auto w-full px-4 mt-8 pb-12 animate-in fade-in duration-500">
  
  <!-- Website Header Title -->
  <div class="text-center mt-12 mb-16">
    <p class="text-slate-500 font-medium mb-2 text-lg">Welcome to</p>
    <div class="inline-block resolveit-wrapper">
      <h1 class="text-6xl md:text-8xl font-black mb-3 tracking-tighter cursor-default inline-block resolveit-wave">
        {#each 'ResolveIt'.split('') as char, i}
          <span class="resolveit-char" style="--delay: {i * 0.08}s">{char}</span>
        {/each}
      </h1>
    </div>
    <p class="text-slate-500 italic text-sm font-medium">Built by the students, for the students.</p>
  </div>

  <!-- Hero / Primary Action -->
  <div class="max-w-2xl mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 text-center mb-16 relative overflow-hidden">
    <div class="absolute -right-10 -top-10 w-32 h-32 bg-orange-50 rounded-full mix-blend-multiply opacity-50 z-0"></div>
    
    <div class="relative z-10">
      <h2 class="text-xl md:text-2xl font-bold text-slate-800 mb-2">Facing an Issue?</h2>
      <p class="text-slate-500 mb-6 max-w-sm mx-auto text-sm md:text-base">Report problems across the campus quickly and track them until they are resolved.</p>
      
      <a href="/dashboard/report" class="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300">
        <PlusCircle size={20} class="group-hover:rotate-90 transition-transform duration-300" />
        <span>Report a Problem</span>
      </a>
    </div>
  </div>

  <!-- Feed Section -->
  <div class="flex items-center justify-between mb-6">
    <h3 class="text-xl font-bold text-slate-800">
      {searchStore.query ? `Search Results for "${searchStore.query}"` : 'Recent Campus Issues'}
    </h3>
    
    <!-- Filter/Sort -->
    <div class="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
      <button 
        onclick={() => currentFilter = 'Top'}
        class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors {currentFilter === 'Top' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800'}"
      >
        Top
      </button>
      <button 
        onclick={() => currentFilter = 'New'}
        class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors {currentFilter === 'New' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800'}"
      >
        New
      </button>
    </div>
  </div>

  <!-- Ticket List -->
  <div class="space-y-4">
    {#if filteredTickets.length === 0}
      <div class="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <p class="text-slate-500">No issues found matching your search.</p>
      </div>
    {/if}

    {#each filteredTickets as ticket}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div onclick={() => openTicketModal(ticket)} class="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all group cursor-pointer flex gap-4 md:gap-6">
        
        <!-- Upvote -->
        <div class="flex flex-col items-center gap-1 min-w-[40px]">
          <button onclick={(e) => { e.stopPropagation(); ticket.votes++; }} class="text-slate-400 hover:text-orange-500 p-1 transition-colors">
            <ChevronUp size={24} strokeWidth={2.5}/>
          </button>
          <span class="font-semibold text-slate-700 text-sm">{ticket.votes}</span>
        </div>

        <!-- Ticket Content -->
        <div class="flex-1 min-w-0">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
            <h4 class="font-bold text-slate-800 text-lg group-hover:text-teal-600 transition-colors truncate pr-4">{ticket.title}</h4>
            
            <div class="shrink-0">
              {#if ticket.status === 'pending'}
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 whitespace-nowrap"><AlertCircle size={14} /> Pending</span>
              {:else if ticket.status === 'acknowledged'}
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap"><Clock size={14} /> In Progress</span>
              {:else}
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap"><CheckCircle2 size={14} /> Resolved</span>
              {/if}
            </div>
          </div>

          <!-- Meta info -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
            <span class="inline-flex items-center gap-1.5 font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"><div class="w-1.5 h-1.5 rounded-full bg-slate-400"></div>{ticket.category}</span>
            <span class="inline-flex items-center gap-1"><MapPin size={14} class="text-slate-400" />{ticket.location}</span>
            <span class="inline-flex items-center gap-1"><Clock size={14} class="text-slate-400" />{ticket.time}</span>
          </div>
        </div>

      </div>
    {/each}
  </div>
</main>

<style>
  .resolveit-char {
    display: inline-block;
    color: #0f766e; /* Base Teal color */
    animation: pulse-shine 3s ease-in-out infinite;
    animation-delay: var(--delay);
  }

  .resolveit-wrapper:hover .resolveit-char {
    /* Play the wave animation exactly ONCE on hover */
    animation: stylish-wave 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    animation-delay: var(--delay);
  }

  @keyframes pulse-shine {
    0%, 100% {
      color: #0f766e;
      text-shadow: 1px 1px 2px rgba(15, 118, 110, 0.2);
    }
    50% {
      color: #2dd4bf; /* Bright, shiny Teal */
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
      color: #14b8a6; /* Darker, readable teal peak */
      text-shadow: 0px 8px 15px rgba(20, 184, 166, 0.4);
    }
    100% {
      transform: translateY(0) scale(1) rotate(0deg);
      color: #0f766e;
    }
  }
</style>

<!-- Ticket Details Modal -->
{#if selectedTicket}
  <div class="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" transition:fade={{duration: 200}} onclick={closeTicketModal}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" transition:scale={{start: 0.95, duration: 200}} onclick={(e) => e.stopPropagation()}>
      
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div class="flex items-center gap-3">
          <span class="text-sm font-bold text-teal-700 bg-teal-100 px-3 py-1 rounded-full">{selectedTicket.id}</span>
          {#if selectedTicket.status === 'pending'}
            <span class="text-sm font-semibold text-red-600 flex items-center gap-1"><AlertCircle size={16}/> Pending</span>
          {:else if selectedTicket.status === 'acknowledged'}
            <span class="text-sm font-semibold text-blue-600 flex items-center gap-1"><Clock size={16}/> In Progress</span>
          {:else}
            <span class="text-sm font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={16}/> Resolved</span>
          {/if}
        </div>
        <button type="button" onclick={closeTicketModal} class="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto flex-1">
        <h2 class="text-2xl font-bold text-slate-800 mb-4">{selectedTicket.title}</h2>
        
        <div class="flex flex-wrap gap-4 mb-6 text-sm text-slate-600">
          <div class="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg font-medium"><MapPin size={16} class="text-teal-600"/> {selectedTicket.location}</div>
          <div class="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg font-medium"><Clock size={16} class="text-teal-600"/> Reported {selectedTicket.time}</div>
        </div>

        <div class="mb-8">
          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
          <p class="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {selectedTicket.desc}
          </p>
        </div>

        <div class="flex items-center gap-4 pt-4 border-t border-slate-100">
          <button onclick={() => selectedTicket.votes++} class="flex items-center gap-2 px-6 py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-xl transition-colors">
            <ThumbsUp size={20} /> Upvote ({selectedTicket.votes})
          </button>
          <button class="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
            <MessageSquare size={20} /> Add Comment
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
