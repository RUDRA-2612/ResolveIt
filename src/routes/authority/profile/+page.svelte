<script lang="ts">
  import { ShieldCheck, User, Mail, Building, Phone, Clock, ArrowLeft } from 'lucide-svelte';
  
  // Mock data for Authority Profile
  let profile = {
    name: 'Hostel Authority',
    department: 'Hostel Department',
    role: 'Chief Warden',
    email: 'hostel.authority@jklu.edu.in',
    phone: '+91 98765 43210',
    joined: 'August 2021',
    resolvedTickets: 432,
    activeTickets: 15
  };

  function goBack() {
    window.history.back();
  }
</script>

<div class="min-h-full bg-slate-50 flex flex-col items-center py-10 px-4">
  <div class="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
    
    <!-- Header Banner -->
    <div class="h-32 bg-gradient-to-r from-teal-600 to-emerald-600 w-full relative">
      <button onclick={goBack} class="absolute top-4 left-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors">
        <ArrowLeft size={24} />
      </button>
      <div class="absolute -bottom-12 left-8 p-1 bg-white rounded-2xl">
        <div class="w-24 h-24 bg-slate-800 rounded-xl flex items-center justify-center text-white text-3xl font-black border-4 border-white shadow-md">
          HA
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="pt-16 pb-8 px-8 flex flex-col md:flex-row gap-8">
      
      <div class="flex-1 space-y-6">
        <div>
          <h1 class="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            {profile.name}
            <ShieldCheck size={24} class="text-teal-600" />
          </h1>
          <p class="text-lg font-bold text-teal-700">{profile.role}</p>
        </div>

        <div class="space-y-4 pt-4 border-t border-slate-100">
          <div class="flex items-center gap-4 text-slate-600 font-medium">
            <div class="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Building size={20} />
            </div>
            <span>{profile.department}</span>
          </div>
          
          <div class="flex items-center gap-4 text-slate-600 font-medium">
            <div class="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <span>{profile.email}</span>
          </div>

          <div class="flex items-center gap-4 text-slate-600 font-medium">
            <div class="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Phone size={20} />
            </div>
            <span>{profile.phone}</span>
          </div>
          
          <div class="flex items-center gap-4 text-slate-600 font-medium">
            <div class="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <span>Joined {profile.joined}</span>
          </div>
        </div>
      </div>

      <!-- Stats Box -->
      <div class="w-full md:w-64 space-y-4">
        <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-teal-500/20 text-center">
          <p class="text-5xl font-black mb-1">{profile.resolvedTickets}</p>
          <p class="text-sm font-bold text-teal-100 uppercase tracking-widest">Issues Resolved</p>
        </div>
        <div class="bg-slate-100 rounded-2xl p-6 text-slate-800 text-center border border-slate-200">
          <p class="text-4xl font-black text-slate-800 mb-1">{profile.activeTickets}</p>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Currently Active</p>
        </div>
      </div>

    </div>
  </div>
</div>
