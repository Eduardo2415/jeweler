<template>
  <q-page class="admin-page-padding font-sans">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <h1 class="text-h4 font-serif text-dark q-mb-xs">Configuración General</h1>
        <p class="text-subtitle2 text-grey-6 font-sans">
          Administra las constantes del sitio, números de contacto y redes sociales.
        </p>
      </div>
    </div>

    <!-- Configuration Card Form -->
    <div class="form-container shadow-card q-pa-xl">
      <q-form @submit.prevent="saveSettings" class="flex flex-column gap-4">
        <!-- Section: WhatsApp & UX -->
        <div>
          <h2 class="section-subtitle font-serif text-dark q-mb-md">Atención y Carrusel</h2>
          <q-separator class="q-mb-lg separator-accent" />
          <div class="row gap-4">
            <q-input
              v-model="whatsappNumber"
              outlined
              label="Número de WhatsApp (con código de país, ej: 5491112345678)"
              color="accent"
              dense
              class="col"
              placeholder="5491112345678"
              :rules="[
                (val) => !!val || 'El número de WhatsApp es obligatorio',
                (val) => /^[0-9]+$/.test(val) || 'Solo debe contener dígitos numéricos sin símbolos ni espacios'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="whatsapp" class="text-green-6" />
              </template>
            </q-input>

            <q-input
              v-model.number="intervalSeconds"
              type="number"
              outlined
              label="Intervalo de Banner (en segundos)"
              color="accent"
              dense
              class="col"
              :rules="[
                (val) => val !== null && val !== '' || 'El intervalo es obligatorio',
                (val) => val > 0 || 'El intervalo debe ser mayor a 0'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="schedule" class="text-accent" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Section: Social Networks -->
        <div class="q-mt-lg">
          <h2 class="section-subtitle font-serif text-dark q-mb-md">Redes Sociales</h2>
          <q-separator class="q-mb-lg separator-accent" />
          <p class="section-info text-grey-6 q-mb-md">
            Los íconos en el footer y el menú lateral del sitio público se enlazarán a las URLs provistas a continuación. Deja un campo en blanco para ocultar su ícono correspondiente.
          </p>

          <div class="flex flex-column gap-3">
            <q-input
              v-model="socialInstagram"
              outlined
              label="Enlace de Instagram"
              color="accent"
              dense
              placeholder="https://instagram.com/nombre_cuenta"
              :rules="[
                (val) => !val || /^https?:\/\/.+/.test(val) || 'Debe ser una URL válida (debe comenzar con http:// o https://)'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="camera_alt" class="text-purple-6" />
              </template>
            </q-input>

            <q-input
              v-model="socialFacebook"
              outlined
              label="Enlace de Facebook"
              color="accent"
              dense
              placeholder="https://facebook.com/nombre_cuenta"
              :rules="[
                (val) => !val || /^https?:\/\/.+/.test(val) || 'Debe ser una URL válida (debe comenzar con http:// o https://)'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="facebook" class="text-blue-8" />
              </template>
            </q-input>

            <q-input
              v-model="socialTiktok"
              outlined
              label="Enlace de TikTok"
              color="accent"
              dense
              placeholder="https://tiktok.com/@nombre_cuenta"
              :rules="[
                (val) => !val || /^https?:\/\/.+/.test(val) || 'Debe ser una URL válida (debe comenzar con http:// o https://)'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="music_note" class="text-dark" />
              </template>
            </q-input>

            <q-input
              v-model="socialYoutube"
              outlined
              label="Enlace de YouTube"
              color="accent"
              dense
              placeholder="https://youtube.com/c/nombre_canal"
              :rules="[
                (val) => !val || /^https?:\/\/.+/.test(val) || 'Debe ser una URL válida (debe comenzar con http:// o https://)'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="play_circle_filled" class="text-red-7" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="row justify-end q-mt-xl">
          <q-btn
            unelevated
            type="submit"
            color="accent"
            class="btn-primary q-px-lg q-py-sm"
            label="Guardar Configuración"
            icon="save"
            :loading="saving"
          />
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useShopStore } from '../stores/shop'

const store = useShopStore()
const $q = useQuasar()

const whatsappNumber = ref('5491112345678')
const intervalSeconds = ref(5)
const socialFacebook = ref('')
const socialInstagram = ref('')
const socialTiktok = ref('')
const socialYoutube = ref('')
const saving = ref(false)

// Sync form values reactively with Pinia store (robust to async loads)
watch(
  () => store.bannerInterval,
  (val) => {
    if (val) intervalSeconds.value = val / 1000
  },
  { immediate: true }
)

watch(
  () => store.whatsappNumber,
  (val) => {
    if (val) whatsappNumber.value = val
  },
  { immediate: true }
)

watch(
  () => store.socialFacebook,
  (val) => {
    socialFacebook.value = val || ''
  },
  { immediate: true }
)

watch(
  () => store.socialInstagram,
  (val) => {
    socialInstagram.value = val || ''
  },
  { immediate: true }
)

watch(
  () => store.socialTiktok,
  (val) => {
    socialTiktok.value = val || ''
  },
  { immediate: true }
)

watch(
  () => store.socialYoutube,
  (val) => {
    socialYoutube.value = val || ''
  },
  { immediate: true }
)

async function saveSettings() {
  saving.value = true
  $q.loading.show({ message: 'Guardando ajustes globales en Directus...' })

  try {
    const payload = {
      banner_interval: intervalSeconds.value * 1000,
      whatsapp_number: whatsappNumber.value,
      social_facebook: socialFacebook.value.trim() || null,
      social_instagram: socialInstagram.value.trim() || null,
      social_tiktok: socialTiktok.value.trim() || null,
      social_youtube: socialYoutube.value.trim() || null,
    }

    const success = await store.updateSettings(payload)

    if (success) {
      $q.notify({
        message: 'Configuración Guardada',
        caption: 'Los cambios se aplicaron exitosamente en el servidor de producción.',
        color: 'white',
        textColor: 'dark',
        classes: 'luxury-toast',
        icon: 'check_circle',
        timeout: 3000,
      })
    } else {
      throw new Error('La respuesta del servidor no reportó éxito.')
    }
  } catch (error) {
    $q.notify({
      message: 'Error al Guardar Ajustes',
      caption: error.response?.data?.message || error.message,
      color: 'negative',
      icon: 'error_outline',
      timeout: 3500,
    })
  } finally {
    saving.value = false
    $q.loading.hide()
  }
}
</script>

<style scoped lang="scss">
.admin-page-padding {
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
}

.shadow-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(180, 127, 96, 0.08);
  box-shadow: 0 10px 40px rgba(180, 127, 96, 0.03);
}

.form-container {
  margin-top: 24px;
}

.section-subtitle {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin: 0;
}

.section-info {
  font-size: 13px;
  line-height: 1.5;
}

.separator-accent {
  background-color: rgba(180, 127, 96, 0.15);
  height: 1px;
}

.btn-primary {
  background-color: #b47f60 !important;
  color: #ffffff !important;
  border-radius: 20px;
  font-weight: 600;
  text-transform: none;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(180, 127, 96, 0.12);
  border: 1px solid #b47f60;
  transition: all 0.3s ease;

  &:hover {
    background: transparent !important;
    color: #b47f60 !important;
    box-shadow: none;
  }
}

.text-accent {
  color: #b47f60;
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
