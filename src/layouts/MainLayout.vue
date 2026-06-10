<template>
  <q-layout view="hHh lpR fFf" class="layout-clean">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
// Layout intentionally minimal to let pages render their own headers
</script>

<style scoped lang="scss">
.header-clean {
  box-shadow: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.brand-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.brand-title {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #1a1a1a;
}

.brand-subtitle {
  font-size: 0.72rem;
  color: #5f5f5f;
}

.drawer-clean {
  background-color: #ffffff;
}

.drawer-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 18px;
  letter-spacing: 0.02em;
}

.q-item {
  border-radius: 14px;
}

.q-item:hover {
  background-color: #fff6e8;
}

@media (max-width: 599px) {
  .brand-title {
    font-size: 0.88rem;
  }
}
</style>
