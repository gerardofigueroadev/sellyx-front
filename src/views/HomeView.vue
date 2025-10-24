<template>
  <div class="home-view flex-grow-1">
    <section class="hero-section py-5">
      <div class="container py-lg-5">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <h1 class="display-5 fw-bold mb-3">Administra tus ventas con facilidad</h1>
            <p class="lead text-muted mb-4">
              PanelSales te ayuda a visualizar metricas clave, gestionar clientes y monitorear el desempeno de tu equipo en
              tiempo real.
            </p>
            <div class="d-flex flex-column flex-sm-row gap-3">
              <a class="btn btn-primary btn-lg" href="#register">Comenzar ahora</a>
              <a class="btn btn-outline-primary btn-lg" href="#demo">Ver demo</a>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="card dashboard-card shadow-lg border-0">
              <div class="card-body p-4">
                <h2 class="h5 text-primary mb-4">Resumen diario</h2>
                <div class="row g-3">
                  <div class="col-6">
                    <div class="stat-card">
                      <span class="text-muted small">Ventas hoy</span>
                      <p class="h4 mb-0">S/ 4,250</p>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="stat-card">
                      <span class="text-muted small">Nuevos clientes</span>
                      <p class="h4 mb-0">18</p>
                    </div>
                  </div>
                  <div class="col-12">
                    <span class="text-muted small">Meta mensual</span>
                    <div class="progress my-2" style="height: 8px">
                      <div
                        class="progress-bar bg-primary"
                        role="progressbar"
                        style="width: 72%"
                        aria-valuenow="72"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <small class="text-success fw-semibold">72% alcanzado</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="top-products" class="py-5 bg-light">
      <div class="container">
        <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
          <div>
            <h2 class="fw-bold mb-1">Productos destacados</h2>
            <p class="text-muted mb-0">Revisa los productos mas y menos vendidos segun el periodo seleccionado.</p>
          </div>
          <div class="top-products-filter text-lg-end">
            <label class="form-label small text-muted mb-1" for="topProductsRange">Rango de fechas</label>
            <select
              id="topProductsRange"
              v-model="selectedRange"
              class="form-select form-select-sm"
              :disabled="isLoadingTopProducts"
            >
              <option v-for="option in rangeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="isLoadingTopProducts" class="d-flex flex-column align-items-center justify-content-center py-5">
          <div class="spinner-border text-primary mb-3" role="status" aria-hidden="true"></div>
          <p class="text-muted mb-0">Cargando productos destacados...</p>
        </div>
        <div v-else-if="topProductsError" class="alert alert-danger" role="alert">
          {{ topProductsError }}
        </div>
        <div v-else class="row g-4">
          <div class="col-lg-6">
            <div class="top-products-card h-100">
              <div class="card-header bg-transparent border-0 px-0 pt-0">
                <h3 class="h5 fw-semibold mb-1 text-success">Top 3 mas vendidos</h3>
                <p class="text-muted small mb-0">Productos con mayor cantidad vendida.</p>
              </div>
              <ul class="list-unstyled mb-0 mt-3">
                <li v-for="item in mostSold" :key="item.productId" class="product-summary-item">
                  <div class="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <span class="fw-semibold">{{ item.name ?? 'Producto sin nombre' }}</span>
                      <div class="text-muted small">Unidades vendidas: {{ item.totalCount }}</div>
                    </div>
                    <span class="badge text-bg-success">{{ formatCurrency(item.totalRevenue) }}</span>
                  </div>
                </li>
                <li v-if="!mostSold.length" class="product-summary-item text-muted text-center">
                  No hay datos disponibles para este rango.
                </li>
              </ul>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="top-products-card h-100">
              <div class="card-header bg-transparent border-0 px-0 pt-0">
                <h3 class="h5 fw-semibold mb-1 text-danger">Top 3 menos vendidos</h3>
                <p class="text-muted small mb-0">Productos con menor movimiento.</p>
              </div>
              <ul class="list-unstyled mb-0 mt-3">
                <li v-for="item in leastSold" :key="item.productId" class="product-summary-item">
                  <div class="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <span class="fw-semibold">{{ item.name ?? 'Producto sin nombre' }}</span>
                      <div class="text-muted small">Unidades vendidas: {{ item.totalCount }}</div>
                    </div>
                    <span class="badge text-bg-secondary">{{ formatCurrency(item.totalRevenue) }}</span>
                  </div>
                </li>
                <li v-if="!leastSold.length" class="product-summary-item text-muted text-center">
                  No hay datos disponibles para este rango.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="sales-charts" class="py-5 bg-white">
      <div class="container">
        <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
          <div>
            <h2 class="fw-bold mb-1">Rendimiento diario</h2>
            <p class="text-muted mb-0">Visualiza el comportamiento de las ventas diarias y los montos recaudados.</p>
          </div>
        </div>

        <div v-if="isLoadingDailySales" class="d-flex flex-column align-items-center justify-content-center py-5">
          <div class="spinner-border text-primary mb-3" role="status" aria-hidden="true"></div>
          <p class="text-muted mb-0">Cargando informacion diaria...</p>
        </div>
        <div v-else-if="dailySalesError" class="alert alert-danger" role="alert">
          {{ dailySalesError }}
        </div>
        <div v-else class="row g-4">
          <div class="col-lg-6">
            <div class="sales-chart-card h-100">
              <h3 class="h5 fw-semibold mb-3">Cantidad de ventas</h3>
              <Responsive>
                <template #main="{ width }">
                  <VueChart
                    :size="resolveChartSize(width)"
                    :data="countChartData"
                    :margin="chartMargin"
                    :direction="chartDirection"
                    :axis="countAxis"
                    :config="{ controlHover: true }"
                  >
                    <template #layers>
                      <Grid strokeDasharray="2,2" />
                      <Area :dataKeys="['day', 'count']" type="monotone" :areaStyle="{ fill: 'url(#countGradient)' }" />
                      <Line :dataKeys="['day', 'count']" type="monotone" :lineStyle="countLineStyle" />
                      <defs>
                        <linearGradient id="countGradient" gradientTransform="rotate(90)">
                          <stop offset="0%" stop-color="#0d6efd" stop-opacity="0.35" />
                          <stop offset="100%" stop-color="white" stop-opacity="0.1" />
                        </linearGradient>
                      </defs>
                    </template>
                    <template #widgets>
                      <Tooltip
                        borderColor="#0d6efd"
                        :config="countTooltipConfig"
                      />
                    </template>
                  </VueChart>
                </template>
              </Responsive>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="sales-chart-card h-100">
              <h3 class="h5 fw-semibold mb-3">Monto recaudado</h3>
              <Responsive>
                <template #main="{ width }">
                  <VueChart
                    :size="resolveChartSize(width)"
                    :data="revenueChartData"
                    :margin="chartMargin"
                    :direction="chartDirection"
                    :axis="revenueAxis"
                    :config="{ controlHover: true }"
                  >
                    <template #layers>
                      <Grid strokeDasharray="2,2" />
                      <Area
                        :dataKeys="['day', 'amount']"
                        type="monotone"
                        :areaStyle="{ fill: 'url(#revenueGradient)' }"
                      />
                      <Line :dataKeys="['day', 'amount']" type="monotone" :lineStyle="revenueLineStyle" />
                      
                      <defs>
                        <linearGradient id="revenueGradient" gradientTransform="rotate(90)">
                          <stop offset="0%" stop-color="#6610f2" stop-opacity="0.35" />
                          <stop offset="100%" stop-color="white" stop-opacity="0.1" />
                        </linearGradient>
                      </defs>
                    </template>
                    <template #widgets>
                      <Tooltip
                        borderColor="#6610f2"
                        :config="revenueTooltipConfig"
                      />
                    </template>
                  </VueChart>
                </template>
              </Responsive>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer id="contact" class="bg-primary text-white py-4">
      <div class="container d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3">
        <div>
          <span class="fw-semibold">Necesitas ayuda?</span>
          <p class="mb-0 text-white-50">Escribenos a soporte@panelsales.com o agenda una demostracion personalizada.</p>
        </div>
        <div class="d-flex gap-3">
          <a class="text-white text-decoration-none" href="#privacy">Privacidad</a>
          <a class="text-white text-decoration-none" href="#terms">Terminos</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, onMounted, ref, watch } from 'vue';
