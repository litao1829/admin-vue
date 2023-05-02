import axios from '@/utils/axios'

export function getRoleList(page, limit) {
  return axios.get(`/sys/role/page?page=${page}&limit=${limit}`)
}

export function getRoleInfo(roleId) {
  return axios.get(`/sys/role/${roleId}`)
}

export function createRole(data) {
  return axios.post(`/sys/role`, data)
}

export function updateRole(data) {
  return axios.put(`/sys/role`, data)
}

export function deleteRole(roleId) {
  return axios.delete(`/sys/role/${roleId}`)
}

export function setRoleMenus(roleId, menuIds) {
  return axios.post(`/sys/role/menus/${roleId}`, menuIds)
}
