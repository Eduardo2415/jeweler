<template>
  <div class="admin-login-page bg-custom-cream flex items-center justify-center q-pa-md">
    <div class="login-card-wrapper">
      <q-card class="login-card q-pa-xl font-sans" flat>
        <!-- Header -->
        <div class="login-header text-center q-mb-lg">
          <q-avatar size="64px" class="brand-avatar q-mb-md">
            <q-img src="/logo1.jpeg" />
          </q-avatar>
          <h1 class="brand-title font-serif">JUAN INVERSIONES</h1>
          <p class="brand-subtitle">Panel Administrativo</p>
        </div>

        <!-- Form -->
        <q-form @submit.prevent="handleLogin" class="login-form flex flex-column gap-4">
          <p class="login-instructions text-center text-muted">
            Introduce tus credenciales exclusivas de administrador para acceder al inventario de piezas extraordinarias.
          </p>

          <div class="flex flex-column gap-3">
            <q-input
              v-model="email"
              type="email"
              outlined
              label="Correo de Administrador"
              color="accent"
              bg-color="white"
              dense
              class="custom-input"
              :rules="[val => !!val || 'El correo electrónico es requerido']"
            />

            <q-input
              v-model="password"
              type="password"
              outlined
              label="Contraseña de Seguridad"
              color="accent"
              bg-color="white"
              dense
              class="custom-input"
              :rules="[val => !!val || 'La contraseña es requerida']"
            />
          </div>

          <q-btn
            unelevated
            class="btn-login full-width"
            label="Acceder al Panel"
            type="submit"
            :loading="loading"
          />
        </q-form>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '../services/api'

const router = useRouter()
const $q = useQuasar()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) return

  loading.value = true
  try {
    const response = await api.post('/admin-login', {
      email: email.value,
      password: password.value
    })
    
    if (response.data && response.data.status === 'success') {
      localStorage.setItem('ji_admin_token', response.data.admin_token)
      
      $q.notify({
        message: 'Acceso Autorizado',
        caption: `Bienvenido, administrador ${response.data.admin?.nombre || email.value}`,
        color: 'white',
        textColor: 'dark',
        classes: 'luxury-toast',
        icon: 'verified',
        timeout: 2000
      })
      
      router.push('/admin/productos')
    } else {
      throw new Error(response.data?.message || 'Credenciales inválidas.')
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Error de conexión con el servidor.'
    $q.notify({
      message: 'Acceso Denegado',
      caption: errorMsg,
      color: 'white',
      textColor: 'dark',
      classes: 'luxury-toast',
      icon: 'error_outline',
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.admin-login-page {
  min-height: 100vh;
  width: 100%;
}

.bg-custom-cream {
  background-color: #f7f2ee !important;
}

.login-card-wrapper {
  width: 100%;
  max-width: 440px;
}

.login-card {
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(180, 127, 96, 0.15);
  box-shadow: 0 12px 36px rgba(180, 127, 96, 0.04);
}

.brand-avatar {
  border: 1px solid rgba(180, 127, 96, 0.2);
  background: #ffffff;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(180, 127, 96, 0.06);
}

.brand-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #333333;
  margin: 0;
}

.brand-subtitle {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #b47f60;
  font-weight: 600;
  margin: 4px 0 0 0;
}

.login-instructions {
  font-size: 13px;
  line-height: 1.5;
  color: #666666;
  margin: 0 0 8px 0;
}

.custom-input {
  ::v-deep(.q-field__control) {
    border-radius: 16px !important;
  }
}

.btn-login {
  background-color: #b47f60 !important;
  color: #ffffff !important;
  border-radius: 20px;
  font-weight: 600;
  text-transform: none;
  font-size: 15px;
  padding: 12px 0;
  box-shadow: 0 4px 15px rgba(180, 127, 96, 0.15);
  border: 1px solid #b47f60;
  transition: all 0.3s ease;

  &:hover {
    background-color: transparent !important;
    color: #b47f60 !important;
    box-shadow: none;
  }
}

.flex-column {
  display: flex;
  flex-direction: column;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}
</style>
