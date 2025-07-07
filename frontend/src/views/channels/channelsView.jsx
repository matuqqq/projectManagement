import { useState, useEffect } from "react"
import { Hash, Lock, Volume2, Users, Settings, Plus, ChevronDown } from "lucide-react"
import './channelsView.css';

export default function ChannelsView() {
  const API_URL = process.env.REACT_APP_URLAPI;

  const [servers, setServers] = useState([])
  const [selectedServer, setSelectedServer] = useState(null)
  const [channels, setChannels] = useState([])
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [isLoadingServers, setIsLoadingServers] = useState(true)
  const [isLoadingChannels, setIsLoadingChannels] = useState(false)
  const [error, setError] = useState(null)

  const fetchServers = async () => {
    try {
      const response = await fetch(`${API_URL}/servers`)
      if (!response.ok) {
        throw new Error("Failed to fetch servers")
      }
      const data = await response.json()
      setServers(data.data)
    } catch (error) {
      console.error("Error fetching servers:", error)
      setError(error.message)
    } finally {
      setIsLoadingServers(false)
    }
  }

  const fetchChannels = async (serverId) => {
    setIsLoadingChannels(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/channels?serverId=${serverId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch channels")
      }
      const data = await response.json()
      
      // Add mock unread counts and connected users for demo purposes
      const channelsWithMockData = data.data.map((channel, index) => ({
        ...channel,
        unreadCount: channel.isVoice ? undefined : Math.floor(Math.random() * 10),
        connectedUsers: channel.isVoice ? Math.floor(Math.random() * 5) : undefined
      }))
      
      setChannels(channelsWithMockData)
      
      // Auto-select the first text channel when loading channels
      const firstTextChannel = channelsWithMockData.find(channel => !channel.isVoice)
      if (firstTextChannel) {
        setSelectedChannel(firstTextChannel)
      }
    } catch (error) {
      console.error("Error fetching channels:", error)
      setError(error.message)
    } finally {
      setIsLoadingChannels(false)
    }
  }

  const handleServerClick = (server) => {
    setSelectedServer(server)
    setSelectedChannel(null) // Reset selected channel when switching servers
    fetchChannels(server.id)
  }

  const handleChannelClick = (channel) => {
    setSelectedChannel(channel)
    
    // Simulate marking channel as read (clear unread count)
    if (channel.unreadCount && channel.unreadCount > 0) {
      setChannels(prevChannels => 
        prevChannels.map(ch => 
          ch.id === channel.id 
            ? { ...ch, unreadCount: 0 }
            : ch
        )
      )
    }
  }

  useEffect(() => {
    fetchServers()
  }, [])

  return (
    <div className="discord-layout">
      {/* Server Sidebar */}
      <div className="server-sidebar">
        <div className="server-list">
          {isLoadingServers ? (
            <div className="loading-placeholder">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            servers.map((server) => (
              <div
                key={server.id}
                className={`server-item ${selectedServer?.id === server.id ? 'selected' : ''}`}
                onClick={() => handleServerClick(server)}
                title={server.name}
              >
                {server.icon ? (
                  <img src={server.icon} alt={server.name} className="server-icon" />
                ) : (
                  <div className="server-icon-placeholder">
                    {server.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Channels Sidebar */}
      <div className="channels-sidebar">
        {selectedServer ? (
          <>
            {/* Server Header */}
            <div className="server-header">
              <h2 className="server-name">{selectedServer.name}</h2>
              <ChevronDown className="server-dropdown-icon" />
            </div>

            {/* Channels List */}
            <div className="channels-list">
              {isLoadingChannels ? (
                <div className="channels-loading">
                  <div className="loading-spinner"></div>
                  <span>Loading channels...</span>
                </div>
              ) : channels.length > 0 ? (
                <>
                  <div className="channel-category">
                    <div className="category-header">
                      <ChevronDown className="category-icon" />
                      <span className="category-name">TEXT CHANNELS</span>
                      <Plus className="add-channel-icon" />
                    </div>
                    {channels.filter(channel => !channel.isVoice).map((channel) => (
                      <div 
                        key={channel.id} 
                        className={`channel-item ${selectedChannel?.id === channel.id ? 'selected' : ''}`}
                        onClick={() => handleChannelClick(channel)}
                      >
                        {channel.isPrivate ? (
                          <Lock className="channel-icon" />
                        ) : (
                          <Hash className="channel-icon" />
                        )}
                        <span className="channel-name">{channel.name}</span>
                        {channel.unreadCount && channel.unreadCount > 0 && (
                          <div className="unread-badge">
                            {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="channel-category">
                    <div className="category-header">
                      <ChevronDown className="category-icon" />
                      <span className="category-name">VOICE CHANNELS</span>
                      <Plus className="add-channel-icon" />
                    </div>
                    {channels.filter(channel => channel.isVoice).map((channel) => (
                      <div 
                        key={channel.id} 
                        className={`channel-item voice-channel ${selectedChannel?.id === channel.id ? 'selected' : ''}`}
                        onClick={() => handleChannelClick(channel)}
                      >
                        <Volume2 className="channel-icon" />
                        <span className="channel-name">{channel.name}</span>
                        <div className="voice-info">
                          {channel.connectedUsers && channel.connectedUsers > 0 && (
                            <span className="connected-users">{channel.connectedUsers}</span>
                          )}
                          <Users className="voice-users-icon" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-channels">
                  <p>No channels found in this server.</p>
                </div>
              )}
            </div>

            {/* User Panel */}
            <div className="user-panel">
              <div className="user-info">
                <div className="user-avatar"></div>
                <div className="user-details">
                  <span className="username">User</span>
                  <span className="user-status">Online</span>
                </div>
              </div>
              <div className="user-controls">
                <Settings className="control-icon" />
              </div>
            </div>
          </>
        ) : (
          <div className="no-server-selected">
            <h3>Select a Server</h3>
            <p>Choose a server from the sidebar to view its channels.</p>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {selectedServer ? (
          <div className="channel-content">
            <div className="channel-header">
              {selectedChannel ? (
                <>
                  {selectedChannel.isVoice ? (
                    <Volume2 className="current-channel-icon" />
                  ) : selectedChannel.isPrivate ? (
                    <Lock className="current-channel-icon" />
                  ) : (
                    <Hash className="current-channel-icon" />
                  )}
                  <span className="current-channel-name">{selectedChannel.name}</span>
                  {selectedChannel.description && (
                    <span className="channel-description">— {selectedChannel.description}</span>
                  )}
                </>
              ) : (
                <>
                  <Hash className="current-channel-icon" />
                  <span className="current-channel-name">Select a channel</span>
                </>
              )}
            </div>
            <div className="messages-area">
              {selectedChannel ? (
                <div className="welcome-message">
                  <h2>Welcome to {selectedChannel.isVoice ? '' : '#'}{selectedChannel.name}!</h2>
                  <p>This is the beginning of the {selectedChannel.isVoice ? '' : '#'}{selectedChannel.name} {selectedChannel.isVoice ? 'voice channel' : 'channel'}.</p>
                  {selectedChannel.description && (
                    <p className="channel-description-detail">{selectedChannel.description}</p>
                  )}
                  {selectedChannel.isVoice && (
                    <div className="voice-channel-info">
                      <Users className="voice-icon" />
                      <span>
                        {selectedChannel.connectedUsers && selectedChannel.connectedUsers > 0
                          ? `${selectedChannel.connectedUsers} user${selectedChannel.connectedUsers !== 1 ? 's' : ''} connected`
                          : 'No one is currently in this voice channel'
                        }
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-channel-selected">
                  <div className="no-channel-content">
                    <Hash className="no-channel-icon" />
                    <h3>No channel selected</h3>
                    <p>Select a channel from the sidebar to start chatting!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-content">
            <div className="no-content-inner">
              <h2>Welcome to Discord Clone</h2>
              <p>Select a server and channel to start chatting!</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="error-toast">
          <span>Error: {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  )
}