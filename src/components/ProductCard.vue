<template>
  <q-card flat class="product-card">
    <div class="product-image-wrap">
      <ImageWithFallback :src="product.image" :alt="product.name" class-name="product-image" />
    </div>

    <q-card-section class="product-info q-pa-md">
      <div class="row items-start justify-between gap-sm">
        <div>
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-price">${{ formatPrice(product.price) }}</p>
        </div>
      </div>

      <p class="product-description">{{ product.description }}</p>

      <div class="row items-center justify-between q-mt-md product-rating">
        <div class="row items-center gap-xs">
          <q-rating :model-value="product.rating" :max="5" size="sm" color="amber" readonly />
          <span class="rating-text">{{ product.rating.toFixed(1) }}</span>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="center" class="q-pa-sm">
      <q-btn
        unelevated
        class="add-btn full-width"
        color="dark"
        text-color="white"
        label="Añadir al carrito"
        @click="$emit('add-to-cart', product)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import ImageWithFallback from './ImageWithFallback.vue'

defineProps({
  product: {
    type: Object,
    required: true,
  },
})

defineEmits(['add-to-cart'])

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
</script>

<style scoped lang="scss">
.product-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 22px;
  overflow: hidden;
  transition: transform 0.25s ease, border-color 0.25s ease;
}

.product-card:hover {
  border-color: rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.product-image {
  min-height: 220px;
  object-fit: cover;
}

.product-info {
  padding-bottom: 0;
}

.product-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #111111;
  line-height: 1.25;
}

.product-price {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111111;
  margin-top: 4px;
}

.product-description {
  font-size: 0.88rem;
  color: #5f5f5f;
  margin: 12px 0 0 0;
  line-height: 1.5;
}

.product-rating {
  margin-top: 10px;
}

.rating-text {
  font-size: 0.8rem;
  color: #777777;
}

.add-btn {
  border-radius: 14px;
  padding: 12px 0;
}

@media (max-width: 599px) {
  .product-image {
    min-height: 180px;
  }

  .product-name {
    font-size: 0.98rem;
  }

  .product-description {
    font-size: 0.82rem;
  }
}
</style>
