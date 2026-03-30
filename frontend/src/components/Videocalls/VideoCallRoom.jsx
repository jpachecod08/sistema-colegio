import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AgoraRTC from 'agora-rtc-sdk-ng'
import { videocallService } from '../../services/videocalls'
import { 
  Box, 
  Paper, 
  IconButton, 
  Typography, 
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  CallEnd,
  ScreenShare,
  StopScreenShare,
  Chat
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'

const VideoCallRoom = () => {
  const { callId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [localVideoTrack, setLocalVideoTrack] = useState(null)
  const [localAudioTrack, setLocalAudioTrack] = useState(null)
  const [remoteUsers, setRemoteUsers] = useState({})
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isSharingScreen, setIsSharingScreen] = useState(false)
  const [screenTrack, setScreenTrack] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  
  const clientRef = useRef(null)
  const localVideoRef = useRef(null)
  const chatEndRef = useRef(null)
  
  useEffect(() => {
    initAgora()
    
    return () => {
      leaveCall()
    }
  }, [])
  
  const initAgora = async () => {
    try {
      // Unirse a la llamada
      const callData = await videocallService.joinCall(callId)
      
      // Crear cliente Agora
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
      clientRef.current = client
      
      // Eventos de cliente
      client.on('user-published', handleUserPublished)
      client.on('user-unpublished', handleUserUnpublished)
      client.on('user-left', handleUserLeft)
      
      // Unirse al canal
      await client.join(callData.app_id, callData.channel_name, callData.token, user.id)
      
      // Crear tracks locales
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
      setLocalAudioTrack(audioTrack)
      setLocalVideoTrack(videoTrack)
      
      // Publicar tracks
      await client.publish([audioTrack, videoTrack])
      
      // Reproducir video local
      videoTrack.play(localVideoRef.current)
      
    } catch (error) {
      console.error('Error al iniciar videollamada:', error)
    }
  }
  
  const handleUserPublished = async (user, mediaType) => {
    await clientRef.current.subscribe(user, mediaType)
    
    if (mediaType === 'video') {
      setRemoteUsers(prev => ({
        ...prev,
        [user.uid]: { ...prev[user.uid], videoTrack: user.videoTrack }
      }))
    }
    
    if (mediaType === 'audio') {
      user.audioTrack.play()
      setRemoteUsers(prev => ({
        ...prev,
        [user.uid]: { ...prev[user.uid], audioTrack: user.audioTrack }
      }))
    }
  }
  
  const handleUserUnpublished = (user, mediaType) => {
    if (mediaType === 'video') {
      setRemoteUsers(prev => {
        const newUsers = { ...prev }
        delete newUsers[user.uid]
        return newUsers
      })
    }
  }
  
  const handleUserLeft = (user) => {
    setRemoteUsers(prev => {
      const newUsers = { ...prev }
      delete newUsers[user.uid]
      return newUsers
    })
  }
  
  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isVideoEnabled)
      setIsVideoEnabled(!isVideoEnabled)
    }
  }
  
  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isAudioEnabled)
      setIsAudioEnabled(!isAudioEnabled)
    }
  }
  
  const toggleScreenShare = async () => {
    if (!isSharingScreen) {
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack()
        setScreenTrack(screenTrack)
        await clientRef.current.unpublish(localVideoTrack)
        await clientRef.current.publish(screenTrack)
        setIsSharingScreen(true)
      } catch (error) {
        console.error('Error al compartir pantalla:', error)
      }
    } else {
      await clientRef.current.unpublish(screenTrack)
      await clientRef.current.publish(localVideoTrack)
      screenTrack.close()
      setScreenTrack(null)
      setIsSharingScreen(false)
    }
  }
  
  const leaveCall = async () => {
    if (localVideoTrack) localVideoTrack.close()
    if (localAudioTrack) localAudioTrack.close()
    if (screenTrack) screenTrack.close()
    
    if (clientRef.current) {
      await clientRef.current.leave()
    }
    
    navigate('/dashboard')
  }
  
  const sendMessage = async () => {
    if (newMessage.trim()) {
      const message = {
        user: user.username,
        text: newMessage,
        timestamp: new Date()
      }
      setMessages([...messages, message])
      setNewMessage('')
      
      // Enviar mensaje por WebSocket
      // Aquí implementarías el envío de mensajes
    }
  }
  
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Video Grid */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Grid container spacing={2}>
          {/* Video Local */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper elevation={3} sx={{ position: 'relative', pt: '56.25%' }}>
              <div ref={localVideoRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
              <Typography 
                variant="caption" 
                sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', p: 0.5 }}
              >
                {user.username} (Tú)
              </Typography>
            </Paper>
          </Grid>
          
          {/* Videos Remotos */}
          {Object.entries(remoteUsers).map(([uid, user]) => (
            <Grid item xs={12} md={6} lg={4} key={uid}>
              <Paper elevation={3} sx={{ position: 'relative', pt: '56.25%' }}>
                {user.videoTrack && (
                  <div 
                    ref={(ref) => ref && user.videoTrack.play(ref)} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  />
                )}
                <Typography 
                  variant="caption" 
                  sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', p: 0.5 }}
                >
                  Usuario {uid}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Controles */}
      <Paper elevation={3} sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <IconButton color={isVideoEnabled ? 'primary' : 'error'} onClick={toggleVideo}>
          {isVideoEnabled ? <Videocam /> : <VideocamOff />}
        </IconButton>
        
        <IconButton color={isAudioEnabled ? 'primary' : 'error'} onClick={toggleAudio}>
          {isAudioEnabled ? <Mic /> : <MicOff />}
        </IconButton>
        
        <IconButton color="error" onClick={leaveCall}>
          <CallEnd />
        </IconButton>
        
        <IconButton color={isSharingScreen ? 'primary' : 'default'} onClick={toggleScreenShare}>
          {isSharingScreen ? <StopScreenShare /> : <ScreenShare />}
        </IconButton>
        
        <IconButton color={showChat ? 'primary' : 'default'} onClick={() => setShowChat(!showChat)}>
          <Chat />
        </IconButton>
      </Paper>
      
      {/* Chat */}
      <Dialog open={showChat} onClose={() => setShowChat(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chat de la Videollamada</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, overflow: 'auto', mb: 2 }}>
            {messages.map((msg, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {msg.user} - {msg.timestamp.toLocaleTimeString()}
                </Typography>
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            ))}
            <div ref={chatEndRef} />
          </Box>
        </DialogContent>
        <DialogActions>
          <TextField
            fullWidth
            size="small"
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage} variant="contained">Enviar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default VideoCallRoom