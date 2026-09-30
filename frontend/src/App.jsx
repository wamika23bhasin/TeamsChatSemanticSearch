import { useState, useEffect } from 'react';
import { MessageSquare, LayoutList, Download, Settings, Brain, Search, Sparkles, History, CheckCircle, Loader2, X, User, AlertCircle, Lightbulb } from 'lucide-react';
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('Ask');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);

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
      setAnswer(data.answer || "");
      setSources(data.sources || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setAnswer("");
      setSources([]);
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
                {loading ? (
                  <div style={{ marginTop: '40px', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#6b7280' }}>
                    <Loader2 className="animate-spin" size={24} />
                    <span style={{ fontSize: '15px', fontWeight: '500' }}>Analyzing threads and generating answer...</span>
                  </div>
                ) : results.length > 0 ? (
                  <>
                  <div className="answer-box">
                    <div className="answer-box-header" style={{ justifyContent: 'flex-start', gap: '12px', alignItems: 'center' }}>
                      <span className="answer-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 'bold' }}>
                        <Lightbulb size={20} className="header-icon" style={{ color: '#0066cc' }} />
                        Suggested Answer
                      </span>
                      <span className="answer-meta" style={{ fontSize: '11px', color: '#4b5563', fontWeight: '500', backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        Generated from previous conversations
                      </span>
                    </div>
                    <div className="answer-box-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      <p style={{ margin: 0 }}>{answer}</p>
                    </div>
                    <div className="answer-box-footer" style={{ justifyContent: 'space-between' }}>
                      {/* <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="sources-label">Sources:</span>
                        <div className="sources-list">
                          {sources.map((source, i) => {
                            if (source.source_url) {
                              return (
                                <a 
                                  key={i} 
                                  href={source.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="source-badge"
                                  style={{ cursor: 'pointer', textDecoration: 'none' }}
                                  title={`View Thread ${i + 1}`}
                                >
                                  {i + 1}
                                </a>
                              );
                            }
                            return (
                              <span 
                                key={i} 
                                className="source-badge"
                                onClick={(e) => openThread(source, e)}
                                style={{ cursor: 'pointer' }}
                                title={`View Thread ${i + 1}`}
                              >
                                {i + 1}
                              </span>
                            );
                          })}
                        </div>
                      </div> */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b7280', backgroundColor: '#f9fafb', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                        <AlertCircle size={12} />
                        AI-generated answer - verify against source conversations
                      </div>
                    </div>
                  </div>
                  
                  <hr className="divider" />
                  
                  <div className="related-section">
                    <h2 className="related-heading">Related conversations</h2>
                    <p className="related-subheading">More discussions from your team that might help</p>
                    
                    <div className="related-cards-container">
                      {results.map((result, index) => (
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
                      ))}
                    </div>
                  </div>
                  </>
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
