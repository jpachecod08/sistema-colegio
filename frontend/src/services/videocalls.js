import api from './api'

export const videocallService = {
  // Obtener todas las llamadas
  getCalls: async () => {
    const response = await api.get('/videocalls/calls/')
    return response.data
  },
  
  // Obtener mis llamadas
  getMyCalls: async () => {
    const response = await api.get('/videocalls/calls/my_calls/')
    return response.data
  },
  
  // Crear nueva llamada
  createCall: async (callData) => {
    const response = await api.post('/videocalls/calls/', callData)
    return response.data
  },
  
  // Unirse a una llamada
  joinCall: async (callId) => {
    const response = await api.post(`/videocalls/calls/${callId}/join_call/`)
    return response.data
  },
  
  // Iniciar llamada
  startCall: async (callId) => {
    const response = await api.post(`/videocalls/calls/${callId}/start_call/`)
    return response.data
  },
  
  // Finalizar llamada
  endCall: async (callId) => {
    const response = await api.post(`/videocalls/calls/${callId}/end_call/`)
    return response.data
  },
  
  // Invitar participantes
  inviteParticipants: async (callId, userIds) => {
    const response = await api.post(`/videocalls/calls/${callId}/invite_participants/`, { user_ids: userIds })
    return response.data
  },
  
  // Obtener participantes disponibles
  getAvailableParticipants: async () => {
    const response = await api.get('/videocalls/calls/available_participants/')
    return response.data
  }
}