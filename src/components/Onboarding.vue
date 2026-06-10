<template>
  <div class="onboarding-root">
    <div class="onboarding-hero">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1638717366457-dbcaf6b1afbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
        class-name="hero-img"
      />

      <div class="hero-content">
        <div class="eyebrow">Colección exclusiva</div>
        <h1 class="title">Radiant Diamond Collection</h1>
        <p class="subtitle">Timeless elegance meets modern craftsmanship</p>
        <q-btn unelevated class="cta" @click="$emit('continue')">
          Explore Collection
          <q-icon name="chevron_right" class="q-ml-sm" />
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import ImageWithFallback from './ImageWithFallback.vue'
defineOptions({ name: 'OnboardingHero' })
</script>

<style scoped lang="scss">
.onboarding-root {
  min-height: 100vh;
  background: #f7f2ee;
}
.onboarding-hero {
  position: relative;
  width: 100%;
  max-width: 980px;
  height: 70vh;
  border-radius: 24px;
  overflow: hidden;
  margin: 20px auto;
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-content {
  position: absolute;
  bottom: 32px;
  left: 32px;
  color: #fff;
  max-width: 520px;
}
.eyebrow {
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 12px;
}
.title {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  margin: 6px 0;
}
.subtitle {
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 18px;
}
.cta {
  border-radius: 24px;
  background: #b47f60;
  color: #fff;
}
</style>
