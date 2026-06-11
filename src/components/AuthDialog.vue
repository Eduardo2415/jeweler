<template>
  <q-dialog v-model="isOpen" persistent backdrop-filter="blur(10px)">
    <q-card class="auth-card q-pa-lg">
      <!-- Header -->
      <div class="auth-header flex items-center justify-between q-mb-lg">
        <h3 class="auth-title font-serif">Acceso Premium</h3>
        <q-btn flat round dense icon="close" class="close-btn" @click="closeDialog" />
      </div>

      <!-- Main Body -->
      <div class="auth-body flex flex-column gap-4">
        <p class="auth-subtitle font-sans text-center">
          Inicia sesión para registrar tu pedido por transferencia bancaria y realizar el
          seguimiento de tus joyas.
        </p>

        <!-- Social Login Methods -->
        <div class="social-login-methods flex flex-column gap-3">
          <button class="social-btn google-btn font-sans" @click="handleSocialLogin('Google')">
            <svg class="social-icon" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#EA4335"
                d="M12 5.04c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.4 15 0 12 0 7.3 0 3.3 2.7 1.4 6.6l3.9 3C6.3 6.9 8.9 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.4 7.2C.5 9.1 0 11.2 0 13.5s.5 4.4 1.4 6.3l3.9-3z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1.1.7-2.5 1.2-4.2 1.2-3.1 0-5.7-1.9-6.7-4.6l-3.9 3C3.3 21.3 7.3 24 12 24z"
              />
            </svg>
            Continuar con Google
          </button>

          <button class="social-btn apple-btn font-sans" @click="handleSocialLogin('Apple')">
            <q-icon name="apple" size="20px" class="social-icon text-black" />
            Continuar con Apple
          </button>
        </div>

        <div class="flex items-center justify-center q-my-sm">
          <div class="line-divider"></div>
          <span class="divider-text font-sans">o vía código</span>
          <div class="line-divider"></div>
        </div>

        <!-- Email / WhatsApp Access Form -->
        <q-form @submit.prevent="handleSubmit" class="auth-form flex flex-column gap-3">
          <div v-if="!codeSent">
            <!-- Selector de Método: Email o WhatsApp -->
            <div class="flex justify-center gap-4 q-mb-md">
              <q-radio
                v-model="loginMethod"
                val="email"
                label="Correo Electrónico"
                color="accent"
                class="font-sans text-xs"
              />
              <q-radio
                v-model="loginMethod"
                val="whatsapp"
                label="WhatsApp"
                color="accent"
                class="font-sans text-xs"
              />
            </div>

            <!-- Input Principal -->
            <q-input
              v-if="loginMethod === 'email'"
              v-model="email"
              type="email"
              outlined
              label="Ingresa tu correo electrónico"
              color="accent"
              bg-color="white"
              dense
              class="auth-input font-sans"
              :rules="[(val) => !!val || 'El correo es requerido']"
            />
            <q-input
              v-else
              v-model="phone"
              type="tel"
              outlined
              label="Número de WhatsApp"
              placeholder="+54 9..."
              color="accent"
              bg-color="white"
              dense
              class="auth-input font-sans"
              :rules="[(val) => !!val || 'El número es requerido']"
            />

            <q-btn unelevated class="btn-send-code full-width" type="submit" :loading="loading">
              Enviar código de acceso
            </q-btn>
          </div>

          <!-- Code Entry Panel -->
          <div v-else class="code-panel flex flex-column items-center gap-3">
            <p class="code-instructions font-sans text-center">
              Hemos enviado un código de 4 dígitos a
              <strong>{{ loginMethod === 'email' ? email : phone }}</strong
              >.
            </p>

            <q-input
              v-model="verificationCode"
              outlined
              label="Código de 4 dígitos"
              mask="####"
              placeholder="0 0 0 0"
              color="accent"
              bg-color="white"
              dense
              class="code-input font-sans text-center"
              input-class="text-center font-bold text-lg tracking-widest"
              :rules="[(val) => val.length === 4 || 'Debe ingresar un código de 4 dígitos']"
            />

            <q-btn
              unelevated
              class="btn-verify-code full-width"
              label="Verificar y Acceder"
              @click="verifyCode"
              :loading="loading"
            />

            <q-btn
              flat
              dense
              class="btn-back text-accent font-sans text-xs"
              label="Modificar datos de envío"
              @click="codeSent = false"
            />
          </div>
        </q-form>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useShopStore } from '../stores/shop'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'success'])
