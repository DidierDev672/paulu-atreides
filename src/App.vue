<script setup lang="ts">
import { ref } from 'vue'

const chatOpen = ref(false)
</script>

<template>
  <div class="min-h-dvh w-full">
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>

    <!-- Floating AI button -->
    <button
      type="button"
      class="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 backdrop-blur-md transition hover:scale-105 hover:shadow-xl hover:shadow-violet-500/40 active:scale-95"
      @click="chatOpen = !chatOpen"
    >
      <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 4a4 4 0 0 1 3.5 2.1 7 7 0 0 1 2.5-.6 7 7 0 0 1 4.8 2 7 7 0 0 1-2.8 11.5 4 4 0 0 1-7.5.8 4 4 0 0 1-7.5-.8A7 7 0 0 1 1.2 7.5a7 7 0 0 1 4.8-2 7 7 0 0 1 2.5.6A4 4 0 0 1 12 4z" />
        <circle cx="9" cy="12" r="1" fill="currentColor" />
        <circle cx="15" cy="12" r="1" fill="currentColor" />
        <path d="M9 15.5a3.5 3.5 0 0 0 6 0" />
      </svg>
    </button>

    <!-- Chat modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        leave-active-class="transition duration-150 ease-in"
        enter-from-class="opacity-0 scale-95 translate-y-4"
        leave-to-class="opacity-0 scale-95 translate-y-4"
      >
        <div
          v-if="chatOpen"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 pt-12 backdrop-blur-sm sm:items-center sm:pb-0"
          @click.self="chatOpen = false"
        >
          <div
            class="flex h-[70vh] w-full max-w-lg flex-col rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40 sm:h-[520px]"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <svg viewBox="0 0 24 24" class="h-5 w-5 text-white" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 4a4 4 0 0 1 3.5 2.1 7 7 0 0 1 2.5-.6 7 7 0 0 1 4.8 2 7 7 0 0 1-2.8 11.5 4 4 0 0 1-7.5.8 4 4 0 0 1-7.5-.8A7 7 0 0 1 1.2 7.5a7 7 0 0 1 4.8-2 7 7 0 0 1 2.5.6A4 4 0 0 1 12 4z" />
                    <circle cx="9" cy="12" r="1" fill="currentColor" />
                    <circle cx="15" cy="12" r="1" fill="currentColor" />
                    <path d="M9 15.5a3.5 3.5 0 0 0 6 0" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-white">Asistente Paulu</h3>
                  <p class="text-xs text-slate-500">Configuración pendiente</p>
                </div>
              </div>
              <button
                type="button"
                class="rounded-xl p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                @click="chatOpen = false"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="flex flex-1 items-center justify-center px-6">
              <div class="text-center">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
                  <svg viewBox="0 0 24 24" class="h-7 w-7 text-violet-400" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 4a4 4 0 0 1 3.5 2.1 7 7 0 0 1 2.5-.6 7 7 0 0 1 4.8 2 7 7 0 0 1-2.8 11.5 4 4 0 0 1-7.5.8 4 4 0 0 1-7.5-.8A7 7 0 0 1 1.2 7.5a7 7 0 0 1 4.8-2 7 7 0 0 1 2.5.6A4 4 0 0 1 12 4z" />
                    <circle cx="9" cy="12" r="1" fill="currentColor" />
                    <circle cx="15" cy="12" r="1" fill="currentColor" />
                    <path d="M9 15.5a3.5 3.5 0 0 0 6 0" />
                  </svg>
                </div>
                <p class="text-sm font-medium text-white">Asistente de IA</p>
                <p class="mt-1 text-xs text-slate-500">Configuración próximamente</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-white/10 px-6 py-4">
              <div class="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  class="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  disabled
                />
                <button
                  type="button"
                  disabled
                  class="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/30 text-violet-400"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M22 2L15 22l-4-9-9-4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
