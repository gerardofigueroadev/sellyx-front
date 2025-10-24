<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { Modal } from 'bootstrap'
import { API_BASE_URL } from '../constants/env'

interface Product {
  id: string
  name: string
  details: string[]
  price: number
  createdAt: string
}

const PRODUCTS_ENDPOINT = `${API_BASE_URL}/products`
const PRODUCT_ENDPOINT = (id: string) => `${API_BASE_URL}/product/${id}`
const PRODUCT_RESOURCE = `${API_BASE_URL}/product`

const products = ref<Product[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)
const productToDelete = ref<Product | null>(null)
const isCreating = ref(false)
const createError = ref<string | null>(null)
const isUpdating = ref(false)
const updateError = ref<string | null>(null)
const newProduct = reactive({
  name: '',
  detailsText: '',
  price: '',
  createdAt: '',
})
const editProduct = reactive({
  id: '',
  name: '',
  detailsText: '',
  price: '',
  createdAt: '',
})

const deleteModalRef = ref<HTMLElement | null>(null)
const createModalRef = ref<HTMLElement | null>(null)
const editModalRef = ref<HTMLElement | null>(null)
let deleteModal: Modal | null = null
let createModal: Modal | null = null
let editModal: Modal | null = null

const fetchProducts = async () => {
  isLoading.value = true
  errorMessage.value = null
  try {
    const { data } = await axios.get<Product[]>(PRODUCTS_ENDPOINT)
    products.value = data
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los productos. Intenta nuevamente.'
  } finally {
    isLoading.value = false
  }
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(value)

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-BO')

const confirmDelete = (product: Product) => {
  productToDelete.value = product
  deleteError.value = null
  deleteModal?.show()
}

const cancelDelete = () => {
  deleteModal?.hide()
}

const handleDeleteModalHidden = () => {
  productToDelete.value = null
  deleteError.value = null
  isDeleting.value = false
}

const deleteProduct = async () => {
  if (!productToDelete.value) return

  isDeleting.value = true
  deleteError.value = null

  try {
    await axios.delete(PRODUCT_ENDPOINT(productToDelete.value.id))
    products.value = products.value.filter((item) => item.id !== productToDelete.value?.id)
    cancelDelete()
  } catch (error) {
    deleteError.value = 'No se pudo eliminar el producto. Intenta nuevamente.'
    isDeleting.value = false
  }
}

const getDefaultCreatedAt = () => {
  const now = new Date()
  now.setSeconds(0, 0)
  const offsetMs = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16)
}

const toDateTimeLocal = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return getDefaultCreatedAt()
  }
  const offsetMs = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

const resetNewProduct = () => {
  newProduct.name = ''
  newProduct.detailsText = ''
  newProduct.price = ''
  newProduct.createdAt = getDefaultCreatedAt()
}

const resetEditProduct = () => {
  editProduct.id = ''
  editProduct.name = ''
  editProduct.detailsText = ''
  editProduct.price = ''
  editProduct.createdAt = getDefaultCreatedAt()
}

const openCreateModal = () => {
  resetNewProduct()
  createError.value = null
  isCreating.value = false
  createModal?.show()
}

const cancelCreate = () => {
  createModal?.hide()
}

const handleCreateModalHidden = () => {
  resetNewProduct()
  createError.value = null
  isCreating.value = false
}

const openEditModal = (product: Product) => {
  editProduct.id = product.id
  editProduct.name = product.name
  editProduct.detailsText = product.details.join('\n')
  editProduct.price = product.price.toString()
  editProduct.createdAt = toDateTimeLocal(product.createdAt)
  updateError.value = null
  isUpdating.value = false
  editModal?.show()
}

const cancelEdit = () => {
  editModal?.hide()
}

const handleEditModalHidden = () => {
  resetEditProduct()
  updateError.value = null
  isUpdating.value = false
}

const submitNewProduct = async () => {
  const name = newProduct.name.trim()
  const priceValue = Number(newProduct.price)
  const details = newProduct.detailsText
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  if (!name) {
    createError.value = 'El nombre es obligatorio.'
    return
  }

  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    createError.value = 'Ingresa un precio valido.'
    return
  }

  if (details.length === 0) {
    createError.value = 'Ingresa al menos un detalle del producto.'
    return
  }

  const createdAtIso = newProduct.createdAt
    ? new Date(newProduct.createdAt).toISOString()
    : new Date().toISOString()

  isCreating.value = true
  createError.value = null

  try {
    const { data } = await axios.post<Product>(PRODUCT_RESOURCE, {
      name,
      details,
      price: priceValue,
      createdAt: createdAtIso,
    })
    products.value = [data, ...products.value]
    cancelCreate()
  } catch (error) {
    createError.value = 'No se pudo crear el producto. Intenta nuevamente.'
  } finally {
    isCreating.value = false
  }
}