import { Chart as VueChart, Grid, Line, Area, Tooltip, Responsive } from 'vue3-charts';
import type { ChartAxis, Domain } from 'vue3-charts/dist/types';
import { API_BASE_URL } from '../constants/env';

type RangeValue = 'day' | 'week' | 'all';

interface TopProduct {
  productId: string;
  totalCount: number;
  totalRevenue: number;
  name?: string;
}

interface TopProductsResponse {
  mostSold: TopProduct[];
  leastSold: TopProduct[];
}

interface DailySalesEntry {
  day: string;
  totalSales: number;
  amount: number;
}

const rangeOptions: Array<{ value: RangeValue; label: string }> = [
  { value: 'day', label: 'Hoy' },
  { value: 'week', label: 'Ultimos 7 dias' },
  { value: 'all', label: 'Todos' },
];

const selectedRange = ref<RangeValue>('day');
const isLoadingTopProducts = ref(false);
const topProductsError = ref<string | null>(null);
const topProductsData = ref<TopProductsResponse | null>(null);

const dailySales = ref<DailySalesEntry[]>([]);
const isLoadingDailySales = ref(false);
const dailySalesError = ref<string | null>(null);

const fetchTopProducts = async () => {
  isLoadingTopProducts.value = true;
  topProductsError.value = null;

  try {
    const { data } = await axios.get<TopProductsResponse>(`${API_BASE_URL}/reports/top-products`, {
      params: {
        range: selectedRange.value,
      },
    });
    topProductsData.value = data;
  } catch (error) {
    console.error('Error al cargar los productos destacados:', error);
    topProductsError.value = 'No se pudieron obtener los productos destacados. Intenta nuevamente.';
  } finally {
    isLoadingTopProducts.value = false;
  }
};

