import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/views/index.vue'
import Login from '@/views/login/index.vue'
import NotFound from '@/views/404.vue'
import Admin from '@/layout/admin.vue'

import Noticeview from '@/views/notice/index.vue'
import Menu from '@/views/menu/index.vue'
import Role from '@/views/role/index.vue'
import User from '@/views/user/index.vue'
import Goods from '@/views/goods/index.vue'
import Order from '@/views/order/index.vue'
import Docs from '@/views/docs/index.vue'
import LogView from '@/views/log/index.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'admin',
      component: Admin,
      children: [
        {
          path: '/',
          name: 'index',
          component: Index
        }
      ],
      meta: {
        title: '仪表盘'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: '登录页'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound
    }
  ]
})

//动态路由
const asyncRoutes = [
  {
    path: '/',
    name: 'index',
    component: Index,
    meta: {
      title: '仪表盘'
    }
  },
  {
    path: '/sys/menu/index',
    name: 'menu',
    component: Menu,
    meta: {
      title: '菜单管理'
    }
  },
  {
    path: '/sys/role/index',
    name: 'role',
    component: Role,
    meta: {
      title: '角色管理'
    }
  },
  {
    path: '/sys/user/index',
    name: 'user',
    component: User,
    meta: {
      title: '用户管理'
    }
  },
  {
    path: '/goods/index',
    name: 'goods',
    component: Goods,
    meta: {
      title: '商品管理'
    }
  },
  {
    path: '/order/index',
    name: 'order',
    component: Order,
    meta: {
      title: '订单管理'
    }
  },
  {
    path: '/notice/index',
    name: 'notice',
    component: Noticeview,
    meta: {
      title: '通知管理'
    }
  },
  {
    path: '/docs/index',
    name: 'docs',
    component: Docs,
    meta: {
      title: '接口文档'
    }
  },
  {
    path: '/log/index',
    name: 'log',
    component: LogView,
    meta: {
      title: '日志管理'
    }
  }
]

//动态路由添加方法
export function addRoutes(menus) {
  //是否有新的路由
  let hasNewRoutes = false
  const findAndAddRoutesByMenus = arr => {
    arr.forEach(e => {
      let item = asyncRoutes.find(o => o.path == e.url)
      if (item && !router.hasRoute(item.path)) {
        router.addRoute('admin', item)
        hasNewRoutes = true
      }
      if (e.children && e.children.length > 0) {
        findAndAddRoutesByMenus(e.children)
      }
    })
  }
  findAndAddRoutesByMenus(menus)
  return hasNewRoutes
}

let hasGetInfo = false
router.beforeEach(async (to, from, next) => {
  //显示全局进度条
  showFullLoading()

  const token = getToken()
  // 没有登录，强制跳转回登录页
  if (!token && to.path != '/login') {
    toast('请先登录', 'error')
    hasGetInfo = false
    return next({ path: '/login' })
  }

  // 防止重复登录
  if (token && to.path == '/login') {
    toast('请勿重复登录', 'error')
    return next({ path: from.path ? from.path : '/' })
  }
  if (to.path == '/login') {
    hasGetInfo = false
  }

  const { getStoreInfo } = useAdminStore()
  //  如果登录了，就获取用户信息，存储到 pinia
  let hasNewRoutes = false
  if (token && !hasGetInfo) {
    const res = await getStoreInfo()
    hasGetInfo = true

    //动态路由添加
    hasNewRoutes = addRoutes(res.nav)
  }

  //设置页面标题
  let title = '后台系统—' + to.meta.title ? to.meta.title : ''
  document.title = title

  hasNewRoutes ? next(to.fullPath) : next()
  next()
})

//全局后置守卫
router.afterEach(() => {
  hideFullLoading()
})