const submitEditProduct = async () => {
  if (!editProduct.id) {
    updateError.value = 'No se encontro el producto a actualizar.'
    return
  }

  const name = editProduct.name.trim()
  const priceValue = Number(editProduct.price)
  const details = editProduct.detailsText
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  if (!name) {
    updateError.value = 'El nombre es obligatorio.'
    return
  }

  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    updateError.value = 'Ingresa un precio valido.'
    return
  }

  if (details.length === 0) {
    updateError.value = 'Ingresa al menos un detalle del producto.'
    return
  }

  const createdAtIso = editProduct.createdAt
    ? new Date(editProduct.createdAt).toISOString()
    : new Date().toISOString()

  isUpdating.value = true
  updateError.value = null

  try {
    const { data } = await axios.put<Product>(PRODUCT_ENDPOINT(editProduct.id), {
      name,
      details,
      price: priceValue,
      createdAt: createdAtIso,
    })
    products.value = products.value.map((item) => (item.id === data.id ? data : item))
    isUpdating.value = false
    cancelEdit()
  } catch (error) {
    updateError.value = 'No se pudo actualizar el producto. Intenta nuevamente.'
    isUpdating.value = false
  }
}

resetNewProduct()
resetEditProduct()

onMounted(() => {
  fetchProducts()
  if (deleteModalRef.value) {
    deleteModal = new Modal(deleteModalRef.value)
    deleteModalRef.value.addEventListener('hidden.bs.modal', handleDeleteModalHidden)
  }
  if (createModalRef.value) {
    createModal = new Modal(createModalRef.value)
    createModalRef.value.addEventListener('hidden.bs.modal', handleCreateModalHidden)
  }
  if (editModalRef.value) {
    editModal = new Modal(editModalRef.value)
    editModalRef.value.addEventListener('hidden.bs.modal', handleEditModalHidden)
  }
})

onBeforeUnmount(() => {
  if (deleteModalRef.value) {
    deleteModalRef.value.removeEventListener('hidden.bs.modal', handleDeleteModalHidden)
  }
  if (createModalRef.value) {
    createModalRef.value.removeEventListener('hidden.bs.modal', handleCreateModalHidden)
  }
  if (editModalRef.value) {
    editModalRef.value.removeEventListener('hidden.bs.modal', handleEditModalHidden)
  }
  createModal = null
  editModal = null
  deleteModal = null
})
</script>

