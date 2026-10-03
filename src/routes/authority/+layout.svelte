<script lang="ts">
  import {
    Bell,
    Search,
    Menu,
    X,
    User,
    LogOut,
    CheckCircle2,
    Clock,
    AlertCircle
  } from "lucide-svelte";
  import { beforeNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import { fade, fly, slide, scale } from "svelte/transition";
  import { onMount } from "svelte";

  let { children } = $props();

  let userEmail = $state("");
  onMount(() => {
    userEmail = localStorage.getItem("user_email") || "";
  });

  let isMenuOpen = $state(false);
  let isProfileOpen = $state(false);
  let isNotifOpen = $state(false);
  let isSearchOpen = $state(false);
  
  let isProfileModalOpen = $state(false);
  
  let searchQuery = $state("");

  function openModal(type: "menu" | "profileModal") {
    if (typeof window !== "undefined")
      window.history.pushState({ modal: true }, "");
    if (type === "menu") isMenuOpen = true;
    if (type === "profileModal") {
      isProfileModalOpen = true;
      closeAll();
    } else {
      closeAll();
    }
  }

  function closeModal() {
    if (typeof window !== "undefined" && window.history.state?.modal) {
      window.history.back();
    } else {
      isMenuOpen = false;
      isProfileModalOpen = false;
      closeAll();
    }
  }

  function handlePopState() {
    isMenuOpen = false;
    isProfileModalOpen = false;
    closeAll();
  }

  beforeNavigate(({ cancel, type }) => {
    if (isMenuOpen || isProfileOpen || isNotifOpen || isSearchOpen || isProfileModalOpen) {
      if (type === 'popstate') {
        cancel();
      }
      closeModal();
    }
  });

  function closeAll() {
    isProfileOpen = false;
    isNotifOpen = false;
    isSearchOpen = false;
  }

  function toggle(menu: "menu" | "profile" | "notif" | "search", e: Event) {
    e.stopPropagation();
    if (menu === "menu") {
      openModal("menu");
    } else {
      let temp = {
        profile: menu === "profile" ? !isProfileOpen : false,
        notif: menu === "notif" ? !isNotifOpen : false,
        search: menu === "search" ? !isSearchOpen : false,
      };
      if (temp.profile || temp.notif || temp.search) {
        if (typeof window !== "undefined" && !window.history.state?.modal) {
          window.history.pushState({ modal: true }, "");
        }
      } else {
        if (typeof window !== "undefined" && window.history.state?.modal)
          window.history.back();
      }
      isProfileOpen = temp.profile;
      isNotifOpen = temp.notif;
      isSearchOpen = temp.search;
    }
  }

  function handleOutsideClick() {
    if (isMenuOpen || isProfileOpen || isNotifOpen || isSearchOpen) {
      closeModal();
    }
  }

  function focusElement(node: HTMLElement) {
    node.focus();
  }
</script>

<svelte:window onclick={handleOutsideClick} onpopstate={handlePopState} />

<div class="min-h-screen bg-[#f4f9f8] font-sans flex flex-col">
  <!-- Global Navbar for Authority -->
  <header class="bg-teal-700 text-white sticky top-0 z-50 shadow-md">
    <div class="w-full px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Left: Menu & Brand -->
      <div class="flex items-center gap-4">
        <button
          onclick={(e) => toggle("menu", e)}
          class="p-2 hover:bg-teal-600 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <a
          href="/authority"
          class="group flex items-center gap-2 transition-all hover:scale-105 duration-300"
        >
          <img
            src="/logo_2.png"
            alt="ResolveIt Logo"
            class="w-8 h-8 object-contain drop-shadow-md group-hover:rotate-12 transition-transform duration-300"
          />
          <div class="flex items-center gap-2">
            <span
              class="text-lg sm:text-xl font-bold tracking-tight group-hover:text-orange-400 transition-colors duration-300 {isSearchOpen ? 'hidden sm:block' : ''}"
              >ResolveIt</span
            >
            <span class="text-[10px] font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 shadow-sm {isSearchOpen ? 'hidden sm:block' : ''}">
              AUTHORITY
            </span>
          </div>
        </a>
      </div>

      <!-- Right: Search, Notifications, Profile -->
      <div class="flex items-center gap-2 sm:gap-4 relative">
        <!-- Search -->
        <div class="flex items-center justify-end min-w-[2rem]">
          {#if isSearchOpen}
            <input
              transition:slide={{ axis: 'x', duration: 300 }}
              type="text"
              use:focusElement
              bind:value={searchQuery}
              placeholder="Search ID, student, or category..."
              class="w-36 sm:w-64 px-3 sm:px-4 py-2 bg-slate-900 text-white placeholder-slate-400 rounded-full border border-slate-600 focus:outline-none focus:border-orange-400 text-sm"
              onclick={(e) => e.stopPropagation()}
            />
          {:else}
            <button
              onclick={(e) => toggle("search", e)}
              class="p-2 hover:bg-teal-600 rounded-full transition-colors relative z-10"
            >
              <Search size={20} />
            </button>
          {/if}
        </div>

        <!-- Notifications -->
        <div class="relative">
          <button
            onclick={(e) => toggle("notif", e)}
            class="p-2 hover:bg-teal-600 rounded-full transition-colors relative"
          >
            <Bell size={20} />
            <span
              class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-teal-700"
            ></span>
          </button>

          <!-- Notification Dropdown -->
          {#if isNotifOpen}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              onclick={(e) => e.stopPropagation()}
              transition:fly={{ y: -10, duration: 200 }}
              class="absolute top-12 -right-4 sm:right-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div class="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h4 class="font-bold text-slate-800">Alerts</h4>
                <span class="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">2 New</span>
              </div>
              <div class="max-h-64 overflow-y-auto p-2">
                <div class="p-3 hover:bg-slate-50 rounded-xl cursor-pointer">
                  <p class="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <AlertCircle size={14} class="text-red-500" /> TKT-104 is breaching SLA
                  </p>
                  <p class="text-xs text-slate-500 mt-1">Countdown &lt; 30 mins</p>
                </div>
                <div class="p-3 hover:bg-slate-50 rounded-xl cursor-pointer">
                  <p class="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Clock size={14} class="text-blue-500" /> New ticket in Hostel Mess
                  </p>
                  <p class="text-xs text-slate-500 mt-1">10 minutes ago</p>
                </div>
              </div>
            </div>
          {/if}
        </div>

        <!-- Profile -->
        <div class="relative">
          <button
            onclick={(e) => toggle("profile", e)}
            class="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm border-2 border-teal-500 hover:ring-2 hover:ring-orange-400 transition-all"
          >
            AD
          </button>

          <!-- Profile Dropdown -->
          {#if isProfileOpen}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              onclick={(e) => e.stopPropagation()}
              transition:fly={{ y: -10, duration: 200 }}
              class="absolute top-12 right-0 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div class="p-4 border-b border-slate-100 bg-slate-50">
                <p class="font-bold text-slate-800">Authority</p>
              </div>
              <div class="p-2">
                <button
                  onclick={() => openModal("profileModal")}
                  class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2"
                >
                  <User size={16} /> Profile
                </button>
                <div class="border-t border-slate-100 my-1"></div>
                <a
                  href="#"
                  onclick={closeModal}
                  class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2"
                >
                  Feedback
                </a>
                <div class="border-t border-slate-100 my-1"></div>
                <a
                  href="#"
                  onclick={closeModal}
                  class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2"
                >
                  Report Issue
                </a>
                <div class="border-t border-slate-100 my-1"></div>
                <button
                  onclick={() => {
                    window.location.href = "/";
                  }}
                  class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <!-- Hamburger Menu Drawer -->
  {#if isMenuOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 bg-slate-900/50 z-[60]"
      transition:fade={{ duration: 300 }}
    ></div>
    <div
      class="fixed top-0 left-0 h-full w-72 bg-white z-[60] shadow-2xl flex flex-col"
      transition:fly={{ x: -300, duration: 300 }}
      onclick={(e) => e.stopPropagation()}
    >
      <div
        class="p-4 bg-teal-700 text-white flex justify-between items-center h-16"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold">Authority Menu</span>
        </div>
        <button
          onclick={closeModal}
          class="p-2 hover:bg-teal-600 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <a
          href="/authority"
          onclick={closeModal}
          class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium rounded-xl transition-colors"
        >
          Home
        </a>
        <div class="border-t border-slate-100 mx-4 my-1"></div>
        <a
          href="#"
          onclick={closeModal}
          class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium rounded-xl transition-colors"
        >
          Recently Solved Tickets
        </a>

        {#if userEmail.toLowerCase() === 'rudrapalsinghshekhawat@jklu.edu.in'}
          <div class="border-t border-slate-100 mx-4 my-1"></div>
          <a
            href="#"
            onclick={closeModal}
            class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium rounded-xl transition-colors"
          >
            Admin Panel
          </a>
        {/if}

        <div class="border-t border-slate-100 mx-4 my-1"></div>
        <a
          href="#"
          onclick={closeModal}
          class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium rounded-xl transition-colors"
        >
          Credits
        </a>

      </div>

      {#if userEmail.toLowerCase() === 'rudrapalsinghshekhawat@jklu.edu.in'}
        <div class="p-4 mt-auto border-t border-slate-100">
          <a
            href="/dashboard"
            onclick={closeModal}
            class="flex items-center justify-center gap-2 w-full px-4 py-3 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl transition-colors bg-emerald-50"
          >
            Switch to Student
          </a>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Page Content -->
  <div class="flex-1 flex flex-col min-w-0 h-full">
    {@render children()}
  </div>

  <!-- Global Footer -->
  {#if page.url.pathname === '/authority'}
    <footer
      class="bg-slate-100 text-center py-8 mt-auto border-t border-teal-500 flex flex-col items-center"
    >
      <img
        src="/logo_2.png"
        alt="ResolveIt Logo"
        class="w-16 h-16 object-contain mb-3 drop-shadow-sm opacity-90"
      />

      <p class="text-sm font-medium text-slate-600 mb-1">
        Website crafted with ❤️ by
      </p>
      <p class="text-base font-bold text-teal-700">Rudrapal Singh Shekhawat</p>
      <p class="text-xs font-medium text-slate-500 mb-6">(2nd Year)</p>

      <p class="text-[11px] text-slate-400 font-medium tracking-wide">
        &copy; 2026 ResolveIt Portal. All rights reserved.
      </p>
    </footer>
  {/if}
</div>

<!-- Profile Modal -->
{#if isProfileModalOpen}
  <div
    class="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
      transition:scale={{ start: 0.95, duration: 200 }}
      onclick={(e) => e.stopPropagation()}
    >
      <div
        class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-teal-50"
      >
        <h3 class="font-bold text-teal-800 text-lg">Authority Profile</h3>
        <button
          onclick={closeModal}
          class="p-2 text-slate-400 hover:bg-teal-100 hover:text-teal-700 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Department
          </p>
          <p class="font-semibold text-slate-800">Hostel Department</p>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Role
          </p>
          <p class="font-semibold text-slate-800">Chief Warden</p>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Email ID
          </p>
          <p class="font-semibold text-slate-800">hostel.authority@jklu.edu.in</p>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Contact Number
          </p>
          <p class="font-semibold text-slate-800">+91 98765 43210</p>
        </div>
      </div>
    </div>
  </div>
{/if}
