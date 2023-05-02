import axios from '@/utils/axios'

export function getNav() {
  return axios.get('/sys/menu/nav')
}

export function getAuthority() {
  return axios.get('/sys/menu/authority')
}

export function getMenuList() {
  return axios.get('/sys/menu/list')
}

export function getMenuInfo(id) {
  return axios.get(`/sys/menu/${id}`)
}

export function createMenu(data) {
  return axios.post(`/sys/menu`, data)
}

export function updateMenu(data) {
  return axios.put(`/sys/menu`, data)
}

export function deleteMenu(id) {
  return axios.delete(`/sys/menu/${id}`)
}
