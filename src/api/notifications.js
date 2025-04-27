import axiosInstance from '@/lib/axios'

export const getNotifications = async (cursor = null) => {
  const response = await axiosInstance.get('/api/notifications', {
    params: { cursor },
  })
  return response.data
}

export const markAsRead = async (id) => {
  const response = await axiosInstance.patch(`/api/notifications/${id}/read`)
  return response.data
}

export const markAllAsRead = async () => {
  const response = await axiosInstance.patch('/api/notifications/mark-all-read')
  return response.data
}

export const deleteNotification = async (id) => {
  const response = await axiosInstance.delete(`/api/notifications/${id}`)
  return response.data
}
