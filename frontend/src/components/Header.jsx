import { useState } from 'react'
import { Link } from 'react-router-dom'

const NAV_OPEN_CLASS = 'is-active'

export default function Header({ variant = 'home', onOpen = () => {} }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isHome = variant === 'home'
  const closeMenu = () => setMenuOpen(false)

  const openModal = (key) => (e) => {
    e.preventDefault()
    closeMenu()
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
              <a href="#home" className="nav-link active" onClick={closeMenu}>Home</a>
              <a href="#about" className="nav-link" onClick={openModal('about')}>About</a>
              <a href="#works" className="nav-link" onClick={openModal('projects')}>Works</a>
              <a href="#contact" className="nav-link" onClick={openModal('contact')}>Contact</a>
              <Link to="/stats" onClick={closeMenu}>Visitor stats</Link>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
              <Link to="/#about" className="nav-link" onClick={closeMenu}>About</Link>
              <Link to="/#works" className="nav-link" onClick={closeMenu}>Works</Link>
              <Link to="/#contact" className="nav-link" onClick={closeMenu}>Contact</Link>
              <Link to="/stats" className="nav-link active" onClick={closeMenu}>Visitor stats</Link>
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