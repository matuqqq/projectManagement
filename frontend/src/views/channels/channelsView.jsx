import { useState } from "react"
import { Loader2, Hash, Lock, Globe, Calendar, Server, Search } from "lucide-react"
import './channelsView.css'; // Import the CSS file

export default function ChannelsView() {
  const API_URL = process.env.REACT_APP_URLAPI;

  const [channels, setChannels] = useState([])
  const [serverId, setServerId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchChannels = async () => {
    if (!serverId.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/channels?serverId=${serverId}`)

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()
      setChannels(data.data)
    } catch (error) {
      console.error("Error fetching channels:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchChannels()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="channels-view-container">
      <div className="channels-view-content">
        {/* Header */}
        <div className="header-section">
          <div className="header-title-container">
            <div className="header-icon">
              <Server className="server-icon" />
            </div>
            <h1 className="header-text">Server Channels</h1>
          </div>
          <p className="header-subtext">Discover and explore channels in your Discord server</p>
        </div>

        {/* Search Form */}
        <div className="search-container">
          <div className="search-header">
            <h2 className="search-title">
              <Search className="search-icon" />
              Find Server Channels
            </h2>
            <p className="search-description">Enter a server ID to view all available channels</p>
          </div>
          <div className="search-form-container">
            <form onSubmit={handleSubmit} className="search-form">
              <input
                type="text"
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
                placeholder="Enter Server ID (e.g., 123456789012345678)"
                className="search-input"
              />
              <button
                type="submit"
                disabled={isLoading || !serverId.trim()}
                className={`search-button ${(isLoading || !serverId.trim()) ? 'disabled-button' : ''}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="loading-icon" />
                    Loading...
                  </>
                ) : (
                  "Get Channels"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-container">
            <div className="error-content">
              <div className="error-indicator" />
              Error: {error}
            </div>
          </div>
        )}

        {/* Channels Results */}
        {channels.length > 0 && (
          <div className="channels-results">
            <div className="results-header">
              <h2 className="results-title">Channels in {channels[0].server.name}</h2>
              <span className="results-count">
                {channels.length} {channels.length === 1 ? "channel" : "channels"} found
              </span>
            </div>

            <div className="channels-grid">
              {channels.map((channel, index) => (
                <div
                  key={channel.id}
                  className="channel-card"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.5s ease-out forwards",
                  }}
                >
                  <div className="channel-content">
                    <div className="channel-header">
                      <div className="channel-info">
                        <div className="channel-icon-container">
                          {channel.isPrivate ? (
                            <Lock className="private-channel-icon" />
                          ) : (
                            <Hash className="public-channel-icon" />
                          )}
                        </div>
                        <div>
                          <h3 className="channel-name">{channel.name}</h3>
                          <div className="channel-status-container">
                            <span
                              className={`channel-status ${channel.isPrivate ? 'private-status' : 'public-status'}`}
                            >
                              {channel.isPrivate ? (
                                <>
                                  <Lock className="status-icon" />
                                  Private
                                </>
                              ) : (
                                <>
                                  <Globe className="status-icon" />
                                  Public
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="channel-date">
                        <Calendar className="calendar-icon" />
                        {formatDate(channel.createdAt)}
                      </div>
                    </div>

                    {channel.description && (
                      <>
                        <div className="channel-divider"></div>
                        <div className="channel-description-container">
                          <h4 className="description-title">Description</h4>
                          <p className="description-text">{channel.description}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && !error && serverId && channels.length === 0 && (
          <div className="no-results-container">
            <div className="no-results-content">
              <div className="no-results-inner">
                <div className="no-results-icon-container">
                  <Search className="no-results-icon" />
                </div>
                <div>
                  <h3 className="no-results-title">No channels found</h3>
                  <p className="no-results-message">
                    No channels were found for this server ID. Please check the ID and try again.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}