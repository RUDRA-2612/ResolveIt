<script lang="ts">
  import { Camera, ShieldAlert, CheckCircle2, MapPin, ListPlus, AlertTriangle, Building2, ArrowLeft, ChevronDown } from 'lucide-svelte';
  import { onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  // Updated Categories based on requirements
  const categoriesData: any = {
    "Hostel": {
      "Hostel Buildings": [
        "Broken Taps", "Broken Showers", "Flush / Toilet Issues", 
        "Broken Washroom Mirrors", "Broken Study Table", "Broken Chair", 
        "Damaged Almirah", "Electrical Socket Issues", "Room Lights / Fans", 
        "Door / Lock Issues", "Plumbing Issues", "Irregular Room Cleaning", 
        "Unclean Washrooms", "Dirty Corridors", "Delayed Waste Collection",
        "Water Cooler Not Working", "Washing Machine Broken"
      ],
      "Mess": [
        "Excessively Oily Food", "Poor Taste of Food", "Compromised Food Quality", 
        "Stale Food", "Poor Food Hygiene", "Repeated Menu", "Overcrowding",
        "Water Dispenser Empty / Broken", "Dirty Plates / Utensils"
      ],
      "Laundry": [
        "Delayed Clothes Return", "Poor Ironing Quality", "Poor Washing Quality", 
        "Clothes Misplacement", "Damaged Clothes"
      ]
    },
    "Student Affairs": {
      "General Issues": ["Event Permission Issue", "Club Fund Issue", "Disciplinary Issue", "Lost and Found", "Parking Issue", "Security Issue"],
      "Extracurriculars": ["Sports Equipment Missing", "Gym Equipment Broken", "Playground Maintenance Required"]
    },
    "Academics": {
      "Building Infrastructure": [
        "Broken Taps", "Flush / Toilet Issues", "Broken Washroom Mirrors", 
        "Electrical Socket Issues", "Room Lights / Fans", "Door / Lock Issues", 
        "Plumbing Issues", "Unclean Washrooms", "Dirty Corridors",
        "Elevator / Lift Not Working", "Water Cooler Not Working", 
        "Seepage / Water Leakage from Ceiling", "Fire Extinguisher Missing/Empty"
      ],
      "Classrooms": [
        "AC Not Working", "Projector / IT Issue", "Broken Table and Chair in Classroom", 
        "Irregular Classroom Cleaning", "Smartboard / Screen Issue", 
        "Speaker / Mic Not Working", "Broken Window / Blinds"
      ],
      "Labs / Library": [
        "PC Not Working", "Software Missing", "Internet Issue", "Noisy Environment",
        "Lab Equipment Broken", "LAN Cable Missing / Broken", "Library AC Not Working"
      ]
    },
    "Others": {
      "General": [
        "Campus Wi-Fi Issue", "Transport / Bus Issue", "Other"
      ]
    }
  };

  let selectedDepartment = $state("");
  let selectedCategory = $state("");
  let selectedSpecificIssue = $state("");
  let selectedBuilding = $state("");
  let roomArea = $state("");

  let availableBuildings = $derived.by(() => {
    if (selectedDepartment === 'Hostel' && selectedCategory === 'Hostel Buildings') {
      return ['GH1 (Girls Hostel 1)', 'GH2 (Girls Hostel 2)', 'BH1 (Boys Hostel 1)', 'BH2 (Boys Hostel 2)'];
    } else if (selectedDepartment === 'Academics') {
      if (selectedCategory === 'Labs / Library') {
        return ['HSB', 'TB', 'LRC'];
      } else if (selectedCategory === 'Classrooms') {
        return ['EB1', 'EB2', 'HSB', 'TB'];
      } else {
        // Building Infrastructure
        return ['EB1', 'EB2', 'HSB', 'Admin Block', 'TB', 'LRC'];
      }
    }
    return [];
  });

  $effect(() => {
    // Reset building when department/category changes
    selectedBuilding = "";
  });

  // Camera state
  let videoElement: HTMLVideoElement | undefined = $state();
  let canvasElement: HTMLCanvasElement | undefined = $state();
  let photoDataUrl: string | null = $state(null);
  let isCameraActive = $state(false);
  let stream: MediaStream | null = null;

  // Custom Dropdown States
  let isDeptOpen = $state(false);
  let isCatOpen = $state(false);
  let isIssueOpen = $state(false);
  let isBldgOpen = $state(false);

  function closeAllDropdowns() {
    isDeptOpen = false;
    isCatOpen = false;
    isIssueOpen = false;
    isBldgOpen = false;
  }

  async function startCamera() {
    try {
      if (typeof window !== 'undefined' && !window.history.state?.camera) {
        window.history.pushState({ camera: true }, '');
      }
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoElement) {
        videoElement.srcObject = stream;
        isCameraActive = true;
      }
    } catch (err) {
      alert("Camera access denied or unavailable.");
    }
  }

  function takePhoto() {
    if (videoElement && canvasElement) {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      const ctx = canvasElement.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        photoDataUrl = canvasElement.toDataURL('image/jpeg');
        stopCamera();
      }
    }
  }

  function stopCamera() {
    if (typeof window !== 'undefined' && window.history.state?.camera) {
      window.history.back();
    } else {
      closeCameraOnly();
    }
  }

  function closeCameraOnly() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      isCameraActive = false;
    }
  }

  function handlePopState() {
    closeCameraOnly();
  }

  function retakePhoto() {
    photoDataUrl = null;
    startCamera();
  }

  onDestroy(() => {
    closeCameraOnly();
  });