const store = useShopStore()
const $q = useQuasar()

const isOpen = ref(false)
const loading = ref(false)
const codeSent = ref(false)
const loginMethod = ref('email')
const email = ref('')
const phone = ref('')
const verificationCode = ref('')

// Keep dialog visibility in sync with parent v-model
watch(
  () => props.modelValue,
  (newVal) => {
    isOpen.value = newVal
  },
)

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal)
  if (!newVal) {
    // Reset state on close
    codeSent.value = false
    email.value = ''
    phone.value = ''
    verificationCode.value = ''
  }
})

function closeDialog() {
  isOpen.value = false
}

function handleSocialLogin(provider) {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    const simulatedEmail =
      provider === 'Google' ? 'client.premium@gmail.com' : 'client.premium@apple.com'
    store.loginUser(simulatedEmail, provider)
    $q.notify({
      message: 'Inicio de Sesión Exitoso',
      caption: `Bienvenido a JUAN INVERSIONES, ${simulatedEmail}`,
      color: 'white',
      textColor: 'dark',
      classes: 'luxury-toast',
      icon: 'verified',
      timeout: 2000,
    })
    emit('success')
    closeDialog()
  }, 1000)
}

function handleSubmit() {
  if (loginMethod.value === 'email' && !email.value) return
  if (loginMethod.value === 'whatsapp' && !phone.value) return

  loading.value = true
  setTimeout(() => {
    loading.value = false
    codeSent.value = true
    $q.notify({
      message: 'Código Enviado',
      caption: `Utiliza cualquier código de 4 dígitos para acceder.`,
      color: 'white',
      textColor: 'dark',
      classes: 'luxury-toast',
      icon: 'mail',
      timeout: 3000,
    })
  }, 1000)
}

function verifyCode() {
  if (verificationCode.value.length < 4) return

  loading.value = true
  setTimeout(() => {
    loading.value = false
    const username = loginMethod.value === 'email' ? email.value : phone.value
    store.loginUser(username, loginMethod.value)
    $q.notify({
      message: 'Acceso Autorizado',
      caption: `Sesión iniciada como ${username}`,
      color: 'white',
      textColor: 'dark',
      classes: 'luxury-toast',
      icon: 'check_circle',
      timeout: 2000,
    })
    emit('success')
    closeDialog()
  }, 1000)
}
</script>

<style scoped lang="scss">
.auth-card {
  width: 100%;
  max-width: 400px;
  background-color: #f7f2ee; // Luxury Cream
  border-radius: 28px !important;
  border: 1px solid rgba(180, 127, 96, 0.2);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.auth-header {
  .auth-title {
    font-size: 24px;
    font-weight: 700;
    color: #333333;
    margin: 0;
    letter-spacing: 0.5px;
  }
  .close-btn {
    color: #666666;
    transition: transform 0.2s ease;
    &:hover {
      transform: rotate(90deg);
      color: #b47f60;
    }
  }
}

.auth-subtitle {
  font-size: 13px;
  color: #666666;
  line-height: 1.5;
  margin: 0;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 46px;
  background-color: #ffffff;
  border: 1px solid rgba(180, 127, 96, 0.15);
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #333333;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background-color: rgba(180, 127, 96, 0.05);
    border-color: #b47f60;
    transform: translateY(-1px);
  }

  .social-icon {
    flex-shrink: 0;
  }
}

.line-divider {
  flex: 1;
  height: 1px;
  background-color: rgba(180, 127, 96, 0.15);
}

.divider-text {
  font-size: 11px;
  color: #999999;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 0 12px;
}

.auth-input {
  ::v-deep(.q-field__control) {
    border-radius: 16px !important;
  }
}

.btn-send-code,
.btn-verify-code {
  background-color: #b47f60 !important;
  color: #ffffff !important;
  border-radius: 20px;
  font-weight: 600;
  text-transform: none;
  font-size: 14px;
  padding: 10px 0;
  box-shadow: 0 4px 15px rgba(180, 127, 96, 0.15);
  transition: all 0.25s ease;

  &:hover {
    opacity: 0.95;
    box-shadow: 0 6px 20px rgba(180, 127, 96, 0.25);
  }
}

.code-panel {
  .code-instructions {
    font-size: 12px;
    color: #666666;
    line-height: 1.5;
  }
  .code-input {
    width: 180px;
    margin: 0 auto;
    ::v-deep(.q-field__control) {
      border-radius: 16px !important;
    }
  }
}

.btn-back {
  text-transform: none;
  font-weight: 500;
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
