import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: () => ({ name: 'builds' }) },
  { path: '/builds', name: 'builds', component: () => import('@/pages/BuildsPage.vue') },
  { path: '/builds/downloadHistory/:id', name: 'builds-download-history', component: () => import('@/pages/BuildDownloadHistory.vue') },
  { path: '/builds/edit/:id', name: 'edit-builds', component: () => import('@/pages/EditBuildPage.vue') },
  { path: '/branches', name: 'branches', component: () => import('@/pages/BranchesPage.vue') },
  { path: '/branch/create', name: 'create-branch', component: () => import('@/pages/CreateBranchPage.vue') },
  { path: '/branch/edit/:id', name: 'edit-branch', component: () => import('@/pages/EditBranchPage.vue') },
  { path: '/users', name: 'users', component: () => import('@/pages/UsersPage.vue') },
  { path: '/storages', name: 'storages', component: () => import('@/pages/StoragesPage.vue') },
  { path: '/proxy', name: 'proxy', component: () => import('@/pages/ProxyPage.vue') },
  { path: '/proxy/create', name: 'create-proxy', component: () => import('@/pages/CreateProxyPage.vue') },
  { path: '/proxy/edit/:id', name: 'edit-proxy', component: () => import('@/pages/EditProxyPage.vue') },
  { path: '/caches', name: 'cache', component: () => import('@/pages/CachesPage.vue') },
  { path: '/cache/create', name: 'create-cache', component: () => import('@/pages/CreateCachePage.vue') },
  { path: '/cache/edit/:id', name: 'edit-cache', component: () => import('@/pages/EditCachePage.vue') },
  { path: '/statistics', name: 'statistics', component: () => import('@/pages/StatisticsPage.vue') },
  { path: '/error/logs', name: 'error-logs', component: () => import('@/pages/ErrorStorages.vue') },
  { path: '/401', name: '401', component: () => import('@/pages/NoAccessPage.vue') },
  { path: '/:pathMatch(.*)*', name: '404', component: () => import('@/pages/NotFoundPage.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
