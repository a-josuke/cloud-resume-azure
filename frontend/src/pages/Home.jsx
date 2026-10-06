import { useState } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import CardArrow from '../components/CardArrow.jsx'

export default function Home() {
  // Which modal is open: null, 'about', 'projects', 'contact', 'services' or 'credentials'.
  // The modal itself is built in Part B.
  const [modal, setModal] = useState(null)
  const open = (key) => () => setModal(key)

  return (
    <>
      <Header variant="home" onOpen={setModal} />

      <main className="bento-section" id="home">
        <div className="container">
          <div className="bento-grid">

            {/* ROW 1 */}
            <div className="bento-row-1">
              <article className="bento-card hero-card" onClick={open('about')} title="Click to view full bio">
                <div className="hero-avatar-box">
                  <img src="/PP.jpg" alt="Ankit Dahal - Profile" loading="eager" />
                </div>
                <div className="hero-info">
                  <span className="hero-role">Aspiring Cloud Architect</span>
                  <h1 className="hero-name">Ankit<br />Dahal.</h1>
                  <p className="hero-desc">
                    Aspiring Cloud &amp; Azure Solutions Architect &amp; Full Stack Developer based in Kathmandu, Nepal.
                  </p>
                </div>
                <CardArrow />
              </article>

              <div className="bento-col-right">
                <div className="bento-card marquee-card">
                  <div className="marquee-content">
                    <MarqueeText />
                    <MarqueeText hidden />
                  </div>
                </div>

                <div className="row-1-subgrid">
                  <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" className="bento-card credentials-card" title="Click to open CV / Resume (PDF) in new tab">
                    <div className="signature-art">
                      <svg className="signature-svg" viewBox="0 0 220 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 70C35 45 55 20 75 25C95 30 50 85 70 85C85 85 105 40 120 50C135 60 125 75 145 70C165 65 190 35 205 30M95 55C110 55 125 54 140 54" stroke="#f4f4f4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
                        <path d="M125 40L145 35M150 48L170 42" stroke="#f4f4f4" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                      </svg>
                    </div>
                    <div className="card-meta">
                      <span className="card-subtitle">More about me</span>
                      <h2 className="card-title">Credentials</h2>
                    </div>
                    <CardArrow />
                  </a>

                  <article className="bento-card projects-card" onClick={open('projects')} title="Click to view featured projects">
                    <div className="laptop-art">
                      <svg className="laptop-svg" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="25" y="10" width="110" height="66" rx="6" fill="#1e1e1e" stroke="#404040" strokeWidth="1.5" />
                        <rect x="30" y="15" width="100" height="56" rx="3" fill="#0d1117" />
                        <circle cx="37" cy="22" r="2" fill="#ff5f56" />
                        <circle cx="43" cy="22" r="2" fill="#ffbd2e" />
                        <circle cx="49" cy="22" r="2" fill="#27c93f" />
                        <text x="80" y="38" fontFamily="'Inter', sans-serif" fontSize="7.5" fontWeight="700" fill="#ffffff" textAnchor="middle">CLOUD RESUME</text>
                        <rect x="52" y="44" width="56" height="5" rx="2.5" fill="#3c58e3" />
                        <rect x="42" y="53" width="76" height="3" rx="1.5" fill="#30363d" />
                        <rect x="50" y="59" width="60" height="3" rx="1.5" fill="#30363d" />
                        <path d="M10 77C10 76.4477 10.4477 76 11 76H149C149.552 76 150 76.4477 150 77V79C150 81.2091 148.209 83 146 83H14C11.7909 83 10 81.2091 10 79V77Z" fill="#333333" />
                        <path d="M68 76H92V78C92 78.5523 91.5523 79 91 79H69C68.4477 79 68 78.5523 68 78V76Z" fill="#4d4d4d" />
                      </svg>
                    </div>
                    <div className="card-meta">
                      <span className="card-subtitle">Showcase · 4 Featured Works</span>
                      <h2 className="card-title">Projects</h2>
                    </div>
                    <CardArrow />
                  </article>
                </div>
              </div>
            </div>

            {/* ROW 2 */}
            <div className="bento-row-2">
              <a href="https://www.linkedin.com/posts/ankit-dahal28_businessdevelopment-leadgeneration-salesops-share-7509608331070816256-Dh3x/" target="_blank" rel="noopener noreferrer" className="bento-card blog-card" title="Read my latest post on LinkedIn (opens in new tab)">
                <div className="post-art">
                  <svg className="post-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect width="24" height="24" rx="5" fill="#0A66C2" />
                    <path fill="#fff" d="M7.2 9.8H4.6V19h2.6V9.8zM5.9 5.2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM19.4 13.9c0-2.5-1.3-4.3-3.6-4.3-1.2 0-2 .6-2.4 1.2V9.8h-2.6V19h2.6v-5c0-1.3.6-2.1 1.7-2.1s1.6.8 1.6 2.1v5h2.7v-5.1z" />
                  </svg>
                  <div className="post-tags">
                    <span>#BusinessDevelopment</span>
                    <span>#LeadGeneration</span>
                    <span>#SalesOps</span>
                  </div>
                </div>
                <div className="card-meta">
                  <span className="card-subtitle">LinkedIn · Latest post</span>
                  <h2 className="card-title">Lead Gen &amp; Sales Ops</h2>
                </div>
                <CardArrow />
              </a>

              <article className="bento-card services-card" onClick={open('services')} title="Click to view services & specialization">
                <div className="services-icons-row">
                  <div className="service-icon-circle" title="Visual & Web Design">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 19V9C2 7.89543 2.89543 7 4 7H4.5C5.12951 7 5.72229 6.70361 6.1 6.2L8.32 3.24C8.43331 3.08892 8.61115 3 8.8 3H15.2C15.3889 3 15.5667 3.08892 15.68 3.24L17.9 6.2C18.2777 6.70361 18.8705 7 19.5 7H20C21.1046 7 22 7.89543 22 9V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19Z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <div className="service-icon-circle" title="Creative Development">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 21.1679V14L12 7L16 14V21.1679" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 14H16" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="service-icon-circle" title="System Architecture">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="8.5" r="6" />
                      <circle cx="16" cy="15.5" r="6" />
                      <circle cx="8" cy="15.5" r="6" />
                    </svg>
                  </div>
                  <div className="service-icon-circle" title="Full Stack Engineering">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M18 18V21.4C18 21.7314 17.7314 22 17.4 22H6.6C6.26863 22 6 21.7314 6 21.4V18" strokeLinecap="round" />
                      <path d="M18 6V2.6C18 2.26863 17.7314 2 17.4 2H6.6C6.26863 2 6 2.26863 6 2.6V6" strokeLinecap="round" />
                      <path d="M15.5 8.5L19 12L15.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8.5 8.5L5 12L8.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="card-meta">
                  <span className="card-subtitle">Specialization</span>
                  <h2 className="card-title">Services Offering</h2>
                </div>
                <CardArrow />
              </article>

              <article className="bento-card profiles-card" onClick={open('contact')} title="Click to view socials & profiles">
                <div className="profiles-social-box">
                  <a href="https://www.linkedin.com/in/ankit-dahal28/" target="_blank" rel="noopener noreferrer" className="social-circle-btn" title="LinkedIn Profile" onClick={(e) => e.stopPropagation()}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a href="https://github.com/a-josuke?tab=repositories" target="_blank" rel="noopener noreferrer" className="social-circle-btn" title="GitHub Profile" onClick={(e) => e.stopPropagation()}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </a>
                </div>
                <div className="card-meta">
                  <span className="card-subtitle">Stay with me</span>
                  <h2 className="card-title">Profiles</h2>
                </div>
                <CardArrow />
              </article>
            </div>

            {/* ROW 3 */}
            <div className="bento-row-3">
              <article className="bento-card stats-card" onClick={open('credentials')} title="Click to view credentials & experience">
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">02+</span>
                    <span className="stat-label">Years<br />Experience</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">+50</span>
                    <span className="stat-label">Users / Staff<br />Impacted</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">+10</span>
                    <span className="stat-label">Cloud &amp; Web<br />Projects</span>
                  </div>
                </div>
              </article>

              <article className="bento-card cta-card" onClick={open('contact')} title="Click to start a conversation">
                <div className="cta-top">
                  <div className="cta-star-wrap">
                    <div className="cta-star-string"></div>
                    <svg className="cta-star-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                    </svg>
                  </div>
                  <h2 className="cta-heading">
                    Let's <br />work <span className="cta-accent">together.</span>
                  </h2>
                </div>
                <CardArrow />
              </article>
            </div>

          </div>
        </div>
      </main>

      <Footer onOpen={setModal} />

      {/* Part B adds <Modal /> and the lightbox here, driven by the "modal" state. */}
    </>
  )
}

// The scrolling banner text, written once and rendered twice for a seamless loop.
function MarqueeText({ hidden = false }) {
  const sep = <span className="marquee-separator">·</span>
  return (
    <span className="marquee-text" aria-hidden={hidden ? 'true' : undefined}>
      LATEST WORK AND <b>FEATURED</b> {sep}
      CLOUD RESUME CHALLENGE <b>AZURE</b> {sep}
      SOLUTIONS ARCHITECT <b>PORTFOLIO</b> {sep}
      FULL STACK <b>DEVELOPER</b> {sep}
    </span>
  )
}