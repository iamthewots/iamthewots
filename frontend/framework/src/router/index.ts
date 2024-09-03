import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LibView from "@/views/LibView.vue";
import CanvasView from "@/views/CanvasView.vue";
import OverscrollView from "@/views/OverscrollView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/library",
      name: "library",
      component: LibView,
    },
    {
      path: "/components",
      name: "components",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/ComponentsView.vue"),
    },
    {
      path: "/canvas",
      name: "canvas",
      component: CanvasView,
    },
    {
      path: "/overscroll",
      name: "overscroll",
      component: OverscrollView,
    },
  ],
});

export default router;
