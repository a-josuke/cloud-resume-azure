import { useState } from 'react'
import { Link } from 'react-router-dom'

// Open your OLD script.js, find the line that toggles the mobile menu
// (search it for "mobileToggle") and copy the class name it adds to the nav.
// Put that class name here:
const NAV_OPEN_CLASS = 'open'

export default function Header({ variant = 'home', onOpen = () => {} }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isHome = variant === 'home'

  const openModal = (key) => (e) => {
    e.preventDefault()
    setMenuOpen(false)
    onOpen(key)
  }

  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="logo">
          Ankit<span>.</span>
          <span className="logo-tag">{isHome ? 'Portfolio' : 'Stats'}</span>
        </Link>

        <nav className={`main-nav ${menuOpen ? NAV_OPEN_CLASS : ''}`} id="mainNav">
          {isHome ? (
            <>
              <a href="#home" className="nav-link active">Home</a>
              <a href="#about" className="nav-link" onClick={openModal('about')}>About</a>
              <a href="#works" className="nav-link" onClick={openModal('projects')}>Works</a>
              <a href="#contact" className="nav-link" onClick={openModal('contact')}>Contact</a>
              <Link to="/stats">Visitor stats</Link>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/" className="nav-link">About</Link>
              <Link to="/" className="nav-link">Works</Link>
              <Link to="/" className="nav-link">Contact</Link>
              <Link to="/stats" className="nav-link active">Visitor stats</Link>
            </>
          )}
        </nav>

        <div className="header-actions">
          {isHome ? (
            <button className="btn-talk" id="talkBtn" onClick={() => onOpen('contact')}>
              Let's talk
            </button>
          ) : (
            <Link className="btn-talk" to="/">&larr; Back to resume</Link>
          )}
          <button
            className="mobile-toggle"
            id="mobileToggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}