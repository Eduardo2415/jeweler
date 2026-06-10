<template>
  <div class="product-detail-root q-pa-md">
    <!-- Global header -->
    <header class="header flex items-center justify-between px-4 py-3">
      <q-btn flat round dense icon="menu" @click="$emit('toggle-menu')" />
      <div class="brand">
        JUAN INVERSIONES
        <q-img src="" class="logo-placeholder" />
      </div>
      <q-btn flat round dense icon="shopping_bag" @click="$emit('open-cart')">
        <q-badge color="accent" floating rounded v-if="cartCount">{{ cartCount }}</q-badge>
      </q-btn>
    </header>

    <q-btn flat icon="arrow_back" @click="$emit('back')" />
    <div class="detail-grid q-mt-md">
      <div class="image-wrap">
        <q-img :src="product.image" alt="" class="detail-qimg" img-class="detail-img" />
      </div>
      <div class="info">
        <div class="badge">{{ product.category }}</div>
        <h1 class="name">{{ product.name }}</h1>
        <p class="desc">{{ product.description }}</p>
        <div class="price">{{ product.price }}</div>
        <q-btn unelevated class="purchase-btn q-mt-md" @click="$emit('add-to-cart', product)">
          <q-icon name="shopping_bag" class="q-mr-sm" /> Agregar al carrito
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useShopStore } from '../stores/shop'

const { product } = defineProps({ product: { type: Object, required: true } })
const store = useShopStore()
const cartCount = computed(() => store.cart.length)
</script>

<style scoped lang="scss">
/* Boxed root for product detail */
.product-detail-root {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 0 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
.image-wrap {
  width: 100%;
  aspect-ratio: 4 / 5;
  max-height: 400px;
  border-radius: 24px;
  overflow: hidden;
  background: #FAFAFA;
}
.detail-qimg { width: 100%; height: 100%; }
.detail-img { width:100%; height:100%; object-fit: contain; }
.badge {
  display: inline-block;
  padding: 6px 10px;
  background: #fff;
  border-radius: 10px;
  color: #b8860b;
  font-weight: 600;
}
.name {
  font-family: 'Playfair Display', serif;
  font-size: 42px;
  margin: 8px 0;
}
.price {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  color: #B47F60;
  margin-top: 12px;
}
.add-cart {
  border-radius: 30px;
  padding: 14px 22px;
  font-size: 16px;
}
.brand {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  display: flex;
  align-items: center;
}
.logo-placeholder { width:36px; height:36px; margin-left:8px; background:transparent }

@media (min-width: 900px) {
  .product-detail-root {
    padding: 0 32px;
  }
  .detail-grid {
    grid-template-columns: 50% 50%;
    align-items: start;
  }
  .image-wrap { aspect-ratio: 1 / 1; max-height: none }
  .detail-img { object-fit: contain }
}

  /* Purchase button exact styling and mobile typography adjustments */
  .purchase-btn {
    background-color: #B47F60 !important;
    color: white !important;
    padding: 12px 24px !important;
    font-size: 16px !important;
    border-radius: 30px !important;
    font-weight: 600 !important;
    max-width: 350px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 599px) {
    .name { font-size: 28px !important; line-height: 1.2; margin-bottom: 10px !important }
    .price { font-size: 24px !important }
    .detail-grid { gap: 12px }
    .product-detail-root { padding: 8px }
    .image-wrap { max-height: 400px }
    .purchase-btn { width: 100%; max-width: unset }
  }
</style>
