<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 8 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 200 } }"
    class="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-900"
  >
    <svg
      class="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
    <p class="text-sm font-medium text-slate-700 dark:text-slate-200">Aún no hay movimientos de stock</p>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
      Cuando registres entradas o salidas, aparecerán aquí como un rastro claro de tu inventario.
    </p>
  </div>
</template>
