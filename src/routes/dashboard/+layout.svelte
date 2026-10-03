<script lang="ts">
  import {
    ShieldCheck,
    Bell,
    Search,
    Menu,
    X,
    User,
    MessageSquare,
    Flag,
  } from "lucide-svelte";
  import { searchStore } from "../../lib/store.svelte";
  import { beforeNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import { fade, fly, scale, slide } from "svelte/transition";

  let { children } = $props();

  let isMenuOpen = $state(false);
  let isProfileOpen = $state(false);
  let isNotifOpen = $state(false);
  let isSearchOpen = $state(false);

  let isProfileModalOpen = $state(false);
  let isFeedbackModalOpen = $state(false);

  function openModal(type: "menu" | "profileModal" | "feedbackModal") {
    if (typeof window !== "undefined")
      window.history.pushState({ modal: true }, "");
    if (type === "menu") isMenuOpen = true;
    if (type === "profileModal") isProfileModalOpen = true;
    if (type === "feedbackModal") isFeedbackModalOpen = true;
    closeAll();
  }

  function closeModal() {
    if (typeof window !== "undefined" && window.history.state?.modal) {
      window.history.back();
    } else {
      isMenuOpen = false;
      isProfileModalOpen = false;
      isFeedbackModalOpen = false;
      closeAll();
    }
  }

  function handlePopState() {
    isMenuOpen = false;
    isProfileModalOpen = false;
    isFeedbackModalOpen = false;
    closeAll();
  }

  beforeNavigate(({ cancel }) => {
    if (
      isMenuOpen ||
      isProfileOpen ||
      isNotifOpen ||
      isSearchOpen ||
      isProfileModalOpen ||
      isFeedbackModalOpen
    ) {
      cancel();
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
    if (
      isMenuOpen ||
      isProfileOpen ||
      isNotifOpen ||
      isSearchOpen ||
      isProfileModalOpen ||
      isFeedbackModalOpen
    ) {
      closeModal();
    }
  }

  function focusElement(node: HTMLElement) {
    node.focus();
  }
</script>

<svelte:window onclick={handleOutsideClick} onpopstate={handlePopState} />

<div class="min-h-screen bg-[#f4f9f8] font-sans flex flex-col">
  <!-- Global Navbar -->
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
          href="/dashboard"
          class="group flex items-center gap-2 transition-all hover:scale-105 duration-300"
        >
          <img
            src="/logo_2.png"
            alt="ResolveIt Logo"
            class="w-8 h-8 object-contain drop-shadow-md group-hover:rotate-12 transition-transform duration-300"
          />
          <span
            class="text-lg sm:text-xl font-bold tracking-tight group-hover:text-orange-400 transition-colors duration-300 {isSearchOpen ? 'hidden sm:block' : ''}"
            >ResolveIt</span
          >
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
              bind:value={searchStore.query}
              placeholder="Search tickets, issues, or locations..."
              class="w-36 sm:w-64 px-3 sm:px-4 py-2 bg-teal-800 text-white placeholder-teal-300/70 rounded-full border border-teal-600 focus:outline-none focus:border-orange-400 text-sm"
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
              <div class="p-4 bg-slate-50 border-b border-slate-100">
                <h4 class="font-bold text-slate-800">Notifications</h4>
              </div>
              <div class="max-h-64 overflow-y-auto p-2">
                <div class="p-3 hover:bg-slate-50 rounded-xl cursor-pointer">
                  <p class="text-sm font-semibold text-slate-800">
                    TKT-104 is now In Progress
                  </p>
                  <p class="text-xs text-slate-500 mt-1">10 minutes ago</p>
                </div>
                <div class="p-3 hover:bg-slate-50 rounded-xl cursor-pointer">
                  <p class="text-sm font-semibold text-slate-800">
                    New announcement from Warden
                  </p>
                  <p class="text-xs text-slate-500 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
          {/if}
        </div>

        <!-- Profile -->
        <div class="relative">
          <button
            onclick={(e) => toggle("profile", e)}
            class="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold text-sm border-2 border-teal-500 hover:ring-2 hover:ring-orange-400 transition-all"
          >
            RS
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
              <div class="p-4 border-b border-slate-100">
                <p class="font-bold text-slate-800">Rudrapal Singh Shekhawat</p>
                <p class="text-xs text-slate-500 truncate">
                  rudrapalsinghshekhawat@jklu.edu.in
                </p>
              </div>
              <div class="p-2">
                <button
                  onclick={() => openModal("profileModal")}
                  class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-lg flex items-center gap-2"
                >
                  <User size={16} /> Profile
                </button>
                <button
                  onclick={() => openModal("feedbackModal")}
                  class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-lg flex items-center gap-2"
                >
                  <MessageSquare size={16} /> Feedback
                </button>
                <a
                  href="/dashboard/report"
                  onclick={closeModal}
                  class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-lg flex items-center gap-2"
                >
                  <Flag size={16} /> Report
                </a>
                <div class="border-t border-slate-100 my-1"></div>
                <button
                  onclick={() => {
                    localStorage.removeItem("user_email");
                    window.location.href = "/";
                  }}
                  class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium"
                >
                  Log Out
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
      class="fixed inset-0 bg-slate-900/50 z-50"
      transition:fade={{ duration: 300 }}
    ></div>
    <div
      class="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col"
      transition:fly={{ x: -300, duration: 300 }}
      onclick={(e) => e.stopPropagation()}
    >
      <div
        class="p-4 bg-teal-700 text-white flex justify-between items-center h-16"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold">Menu</span>
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
          href="/dashboard"
          onclick={closeModal}
          class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-teal-100 hover:text-teal-800 font-medium rounded-xl transition-colors"
        >
          Home
        </a>
        <div class="border-t border-teal-100 mx-4 my-1"></div>
        <a
          href="#"
          onclick={closeModal}
          class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-teal-100 hover:text-teal-800 font-medium rounded-xl transition-colors"
        >
          Recent Reported
        </a>
        <div class="border-t border-teal-100 mx-4 my-1"></div>
        <a
          href="#"
          onclick={closeModal}
          class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-teal-100 hover:text-teal-800 font-medium rounded-xl transition-colors"
        >
          Admin Panel
        </a>
        <div class="border-t border-teal-100 mx-4 my-1"></div>
        <a
          href="#"
          onclick={closeModal}
          class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-teal-100 hover:text-teal-800 font-medium rounded-xl transition-colors"
        >
          Credits
        </a>
      </div>
    </div>
  {/if}

  <!-- Page Content -->
  <div class="flex-1 flex flex-col">
    {@render children()}
  </div>

  <!-- Global Footer -->
  {#if page.url.pathname === "/dashboard"}
    <footer
      class="bg-slate-100 text-center py-8 mt-auto border-t-2 border-teal-100 flex flex-col items-center"
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
    <div
      class="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
      transition:scale={{ start: 0.95, duration: 200 }}
      onclick={(e) => e.stopPropagation()}
    >
      <div
        class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-teal-50"
      >
        <h3 class="font-bold text-teal-800 text-lg">Student Profile</h3>
        <button
          onclick={closeModal}
          class="p-2 text-slate-400 hover:bg-teal-100 hover:text-teal-700 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <p
            class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
          >
            Full Name
          </p>
          <p class="font-semibold text-slate-800">Rudrapal Singh Shekhawat</p>
        </div>
        <div>
          <p
            class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
          >
            Roll Number
          </p>
          <p class="font-semibold text-slate-800">2023BTECH001</p>
        </div>
        <div>
          <p
            class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
          >
            Course
          </p>
          <p class="font-semibold text-slate-800">B.Tech CSE (2nd Year)</p>
        </div>
        <div>
          <p
            class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
          >
            Email ID
          </p>
          <p class="font-semibold text-slate-800">
            rudrapalsinghshekhawat@jklu.edu.in
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Feedback Modal -->
{#if isFeedbackModalOpen}
  <div
    class="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      transition:scale={{ start: 0.95, duration: 200 }}
      onclick={(e) => e.stopPropagation()}
    >
      <div
        class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-orange-50"
      >
        <h3 class="font-bold text-orange-800 text-lg">Submit Feedback</h3>
        <button
          onclick={closeModal}
          class="p-2 text-slate-400 hover:bg-orange-100 hover:text-orange-700 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div class="p-6">
        <p class="text-sm text-slate-600 mb-4">
          Help us improve the ResolveIt platform. Describe any bugs, UI issues,
          or feature requests below.
        </p>
        <textarea
          rows="4"
          placeholder="Type your feedback here..."
          class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-slate-50 resize-none mb-4"
        ></textarea>
        <button
          onclick={() => {
            closeModal();
            alert("Feedback Submitted!");
          }}
          class="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  </div>
{/if}
