<template>
  <footer class="site-footer q-pa-lg">
    <div class="container">
      <div class="grid">
        <!-- Brand / Logo Column -->
        <div class="col brand-col flex flex-column items-center items-md-start">
          <div class="logo-wrap q-mb-md">
            <q-img src="/logo1.jpeg" class="brand-logo" />
          </div>
          <h3 class="brand-title font-serif">JUAN INVERSIONES</h3>
          <p class="muted font-sans text-center text-md-left">
            Joyas exclusivas y relojería de ultra-lujo. Diseños eternos con el brillo de la
            perfección.
          </p>
        </div>

        <!-- Shop Links Column -->
        <div class="col links-col">
          <h4 class="col-title font-sans">Colecciones</h4>
          <ul>
            <li v-for="item in shopLinks" :key="item.value">
              <a href="#" class="footer-link" @click.prevent="selectCategory(item.value)">{{
                item.name
              }}</a>
            </li>
          </ul>
        </div>

        <!-- Info Column -->
        <div class="col links-col">
          <h4 class="col-title font-sans">Empresa</h4>
          <ul>
            <li v-for="item in companyLinks" :key="item.name">
              <a href="#" class="footer-link">{{ item.name }}</a>
            </li>
          </ul>
        </div>

        <!-- Social & Contact Column -->
        <div class="col contact-col">
          <h4 class="col-title font-sans">Atención Exclusiva</h4>
          <p class="muted font-sans q-mb-md">Visítanos en nuestro showroom con cita previa.</p>
          <div class="socials flex gap-3">
            <a
              v-if="store.socialInstagram"
              :href="store.socialInstagram"
              target="_blank"
              class="social-btn"
              aria-label="Instagram"
            >
              <q-icon name="camera_alt" size="18px" />
            </a>
            <a
              v-if="store.socialFacebook"
              :href="store.socialFacebook"
              target="_blank"
              class="social-btn"
              aria-label="Facebook"
            >
              <q-icon name="facebook" size="18px" />
            </a>
            <a
              v-if="store.socialTiktok"
              :href="store.socialTiktok"
              target="_blank"
              class="social-btn"
              aria-label="TikTok"
            >
              <q-icon name="music_note" size="18px" />
            </a>
            <a
              v-if="store.socialYoutube"
              :href="store.socialYoutube"
              target="_blank"
              class="social-btn"
              aria-label="YouTube"
            >
              <q-icon name="play_circle_filled" size="18px" />
            </a>
            <a
              v-if="store.whatsappNumber"
              :href="'https://wa.me/' + store.whatsappNumber.replace(/[^0-9]/g, '')"
              target="_blank"
              class="social-btn"
              aria-label="WhatsApp"
            >
              <q-icon name="whatsapp" size="18px" />
            </a>
            <a href="mailto:info@juaninversiones.com" class="social-btn" aria-label="Email">
              <q-icon name="mail_outline" size="18px" />
            </a>
          </div>
        </div>
      </div>

      <div class="divider q-my-md" />

      <div class="footer-bottom flex justify-between items-center wrap gap-3">
        <div class="copyright font-sans">
          © 2026 JUAN INVERSIONES. Todos los derechos reservados.
        </div>
        <div class="legal-links flex gap-4 font-sans">
          <a href="#" class="footer-link-sub">Términos de Servicio</a>
          <a href="#" class="footer-link-sub">Política de Privacidad</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useShopStore } from '../stores/shop'

const store = useShopStore()

const shopLinks = [
  { name: 'Anillos', value: 'Rings' },
  { name: 'Cadenas', value: 'Chains' },
  { name: 'Brazaletes', value: 'Bracelets' },
  { name: 'Aretes', value: 'Earrings' },
]

const companyLinks = [
  { name: 'Nuestra Historia' },
  { name: 'Contacto Directo' },
  { name: 'Showrooms' },
  { name: 'Preguntas Frecuentes' },
]

function selectCategory(categoryValue) {
  store.setSelectedCategory(categoryValue)
}
</script>

<style scoped lang="scss">
.site-footer {
  background: #ffffff;
  border-top: 1px solid rgba(180, 127, 96, 0.12);
  color: #333333;
  border-radius: 24px 24px 0 0;
  margin-top: 40px;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 32px;
  padding: 32px 0;
}

.brand-col {
  .logo-wrap {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid rgba(180, 127, 96, 0.2);
    padding: 2px;
    background: #ffffff;
  }
  .brand-logo {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
  .brand-title {
    font-size: 20px;
    font-weight: 700;
    color: #333333;
    letter-spacing: 1.5px;
    margin: 0 0 10px 0;
  }
}

.col-title {
  font-size: 13px;
  color: #b47f60;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 18px;
  margin-top: 0;
}

.muted {
  font-size: 13px;
  color: #666666;
  line-height: 1.6;
  max-width: 280px;
}

.links-col {
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.footer-link {
  color: #666666;
  font-size: 14px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  &:hover {
    color: #b47f60;
    padding-left: 4px;
  }
}

.socials {
  .social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f7f2ee;
    color: #b47f60;
    border: 1px solid rgba(180, 127, 96, 0.1);
    transition: all 0.25s ease;
    text-decoration: none;

    &:hover {
      background: #b47f60;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(180, 127, 96, 0.15);
    }
  }
}

.divider {
  height: 1px;
  background: rgba(180, 127, 96, 0.12);
}

.footer-bottom {
  .copyright {
    font-size: 12px;
    color: #999999;
  }
  .footer-link-sub {
    font-size: 12px;
    color: #999999;
    text-decoration: none;
    transition: color 0.2s ease;
    &:hover {
      color: #b47f60;
    }
  }
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (max-width: 599px) {
  .grid {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 32px;
  }
  .brand-col {
    align-items: center;
  }
  .muted {
    margin-left: auto;
    margin-right: auto;
  }
  .socials {
    justify-content: center;
  }
  .footer-bottom {
    flex-direction: column;
    text-align: center;
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
