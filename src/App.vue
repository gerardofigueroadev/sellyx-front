<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const showNavbar = computed(() => !route.meta?.hideNavbar)
</script>

<template>
  <div class="app-shell bg-light min-vh-100 d-flex flex-column">
    <nav v-if="showNavbar" class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container">
        <RouterLink class="navbar-brand fw-bold" to="/">Panelcito</RouterLink>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/">Inicio</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/pedidos">Pedidos</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/productos">Productos</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="flex-grow-1 d-flex flex-column">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  background-color: #f8f9fa;
}

.nav-link.active {
  font-weight: 600;
}
</style>
