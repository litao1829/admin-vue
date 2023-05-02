<script setup>
import { exportUser } from '../../api/export'
import zhcn from 'element-plus/lib/locale/lang/zh-cn'

const {
  searchForm,
  resetSearchForm,
  multipleTableRef,
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  handleDelete,
  handleSelectionChange,
  handleMultiDelete,
  handleStatusChange
} = useInitTable({
  searchForm: {
    username: '',
    realName: '',
    mobile: '',
    gender: null,
    dateValue: ''
  },
  getList: getUserPage,
  delete: deleteUser,
  deleteSelectAll: deleteSelectAllUser
})

const { formDrawerRef, formRef, form, rules, drawerTitle, handleSubmit, handleCreate, handleEdit } = useInitForm({
  form: {
    id: '',
    username: '',
    password: '',
    realName: '',
    mobile: '',
    gender: ''
  },
  rules: {
    username: [
      {
        required: true,
        message: '用户名不能为空',
        trigger: 'blur'
      }
    ],
    realName: [
      {
        required: true,
        message: '真实姓名不能为空',
        trigger: 'blur'
      }
    ],
    mobile: [
      {
        required: true,
        message: '手机号不能为空',
        trigger: 'blur'
      }
    ]
  },
  getData,
  update: updateUser,
  create: saveUser
})

//导出数据
const handleExport = (filename = '用户数据') => {
  //调用接口
  exportUser()
    .then(res => {
      //可以看到res的data为一个blob文件
      console.log(res)

      //创建a标签
      const down = document.createElement('a')
      //如果文件名没传，则使用时间戳作为文件名
      down.download = filename + '.xlsx' || new Date().getTime().toString() + '.xlsx'

      //隐藏a标签
      down.style.display = 'none'

      //创建字节数组，将返回的blob文件加进去
      let binaryData = []
      binaryData.push(res.data)
      //创建下载url
      down.href = URL.createObjectURL(new Blob(binaryData))

      //将a标签加入DOM
      document.body.appendChild(down)
      //模拟点击下载
      down.click()

      //释放url
      URL.revokeObjectURL(down.href)

      //下载完成后移除a标签
      document.body.removeChild(down)
    })
    .catch(err => {
      msg(err.message, 'error')
    })
}

const show = ref(false)
const uploadUserExcel = import.meta.env.VITE_API_URL + '/sys/user/import?accessToken=' + getToken()
// 上传成功的回调函数
const handleUploadSuccess = response => {
  msg('上传成功')
  console.log(response)
  getData()
}

// 上传失败的回调函数
const handleUploadError = error => {
  msg('上传失败', 'error')
  console.log(error)
}

// 校验文件类型是否为 Excel
const checkFileType = file => {
  const fileType = file.name.split('.').pop().toLowerCase()
  if (fileType !== 'xls' && fileType !== 'xlsx') {
    msg('请选择正确的 Excel 文件', 'error')
    return false
  }
  return true
}

const options = reactive([
  {
    label: '男',
    value: '0'
  },
  { label: '女', value: '1' },
  { label: '未知', value: '2' }
])

//日期显示为中文
const local = zhcn
//快捷选择范围
const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]
</script>

<template>
  <el-card shadow="never" class="border-0">
    <!--搜索组件 -->
    <Search :model="searchForm" @search="getData" @reset="resetSearchForm">
      <el-form-item label="用户名" :span="4">
        <el-input v-model="searchForm.username" placeholder="用户名" clearable></el-input>
      </el-form-item>
      <el-form-item label="姓名" :span="4">
        <el-input v-model="searchForm.realName" placeholder="姓名" clearable></el-input>
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="searchForm.mobile" placeholder="手机号" clearable></el-input>
      </el-form-item>
      <el-form-item label="性别" :span="4">
        <el-select v-model="searchForm.gender" placeholder="选择性别" clearable>
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <template #show>
        <el-form-item label="创建时间" class="ml-4">
          <el-config-provider :locale="local">
            <el-date-picker
              v-model="searchForm.dateValue"
              type="datetimerange"
              unlink-panels
              range-separator="到"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              :shortcuts="shortcuts"
            />
          </el-config-provider>
        </el-form-item>
      </template>
    </Search>
    <!-- 新增、批量删除、刷新 -->
    <ListHeader
      layout="create,delete,export,import,refresh"
      @create="handleCreate"
      @refresh="getData"
      @delete="handleMultiDelete"
      @export="handleExport"
      v-permission="['sys:notice:save', 'sys:notice:delete']"
    >
      <template #import>
        <el-upload
          :action="uploadUserExcel"
          :headers="{ Authorization: getToken }"
          :before-upload="checkFileType"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :show-file-list="show"
          class="inline-block px-5 py-4"
          v-permission="['sys:user:import']"
        >
          <el-button type="success" class="rounded-full">导入数据</el-button>
        </el-upload>
      </template>
    </ListHeader>

    <el-table
      ref="multipleTableRef"
      @selection-change="handleSelectionChange"
      :data="tableData"
      stripe
      v-loading="loading"
      class="w-full"
    >
      <el-table-column type="selection" width="50" v-permission="['sys:notice:save', 'sys:notice:delete']" />
      <el-table-column prop="title" label="管理员信息">
        <template #default="{ row }">
          <div class="v-center">
            <el-avatar :size="40" :src="row.avatar">
              <img :src="row.avatar" />
            </el-avatar>
            <div class="ml-4">
              <div>
                <span>用户名:</span>
                <span class="ml-2">{{ row.username }}</span>
              </div>
              <div>
                <span>ID:</span>
                <span class="ml-2">{{ row.id }}</span>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="realName" label="真实姓名" class="flex-1" align="center" />
      <el-table-column label="状态" align="center">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row, $event)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="220" align="center" />
      <el-table-column label="操作" align="center" v-permission="['sys:notice:update']" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" v-permission="['sys:notice:update']"
            >修改</el-button
          >
          <el-popconfirm
            title="确定删除？"
            confirmButtonText="确认"
            cancelButtonText="取消"
            @confirm="handleDelete(scope.row.id)"
          >
            <template #reference>
              <el-button size="small" v-permission="['sys:notice:delete']" class="bg-red-400 text-light-50"
                >删除</el-button
              >
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

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

    <!-- 抽屉组件 -->
    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="真实姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" placeholder="手机号"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.gender" placeholder="Select" size="large">
            <el-option label="男" :value="0" />
            <el-option label="女" :value="1" />
            <el-option label="未知" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>
</template>

<style scoped></style>
