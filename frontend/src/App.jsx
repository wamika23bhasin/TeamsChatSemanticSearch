import { useState, useEffect } from 'react';
import { MessageSquare, LayoutList, Download, Settings, Brain, Search, Sparkles, History, CheckCircle, Loader2, X, User, AlertCircle } from 'lucide-react';
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('Ask');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  
  const [allThreads, setAllThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'Threads' && allThreads.length === 0) {
      loadAllThreads();
    }
  }, [activeTab]);

  const loadAllThreads = async () => {
    setThreadsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/v1/knowledge/threads');
      const data = await response.json();
      setAllThreads(data.threads || []);
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setThreadsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/v1/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          <a href="#" className={`nav-item ${activeTab === 'Ask' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Ask'); }}>
            <MessageSquare size={20} />
            <span>Ask</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'Threads' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Threads'); }}>
            <LayoutList size={20} />
            <span>Threads</span>
          </a>
          <a href="#" className="nav-item">
            <Download size={20} />
            <span>Import</span>
          </a>
          <a href="#" className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'Ask' && (
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

            {hasSearched && (
              <>
                {loading || results.length > 0 ? (
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
                      ) : (
                        <ul className="remedies-list" style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                          {results.map((result, index) => (
                            <li key={result.id} style={{ marginBottom: '0.5rem' }}>
                              <span style={{ float: 'right', fontWeight: '600', color: '#6b7280', marginLeft: '12px', fontSize: '12px', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '12px' }}>
                                {Math.round(result.similarity * 100)}% Match
                              </span>
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
                ) : (
                  <div className="no-results-message" style={{ marginTop: '30px', padding: '24px', backgroundColor: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', color: '#991b1b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 style={{ margin: '0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                      <AlertCircle size={20} />
                      No Relevant Matches Found
                    </h3>
                    <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.5', paddingLeft: '28px' }}>
                      We couldn't find any discussion threads in the knowledge base that confidently match your query. Try rephrasing your question or using broader technical terms.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* THREADS TAB VIEW */}
        {activeTab === 'Threads' && (
          <div className="threads-section">
            <h1 className="search-heading">All Discussion Threads</h1>
            <p className="search-subheading">Chronological history of all documented discussions</p>
            
            {threadsLoading ? (
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px'}}>
                <Loader2 className="animate-spin" size={24} /> Loading all chats...
              </div>
            ) : (
              <div className="all-threads-list" style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                {allThreads.map((thread) => (
                  <div key={thread.id} className="teams-modal" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e1dfdd' }}>
                    <div className="modal-header">
                      <div className="modal-header-info">
                        <h3>{thread.channel_name || 'Discussion'}</h3>
                        <span className="modal-date">
                          {thread.source_updated_at ? new Date(thread.source_updated_at).toLocaleDateString() : 'Unknown Date'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="modal-body" style={{ maxHeight: '500px' }}>
                      {/* Original Question */}
                      <div className="chat-message question-message">
                        <div className="chat-avatar"><User size={20} /></div>
                        <div className="chat-content">
                          <div className="chat-meta">
                            <span className="chat-author">Original Poster</span>
                            <span className="chat-time">
                              {thread.source_updated_at ? new Date(thread.source_updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                            </span>
                          </div>
                          <div className="chat-bubble">
                            <p><strong>{thread.question}</strong></p>
                          </div>
                        </div>
                      </div>
                      {/* Replies */}
                      {thread.messages && thread.messages.length > 0 ? (
                        <div className="replies-container">
                          {[...thread.messages]
                            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                            .map((msg) => (
                            <div className="chat-message reply-message" key={msg.id}>
                              <div className="chat-avatar"><User size={16} /></div>
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
                          ))}
                        </div>
                      ) : (
                        <p className="no-replies">No replies found for this thread.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Teams-like Modal (only shown in Ask view when a source is clicked) */}
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
              
              {/* Replies */}
              {selectedThread.messages && selectedThread.messages.length > 0 ? (
                <div className="replies-container">
                  {[...selectedThread.messages]
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                    .map((msg) => (
                    <div className="chat-message reply-message" key={msg.id}>
                      <div className="chat-avatar"><User size={16} /></div>
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
                  ))}
                </div>
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
