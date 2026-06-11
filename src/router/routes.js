const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'categoria/:categoryValue', component: () => import('pages/IndexPage.vue') },
      { path: 'producto/:productId', component: () => import('pages/IndexPage.vue') },
    ],
  },
  {
    path: '/admin/login',
    component: () => import('pages/AdminLogin.vue'),
  },
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', redirect: '/admin/productos' },
      { path: 'productos', component: () => import('pages/AdminProducts.vue') },
      { path: 'categorias', component: () => import('pages/AdminCategories.vue') },
      { path: 'banners', component: () => import('pages/AdminBanners.vue') },
      { path: 'cuentas', component: () => import('pages/AdminAccounts.vue') },
      { path: 'configuracion', component: () => import('pages/AdminSettings.vue') },
      { path: 'pedidos', component: () => import('pages/AdminOrders.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
