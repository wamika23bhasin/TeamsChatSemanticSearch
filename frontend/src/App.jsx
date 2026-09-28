import { useState } from 'react';
import { MessageSquare, LayoutList, Download, Settings, Brain, Search, Sparkles, History, CheckCircle, Loader2, X, User } from 'lucide-react';
import './App.css'

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/v1/knowledge/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const openThread = (thread, e) => {
    e.preventDefault();
    setSelectedThread(thread);
  };

  const closeThread = () => {
    setSelectedThread(null);
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Brain className="logo-icon" size={28} />
          <h2>Knowledge Assistant</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <MessageSquare size={20} />
            <span>Ask</span>
          </a>
          <a href="#" className="nav-item">
            <LayoutList size={20} />
            <span>Item 2</span>
          </a>
          <a href="#" className="nav-item">
            <Download size={20} />
            <span>Item 3</span>
          </a>
          <a href="#" className="nav-item">
            <Settings size={20} />
            <span>Item 4</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="search-section">
          <h1 className="search-heading">Ask the knowledge base</h1>
          <p className="search-subheading">Search across historical discussion threads using semantic similarity</p>
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button className="create-button" onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
            </button>
          </div>

          {(hasSearched || results.length > 0) && (
            <>
              <div className="answer-box">
                <div className="answer-box-header">
                  <span className="answer-title">
                    <Sparkles size={20} className="header-icon" />
                    Answer
                  </span>
                  <span className="answer-meta">
                    <History size={14} className="meta-icon" />
                    Answer generated from {results.length} previous discussions
                  </span>
                </div>
                <div className="answer-box-content">
                  {loading ? (
                    <p>Analyzing threads and extracting remedies...</p>
                  ) : results.length > 0 ? (
                    <ul className="remedies-list" style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                      {results.map((result, index) => (
                        <li key={result.id} style={{ marginBottom: '0.5rem' }}>
                          <strong 
                            onClick={(e) => openThread(result, e)}
                            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                            title={`View Thread ${index + 1}`}
                          >
                            Source {index + 1}:
                          </strong> {result.resolution || 'No explicit resolution documented.'}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No highly similar threads were found to confidently extract remedies.</p>
                  )}
                </div>
                <div className="answer-box-footer">
                  <span className="sources-label">Sources:</span>
                  <div className="sources-list">
                    {results.map((result, i) => (
                      <span 
                        key={i} 
                        className="source-badge"
                        onClick={(e) => openThread(result, e)}
                        style={{ cursor: 'pointer' }}
                        title={`View Thread ${i + 1}`}
                      >
                        {i + 1}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <hr className="divider" />

              <div className="related-section">
                <h2 className="related-heading">Related conversations</h2>
                <p className="related-subheading">Previous discussion threads that are semantically similar to your question</p>
                
                <div className="related-cards-container">
                  {loading ? (
                    <p>Loading similar threads...</p>
                  ) : results.length > 0 ? (
                    results.map((result, index) => (
                      <div className="related-card" key={result.id} id={`source-card-${index + 1}`}>
                        <div className="related-card-header">
                          <div className="related-card-title-container">
                            <h3>{result.question}</h3>
                            <span className="related-card-date">
                              Match: {Math.round(result.similarity * 100)}%
                            </span>
                          </div>
                        </div>
                        <p className="related-card-desc">{result.resolution || 'No resolution provided for this thread.'}</p>
                        <hr className="card-divider" />
                        <div className="card-footer">
                          <span className="replies-count">Source {index + 1}</span>
                          <a 
                            href="#"
                            onClick={(e) => openThread(result, e)} 
                            className="view-source-btn"
                          >
                            View source
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No related conversations found.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Teams-like Modal */}
      {selectedThread && (
        <div className="modal-overlay" onClick={closeThread}>
          <div className="modal-content teams-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-info">
                <h3>Thread Discussion</h3>
                <span className="modal-date">
                  {selectedThread.source_updated_at ? new Date(selectedThread.source_updated_at).toLocaleDateString() : 'Unknown Date'}
                </span>
              </div>
              <button className="close-btn" onClick={closeThread}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              {/* Original Question */}
              <div className="chat-message question-message">
                <div className="chat-avatar"><User size={20} /></div>
                <div className="chat-content">
                  <div className="chat-meta">
                    <span className="chat-author">Original Poster</span>
                    <span className="chat-time">
                      {selectedThread.source_updated_at ? new Date(selectedThread.source_updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </span>
                  </div>
                  <div className="chat-bubble">
                    <p><strong>{selectedThread.question}</strong></p>
                  </div>
                </div>
              </div>
              
              <div className="chat-divider">
                <span>Replies</span>
              </div>

              {/* Replies */}
              {selectedThread.messages && selectedThread.messages.length > 0 ? (
                selectedThread.messages.map((msg) => (
                  <div className="chat-message reply-message" key={msg.id}>
                    <div className="chat-avatar"><User size={20} /></div>
                    <div className="chat-content">
                      <div className="chat-meta">
                        <span className="chat-author">{msg.author || 'Unknown User'}</span>
                        <span className="chat-time">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() + ' ' + new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </span>
                      </div>
                      <div className="chat-bubble">
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-replies">No replies found for this thread.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
