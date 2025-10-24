import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // Hash history avoids 404s on GitHub Pages static hosting.
  history: createWebHashHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/productos',
      name: 'productos',
      component: () => import('../views/ProductosView.vue'),
    },
    {
      path: '/pedidos',
      name: 'pedidos',
      component: () => import('../views/PedidosView.vue'),
    },
  ],
})

export default router
