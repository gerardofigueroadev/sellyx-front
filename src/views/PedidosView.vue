<template>
  <section class="py-5 bg-white">
    <div class="container">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 class="fw-bold mb-1">Pedidos recientes</h1>
          <p class="text-muted mb-0">
            Supervisa el estado de cada pedido y mantiene informados a tus clientes en todo momento.
          </p>
        </div>
        <div class="d-flex flex-column flex-sm-row gap-2">
          <button type="button" class="btn btn-outline-primary" @click="openCreateOrderModal">Crear pedido</button>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col">Pedido</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Total</th>
                  <th scope="col">Estado del Pago</th>
                  <th scope="col">Tipo de recojo</th>
                  <th scope="col" class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="7" class="text-center py-4">Cargando pedidos...</td>
                </tr>
                <tr v-else-if="errorMessage">
                  <td colspan="7" class="text-center text-danger py-4">{{ errorMessage }}</td>
                </tr>
                <tr v-else-if="!orders.length">
                  <td colspan="7" class="text-center py-4 text-muted">No hay pedidos disponibles.</td>
                </tr>
                <tr v-else v-for="order in orders" :key="order.id">
                  <td>{{ order.orderCode ?? '-' }}</td>
                  <td>
                    <div class="fw-semibold">{{ order.phoneNumber ?? 'Anonimo' }}</div>
                  </td>
                  <td>{{ formatDate(order.datetime) }}</td>
                  <td>{{ formatCurrency(order.subtotal) }}</td>
                  <td>
                    <span class="badge" :class="statusBadgeClass(order)">{{ statusBadgeLabel(order) }}</span>
                  </td>
                  <td>
                    <span class="badge text-bg-info">{{ pickupTypeLabel(order) }}</span>
                  </td>
                  <td class="text-end">
                    <button type="button" class="btn btn-sm btn-outline-secondary">Ver detalles</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div
    class="modal fade"
    id="createOrderModal"
    tabindex="-1"
    aria-labelledby="createOrderModalLabel"
    aria-hidden="true"
    ref="createOrderModalRef"
  >
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <form @submit.prevent="submitCreateOrder">
          <div class="modal-header">
            <h2 class="modal-title h5" id="createOrderModalLabel">Nuevo pedido</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <div class="row g-4">
              <div class="col-lg-7">
                <h3 class="h6 text-uppercase text-muted mb-3">Selecciona productos</h3>
                <div v-if="isFetchingProducts" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status" aria-hidden="true"></div>
                  <div class="mt-3 small text-muted">Cargando productos...</div>
                </div>
                <div v-else-if="productsError" class="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
                  <span>{{ productsError }}</span>
                  <button type="button" class="btn btn-sm btn-outline-light" @click="fetchProducts">
                    Reintentar
                  </button>
                </div>
                <div v-else-if="!products.length" class="alert alert-info" role="alert">
                  No hay productos disponibles para seleccionar.
                </div>
                <div v-else class="d-flex flex-column gap-3">
                  <div
                    v-for="product in products"
                    :key="product.id"
                    class="product-item"
                    :class="{ 'product-item--selected': (productQuantities[product.id] ?? 0) > 0 }"
                  >
                    <div class="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <h4 class="h6 mb-1">{{ product.name }}</h4>
                        <div class="text-muted small">{{ formatCurrency(product.price) }}</div>
                      </div>
                      <div class="quantity-control input-group input-group-sm">
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="decreaseQuantity(product.id)"
                          :disabled="(productQuantities[product.id] ?? 0) === 0"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          class="form-control text-center"
                          :value="productQuantities[product.id] ?? 0"
                          min="0"
                          @input="handleQuantityInput(product.id, $event)"
                        />
                        <button type="button" class="btn btn-outline-secondary" @click="increaseQuantity(product.id)">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-5">
                <h3 class="h6 text-uppercase text-muted mb-3">Resumen del pedido</h3>
                <div class="mb-3">
                  <label for="orderPhoneNumber" class="form-label fw-semibold">Telefono del cliente</label>
                  <input
                    id="orderPhoneNumber"
                    v-model="phoneNumber"
                    type="tel"
                    class="form-control"
                    placeholder="Ej. 78590523"
                  />
                </div>
                <div class="mb-3">
                  <p class="form-label fw-semibold mb-2">Metodo de pago</p>
                  <div class="d-flex flex-column gap-2">
                    <div class="form-check">
                      <input
                        id="paymentMethodQR"
                        v-model="paymentMethod"
                        class="form-check-input"
                        type="radio"
                        value="QR"
                        name="paymentMethod"
                      />
                      <label class="form-check-label" for="paymentMethodQR">QR (pagado)</label>
                    </div>
                    <div class="form-check">
                      <input
                        id="paymentMethodCash"
                        v-model="paymentMethod"
                        class="form-check-input"
                        type="radio"
                        value="EFECTIVO"
                        name="paymentMethod"
                      />
                      <label class="form-check-label" for="paymentMethodCash">Efectivo (pago pendiente)</label>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <p class="form-label fw-semibold mb-2">Entrega</p>
                  <div class="d-flex flex-column gap-2">
                    <div class="form-check">
                      <input
                        id="pickupLocal"
                        v-model="pickupType"
                        class="form-check-input"
                        type="radio"
                        value="EN_LOCAL"
                        name="pickupType"
                      />
                      <label class="form-check-label" for="pickupLocal">Recoger en el local</label>
                    </div>
                    <div class="form-check">
                      <input
                        id="pickupDelivery"
                        v-model="pickupType"
                        class="form-check-input"
                        type="radio"
                        value="DELIVERY"
                        name="pickupType"
                      />
                      <label class="form-check-label" for="pickupDelivery">Delivery</label>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <p class="form-label fw-semibold mb-1">Subtotal</p>
                  <div class="d-flex justify-content-between align-items-center bg-light rounded px-3 py-2">
                    <span class="text-muted small">Total acumulado</span>
                    <span class="fs-5 fw-bold">{{ formattedSubtotal }}</span>
                  </div>
                </div>
                <div v-if="createOrderError" class="alert alert-danger mb-3" role="alert">
                  {{ createOrderError }}
                </div>
                <div>
                  <p class="form-label fw-semibold mb-2">JSON listo para enviar</p>
                  <pre class="order-preview mb-0">{{ orderPreviewJson }}</pre>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" :disabled="isSavingOrder">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isFetchingProducts || isSavingOrder">
              <span
                v-if="isSavingOrder"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {{ isSavingOrder ? 'Creando...' : 'Crear pedido' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Modal } from 'bootstrap';
import axios from 'axios';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { API_BASE_URL } from '../constants/env';

interface OrderProduct {
  id: string;
  name: string;
  price: number;
  count: number;
}

interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  details?: string[];
}

