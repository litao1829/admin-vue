import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'

import Components from 'unplugin-vue-components/vite' // 自动按需导入组件
import AutoImport from 'unplugin-auto-import/vite' // 自动导入Api
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import IconResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    WindiCSS(),
    AutoImport({
      // 自动导入vue相关的Api
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'pinia',
        // 自定义 ：https://github.com/antfu/unplugin-auto-import#configurations
        {
          // onBeforeRouteLeave 'vue-router’的这个Api未被自动导入，在这里补充
          'vue-router': ['onBeforeRouteLeave'],
          '@/utils/tools': ['toast', 'showModal', 'showFullLoading', 'hideFullLoading', 'msg', 'queryParams'],
          '@/utils/storage': ['getToken', 'setToken', 'removeToken', 'getTabList', 'setTabList', 'removeTabList'],
          '@/api/auth': ['getCaptcha', 'login', 'logout'],
          '@/api/admin': [
            'getInfo',
            'rePassword',
            'getUserPage',
            'saveUser',
            'updateUser',
            'deleteUser',
            'deleteSelectAllUser',
            'changeStatus',
            'importUser',
            'setUserRole',
            'getRoleIds'
          ],
          '@/api/export': ['exportUser'],
          '@/api/menu': [
            'getNav',
            'getAuthority',
            'getMenuList',
            'getMenuInfo',
            'createMenu',
            'updateMenu',
            'deleteMenu'
          ],
          '@/api/notice': ['getNoticePage', 'saveNotice', 'updateNotice', 'deleteNotice', 'deleteSelectAll'],
          '@/api/index': ['getstatistics1', 'getstatistics2', 'getstatistics3', 'getstatistics4'],
          '@/api/role': [
            'getRoleList',
            'getRoleInfo',
            'createRole',
            'updateRole',
            'deleteRole',
            'setRoleMenus',
            'getRoles'
          ],
          '@/stores/index': ['useAdminStore'],
          '@/hooks/useAuth': ['useAccountLogin', 'useLogout'],
          '@/hooks/useAdmin': ['usePassword'],
          '@/hooks/useBreadCrumbs': ['useBreadCrumbs'],
          '@/hooks/useNotice': ['useNotice'],
          '@/hooks/useCurd': ['useInitTable', 'useInitForm']
        }
      ],
      // 指定文件夹位置， 加 /** 可遍历子目录
      dirs: ['src/hooks'],
      // 生成 auto-import.d.ts 声明文件
      dts: 'src/auto-import.d.ts',
      // 解析 ElementPlus
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      // 指定组件所在文件夹的位置，默认是 src/components，可以自行扩充
      dirs: ['src/components', 'src/layout/components/'],
      // 解析 ElementPlus
      resolvers: [ElementPlusResolver(), IconResolver({ enabledCollections: ['ep'] })],
      // 组件的有效文件扩展名
      extensions: ['vue'],
      // 配置 type 文件生成位置，生成 components.d.ts; 可以设置为 false
      dts: 'src/components.d.ts',
      // 遍历子目录
      deep: true
    }),
    // 自动安装图标
    Icons({
      autoInstall: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000, //端口号
    open: true //是否自动打开浏览器
  }
})