const fetchDailySales = async () => {
  isLoadingDailySales.value = true;
  dailySalesError.value = null;

  try {
    const { data } = await axios.get<DailySalesEntry[]>(`${API_BASE_URL}/reports/daily-sales`);
    dailySales.value = data;
  } catch (error) {
    console.error('Error al cargar las ventas diarias:', error);
    dailySalesError.value = 'No se pudieron obtener las ventas diarias. Intenta nuevamente.';
  } finally {
    isLoadingDailySales.value = false;
  }
};

const mostSold = computed(() => topProductsData.value?.mostSold ?? []);
const leastSold = computed(() => topProductsData.value?.leastSold ?? []);

const formatCurrency = (value: number | undefined) => {
  if (typeof value !== 'number') {
    return 'Bs. 0.00';
  }

  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(value);
};

const chartDirection = ref<'horizontal' | 'vertical'>('horizontal');
const chartMargin = ref({ top: 20, right: 20, bottom: 40, left: 48 });
const chartHeight = 280;
const fallbackChartWidth = 520;
const resolveChartSize = (width?: number) => ({
  width: width && width > 0 ? Math.max(width, 240) : fallbackChartWidth,
  height: chartHeight,
});

const countLineStyle = { stroke: '#0d6efd', strokeWidth: 2 };
const revenueLineStyle = { stroke: '#6610f2', strokeWidth: 2 };
const toBandDomain = (values: string[]): Domain =>
  (values.length ? values : ['', '']) as unknown as Domain;

const countChartData = computed(() =>
  dailySales.value.map((item) => ({
    day: item.day,
    count: item.totalSales,
  })),
);

const revenueChartData = computed(() =>
  dailySales.value.map((item) => ({
    day: item.day,
    amount: Number(item.amount.toFixed(2)),
  })),
);

const countAxis = computed<ChartAxis>(() => {
  const domain = countChartData.value.map((item) => item.day);
  return {
    primary: {
      type: 'band',
      domain: toBandDomain(domain),
      rotate: domain.length > 6,
    },
    secondary: {
      type: 'linear',
      domain: ['dataMin', 'dataMax'] as Domain,
      format: (value: string) => `${Math.round(Number(value))}`,
      ticks: 8,
    },
  };
});

const countTooltipConfig = computed(() => ({
  count: { label: 'Ventas', color: '#0d6efd' },
}));

const revenueAxis = computed<ChartAxis>(() => {
  const domain = revenueChartData.value.map((item) => item.day);
  return {
    primary: {
      type: 'band',
      domain: toBandDomain(domain),
      rotate: domain.length > 6,
    },
    secondary: {
      type: 'linear',
      domain: ['dataMin', 'dataMax'] as Domain,
      format: (value: string) => formatCurrency(Number(value)),
      ticks: 8,
    },
  };
});

const revenueTooltipConfig = computed(() => ({
  amount: {
    label: 'Monto',
    color: '#6610f2',
    format: (value: number) => formatCurrency(Number(value)),
  },
}));

watch(selectedRange, () => {
  fetchTopProducts();
});

onMounted(() => {
  fetchTopProducts();
  fetchDailySales();
});
</script>

<style scoped>
.p-1 {
padding: 2rem;
}

.home-view {
  display: flex;
  flex-direction: column;
}

.hero-section {
  background: linear-gradient(120deg, rgba(13, 110, 253, 0.08), rgba(111, 66, 193, 0.08));
}

.dashboard-card {
  border-radius: 1.5rem;
}

.stat-card {
  background-color: #f8f9fa;
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid rgba(13, 110, 253, 0.1);
}

.check-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  font-weight: 600;
}

#top-products {
  background-color: #f6f8fb;
}

.top-products-card {
  background-color: #ffffff;
  border: 1px solid rgba(13, 110, 253, 0.12);
  border-radius: 1rem;
  padding: 1.5rem;
  height: 100%;
  box-shadow: 0 4px 20px rgba(13, 110, 253, 0.05);
}

.product-summary-item + .product-summary-item {
  margin-top: 1rem;
}

.product-summary-item {
  border: 1px dashed rgba(13, 110, 253, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  background-color: #ffffff;
}

.product-summary-item .badge {
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
}

.top-products-filter select {
  min-width: 160px;
}

#sales-charts {
  background-color: #ffffff;
}

.sales-chart-card {
  background-color: #ffffff;
  border: 1px solid rgba(13, 110, 253, 0.12);
  border-radius: 1rem;
  padding: 1.5rem;
  height: 100%;
  box-shadow: 0 4px 20px rgba(13, 110, 253, 0.05);
}
</style>