interface Order {
  id: string;
  phoneNumber: string;
  products: OrderProduct[];
  subtotal: number;
  paid: boolean;
  pickupType: string;
  orderCode: string;
  user: string;
  datetime: string;
  createdAt: string;
  source?: string;
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

const ORDERS_ENDPOINT = `${API_BASE_URL}/orders`;
const PRODUCTS_ENDPOINT = `${API_BASE_URL}/products`;
const ORDER_CREATE_ENDPOINT = `${API_BASE_URL}/order`;

const orders = ref<Order[]>([]);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);

const products = ref<CatalogProduct[]>([]);
const isFetchingProducts = ref(false);
const productsError = ref<string | null>(null);
const productQuantities = ref<Record<string, number>>({});
const phoneNumber = ref('');
const paymentMethod = ref<'QR' | 'EFECTIVO'>('QR');
const pickupType = ref<'EN_LOCAL' | 'DELIVERY'>('EN_LOCAL');
const createOrderError = ref<string | null>(null);
const isSavingOrder = ref(false);

const createOrderModalRef = ref<HTMLElement | null>(null);
let createOrderModal: Modal | null = null;

const staticOrderData = {
  datetime: '2025-10-22T17:01:38.897Z',
  orderCode: 'PL-1020',
  user: 'juanito1',
};

const initializeQuantities = (list: CatalogProduct[]) => {
  const next: Record<string, number> = {};
  list.forEach((item) => {
    next[item.id] = 0;
  });
  productQuantities.value = next;
};

