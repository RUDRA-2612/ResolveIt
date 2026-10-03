<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { ArrowLeft, User, ShieldCheck, ShieldAlert, Clock, CheckSquare, AlertCircle } from "lucide-svelte";
  
  // In a real app, you would fetch the ticket using page.params.id
  let ticketId = $derived(page.params.id);
  
  // Mock data for this specific ticket
  let ticket = $state({
    id: ticketId,
    dept: 'Hostel',
    title: 'AC completely dead in Room 302',
    time: '10 mins ago',
    status: 'pending',
    reporter: 'Rahul Sharma',
    desc: 'The AC is completely dead since yesterday. We have tried everything but it won\'t turn on. The summer heat makes it impossible to study or sleep in the room.'
  });

  let editStatus = $state(ticket.status);

  function goBack() {
    window.history.back();
  }

  function updateStatus() {
    ticket.status = editStatus;
    // Real app would send API request here
    alert("Ticket " + ticket.id + " updated successfully to " + editStatus.toUpperCase() + "!");
    goto('/authority');
  }
</script>

<div class="min-h-full bg-slate-50 flex flex-col">
  
  <!-- Header Bar -->
  <div class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
    <div class="flex items-center gap-4">
      <button onclick={goBack} class="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
        <ArrowLeft size={24} />
      </button>
      <div class="h-6 w-px bg-slate-200"></div>
      <span class="text-sm font-black text-white bg-teal-600 px-3 py-1 rounded-lg shadow-sm">{ticket.id}</span>
      <span class="text-sm font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">{ticket.dept}</span>
    </div>
    
    <div>
      {#if ticket.status === 'pending'}
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-200"><ShieldAlert size={14} /> Not Started</span>
      {:else if ticket.status === 'acknowledged'}
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200"><Clock size={14} /> In Progress</span>
      {:else}
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200"><CheckSquare size={14} /> Resolved</span>
      {/if}
    </div>
  </div>

  <div class="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column: Details (Takes up 2/3 of space on large screens) -->
      <div class="lg:col-span-2 space-y-8">
        
        <div>
          <h1 class="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight mb-6">{ticket.title}</h1>
          
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Problem Description</h3>
            <p class="text-slate-700 leading-relaxed text-lg font-medium">{ticket.desc}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Reported By</h3>
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <User size={28} />
              </div>
              <div>
                <p class="font-black text-slate-800 text-xl">{ticket.reporter}</p>
                <p class="text-sm font-semibold text-slate-500">Student • {ticket.time}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Evidences Attached</h3>
             <!-- Placeholder for photo evidence from student -->
             <div class="w-full h-32 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 flex-col gap-2 cursor-pointer hover:bg-slate-200 transition-colors">
               <AlertCircle size={24} />
               <span class="text-sm font-semibold">View Live Photo</span>
             </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Action Pane -->
      <div class="lg:col-span-1">
        <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-24">
          <h3 class="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><ShieldCheck size={24} class="text-teal-600"/> Ticket Action Pane</h3>
          
          <div class="mb-8">
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Update Status</label>
            <div class="space-y-4">
              
              <!-- Pending Option -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div 
                onclick={() => editStatus = 'pending'}
                class="flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all {editStatus === 'pending' ? 'border-red-500 bg-red-50 shadow-lg shadow-red-500/10' : 'border-slate-100 hover:border-slate-300 bg-white'}"
              >
                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center {editStatus === 'pending' ? 'border-red-500 bg-red-500' : 'border-slate-300'}">
                  {#if editStatus === 'pending'}<div class="w-2.5 h-2.5 bg-white rounded-full"></div>{/if}
                </div>
                <div class="flex items-center gap-3">
                  <ShieldAlert size={22} class={editStatus === 'pending' ? 'text-red-600' : 'text-slate-400'}/>
                  <span class="text-base font-bold {editStatus === 'pending' ? 'text-red-700' : 'text-slate-600'}">Not Started</span>
                </div>
              </div>

              <!-- In Progress Option -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div 
                onclick={() => editStatus = 'acknowledged'}
                class="flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all {editStatus === 'acknowledged' ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10' : 'border-slate-100 hover:border-slate-300 bg-white'}"
              >
                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center {editStatus === 'acknowledged' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}">
                   {#if editStatus === 'acknowledged'}<div class="w-2.5 h-2.5 bg-white rounded-full"></div>{/if}
                </div>
                <div class="flex items-center gap-3">
                  <Clock size={22} class={editStatus === 'acknowledged' ? 'text-blue-600' : 'text-slate-400'}/>
                  <span class="text-base font-bold {editStatus === 'acknowledged' ? 'text-blue-700' : 'text-slate-600'}">In Progress</span>
                </div>
              </div>

              <!-- Resolved Option -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div 
                onclick={() => editStatus = 'resolved'}
                class="flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all {editStatus === 'resolved' ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10' : 'border-slate-100 hover:border-slate-300 bg-white'}"
              >
                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center {editStatus === 'resolved' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}">
                   {#if editStatus === 'resolved'}<div class="w-2.5 h-2.5 bg-white rounded-full"></div>{/if}
                </div>
                <div class="flex items-center gap-3">
                  <CheckSquare size={22} class={editStatus === 'resolved' ? 'text-emerald-600' : 'text-slate-400'}/>
                  <span class="text-base font-bold {editStatus === 'resolved' ? 'text-emerald-700' : 'text-slate-600'}">Resolved</span>
                </div>
              </div>

            </div>
          </div>

          <div class="mb-8">
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Add Official Remark</label>
            <textarea 
              rows="4" 
              placeholder="E.g., Electrician dispatched..." 
              class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none font-medium"
            ></textarea>
          </div>

          <button 
            onclick={updateStatus}
            class="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-lg shadow-teal-600/30 transition-all hover:-translate-y-1 flex justify-center items-center gap-2 text-lg"
          >
            Save & Publish
          </button>
        </div>
      </div>

    </div>
  </div>
</div>
