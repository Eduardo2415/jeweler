<template>
  <footer class="site-footer q-pa-md">
    <div class="container">
      <div class="grid">
        <div class="col">
          <h3 class="brand-title">Lumière</h3>
          <p class="muted">Timeless luxury and elegance in every piece.</p>
        </div>

        <div class="col">
          <h4 class="col-title">Shop</h4>
          <ul>
            <li v-for="item in shopLinks" :key="item">
              <a href="#">{{ item }}</a>
            </li>
          </ul>
        </div>

        <div class="col">
          <h4 class="col-title">Company</h4>
          <ul>
            <li v-for="item in companyLinks" :key="item">
              <a href="#">{{ item }}</a>
            </li>
          </ul>
        </div>

        <div class="col">
          <h4 class="col-title">Social Media</h4>
          <div class="socials">
            <a href="#" class="social" aria-label="instagram">IG</a>
            <a href="#" class="social" aria-label="facebook">FB</a>
            <a href="#" class="social" aria-label="twitter">TW</a>
          </div>
        </div>
      </div>

      <div class="divider" />

      <div class="copyright">© 2026 Lumière. All rights reserved.</div>
    </div>
  </footer>
</template>

<script setup>
const shopLinks = ['Rings', 'Chains', 'Bracelets', 'Earrings']
const companyLinks = ['About Us', 'Account', 'Contact', 'Privacy']
</script>

<style scoped lang="scss">
.site-footer {
  background: #fff;
  border-top: 1px solid #e5e5e5;
  color: #333;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 28px 0;
}
.col-title {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
}
.brand-title {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  margin: 0 0 8px;
}
.muted {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}
.socials {
  display: flex;
  gap: 8px;
}
.social {
  display: inline-flex;
  padding: 8px;
  background: #f7f2ee;
  border-radius: 12px;
  color: #b47f60;
  transition: opacity 0.2s;
}
.divider {
  height: 1px;
  background: #e5e5e5;
  margin: 8px 0;
}
.copyright {
  padding: 12px 0;
  text-align: center;
  font-size: 12px;
  color: #999;
}

@media (max-width: 700px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
