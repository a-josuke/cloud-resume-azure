import { Link } from 'react-router-dom'

export default function Footer({ onOpen, visitors }) {
  const isHome = typeof onOpen === 'function'

  const openModal = (key) => (e) => {
    e.preventDefault()
    onOpen(key)
  }

  const links = [
    ['Home', '#home', null],
    ['About', '#about', 'about'],
    ['Works', '#works', 'projects'],
    ['Contact', '#contact', 'contact'],
  ]

  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <Link to="/" className="footer-logo">Ankit<span>.</span></Link>

        <nav className="footer-nav">
          {links.map(([label, hash, key]) =>
            isHome ? (
              <a key={label} href={hash} className="footer-link" onClick={key ? openModal(key) : undefined}>
                {label}
              </a>
            ) : (
              <Link key={label} to={label === 'Home' ? '/' : `/${hash}`} className="footer-link">{label}</Link>
            ),
          )}
          <Link to="/stats" className="footer-link">Visitor stats</Link>
        </nav>

        <div className="footer-bottom">
          <p className="copyright">
            © All rights reserved by <span>Ankit Dahal</span> · Built on Microsoft Azure
          </p>
          <div className="azure-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.05 4.24l-3.3 5.76-4.5 7.82h5.5l2.3-4.04zM13.8 4.24l2.7 4.7 4.25 7.4h-5.25l-1.7-2.96zM1.75 17.82h5.5l2.25-3.92-2.75-4.8z" />
            </svg>
            <span>Cloud Resume Challenge · Microsoft Azure</span>
            {visitors !== undefined && <span>Visitors: <span id="visitor-count">{visitors}</span></span>}
          </div>
        </div>
      </div>
    </footer>
  )
}