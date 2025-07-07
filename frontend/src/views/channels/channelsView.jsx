import { useState, useEffect } from "react"
import { Hash, Lock, Volume2, Users, Settings, Plus, ChevronDown } from "lucide-react"
import './channelsView.css';

export default function ChannelsView() {
  const API_URL = process.env.REACT_APP_URLAPI;

  const [servers, setServers] = useState([])
  const [selectedServer, setSelectedServer] = useState(null)
  const [channels, setChannels] = useState([])
  const [isLoadingServers, setIsLoadingServers] = useState(true)
  const [isLoadingChannels, setIsLoadingChannels] = useState(false)
  const [error, setError] = useState(null)

  const fetchServers = async () => {
    try {
      // For demo purposes, using mock data
      // Replace this with actual API call when backend is configured
      const mockServers = [
        {
          id: "1",
          name: "General Server",
          description: "A general purpose Discord server",
          icon: null,
          isPublic: true,
          _count: { channels: 4, members: 12 }
        },
        {
          id: "2",
          name: "Gaming Hub",
          description: "Server for gaming enthusiasts", 
          icon: null,
          isPublic: true,
          _count: { channels: 4, members: 8 }
        },
        {
          id: "3",
          name: "Study Group",
          description: "Private study group server",
          icon: null,
          isPublic: false,
          _count: { channels: 3, members: 5 }
        }
      ]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setServers(mockServers)
      
      // Uncomment below for real API call:
      // const response = await fetch(`${API_URL}/servers`)
      // if (!response.ok) {
      //   throw new Error("Failed to fetch servers")
      // }
      // const data = await response.json()
      // setServers(data.data)
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
      // Mock data based on server ID
      const mockChannelsData = {
        "1": [
          { id: "1", name: "general", description: "General discussion", isPrivate: false, isVoice: false, createdAt: new Date().toISOString() },
          { id: "2", name: "announcements", description: "Server announcements", isPrivate: false, isVoice: false, createdAt: new Date().toISOString() },
          { id: "3", name: "random", description: "Random conversations", isPrivate: false, isVoice: false, createdAt: new Date().toISOString() },
          { id: "4", name: "private-chat", description: "Private discussion", isPrivate: true, isVoice: false, createdAt: new Date().toISOString() },
          { id: "5", name: "voice-general", description: "General voice chat", isPrivate: false, isVoice: true, createdAt: new Date().toISOString() }
        ],
        "2": [
          { id: "6", name: "gaming-general", description: "General gaming discussion", isPrivate: false, isVoice: false, createdAt: new Date().toISOString() },
          { id: "7", name: "minecraft", description: "Minecraft discussions", isPrivate: false, isVoice: false, createdAt: new Date().toISOString() },
          { id: "8", name: "valorant", description: "Valorant team coordination", isPrivate: false, isVoice: false, createdAt: new Date().toISOString() },
          { id: "9", name: "voice-gaming", description: "Gaming voice chat", isPrivate: false, isVoice: true, createdAt: new Date().toISOString() }
        ],
        "3": [
          { id: "10", name: "study-hall", description: "Main study discussion", isPrivate: false, isVoice: false, createdAt: new Date().toISOString() },
          { id: "11", name: "resources", description: "Study resources sharing", isPrivate: false, isVoice: false, createdAt: new Date().toISOString() },
          { id: "12", name: "homework-help", description: "Get help with homework", isPrivate: true, isVoice: false, createdAt: new Date().toISOString() }
        ]
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      setChannels(mockChannelsData[serverId] || [])
      
      // Uncomment below for real API call:
      // const response = await fetch(`${API_URL}/channels?serverId=${serverId}`)
      // if (!response.ok) {
      //   throw new Error("Failed to fetch channels")
      // }
      // const data = await response.json()
      // setChannels(data.data)
    } catch (error) {
      console.error("Error fetching channels:", error)
      setError(error.message)
    } finally {
      setIsLoadingChannels(false)
    }
  }

  const handleServerClick = (server) => {
    setSelectedServer(server)
    fetchChannels(server.id)
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
                      <div key={channel.id} className="channel-item">
                        {channel.isPrivate ? (
                          <Lock className="channel-icon" />
                        ) : (
                          <Hash className="channel-icon" />
                        )}
                        <span className="channel-name">{channel.name}</span>
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
                      <div key={channel.id} className="channel-item voice-channel">
                        <Volume2 className="channel-icon" />
                        <span className="channel-name">{channel.name}</span>
                        <Users className="voice-users-icon" />
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
              <Hash className="current-channel-icon" />
              <span className="current-channel-name">
                {channels.length > 0 ? channels[0].name : 'general'}
              </span>
            </div>
            <div className="messages-area">
              <div className="welcome-message">
                <h2>Welcome to #{channels.length > 0 ? channels[0].name : 'general'}!</h2>
                <p>This is the beginning of the #{channels.length > 0 ? channels[0].name : 'general'} channel.</p>
              </div>
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