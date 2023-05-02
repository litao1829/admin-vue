// 通用列表，分页，新增，删除，修改 封装
export function useInitTable(opt = {}) {
  let searchForm = null
  let resetSearchForm = null
  if (opt.searchForm) {
    searchForm = reactive({ ...opt.searchForm })
    resetSearchForm = () => {
      for (const key in opt.searchForm) {
        searchForm[key] = opt.searchForm[key]
      }
      getData()
    }
  }

  const tableData = ref([])
  const loading = ref(false)

  // 分页
  const currentPage = ref(1)
  const total = ref(0)
  const limit = ref(12)

  // 获取数据
  function getData(p = null) {
    if (typeof p == 'number') {
      currentPage.value = p
    }
    loading.value = true
    opt
      .getList(currentPage.value, limit.value, searchForm)
      .then(res => {
        //区分是否分页
        if (res.list) {
          tableData.value = res.list
          total.value = res.total
        } else {
          tableData.value = res
        }
      })
      .finally(() => {
        loading.value = false
      })
  }

  getData()

  // 删除
  const handleDelete = id => {
    loading.value = true
    opt
      .delete(id)
      .then(() => {
        toast('删除成功')
        getData()
      })
      .finally(() => {
        loading.value = false
      })
  }

  const multiSelecttionIds = ref([])
  const handleSelectionChange = e => {
    multiSelecttionIds.value = e.map(o => o.id)
    console.log(multiSelecttionIds.value)
  }

  //批量删除
  const multipleTableRef = ref(null)
  const handleMultiDelete = () => {
    loading.value = true
    opt
      .deleteSelectAll(multiSelecttionIds.value)
      .then(() => {
        msg('删除成功')
        //清空选中
        if (multipleTableRef.value) {
          multipleTableRef.value.clearSelection()
        }
        getData()
      })
      .finally(() => {
        loading.value = false
      })
  }

  //修改用户状态
  const handleStatusChange = (row, status) => {
    changeStatus(row.id, status).then(() => {
      msg('修改状态成功')
      row.status = status
    })
  }

  return {
    searchForm,
    resetSearchForm,
    multiSelecttionIds,
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
  }
}

// 新增，修改
export function useInitForm(opt = {}) {
  // 表单部分
  const formDrawerRef = ref(null)
  const formRef = ref(null)
  const defaultForm = opt.form
  const form = reactive({})
  const rules = opt.rules || {}
  const editId = ref(0)
  const drawerTitle = computed(() => (editId.value ? '修改' : '新增'))

  const handleSubmit = () => {
    formRef.value.validate(valid => {
      if (!valid) return
      formDrawerRef.value.showLoading()
      let body = {}
      if (opt.beforeSubmit && typeof opt.beforeSubmit == 'function') {
        body = opt.beforeSubmit({ ...form })
      } else {
        body = form
      }

      const fun = editId.value ? opt.update(form) : opt.create(body)

      fun
        .then(() => {
          toast(drawerTitle.value + '成功')
          // 修改刷新当前页，新增刷新第一页
          opt.getData(editId.value ? false : 1)
          formDrawerRef.value.close()
        })
        .finally(() => {
          formDrawerRef.value.hideLoading()
        })
    })
  }

  // 重置表单
  function resetForm(row = false) {
    if (formRef.value) formRef.value.clearValidate()
    for (const key in defaultForm) {
      form[key] = row[key]
    }
    console.log(form)
  }

  // 新增
  const handleCreate = () => {
    editId.value = 0
    resetForm(defaultForm)
    formDrawerRef.value.open()
  }

  // 编辑
  const handleEdit = row => {
    editId.value = row.id
    console.log(row.id)
    resetForm(row)
    formDrawerRef.value.open()
  }

  return {
    formDrawerRef,
    formRef,
    form,
    rules,
    editId,
    drawerTitle,
    handleSubmit,
    resetForm,
    handleCreate,
    handleEdit
  }
}