const resetCreateOrderForm = () => {
  phoneNumber.value = '';
  paymentMethod.value = 'QR';
  pickupType.value = 'EN_LOCAL';
  createOrderError.value = null;
  isSavingOrder.value = false;
  initializeQuantities(products.value);
};

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    const { data } = await axios.get<Order[]>(ORDERS_ENDPOINT);
    orders.value = data;
  } catch (error) {
    console.error('Error al cargar los pedidos:', error);
    errorMessage.value = 'No se pudo cargar la lista de pedidos.';
  } finally {
    isLoading.value = false;
  }
};

const fetchProducts = async () => {
  isFetchingProducts.value = true;
  productsError.value = null;
  try {
    const { data } = await axios.get<CatalogProduct[]>(PRODUCTS_ENDPOINT);
    products.value = data;
    initializeQuantities(data);
  } catch (error) {
    console.error('Error al cargar los productos:', error);
    productsError.value = 'No se pudieron cargar los productos. Intenta nuevamente.';
  } finally {
    isFetchingProducts.value = false;
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
  datetime: Date.now().toString(),
  orderCode: staticOrderData.orderCode,
  user: staticOrderData.user,
  source: 'web',
}));

const orderPreviewJson = computed(() => JSON.stringify(orderPreview.value, null, 2));
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

const openCreateOrderModal = async () => {
  createOrderError.value = null;
  if (!products.value.length && !isFetchingProducts.value) {
    await fetchProducts();
  }

  if (products.value.length) {
    resetCreateOrderForm();
  }

  createOrderModal?.show();
};

const handleModalHidden = () => {
  resetCreateOrderForm();
};

const submitCreateOrder = async () => {
  const payload = orderPreview.value;

  if (!payload.phoneNumber) {
    createOrderError.value = 'Ingresa el telefono del cliente.';
    return;
  }

  if (!payload.products.length) {
    createOrderError.value = 'Selecciona al menos un producto para crear el pedido.';
    return;
  }

  createOrderError.value = null;
  isSavingOrder.value = true;

  try {
    const { data } = await axios.post<Order>(ORDER_CREATE_ENDPOINT, payload);
    const createdOrder =
      data ?? {
        id: `TEMP-${Date.now()}`,
        phoneNumber: payload.phoneNumber,
        products: payload.products,
        subtotal: payload.subtotal,
        paid: payload.paid,
        pickupType: payload.pickupType,
        orderCode: payload.orderCode,
        user: payload.user,
        datetime: Date.now(),
        createdAt: Date.now(),
        source: payload.source,
      };

    orders.value = [createdOrder, ...orders.value];
    createOrderModal?.hide();
    fetchOrders();
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    createOrderError.value = 'No se pudo crear el pedido. Intenta nuevamente.';
  } finally {
    isSavingOrder.value = false;
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

const formatDate = (value: string | undefined) => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const statusBadgeClass = (order: Order) => (order.paid ? 'text-bg-success' : 'text-bg-warning');
const statusBadgeLabel = (order: Order) => (order.paid ? 'Pagado' : 'Pendiente');
const pickupTypeLabel = (order: Order) => (order.pickupType === 'EN_LOCAL' ? 'En local' : 'Delivery');

watch(
  [phoneNumber, () => selectedProducts.value.length],
  () => {
    if (createOrderError.value) {
      createOrderError.value = null;
    }
  },
);

onMounted(() => {
  fetchOrders();
  fetchProducts();

  if (createOrderModalRef.value) {
    createOrderModal = new Modal(createOrderModalRef.value, { backdrop: 'static' });
    createOrderModalRef.value.addEventListener('hidden.bs.modal', handleModalHidden);
  }
});

onBeforeUnmount(() => {
  if (createOrderModalRef.value) {
    createOrderModalRef.value.removeEventListener('hidden.bs.modal', handleModalHidden);
  }

  createOrderModal?.hide();
  createOrderModal = null;
});
</script>

<style scoped>
.table-responsive {
  border-radius: 1rem;
  overflow: hidden;
}

.product-item {
  border: 1px solid #e9ecef;
  border-radius: 0.75rem;
  padding: 1rem;
}

.product-item--selected {
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.15);
}

.quantity-control {
  max-width: 7rem;
}

.quantity-control .btn {
  width: 2rem;
  font-size: 0.85rem;
  padding: 0.35rem 0;
}

.quantity-control input {
  text-align: center;
  font-size: 0.85rem;
  padding: 0.35rem 0;
}

.order-preview {
  max-height: 220px;
  overflow-y: auto;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 1rem;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.85rem;
}
</style>
