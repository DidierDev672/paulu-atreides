import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/presentation/stores/authStore";
import AuthPage from "@/presentation/pages/AuthPage.vue";
import DashboardPage from "@/presentation/pages/DashboardPage.vue";
const routes = [
  {
    path: "/",
    name: "dashboard",
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/orders",
    name: "orders",
    component: () => import("@/presentation/pages/OrdersPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/shipments",
    name: "shipments",
    component: () => import("@/presentation/pages/ShipmentsPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/auth",
    name: "auth",
    component: AuthPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.session;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: "auth" };
  }
  if (to.name === "auth" && isAuthenticated) {
    return { name: "dashboard" };
  }
});

export default router;
