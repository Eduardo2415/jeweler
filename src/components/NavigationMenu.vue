<template>
  <div>
    <div v-if="open" class="menu-overlay" @click="$emit('close')"></div>
    <transition name="slide">
      <aside v-if="open" class="menu-drawer">
        <div class="menu-head q-pa-sm">
          <q-btn flat icon="close" @click="$emit('close')" />
        </div>
        <nav class="q-pa-md">
          <ul>
            <li v-for="(item, idx) in items" :key="idx">
              <a href="#" @click.prevent="navigate(item)">{{ item }}</a>
            </li>
          </ul>
        </nav>
      </aside>
    </transition>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'
const { open, items } = defineProps({
  open: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
})
const emit = defineEmits(['select', 'close'])
const navigate = (item) => {
  emit('select', item)
  emit('close')
}
</script>

<style scoped lang="scss">
.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 50;
}
.menu-drawer {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 78%;
  max-width: 340px;
  background: #f7f2ee;
  z-index: 60;
  padding-top: 12px;
}
.menu-drawer nav {
  height: calc(100% - 48px);
}
.menu-drawer nav ul {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 22px;
  padding: 0 24px;
  list-style: none;
}
.menu-drawer a {
  display: block;
  padding: 8px 0;
  color: #333333;
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  text-decoration: none;
  transition: color 0.15s ease;
}
.menu-drawer a:hover {
  color: #b47f60;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