</script>

<svelte:window onpopstate={handlePopState} onclick={closeAllDropdowns} />

<main class="max-w-5xl mx-auto w-full px-4 mt-8 pb-24">
  
  <div class="flex items-center gap-4 mb-8">
    <a href="/dashboard" class="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
      <ArrowLeft size={24} />
    </a>
    <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">Report a Problem</h1>
  </div>

  <form class="space-y-6">
    
    <!-- Multi-level Dropdowns (Grid for wider layout) -->
    <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="space-y-2 relative">
          <label class="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Building2 size={16} class="text-teal-600"/> Department
          </label>
          <button 
            type="button" 
            onclick={(e) => { e.stopPropagation(); closeAllDropdowns(); isDeptOpen = !isDeptOpen; }} 
            class="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-slate-50 hover:bg-slate-100 font-medium text-slate-800 flex justify-between items-center"
          >
            <span class={!selectedDepartment ? "text-slate-500" : ""}>{selectedDepartment || 'Select department...'}</span>
            <ChevronDown size={18} class="text-slate-400 transition-transform duration-300 {isDeptOpen ? 'rotate-180' : ''}"/>
          </button>
          
          {#if isDeptOpen}
            <div onclick={(e) => e.stopPropagation()} transition:fly={{y: -10, duration: 200}} class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
              {#each Object.keys(categoriesData) as dept}
                <button 
                  type="button" 
                  onclick={() => { selectedDepartment = dept; selectedCategory = ""; selectedSpecificIssue = ""; isDeptOpen = false; }} 
                  class="w-full text-left px-4 py-3 transition-colors {selectedDepartment === dept ? 'bg-teal-600 text-white font-bold' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700 font-medium'}"
                >
                  {dept}
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Category -->
        <div class="space-y-2 relative">
          <label class="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <ListPlus size={16} class="text-teal-600"/> Category
          </label>
          <button 
            type="button" 
            onclick={(e) => { e.stopPropagation(); closeAllDropdowns(); if(selectedDepartment) isCatOpen = !isCatOpen; }} 
            class="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-slate-50 hover:bg-slate-100 font-medium text-slate-800 flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedDepartment}
          >
            <span class={!selectedCategory ? "text-slate-500" : ""}>{selectedCategory || (selectedDepartment ? 'Select category...' : 'Select department first...')}</span>
            <ChevronDown size={18} class="text-slate-400 transition-transform duration-300 {isCatOpen ? 'rotate-180' : ''}"/>
          </button>
          
          {#if isCatOpen && selectedDepartment}
            <div onclick={(e) => e.stopPropagation()} transition:fly={{y: -10, duration: 200}} class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
              {#each Object.keys(categoriesData[selectedDepartment]) as cat}
                <button 
                  type="button" 
                  onclick={() => { selectedCategory = cat; selectedSpecificIssue = ""; isCatOpen = false; }} 
                  class="w-full text-left px-4 py-3 transition-colors {selectedCategory === cat ? 'bg-teal-600 text-white font-bold' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700 font-medium'}"
                >
                  {cat}
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Specific Issue -->
        {#if selectedCategory}
          <div class="space-y-2 relative animate-in fade-in zoom-in-95 duration-300">
            <label class="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <AlertTriangle size={16} class="text-orange-500"/> Specific Issue
            </label>
            <button 
              type="button" 
              onclick={(e) => { e.stopPropagation(); closeAllDropdowns(); isIssueOpen = !isIssueOpen; }} 
              class="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-slate-50 hover:bg-slate-100 font-medium text-slate-800 flex justify-between items-center"
            >
              <span class={!selectedSpecificIssue ? "text-slate-500" : ""}>{selectedSpecificIssue || 'Select the exact issue...'}</span>
              <ChevronDown size={18} class="text-slate-400 transition-transform duration-300 {isIssueOpen ? 'rotate-180' : ''}"/>
            </button>
            
            {#if isIssueOpen && selectedCategory && selectedDepartment}
              <div onclick={(e) => e.stopPropagation()} transition:fly={{y: -10, duration: 200}} class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
                {#each categoriesData[selectedDepartment][selectedCategory] as issue}
                  <button 
                    type="button" 
                    onclick={() => { selectedSpecificIssue = issue; isIssueOpen = false; }} 
                    class="w-full text-left px-4 py-3 transition-colors {selectedSpecificIssue === issue ? 'bg-teal-600 text-white font-bold' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700 font-medium'}"
                  >
                    {issue}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Details and Location -->
    <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
      
      <!-- Location -->
      <div class="space-y-3">
        <label class="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <MapPin size={16} class="text-teal-600"/> Exact Location
        </label>
        <div class="flex flex-col xl:flex-row gap-3">
          {#if availableBuildings.length > 0}
            <div class="relative w-full xl:w-1/2">
              <button 
                type="button" 
                onclick={(e) => { e.stopPropagation(); closeAllDropdowns(); isBldgOpen = !isBldgOpen; }} 
                class="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 flex justify-between items-center"
              >
                <span class={!selectedBuilding ? "text-slate-500" : ""}>{selectedBuilding || 'Select Building...'}</span>
                <ChevronDown size={18} class="text-slate-400 transition-transform duration-300 {isBldgOpen ? 'rotate-180' : ''}"/>
              </button>
              
              {#if isBldgOpen}
                <div onclick={(e) => e.stopPropagation()} transition:fly={{y: -10, duration: 200}} class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
                  {#each availableBuildings as bldg}
                    <button 
                      type="button" 
                      onclick={() => { selectedBuilding = bldg; isBldgOpen = false; }} 
                      class="w-full text-left px-4 py-3 transition-colors {selectedBuilding === bldg ? 'bg-teal-600 text-white font-bold' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700 font-medium'}"
                    >
                      {bldg}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
            <input type="text" bind:value={roomArea} placeholder="Room No. / Area" class="w-full xl:w-1/2 px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-slate-50 hover:bg-slate-100 font-medium text-slate-800" />
          {:else}
            <input type="text" bind:value={roomArea} placeholder={selectedCategory === 'Mess' || selectedCategory === 'Laundry' ? `Specific Area (e.g. Near ${selectedCategory} Counter)` : 'Specific Area / Location Details'} class="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-slate-50 hover:bg-slate-100 font-medium text-slate-800" />
          {/if}
        </div>
      </div>

      <!-- Description -->
      <div class="space-y-3">
        <label class="text-sm font-semibold text-slate-700">Additional Details</label>
        <textarea rows="3" placeholder="Add any extra details..." class="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-slate-50 hover:bg-slate-100 resize-none font-medium text-slate-800"></textarea>
      </div>

    </div>

    <!-- Live Photo Section -->
    <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div class="flex justify-between items-center">
        <label class="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Camera size={16} class="text-teal-600"/> Live Evidence
        </label>
        <span class="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-bold">Required</span>
      </div>
      
      <div class="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden relative" class:p-10={!isCameraActive && !photoDataUrl}>
        
        {#if !isCameraActive && !photoDataUrl}
          <div class="text-center">
            <div class="w-16 h-16 bg-white shadow-sm text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera size={28} />
            </div>
            <p class="text-slate-600 font-medium mb-1">You must take a live photo of the issue.</p>
            <p class="text-slate-400 text-sm mb-6">Gallery uploads are not permitted by administration.</p>
            <button type="button" onclick={startCamera} class="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-md">
              <Camera size={18} /> Open Camera
            </button>
          </div>
        {/if}

        <div class={isCameraActive ? 'block relative bg-black rounded-2xl overflow-hidden' : 'hidden'}>
          <!-- svelte-ignore a11y-media-has-caption -->
          <video bind:this={videoElement} autoplay playsinline class="w-full h-[400px] object-cover"></video>
          <div class="absolute bottom-6 left-0 right-0 flex justify-center">
            <button type="button" onclick={takePhoto} class="w-16 h-16 bg-white rounded-full border-4 border-slate-300 shadow-xl flex items-center justify-center hover:scale-105 transition-transform">
              <div class="w-12 h-12 bg-white border border-slate-200 rounded-full"></div>
            </button>
          </div>
        </div>

        {#if photoDataUrl}
          <div class="relative bg-slate-900 group rounded-2xl overflow-hidden shadow-inner">
            <img src={photoDataUrl} alt="Captured Issue" class="w-full h-[400px] object-cover opacity-90" />
            <div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
              <button type="button" onclick={retakePhoto} class="px-6 py-3 bg-white text-slate-800 rounded-xl font-bold shadow-xl hover:scale-105 transition-transform">
                Retake Photo
              </button>
            </div>
            <div class="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
              <CheckCircle2 size={24} />
            </div>
          </div>
        {/if}
        
        <canvas bind:this={canvasElement} class="hidden"></canvas>
      </div>
      <p class="text-sm text-slate-500 mt-2 flex items-center gap-2">
        <ShieldAlert size={14} class="text-teal-600" /> AI checks will run to prevent duplicate tickets based on image and location.
      </p>
    </div>

    <!-- Submit -->
    <div class="pt-6 flex justify-center">
      <a href="/dashboard" class="group flex w-full md:w-auto min-w-[300px] justify-center items-center gap-2 py-4 px-10 bg-teal-500 hover:bg-teal-800 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-700/40 hover:-translate-y-0.5 transition-all duration-300">
        Submit Ticket
      </a>
    </div>

  </form>
</main>
