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
    {
      path: '/online-pedido/:phone',
      name: 'online-pedido',
      component: () => import('../views/OnlinePedidoView.vue'),
      props: true,
      meta: { hideNavbar: true },
    },
    {
      path: '/online-pedido/:phone/gracias',
      name: 'online-pedido-gracias',
      component: () => import('../views/OnlinePedidoGraciasView.vue'),
      props: true,
      meta: { hideNavbar: true },
    },
  ],
})

export default router
