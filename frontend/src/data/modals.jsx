/* eslint-disable react-refresh/only-export-components -- data file: exports the MODALS map next to its body components */

import { useEffect, useState } from 'react'

const EMAIL = 'dahal.ankit7@gmail.com'

/* ---------- small shared pieces ---------- */

function TimelineItem({ role, company, date, bullets, bulletsStyle, children }) {
  return (
    <div className="modal-timeline-item">
      <div className="timeline-role">{role}</div>
      <div className="timeline-company">{company}</div>
      {date && <div className="timeline-date">{date}</div>}
      {bullets && (
        <ul className="timeline-bullets" style={bulletsStyle}>
          {bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
      {children}
    </div>
  )
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
  )
}

const grey = { color: '#9f9f9f', fontSize: '13.5px', marginTop: '6px' }

/* ---------- About ---------- */

function AboutBody() {
  return (
    <>
      <p style={{ marginBottom: '18px', fontSize: '15.5px', color: '#e5e5e5', lineHeight: 1.65 }}>
        I am an aspiring <strong>Cloud / Azure Solutions Architect</strong> and <strong>Full Stack Developer</strong> based in
        Kathmandu, Nepal. Passionate about designing resilient, highly available cloud infrastructures and building performant
        web applications that solve real-world problems.
      </p>
      <TimelineItem
        role="Current Focus & Aspirations"
        company="Cloud Architecture & Azure Solutions"
        date="2025 – Present"
        bullets={[
          'Designing scalable, cost-efficient cloud workloads on Microsoft Azure.',
          'Mastering Infrastructure as Code (IaC), serverless architectures, and CI/CD automation.',
          'Implementing end-to-end cloud projects including the Cloud Resume Challenge with Azure Storage, CDN, and CosmosDB.',
        ]}
      />
      <TimelineItem
        role="Location & Availability"
        company="Kathmandu, Nepal (Open to Remote / Hybrid Worldwide)"
        date="Ready for Solutions Architect & Developer roles"
      />
    </>
  )
}

/* ---------- Credentials ---------- */

function CredentialsBody() {
  return (
    <>
      <h4 style={{ color: '#fff', fontSize: '18px', marginBottom: '14px' }}>Work Experience</h4>

      <TimelineItem
        role="Full Stack Web Developer (Remote)"
        company="Azigau Environmental Engineering Ltd. · Port Moresby, PNG"
        date="Jan 2025 – Present"
        bullets={[
          'Architected and built the corporate web platform (azigau.com) showcasing forestry engineering & environmental initiatives.',
          'Engineered an ERMS (Employee Relationship Management System) dashboard to track essential KPIs and engagement for 50+ enterprise personnel.',
          'Created secure web applications for cross-government collaboration on high-level forestry logging policies.',
          'Initiated and executed digital marketing campaigns and technical SEO optimization driving high organic visibility.',
        ]}
      />
      <TimelineItem
        role="Lead Frontend Developer & SEO/Analytics"
        company="PNG Diwai Holdings Limited · Port Moresby, PNG"
        date="2024 – 2025"
        bullets={[
          'Took over frontend development from the previous team, refactoring legacy architecture into a sleek, responsive portal (pngdhl.com.pg).',
          'Showcased the National Reforestation and Afforestation Programme (NRAP 2025–2030) and Regional Forest Industrial Parks.',
          'Integrated Google Analytics 4 (GA4), structured meta schemas, and performance tuning for international stakeholders.',
        ]}
      />
      <TimelineItem
        role="WordPress Developer & Graphics Designer"
        company="Shangrila Hospitality LLC · Glenview, Illinois, USA"
        date="2024 – 2025"
        bullets={[
          'Designed and launched the comprehensive online dining website for The Clove Indian & Nepali Cuisine (thecloveglenview.com).',
          'Engineered interactive dining/bar menus, integrated online takeout & delivery ordering, and reservation systems.',
          'Crafted marketing branding collateral, social graphics, and digital media assets.',
        ]}
      />

      <h4 style={{ color: '#fff', fontSize: '18px', margin: '24px 0 14px 0' }}>Education & Certifications</h4>
      <TimelineItem
        role="B.Sc (HONS) Computing (Software Engineering)"
        company="University of Northampton, United Kingdom"
        date="Graduated 2023 / 2024"
      >
        <p style={grey}>
          Focused on software engineering principles, distributed systems, database design, and cloud methodologies.
        </p>
      </TimelineItem>
      <TimelineItem
        role="AZ-900: Microsoft Azure Fundamentals"
        company="Microsoft Certified"
        date="In Progress / Certification Track"
      >
        <p style={grey}>
          Core Azure services, cloud concepts, security, privacy, compliance, and Azure pricing/support.
        </p>
      </TimelineItem>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a
          href="/cv.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '9999px',
            color: '#fff',
            fontSize: '13.5px',
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
        >
          📄 View / Download Full CV (PDF) ↗
        </a>
      </div>
    </>
  )
}

/* ---------- Projects ---------- */

const FILTERS = [
  { key: 'all', label: 'All Projects (4)' },
  { key: 'cloud', label: 'Cloud & Azure' },
  { key: 'web', label: 'Full Stack & Web' },
  { key: 'wordpress', label: 'WordPress & CMS' },
]

const PROJECTS = [
  {
    id: 'clove',
    category: 'web wordpress',
    hero: {
      src: '/theclove.png',
      caption: 'The Clove Indian & Nepali Cuisine — Glenview, Illinois',
      title: 'Click to view full image mockup',
    },
    tag: 'WordPress · Elementor Pro',
    status: { label: 'Live Website', kind: 'live' },
    title: 'The Clove — Indian & Nepali Cuisine',
    client: 'Shangrila Hospitality LLC · Glenview, Illinois, USA',
    desc: 'Designed, built, and launched the full digital presence and online restaurant platform for an upscale Indian and Nepali dining destination in the Chicago metropolitan area.',
    bullets: [
      <>Engineered a custom WordPress theme using <strong>Elementor Pro</strong> with a modern dark dining aesthetic matching the in-restaurant ambiance.</>,
      <>Integrated <strong>live online ordering</strong> pipelines, interactive food & cocktail menus, and catering/private event inquiry systems.</>,
      'Optimized local SEO, mobile touch responsiveness, and image caching resulting in rapid page loads and high customer conversion.',
    ],
    tech: ['WordPress', 'Elementor Pro', 'Online Ordering', 'Menu Architecture', 'Local SEO', 'Mobile Responsive', 'Figma'],
    link: { label: 'Visit Live Website', href: 'https://thecloveglenview.com/' },
    buttons: [
      { label: '🔍 View Mockup', src: '/theclove.png', caption: 'The Clove Restaurant — Glenview, IL Showcase Mockup' },
      { label: '🖥️ Live Screenshot', src: '/theclove-live.png', caption: 'The Clove Restaurant — Live Homepage Screenshot' },
    ],
  },
  {
    id: 'azigau',
    category: 'web',
    hero: {
      src: '/azigau.png',
      caption: 'Azigau Environmental Engineering Ltd. — Corporate Web Platform & Systems',
      title: 'Click to view full image mockup',
    },
    tag: 'Full Stack · Bootstrap · ERMS',
    status: { label: 'Domain Renewal in Progress', kind: 'pending' },
    title: 'A.E.E.L — Azigau Environmental Engineering',
    client: 'Azigau Environmental Engineering Ltd. · Port Moresby, PNG',
    desc: 'Corporate engineering web platform and internal enterprise dashboard systems developed for an environmental engineering, procurement, and technical staffing firm.',
    bullets: [
      <>Architected the corporate web platform utilizing <strong>Bootstrap</strong>, modern <strong>JavaScript (ES6+)</strong>, and custom <strong>Figma</strong> UI design system.</>,
      <>Engineered a custom <strong>ERMS (Employee Relationship Management System)</strong> analytics dashboard monitoring retention rates and essential KPIs for 50+ enterprise personnel.</>,
      'Created secure inter-agency collaboration modules for cross-governmental forestry policy and compliance workflows.',
      'Authored photography showcases and company portfolios reflecting real on-site engineering projects.',
    ],
    tech: ['Bootstrap 5', 'JavaScript (ES6+)', 'Figma Design', 'ERMS Dashboard', 'Enterprise Portal', 'Technical SEO'],
    link: { label: 'Visit azigau.com', href: 'https://azigau.com/' },
    buttons: [
      { label: '🔍 View Site Mockup', src: '/azigau.png', caption: 'A.E.E.L — Azigau Environmental Engineering Website Showcase' },
    ],
    note: '⏳ Domain fee renewal pending with registrar (Live shortly)',
  },
  {
    id: 'pngdhl',
    category: 'web',
    hero: {
      src: '/pngdhl.png',
      caption: 'PNG Diwai Holdings Limited — Sustainable Forestry Portal',
      title: 'Click to view full image screenshot',
    },
    tag: 'Lead Frontend Takeover · SEO & Analytics',
    status: { label: 'Live Production Portal', kind: 'live' },
    title: 'PNG Diwai Holdings Limited (PNGDHL)',
    client: 'A Government of PNG Undertaking · Port Moresby, Papua New Guinea',
    desc: "Essentially created and took over frontend development and digital architecture from the previous frontend team for Papua New Guinea's governmental undertaking in sustainable forestry management and timber exports.",
    bullets: [
      'Took over and modernized legacy codebase into a responsive, high-performance web experience for national and international audiences.',
      <>Showcased the <strong>National Reforestation and Afforestation Programme (NRAP 2025–2030)</strong>, Regional Forest Industrial Parks, and public galleries.</>,
      <>Implemented <strong>Google Analytics (GA4)</strong> tracking infrastructure, SEO keyword hierarchy, and fast Core Web Vitals.</>,
    ],
    tech: ['Lead Frontend', 'Bootstrap', 'HTML5 & CSS3', 'JavaScript / jQuery', 'Google Analytics 4', 'Gov Platform'],
    link: { label: 'Visit Live Portal', href: 'https://www.pngdhl.com.pg/' },
    buttons: [
      { label: '🖥️ View Live Screenshot', src: '/pngdhl.png', caption: 'PNG Diwai Holdings Limited — Official Production Homepage' },
      { label: '🖼️ Official Ceremony Banner', src: '/pngdhl-banner.webp', caption: 'PNG Diwai Holdings Limited — Official Launching Ceremony Banner' },
    ],
  },
  {
    id: 'crc',
    category: 'cloud',
    hero: {
      src: '/cloud-resume.jpg',
      caption: 'Cloud Resume Challenge — Serverless Architecture on Microsoft Azure',
      title: 'Click to view full architecture diagram',
    },
    tag: 'Microsoft Azure · Serverless · CI/CD',
    status: { label: 'Active Azure Workload', kind: 'live' },
    title: 'Cloud Resume Challenge (Azure Architecture)',
    client: 'Self-Engineered Cloud Architecture · Microsoft Azure',
    desc: 'Production-grade serverless cloud infrastructure built for the Cloud Resume Challenge, demonstrating enterprise-grade resilience, edge caching, and automated CI/CD pipelines.',
    bullets: [
      <>Deployed static Bento-grid resume on <strong>Azure Blob Storage</strong> enabled with static website hosting.</>,
      <>Configured <strong>Azure CDN</strong> for worldwide edge caching, custom domain SSL/TLS certificate, and HTTPS enforcement.</>,
      <>Created a serverless visitor counter utilizing an <strong>Azure Function (Python)</strong> connected to an <strong>Azure Cosmos DB</strong> NoSQL database.</>,
      <>Automated infrastructure deployments, automated testing, and code synchronization using <strong>GitHub Actions CI/CD</strong> workflow.</>,
    ],
    tech: ['Microsoft Azure', 'Azure Blob Storage', 'Azure CDN', 'Azure Functions', 'Cosmos DB', 'GitHub Actions', 'Python API'],
    link: { label: 'GitHub Repository', href: 'https://github.com/a-josuke?tab=repositories' },
    buttons: [
      { label: '🔍 Architecture Diagram', src: '/cloud-resume.jpg', caption: 'Cloud Resume Challenge — Serverless Azure Architecture Diagram' },
    ],
  },
]

function ProjectBox({ project: p, openLightbox }) {
  return (
    <article className="project-box" data-category={p.category}>
      <div className="project-box-hero" title={p.hero.title} onClick={() => openLightbox(p.hero.src, p.hero.caption)}>
        <div className="project-box-hero-bg" style={{ backgroundImage: `url('${p.hero.src}')` }}></div>
        <div className="project-box-hero-overlay"></div>
        <div className="project-box-hero-inner">
          <div className="project-box-badges">
            <span className="project-pill-tag featured">{p.tag}</span>
            <span className={`project-status-pill ${p.status.kind}`}>{p.status.label}</span>
          </div>
          <div className="project-box-hero-title-wrap">
            <h3 className="project-box-title">{p.title}</h3>
            <span className="project-box-client">{p.client}</span>
          </div>
        </div>
      </div>
      <div className="project-box-body">
        <p className="project-box-desc">{p.desc}</p>
        <ul className="project-bullets">
          {p.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
        <div className="project-tech-tags">
          {p.tech.map((t) => <span className="project-tech-tag" key={t}>{t}</span>)}
        </div>
        <div className="project-box-footer">
          <div className="project-footer-actions">
            <a href={p.link.href} target="_blank" rel="noopener noreferrer" className="btn-project-primary">
              <span>{p.link.label}</span>
              <ExternalIcon />
            </a>
            {p.buttons.map((b) => (
              <button key={b.label} type="button" className="btn-project-secondary" onClick={() => openLightbox(b.src, b.caption)}>
                <span>{b.label}</span>
              </button>
            ))}
          </div>
          {p.note && <span className="project-note-badge">{p.note}</span>}
        </div>
      </div>
    </article>
  )
}

function ProjectsBody({ openLightbox }) {
  const [filter, setFilter] = useState('all')
  const shown = PROJECTS.filter((p) => filter === 'all' || p.category.includes(filter))

  return (
    <>
      <div className="project-filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`btn-filter${filter === f.key ? ' is-active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {shown.map((p) => <ProjectBox key={p.id} project={p} openLightbox={openLightbox} />)}
    </>
  )
}

/* ---------- Services ---------- */

function ServicesBody() {
  const tight = { marginTop: '8px' }
  return (
    <>
      <p style={{ marginBottom: '20px', fontSize: '14.5px', color: '#b5b5b5' }}>
        Bridging the gap between reliable cloud infrastructure and intuitive frontend user experiences.
      </p>
      <TimelineItem
        role="☁️ Cloud & Azure Infrastructure"
        company="Solutions Architecture & Deployment"
        bulletsStyle={tight}
        bullets={[
          'Static web hosting, Azure Storage Accounts & Blob containers.',
          'Azure CDN configuration, SSL/TLS certificates & DNS management.',
          'Serverless Azure Functions & API integration.',
          'Resource Group lifecycle & Azure Cost Management.',
        ]}
      />
      <TimelineItem
        role="💻 Full Stack & Frontend Engineering"
        company="Modern Web Development"
        bulletsStyle={tight}
        bullets={[
          'Single Page Applications (SPA) with React.js.',
          'Tailwind CSS, Bootstrap, and pixel-perfect vanilla CSS design systems.',
          'Bento Grid layouts, responsive UI/UX, and accessibility compliance.',
        ]}
      />
      <TimelineItem
        role="⚡ WordPress & Managed Hosting"
        company="CMS & Platform Optimization"
        bulletsStyle={tight}
        bullets={[
          'Custom WordPress theme development & Elementor kit customization.',
          'Managed hosting setup, caching layers & security hardening.',
          'Technical SEO audits and Core Web Vitals performance tuning.',
        ]}
      />
    </>
  )
}

/* ---------- Contact ---------- */

function ContactBody() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const t = setTimeout(() => setCopied(false), 2500)
    return () => clearTimeout(t)
  }, [copied])

  const copy = () => {
    navigator.clipboard.writeText(EMAIL).then(() => setCopied(true))
  }

  return (
    <>
      <p style={{ marginBottom: '16px', fontSize: '15px', color: '#cfcfcf' }}>
        Whether you're looking to discuss cloud infrastructure, hire a full stack engineer, or build your next project — my
        inbox is always open!
      </p>
      <div className="contact-grid">
        <div className="contact-card">
          <span className="contact-label">Direct Email</span>
          <a href={`mailto:${EMAIL}`} className="contact-value">{EMAIL}</a>
          <span
            className="btn-copy"
            id="copyEmailBtn"
            role="button"
            tabIndex={0}
            onClick={copy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') copy()
            }}
          >
            {copied ? '✅ Copied to clipboard!' : '📋 Copy email address'}
          </span>
        </div>
        <div className="contact-card">
          <span className="contact-label">LinkedIn</span>
          <a href="https://www.linkedin.com/in/ankit-dahal28/" target="_blank" rel="noopener noreferrer" className="contact-value">
            in/ankit-dahal28 ↗
          </a>
        </div>
        <div className="contact-card">
          <span className="contact-label">Location</span>
          <span className="contact-value">Kathmandu, Nepal</span>
        </div>
        <div className="contact-card">
          <span className="contact-label">GitHub</span>
          <a href="https://github.com/a-josuke?tab=repositories" target="_blank" rel="noopener noreferrer" className="contact-value">
            github.com/a-josuke ↗
          </a>
        </div>
      </div>
    </>
  )
}

/* ---------- the lookup table used by Modal.jsx ---------- */

export const MODALS = {
  about: { subtitle: 'More About Me', title: 'Ankit Dahal', Body: AboutBody },
  credentials: { subtitle: 'Experience & Education', title: 'Credentials', Body: CredentialsBody },
  projects: { subtitle: 'Showcase & Portfolio', title: 'Featured Projects', Body: ProjectsBody },
  services: { subtitle: 'Specialization & Capabilities', title: 'Services Offering', Body: ServicesBody },
  contact: { subtitle: "Let's Connect", title: 'Get in Touch', Body: ContactBody },
}