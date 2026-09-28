import { MessageSquare, LayoutList, Download, Settings, Brain, Search, Sparkles, History, CheckCircle } from 'lucide-react';
import './App.css'

function App() {
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
              />
            </div>
            <button className="create-button">Create</button>
          </div>

          <div className="answer-box">
            <div className="answer-box-header">
              <span className="answer-title">
                <Sparkles size={20} className="header-icon" />
                Answer
              </span>
              <span className="answer-meta">
                <History size={14} className="meta-icon" />
                Answer generated from 3 previous discussions
              </span>
            </div>
            <div className="answer-box-content">
              <p>This is a dummy text representing the generated answer. The system analyzed previous threads and compiled this response to demonstrate how the UI will present the synthesized knowledge to the user.</p>
            </div>
            <div className="answer-box-footer">
              <span className="sources-label">Sources:</span>
              <div className="sources-list">
                <span className="source-badge">1</span>
                <span className="source-badge">2</span>
                <span className="source-badge">3</span>
              </div>
            </div>
          </div>

          <hr className="divider" />

          <div className="related-section">
            <h2 className="related-heading">Related conversations</h2>
            <p className="related-subheading">Previous discussion threads that are semantically similar to your question</p>
            
            <div className="related-cards-container">
              {/* Box 1 */}
              <div className="related-card">
                <div className="related-card-header">
                  <div className="related-card-title-container">
                    <h3>How to deploy the application to AWS?</h3>
                    <span className="related-card-date">Oct 12, 2025</span>
                  </div>
                  <div className="resolved-badge">
                    Mark as resolved <CheckCircle size={16} />
                  </div>
                </div>
                <p className="related-card-desc">This thread discusses the step-by-step process of setting up Docker containers and deploying the backend to AWS ECS. It also covers load balancing setup.</p>
                <hr className="card-divider" />
                <div className="card-footer">
                  <span className="replies-count">7 replies</span>
                  <button className="view-source-btn">View source</button>
                </div>
              </div>

              {/* Box 2 */}
              <div className="related-card">
                <div className="related-card-header">
                  <div className="related-card-title-container">
                    <h3>Database migration issues on production</h3>
                    <span className="related-card-date">Sep 04, 2025</span>
                  </div>
                  <div className="resolved-badge">
                    Mark as resolved <CheckCircle size={16} />
                  </div>
                </div>
                <p className="related-card-desc">A detailed debugging session resolving timeout issues during PostgreSQL migrations. Includes the specific SQL scripts and timeout configurations used to fix it.</p>
                <hr className="card-divider" />
                <div className="card-footer">
                  <span className="replies-count">8 replies</span>
                  <button className="view-source-btn">View source</button>
                </div>
              </div>

              {/* Box 3 */}
              <div className="related-card">
                <div className="related-card-header">
                  <div className="related-card-title-container">
                    <h3>Implementing SSO with Entra ID</h3>
                    <span className="related-card-date">Aug 21, 2025</span>
                  </div>
                  <div className="resolved-badge">
                    Mark as resolved <CheckCircle size={16} />
                  </div>
                </div>
                <p className="related-card-desc">Contains the exact MSAL configuration needed for Single Sign-On integration, along with troubleshooting steps for invalid redirect URIs and token validation errors.</p>
                <hr className="card-divider" />
                <div className="card-footer">
                  <span className="replies-count">10 replies</span>
                  <button className="view-source-btn">View source</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
