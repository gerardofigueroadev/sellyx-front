<template>
  <section class="thankyou-view">
    <div class="container h-100">
      <div class="row h-100 justify-content-center align-items-center">
        <div class="col-lg-8 col-xl-6">
          <div class="thankyou-card text-center p-5 shadow-sm rounded-4 bg-white">
            <div class="thankyou-icon mx-auto mb-4">
              <span class="checkmark">✔</span>
            </div>
            <p class="text-uppercase text-muted small mb-2">Pedido recibido</p>
            <h1 class="thankyou-title mb-3">¡Gracias por tu pedido!</h1>
            <p class="thankyou-message mb-4">
              Enviaremos la confirmación y el resumen a tu WhatsApp
              <strong v-if="phoneLabel">{{ phoneLabel }}</strong>
              <span v-else>en los próximos minutos</span>.
            </p>
            <div class="d-flex flex-column flex-md-row gap-3 justify-content-center">
              <RouterLink class="btn btn-outline-secondary px-4 py-2" :to="`/online-pedido/${route.params.phone ?? ''}`">
                Crear otro pedido
              </RouterLink>
            </div>
            <p class="text-muted small mt-4 mb-0">
              Si necesitas ajustar algo responde el mensaje y te ayudaremos enseguida.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const phoneLabel = computed(() => {
  const param = route.params.phone;
  return typeof param === 'string' && param.trim().length ? param : null;
});
</script>

<style scoped>
.thankyou-view {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(13, 110, 253, 0.12), rgba(25, 135, 84, 0.12));
  padding: 2rem 0;
}

.thankyou-card {
  border: none;
}

.thankyou-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(25, 135, 84, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #198754;
}

.thankyou-title {
  font-weight: 700;
}

.thankyou-message {
  font-size: 1.05rem;
  color: #5f6368;
}
</style>