<template>
  <section class="py-5">
    <div class="container">
      <div class="text-center mb-5">
        <h1 class="fw-bold">Gestión de Productos</h1>
        <p class="text-muted mb-0">
          Organizá tu catalogo, controla inventarios y manten tus productos al dia con una vista centralizada.
        </p>
      </div>

      <div class="card shadow-sm border-0">
        <div class="card-header d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div>
            <h2 class="h5 fw-semibold mb-0">Productos</h2>
          </div>
          <div class="d-flex flex-column flex-sm-row gap-2">
            <button type="button" class="btn btn-outline-primary" @click="openCreateModal">
              Nuevo Producto
            </button>
            <button type="button" class="btn btn-outline-primary" @click="fetchProducts" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Recargar
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <div v-if="errorMessage" class="alert alert-danger m-3" role="alert">
            {{ errorMessage }}
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Detalles</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Creado</th>
                  <th scope="col" class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="5" class="text-center py-4">
                    <div class="d-flex justify-content-center align-items-center gap-2">
                      <span class="spinner-border text-primary" role="status" aria-hidden="true"></span>
                      <span>Cargando productos...</span>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="products.length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">No hay productos registrados.</td>
                </tr>
                <tr v-else v-for="product in products" :key="product.id">
                  <td class="fw-semibold">{{ product.name }}</td>
                  <td>
                    <ul class="list-unstyled mb-0">
                      <li v-for="detail in product.details" :key="detail">{{ detail }}</li>
                    </ul>
                  </td>
                  <td>{{ formatPrice(product.price) }}</td>
                  <td>{{ formatDate(product.createdAt) }}</td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm" role="group" aria-label="acciones">
                      <button type="button" class="btn btn-outline-secondary" @click="openEditModal(product)">Editar</button>
                      <button type="button" class="btn btn-outline-danger" @click="confirmDelete(product)">Eliminar</button>
                    </div>
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
    id="createProductModal"
    tabindex="-1"
    aria-labelledby="createProductModalLabel"
    aria-hidden="true"
    ref="createModalRef"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <form @submit.prevent="submitNewProduct">
          <div class="modal-header">
            <h2 class="modal-title h5" id="createProductModalLabel">Nuevo producto</h2>
            <button type="button" class="btn-close" @click="cancelCreate" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="productName" class="form-label">Nombre</label>
              <input
                id="productName"
                v-model="newProduct.name"
                type="text"
                class="form-control"
                placeholder="Ej. Cuarto de Pollo"
                required
              />
            </div>
            <div class="mb-3">
              <label for="productPrice" class="form-label">Precio (Bs)</label>
              <input
                id="productPrice"
                v-model="newProduct.price"
                type="number"
                min="0"
                step="0.01"
                class="form-control"
                placeholder="0.00"
                required
              />
            </div>
            <div class="mb-3">
              <label for="productDetails" class="form-label">Detalles</label>
              <textarea
                id="productDetails"
                v-model="newProduct.detailsText"
                rows="3"
                class="form-control"
                placeholder="Una linea por detalle (ej. Porcion de papas fritas)"
                required
              ></textarea>
              <small class="text-muted">Ingresa un detalle por linea.</small>
            </div>
            <div class="mb-3">
              <label for="productCreatedAt" class="form-label">Fecha de creacion</label>
              <input
                id="productCreatedAt"
                v-model="newProduct.createdAt"
                type="datetime-local"
                class="form-control"
                required
              />
            </div>
            <div v-if="createError" class="alert alert-danger mb-0" role="alert">
              {{ createError }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="cancelCreate" :disabled="isCreating">
              Cancelar
            </button>
            <button type="submit" class="btn btn-outline-primary" :disabled="isCreating">
              <span v-if="isCreating" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    id="editProductModal"
    tabindex="-1"
    aria-labelledby="editProductModalLabel"
    aria-hidden="true"
    ref="editModalRef"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <form @submit.prevent="submitEditProduct">
          <div class="modal-header">
            <h2 class="modal-title h5" id="editProductModalLabel">Editar producto</h2>
            <button type="button" class="btn-close" @click="cancelEdit" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="editProductName" class="form-label">Nombre</label>
              <input
                id="editProductName"
                v-model="editProduct.name"
                type="text"
                class="form-control"
                placeholder="Ej. Cuarto de Pollo"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editProductPrice" class="form-label">Precio (Bs)</label>
              <input
                id="editProductPrice"
                v-model="editProduct.price"
                type="number"
                min="0"
                step="0.01"
                class="form-control"
                placeholder="0.00"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editProductDetails" class="form-label">Detalles</label>
              <textarea
                id="editProductDetails"
                v-model="editProduct.detailsText"
                rows="3"
                class="form-control"
                placeholder="Una linea por detalle (ej. Porcion de papas fritas)"
                required
              ></textarea>
              <small class="text-muted">Ingresa un detalle por linea.</small>
            </div>
            <div class="mb-3">
              <label for="editProductCreatedAt" class="form-label">Fecha de creacion</label>
              <input
                id="editProductCreatedAt"
                v-model="editProduct.createdAt"
                type="datetime-local"
                class="form-control"
                required
              />
            </div>
            <div v-if="updateError" class="alert alert-danger mb-0" role="alert">
              {{ updateError }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="cancelEdit" :disabled="isUpdating">
              Cancelar
            </button>
            <button type="submit" class="btn btn-outline-primary" :disabled="isUpdating">
              <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    id="deleteProductModal"
    tabindex="-1"
    aria-labelledby="deleteProductModalLabel"
    aria-hidden="true"
    ref="deleteModalRef"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title h5" id="deleteProductModalLabel">Eliminar producto</h2>
          <button type="button" class="btn-close" @click="cancelDelete" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <p class="mb-3">
            Seguro que deseas eliminar
            <strong>{{ productToDelete?.name }}</strong>?
          </p>
          <p class="text-muted small mb-0">
            Esta accion no se puede deshacer y eliminara definitivamente el producto seleccionado.
          </p>
          <div v-if="deleteError" class="alert alert-danger mt-3 mb-0" role="alert">
            {{ deleteError }}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="cancelDelete" :disabled="isDeleting">Cancelar</button>
          <button type="button" class="btn btn-outline-danger" @click="deleteProduct" :disabled="isDeleting">
            <span v-if="isDeleting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
section {
  background-color: #f8f9fa;
}
</style>
