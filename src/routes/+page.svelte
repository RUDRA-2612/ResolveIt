<script lang="ts">
  import { User, Lock, ChevronRight, Mail, Hash, BookOpen, ShieldCheck, Building2 } from 'lucide-svelte';
  import { onMount } from 'svelte';

  // Step 1: Login, Step 2: Complete Profile (First time user)
  let step = $state(1); 
  // User type for Signup (Step 2)
  let userType = $state('student'); // 'student' or 'authority'
  let email = $state('');

  onMount(() => {
    if (localStorage.getItem('user_email')) {
      window.location.href = '/dashboard';
    }
  });
</script>

<div class="min-h-screen flex flex-col lg:flex-row font-sans bg-teal-800">
  
  <!-- Left Side: Brand (Teal Background) -->
  <div class="lg:w-1/2 bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-900 flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-500/20 blur-[120px]"></div>
    <div class="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-500/20 blur-[150px]"></div>
    
    <div class="z-10 text-center group cursor-pointer hover-dance">
      <div class="flex justify-center mb-4 lg:mb-8">
        <img src="/logo.png" alt="ResolveIt Logo" class="w-24 h-24 lg:w-48 lg:h-48 object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
      </div>
      <h1 class="text-4xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm transition-colors duration-300 group-hover:text-orange-400">ResolveIt</h1>
    </div>
  </div>

  <!-- Right Side: Login / Complete Profile Form -->
  <!-- Desktop: Solid White. Mobile: Teal gradient (inherits from body/wrapper) with floating white box -->
  <div class="lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 lg:bg-white relative">
    
    <!-- Form Container -->
    <div class="w-full max-w-md bg-white rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none p-8 lg:p-0 relative overflow-hidden lg:overflow-visible">
      
      <!-- Top accent line (Visible only on mobile floating box) -->
      <div class="lg:hidden absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-500"></div>

      {#if step === 1}
        <div class="mb-8 text-center lg:text-left">
          <h2 class="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Welcome</h2>
          <p class="text-slate-500 text-sm lg:text-base">
            Please enter your credentials to login.
          </p>
        </div>

        <form class="space-y-5" onsubmit={(e) => { 
          e.preventDefault(); 
          if (email.toLowerCase() === 'rudrapalsinghshekhawat@jklu.edu.in') {
            localStorage.setItem('user_email', email.toLowerCase());
            window.location.href = '/dashboard';
          } else {
            step = 2; 
          }
        }}>
          
          <!-- Email Field -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">JKLU Email Address</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} class="text-slate-400" />
              </div>
              <input type="email" bind:value={email} placeholder="name@jklu.edu.in" required class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" />
            </div>
          </div>

          <!-- Admin Direct Interface Selection -->
          {#if email.toLowerCase() === 'rudrapalsinghshekhawat@jklu.edu.in'}
            <div class="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p class="text-sm font-bold text-teal-700 mb-3 flex justify-center">God Mode Unlocked: Select Interface</p>
              <div class="flex gap-3">
                <button onclick={(e) => { e.preventDefault(); localStorage.setItem('user_email', email.toLowerCase()); window.location.href = '/dashboard'; }} class="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-center rounded-xl font-bold shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-0.5">
                  Student
                </button>
                <button onclick={(e) => { e.preventDefault(); localStorage.setItem('user_email', email.toLowerCase()); window.location.href = '/dashboard'; }} class="flex-1 py-3.5 bg-slate-800 hover:bg-slate-900 text-white text-center rounded-xl font-bold shadow-lg shadow-slate-500/30 transition-all hover:-translate-y-0.5">
                  Authority
                </button>
              </div>
            </div>
          {:else}
            <!-- Password Field -->
            <div class="animate-in fade-in duration-300">
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-sm font-medium text-slate-700">Password</label>
                <a href="#" class="text-xs font-semibold text-teal-600 hover:text-teal-700">Forgot Password?</a>
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} class="text-slate-400" />
                </div>
                <input type="password" placeholder="••••••••" required class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" />
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="group flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all duration-300 mt-6">
              Sign In
              <ChevronRight size={20} class="group-hover:translate-x-1 transition-transform" />
            </button>

            <!-- Microsoft Integration Button -->
            <button type="button" onclick={() => step = 2} class="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all duration-300 mt-3">
              <svg class="w-5 h-5" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              Sign in with Microsoft
            </button>
          {/if}

        </form>

      {:else}
        <!-- Step 2: Complete Profile for First-time users -->
        <div class="mb-8 text-center lg:text-left">
          <h2 class="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Complete Profile</h2>
          <p class="text-slate-500 text-sm lg:text-base">
            It looks like this is your first time. Please complete your profile to continue.
          </p>
        </div>

        <!-- User Type Toggle -->
        <div class="flex bg-slate-100 p-1 rounded-xl mb-6 shadow-inner">
          <button onclick={() => userType = 'student'} class="flex-1 py-2 text-sm font-bold rounded-lg transition-all {userType === 'student' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
            Student
          </button>
          <button onclick={() => userType = 'authority'} class="flex-1 py-2 text-sm font-bold rounded-lg transition-all {userType === 'authority' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
            Authority
          </button>
        </div>

        <form class="space-y-5" onsubmit={(e) => { e.preventDefault(); localStorage.setItem('user_email', email.toLowerCase() || 'user@jklu.edu.in'); window.location.href='/dashboard'; }}>
          
          <!-- Full Name -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} class="text-slate-400" />
              </div>
              <input type="text" placeholder="John Doe" required class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" />
            </div>
          </div>

          <!-- Student specific fields -->
          {#if userType === 'student'}
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Roll No.</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash size={16} class="text-slate-400" />
                  </div>
                  <input type="text" placeholder="2023BTECH..." required class="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                </div>
              </div>
              <div class="flex-1">
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Course</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen size={16} class="text-slate-400" />
                  </div>
                  <input type="text" placeholder="B.Tech CSE" required class="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                </div>
              </div>
            </div>
          {/if}

          <!-- Submit Button -->
          <button type="submit" class="group flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all duration-300 mt-6">
            Save & Continue
            <ChevronRight size={20} class="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      {/if}
      
    </div>
  </div>
</div>
