<template>
  <section class="online-order-view py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10 col-xl-9">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <div class="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                <div>
                  <p class="text-uppercase text-muted small mb-1">Canal WhatsApp</p>
                  <h1 class="h3 mb-1">Crea tu pedido en linea</h1>
                  <p class="text-muted mb-0">Selecciona los productos y envianos tu pedido sin salir de la conversacion.</p>
                </div>
                <div class="text-md-end">
                  <span class="badge text-bg-success px-3 py-2">Listo en minutos</span>
                </div>
              </div>

              <div class="row g-4">
                <div class="col-lg-7">
                  <h2 class="h6 text-uppercase text-muted mb-3">Productos</h2>
                  <div v-if="isLoadingProducts" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status" aria-hidden="true"></div>
                    <p class="text-muted mt-3 mb-0 small">Cargando catalogo...</p>
                  </div>
                  <div v-else-if="productsError" class="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
                    <span>{{ productsError }}</span>
                    <button type="button" class="btn btn-sm btn-outline-light" @click="fetchProducts">Reintentar</button>
                  </div>
                  <div v-else-if="!products.length" class="alert alert-info mb-0" role="alert">
                    No hay productos disponibles en este momento.
                  </div>
                  <div v-else class="d-flex flex-column gap-3">
                    <article
                      v-for="product in products"
                      :key="product.id"
                      class="product-card p-3 border rounded-3"
                      :class="{ 'product-card--selected': (productQuantities[product.id] ?? 0) > 0 }"
                    >
                      <div class="d-flex justify-content-between gap-3 flex-column flex-sm-row">
                        <div>
                          <h3 class="h6 mb-1">{{ product.name }}</h3>
                          <p class="mb-2 text-muted small">{{ formatCurrency(product.price) }}</p>
                          <ul v-if="product.details?.length" class="small text-muted mb-0">
                            <li v-for="detail in product.details" :key="detail">{{ detail }}</li>
                          </ul>
                        </div>
                        <div class="quantity-control ms-sm-auto">
                          <button type="button" class="btn btn-outline-secondary btn-sm" @click="decreaseQuantity(product.id)">-</button>
                          <input
                            type="number"
                            min="0"
                            class="form-control form-control-sm"
                            :value="productQuantities[product.id] ?? 0"
                            @input="handleQuantityInput(product.id, $event)"
                          />
                          <button type="button" class="btn btn-outline-secondary btn-sm" @click="increaseQuantity(product.id)">+</button>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>

                <div class="col-lg-5">
                  <h2 class="h6 text-uppercase text-muted mb-3">Tu pedido</h2>
                  <div class="border rounded-3 p-4 bg-light">
                    <div class="mb-3">
                      <label class="form-label small text-uppercase">Telefono</label>
                      <input
                        type="tel"
                        class="form-control"
                        placeholder="Ej. 71234567"
                        v-model.trim="phoneNumber"
                        :readonly="isPhoneLocked"
                      />
                      <p v-if="isPhoneLocked" class="form-text small text-muted mb-0">
                        Este número viene del enlace de WhatsApp. Abre un nuevo enlace para usar otro.
                      </p>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small text-uppercase">Metodo de pago</label>
                      <div class="btn-group w-100" role="group">
                        <input
                          type="radio"
                          class="btn-check"
                          name="payment"
                          id="paymentQr"
                          value="QR"
                          v-model="paymentMethod"
                        />
                        <label class="btn btn-outline-primary" for="paymentQr">QR / Transferencia</label>
                        <input
                          type="radio"
                          class="btn-check"
                          name="payment"
                          id="paymentCash"
                          value="EFECTIVO"
                          v-model="paymentMethod"
                        />
                        <label class="btn btn-outline-primary" for="paymentCash">Efectivo</label>
                      </div>
                    </div>

                    <div class="mb-4">
                      <label class="form-label small text-uppercase">Tipo de entrega</label>
                      <div class="btn-group w-100" role="group">
                        <input
                          type="radio"
                          class="btn-check"
                          name="pickup"
                          id="pickupStore"
                          value="EN_LOCAL"
                          v-model="pickupType"
                        />
                        <label class="btn btn-outline-secondary" for="pickupStore">Retiro en local</label>
                        <input
                          type="radio"
                          class="btn-check"
                          name="pickup"
                          id="pickupDelivery"
                          value="DELIVERY"
                          v-model="pickupType"
                        />
                        <label class="btn btn-outline-secondary" for="pickupDelivery">Delivery</label>
                      </div>
                    </div>

                    <div class="mb-3">
                      <p class="text-uppercase small text-muted mb-2">Resumen</p>
                      <div v-if="!selectedProducts.length" class="text-muted small">
                        Agrega productos para ver el resumen de tu pedido.
                      </div>
                      <ul v-else class="list-unstyled mb-0 small">
                        <li v-for="product in selectedProducts" :key="product.id" class="d-flex justify-content-between mb-2">
                          <span>{{ product.name }} x{{ product.count }}</span>
                          <strong>{{ formatCurrency(product.price * product.count) }}</strong>
                        </li>
                        <li class="d-flex justify-content-between pt-2 border-top mt-3">
                          <span class="fw-semibold">Total</span>
                          <span class="fw-bold">{{ formattedSubtotal }}</span>
                        </li>
                      </ul>
                    </div>

                    <div v-if="formError" class="alert alert-danger small py-2" role="alert">
                      {{ formError }}
                    </div>

                    <button
                      type="button"
                      class="btn btn-primary w-100"
                      :disabled="isSubmitting"
                      @click="submitOrder"
                    >
                      <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Enviar pedido
                    </button>
                  </div>
                  <p class="small text-muted text-center mt-3 mb-0">Nos comunicaremos contigo para confirmar los detalles.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { API_BASE_URL } from '../constants/env';

interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  details?: string[];
}

interface OrderProduct {
  id: string;
  name: string;
  price: number;
  count: number;
}

interface OrderPayload {
  phoneNumber: string;
  products: OrderProduct[];
  subtotal: number;
  paid: boolean;
  pickupType: 'EN_LOCAL' | 'DELIVERY';
  datetime: string;
  orderCode: string;
  user: string;
  source: string;
}

const PRODUCTS_ENDPOINT = `${API_BASE_URL}/products`;
const ORDER_CREATE_ENDPOINT = `${API_BASE_URL}/order`;

const route = useRoute();
const router = useRouter();
const isPhoneLocked = computed(() => {
  const param = route.params.phone;
  return typeof param === 'string' && param.trim().length > 0;
});

const products = ref<CatalogProduct[]>([]);
const productQuantities = ref<Record<string, number>>({});
const isLoadingProducts = ref(true);
const productsError = ref<string | null>(null);

const phoneNumber = ref('');
const paymentMethod = ref<'QR' | 'EFECTIVO'>('EFECTIVO');
const pickupType = ref<'EN_LOCAL' | 'DELIVERY'>('DELIVERY');

const formError = ref<string | null>(null);
const isSubmitting = ref(false);

const staticOrderData = {
  user: 'online',
};

const initializeQuantities = (list: CatalogProduct[]) => {
  const next: Record<string, number> = {};
  list.forEach((item) => {
    next[item.id] = 0;
  });
  productQuantities.value = next;
};

const fetchProducts = async () => {
  isLoadingProducts.value = true;
  productsError.value = null;
  try {
    const { data } = await axios.get<CatalogProduct[]>(PRODUCTS_ENDPOINT);
    products.value = data;
    initializeQuantities(data);
  } catch (error) {
    console.error('Error al cargar los productos:', error);
    productsError.value = 'No pudimos cargar los productos. Intenta nuevamente.';
  } finally {
    isLoadingProducts.value = false;
  }
};

const selectedProducts = computed<OrderProduct[]>(() =>
  products.value.reduce<OrderProduct[]>((accumulator, product) => {
    const count = productQuantities.value[product.id] ?? 0;
    if (count > 0) {
      accumulator.push({
        id: product.id,
        name: product.name,
        price: product.price,
        count,
      });
    }
    return accumulator;
  }, []),
);

const subtotal = computed(() =>
  selectedProducts.value.reduce((accumulator, product) => accumulator + product.price * product.count, 0),
);

const orderPreview = computed<OrderPayload>(() => ({
  phoneNumber: phoneNumber.value.trim(),
  products: selectedProducts.value,
  subtotal: Number(subtotal.value.toFixed(2)),
  paid: paymentMethod.value === 'QR',
  pickupType: pickupType.value,
  datetime: new Date().toISOString(),
  orderCode: `WA-${Date.now()}`,
  user: staticOrderData.user,
  source: 'whatsapp',
}));

const formattedSubtotal = computed(() => formatCurrency(subtotal.value));

const updateQuantity = (id: string, value: number) => {
  const sanitizedValue = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  productQuantities.value = {
    ...productQuantities.value,
    [id]: sanitizedValue,
  };
};

const increaseQuantity = (id: string) => {
  const current = productQuantities.value[id] ?? 0;
  updateQuantity(id, current + 1);
};

const decreaseQuantity = (id: string) => {
  const current = productQuantities.value[id] ?? 0;
  updateQuantity(id, Math.max(current - 1, 0));
};

const handleQuantityInput = (id: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const parsed = parseInt(target.value, 10);
  updateQuantity(id, Number.isNaN(parsed) ? 0 : parsed);
};

const submitOrder = async () => {
  const payload = orderPreview.value;

  if (!payload.phoneNumber) {
    formError.value = 'Ingresa tu numero de telefono para continuar.';
    return;
  }

  if (!payload.products.length) {
    formError.value = 'Selecciona al menos un producto.';
    return;
  }

  formError.value = null;
  isSubmitting.value = true;

  try {
    await axios.post(ORDER_CREATE_ENDPOINT, payload);
    initializeQuantities(products.value);
    router.push({
      name: 'online-pedido-gracias',
      params: { phone: payload.phoneNumber },
    });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    formError.value = 'No pudimos enviar tu pedido. Intenta nuevamente.';
  } finally {
    isSubmitting.value = false;
  }
};

const formatCurrency = (amount: number | undefined) => {
  if (typeof amount !== 'number') {
    return 'N/A';
  }

  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(amount);
};

watch(
  () => route.params.phone,
  (value) => {
    if (typeof value === 'string') {
      phoneNumber.value = value.trim();
    } else {
      phoneNumber.value = '';
    }
  },
  { immediate: true },
);

watch(
  [phoneNumber, () => selectedProducts.value.length],
  () => {
    if (formError.value) {
      formError.value = null;
    }
  },
);

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.online-order-view {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(13, 110, 253, 0.05), rgba(25, 135, 84, 0.05));
}

.product-card {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.product-card--selected {
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.2);
}

.quantity-control {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5rem;
  align-items: center;
}

.quantity-control input {
  text-align: center;
}
</style>
