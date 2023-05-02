<script setup>
const { tableData, loading, currentPage, total, limit, getData, handleDelete } = useInitTable({
  searchForm: {
    username: '',
    realName: '',
    mobile: '',
    gender: null,
    dateValue: ''
  },
  getList: getRoleList,
  delete: deleteRole
})

const { formDrawerRef, formRef, form, rules, drawerTitle, handleSubmit, handleCreate, handleEdit } = useInitForm({
  form: {
    id: '',
    name: '',
    remark: ''
  },
  rules: {
    name: [
      {
        required: true,
        message: '角色名不能为空',
        trigger: 'blur'
      }
    ]
  },
  getData,
  update: updateRole,
  create: createRole
})

const setMenuFormDrawerRef = ref(null)
const menuList = ref([])
const treeHeight = ref(0)
const roleId = ref(0)
const elTreeRef = ref(null)
//当前用户用户的权限ID
const menuIds = ref([])
const checkStrictly = ref(false)

const openSetMenu = row => {
  roleId.value = row.id
  treeHeight.value = window.innerHeight - 180
  checkStrictly.value = true

  getMenuList().then(res => {
    menuList.value = res
    setMenuFormDrawerRef.value.open()

    //当前角色拥有的所有权限id
    getRoleInfo(roleId.value).then(res => {
      menuIds.value = res.menuIdList
      setTimeout(() => {
        elTreeRef.value.setCheckedKeys(menuIds.value)
        checkStrictly.value = false
      }, 150)
    })
  })
}

const handleSetMenuSubmit = () => {
  setMenuFormDrawerRef.value.showLoading()
  setRoleMenus(roleId.value, menuIds.value)
    .then(() => {
      toast('配置成功')
      getData()
      setMenuFormDrawerRef.value.close()
    })
    .finally(() => {
      setMenuFormDrawerRef.value.hideLoading()
    })
}

const handleTreeCheck = (...e) => {
  const { checkedKeys, halfCheckedKeys } = e[1]
  menuIds.value = [...checkedKeys, ...halfCheckedKeys]
}
</script>

<template>
  <el-card shadow="never" class="border-0">
    <ListHeader layout="create" @create="handleCreate" @refresh="getData" />

    <el-table :data="tableData" stripe class="w-full" v-loading="loading">
      <el-table-column prop="name" label="角色名称" align="center" width="200" />
      <el-table-column prop="remark" label="角色描述" align="center" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" text @click="openSetMenu(scope.row)">配置权限</el-button>
          <el-button type="success" size="small" text @click="handleEdit(scope.row)">修改</el-button>
          <el-popconfirm
            title="确认删除"
            confirmButtonText="确认"
            cancelButtonText="取消"
            @confirm="handleDelete(scope.row.id)"
          >
            <template #reference>
              <el-button text type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="mt-3 relative left-[35%]">
      <el-pagination
        background
        layout="prev, pager ,next"
        :total="total"
        :current-page="currentPage"
        :page-size="limit"
        @current-change="getData"
      />
    </div>

    <!-- 添加用户 -->
    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="remark">
          <el-input v-model="form.remark"></el-input>
        </el-form-item>
      </el-form>
    </FormDrawer>

    <!--权限配置 -->
    <FormDrawer ref="setMenuFormDrawerRef" title="权限配置" @submit="handleSetMenuSubmit">
      <el-tree-v2
        ref="elTreeRef"
        node-key="id"
        :check-strictly="checkStrictly"
        :default-checked-keys="tableData.map(o => o.id)"
        :data="menuList"
        :props="{ label: 'name', children: 'children' }"
        show-checkbox
        :height="treeHeight"
        @check="handleTreeCheck"
      >
        <template #default="{ data }">
          <div class="v-center">
            <el-tag v-if="data.type === 0" type="success">菜单</el-tag>
            <el-tag v-if="data.type === 1" type="warning">按钮</el-tag>
            <el-tag v-if="data.type === 2" type="info">接口</el-tag>
            <span class="ml-2 text-sm">{{ data.name }}</span>
          </div>
        </template>
      </el-tree-v2>
    </FormDrawer>
  </el-card>
</template>

<style scoped></style>
