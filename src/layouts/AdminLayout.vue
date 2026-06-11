<template>
  <q-layout view="lHh Lpr lFf" class="admin-layout bg-custom-cream">
    <!-- Header -->
    <q-header elevated class="admin-header text-dark">
      <q-toolbar class="q-px-lg">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="md-hidden-btn"
          @click="toggleLeftDrawer"
        />

        <div class="brand-title font-serif flex items-center gap-2">
          <q-avatar size="32px" class="brand-avatar">
            <q-img src="/logo1.jpeg" />
          </q-avatar>
          <span>JUAN INVERSIONES <span class="admin-badge font-sans">ADMIN</span></span>
        </div>

        <q-space />

        <div class="user-info flex items-center gap-3 font-sans">
          <span class="user-role">Administrador</span>
          <q-btn flat round dense icon="logout" class="logout-btn" @click="handleLogout">
            <q-tooltip class="bg-dark text-white">Cerrar Sesión</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Sidebar / Drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="admin-drawer" :width="280">
      <div class="drawer-content flex flex-column justify-between full-height py-4">
        <!-- Main Nav Menu -->
        <div class="nav-menu flex flex-column gap-2 q-px-md">
          <div class="menu-header font-serif text-center q-py-lg">
            <h2 class="menu-brand">JUAN INVERSIONES</h2>
            <p class="menu-subtitle font-sans">Panel de Control de Ultra-Lujo</p>
          </div>

          <q-separator class="q-my-md custom-separator" />

          <!-- Navigation Links -->
          <div class="nav-links flex flex-column gap-2 font-sans">
            <router-link to="/admin/productos" class="nav-link-item" active-class="active">
              <q-icon name="diamond" size="20px" class="q-mr-sm icon" />
              <span>Gestión de Inventario</span>
            </router-link>

            <router-link to="/admin/categorias" class="nav-link-item" active-class="active">
              <q-icon name="category" size="20px" class="q-mr-sm icon" />
              <span>Gestión de Categorías</span>
            </router-link>

            <router-link to="/admin/banners" class="nav-link-item" active-class="active">
              <q-icon name="view_carousel" size="20px" class="q-mr-sm icon" />
              <span>Gestión de Banners</span>
            </router-link>

            <router-link to="/admin/pedidos" class="nav-link-item" active-class="active">
              <q-icon name="receipt_long" size="20px" class="q-mr-sm icon" />
              <span>Gestión de Pedidos</span>
            </router-link>

            <router-link to="/admin/cuentas" class="nav-link-item" active-class="active">
              <q-icon name="account_balance" size="20px" class="q-mr-sm icon" />
              <span>Cuentas Bancarias</span>
            </router-link>

            <router-link to="/admin/configuracion" class="nav-link-item" active-class="active">
              <q-icon name="settings" size="20px" class="q-mr-sm icon" />
              <span>Configuración General</span>
            </router-link>

            <router-link to="/" class="nav-link-item">
              <q-icon name="storefront" size="20px" class="q-mr-sm icon" />
              <span>Ver Tienda Pública</span>
            </router-link>
          </div>
        </div>

        <!-- Drawer Footer -->
        <div class="drawer-footer text-center font-sans q-pa-md">
          <span class="footer-copy">© 2026 JUAN INVERSIONES</span>
        </div>
      </div>
    </q-drawer>

    <!-- Page Container -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function handleLogout() {
  localStorage.removeItem('ji_admin_token')
  $q.notify({
    message: 'Sesión Cerrada',
    caption: 'Has salido del panel administrativo.',
    color: 'white',
    textColor: 'dark',
    classes: 'luxury-toast',
    icon: 'info',
    timeout: 2000,
  })
  router.push('/admin/login')
}
</script>

<style scoped lang="scss">
.bg-custom-cream {
  background-color: #f7f2ee !important;
}

.admin-layout {
  min-height: 100vh;
}

.admin-header {
  background: rgba(247, 242, 238, 0.85) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(180, 127, 96, 0.08);
  box-shadow: none !important;
  height: 64px;
  display: flex;
  align-items: center;
}

.text-dark {
  color: #333333;
}

.brand-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1.5px;

  .admin-badge {
    font-size: 9px;
    background-color: #b47f60;
    color: #ffffff;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 4px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
}

.brand-avatar {
  border: 1px solid rgba(180, 127, 96, 0.2);
  background: #ffffff;
}

.md-hidden-btn {
  color: #333333;
  @media (min-width: 1024px) {
    display: none;
  }
}

.user-info {
  .user-role {
    font-size: 12px;
    color: #666666;
    font-weight: 500;
  }
  .logout-btn {
    color: #666666;
    transition: color 0.2s ease;
    &:hover {
      color: #b47f60;
    }
  }
}

.admin-drawer {
  background-color: #ffffff !important;
  border-right: 1px solid rgba(180, 127, 96, 0.1) !important;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.menu-brand {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #333333;
  margin: 0 0 4px 0;
}

.menu-subtitle {
  font-size: 10px;
  color: #999999;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.custom-separator {
  background-color: rgba(180, 127, 96, 0.1);
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link-item {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-radius: 16px;
  text-decoration: none;
  color: #666666;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.25s ease;
  border: 1px solid transparent;

  .icon {
    transition: color 0.25s ease;
  }

  &:hover {
    color: #b47f60;
    background-color: rgba(180, 127, 96, 0.04);
    border-color: rgba(180, 127, 96, 0.1);
  }

  &.active {
    color: #b47f60;
    background-color: #f7f2ee;
    border-color: rgba(180, 127, 96, 0.15);
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(180, 127, 96, 0.03);
  }
}

.drawer-footer {
  .footer-copy {
    font-size: 10px;
    color: #999999;
    letter-spacing: 0.5px;
  }
}

.flex-column {
  display: flex;
  flex-direction: column;
}
.full-height {
  height: 100%;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
</style>
