/* ==========================================================================
   GRIDLY / BENTO PORTFOLIO - JAVASCRIPT
   Interactive Modals, Smooth Navigation & Cloud Resume Challenge Counter
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Mobile Menu Toggle ---
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('is-active');
    });

    // Close menu when clicking any nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-active');
      });
    });
  }

  // --- 2. Interactive Modals Management ---
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalContainer = document.getElementById('modalContainer');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalBody = document.getElementById('modalBody');

  // Modal Content Templates
  const modalData = {
    about: {
      subtitle: "More About Me",
      title: "Ankit Dahal",
      content: `
        <p style="margin-bottom: 18px; font-size: 15.5px; color: #e5e5e5; line-height: 1.65;">
          I am an aspiring <strong>Cloud / Azure Solutions Architect</strong> and <strong>Full Stack Developer</strong> based in Kathmandu, Nepal. Passionate about designing resilient, highly available cloud infrastructures and building performant web applications that solve real-world problems.
        </p>
        <div class="modal-timeline-item">
          <div class="timeline-role">Current Focus & Aspirations</div>
          <div class="timeline-company">Cloud Architecture & Azure Solutions</div>
          <div class="timeline-date">2025 – Present</div>
          <ul class="timeline-bullets">
            <li>Designing scalable, cost-efficient cloud workloads on Microsoft Azure.</li>
            <li>Mastering Infrastructure as Code (IaC), serverless architectures, and CI/CD automation.</li>
            <li>Implementing end-to-end cloud projects including the Cloud Resume Challenge with Azure Storage, CDN, and CosmosDB.</li>
          </ul>
        </div>
        <div class="modal-timeline-item">
          <div class="timeline-role">Location & Availability</div>
          <div class="timeline-company">Kathmandu, Nepal (Open to Remote / Hybrid Worldwide)</div>
          <div class="timeline-date">Ready for Solutions Architect & Developer roles</div>
        </div>
      `
    },
    credentials: {
      subtitle: "Experience & Education",
      title: "Credentials",
      content: `
        <h4 style="color: #fff; font-size: 18px; margin-bottom: 14px;">Work Experience</h4>
        
        <div class="modal-timeline-item">
          <div class="timeline-role">Full Stack Web Developer (Remote)</div>
          <div class="timeline-company">Azigau Environmental Engineering Ltd. · Port Moresby, PNG</div>
          <div class="timeline-date">Jan 2025 – Present</div>
          <ul class="timeline-bullets">
            <li>Architected and built the corporate web platform (azigau.com) showcasing forestry engineering &amp; environmental initiatives.</li>
            <li>Engineered an ERMS (Employee Relationship Management System) dashboard to track essential KPIs and engagement for 50+ enterprise personnel.</li>
            <li>Created secure web applications for cross-government collaboration on high-level forestry logging policies.</li>
            <li>Initiated and executed digital marketing campaigns and technical SEO optimization driving high organic visibility.</li>
          </ul>
        </div>

        <div class="modal-timeline-item">
          <div class="timeline-role">Lead Frontend Developer &amp; SEO/Analytics</div>
          <div class="timeline-company">PNG Diwai Holdings Limited · Port Moresby, PNG</div>
          <div class="timeline-date">2024 – 2025</div>
          <ul class="timeline-bullets">
            <li>Took over frontend development from the previous team, refactoring legacy architecture into a sleek, responsive portal (pngdhl.com.pg).</li>
            <li>Showcased the National Reforestation and Afforestation Programme (NRAP 2025–2030) and Regional Forest Industrial Parks.</li>
            <li>Integrated Google Analytics 4 (GA4), structured meta schemas, and performance tuning for international stakeholders.</li>
          </ul>
        </div>

        <div class="modal-timeline-item">
          <div class="timeline-role">WordPress Developer &amp; Graphics Designer</div>
          <div class="timeline-company">Shangrila Hospitality LLC · Glenview, Illinois, USA</div>
          <div class="timeline-date">2024 – 2025</div>
          <ul class="timeline-bullets">
            <li>Designed and launched the comprehensive online dining website for The Clove Indian &amp; Nepali Cuisine (thecloveglenview.com).</li>
            <li>Engineered interactive dining/bar menus, integrated online takeout &amp; delivery ordering, and reservation systems.</li>
            <li>Crafted marketing branding collateral, social graphics, and digital media assets.</li>
          </ul>
        </div>

        <h4 style="color: #fff; font-size: 18px; margin: 24px 0 14px 0;">Education &amp; Certifications</h4>
        <div class="modal-timeline-item">
          <div class="timeline-role">B.Sc (HONS) Computing (Software Engineering)</div>
          <div class="timeline-company">University of Northampton, United Kingdom</div>
          <div class="timeline-date">Graduated 2023 / 2024</div>
          <p style="color: #9f9f9f; font-size: 13.5px; margin-top: 6px;">Focused on software engineering principles, distributed systems, database design, and cloud methodologies.</p>
        </div>
        <div class="modal-timeline-item">
          <div class="timeline-role">AZ-900: Microsoft Azure Fundamentals</div>
          <div class="timeline-company">Microsoft Certified</div>
          <div class="timeline-date">In Progress / Certification Track</div>
          <p style="color: #9f9f9f; font-size: 13.5px; margin-top: 6px;">Core Azure services, cloud concepts, security, privacy, compliance, and Azure pricing/support.</p>
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <a href="cv.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 9999px; color: #fff; font-size: 13.5px; font-weight: 500; transition: all 0.2s ease;">📄 View / Download Full CV (PDF) ↗</a>
        </div>
      `
    },
    projects: {
      subtitle: "Showcase & Portfolio",
      title: "Featured Projects",
      content: `
        <!-- Filter Tabs -->
        <div class="project-filter-bar">
          <button type="button" class="btn-filter is-active" data-filter="all">All Projects (4)</button>
          <button type="button" class="btn-filter" data-filter="cloud">Cloud &amp; Azure</button>
          <button type="button" class="btn-filter" data-filter="web">Full Stack &amp; Web</button>
          <button type="button" class="btn-filter" data-filter="wordpress">WordPress &amp; CMS</button>
        </div>

        <!-- Project 1: The Clove Glenview -->
        <article class="project-box" data-category="web wordpress">
          <div class="project-box-hero" data-lightbox="images/theclove.png" data-caption="The Clove Indian &amp; Nepali Cuisine — Glenview, Illinois" title="Click to view full image mockup">
            <div class="project-box-hero-bg" style="background-image: url('images/theclove.png');"></div>
            <div class="project-box-hero-overlay"></div>
            <div class="project-box-hero-inner">
              <div class="project-box-badges">
                <span class="project-pill-tag featured">WordPress · Elementor Pro</span>
                <span class="project-status-pill live">Live Website</span>
              </div>
              <div class="project-box-hero-title-wrap">
                <h3 class="project-box-title">The Clove — Indian &amp; Nepali Cuisine</h3>
                <span class="project-box-client">Shangrila Hospitality LLC · Glenview, Illinois, USA</span>
              </div>
            </div>
          </div>
          <div class="project-box-body">
            <p class="project-box-desc">
              Designed, built, and launched the full digital presence and online restaurant platform for an upscale Indian and Nepali dining destination in the Chicago metropolitan area.
            </p>
            <ul class="project-bullets">
              <li>Engineered a custom WordPress theme using <strong>Elementor Pro</strong> with a modern dark dining aesthetic matching the in-restaurant ambiance.</li>
              <li>Integrated <strong>live online ordering</strong> pipelines, interactive food &amp; cocktail menus, and catering/private event inquiry systems.</li>
              <li>Optimized local SEO, mobile touch responsiveness, and image caching resulting in rapid page loads and high customer conversion.</li>
            </ul>
            <div class="project-tech-tags">
              <span class="project-tech-tag">WordPress</span>
              <span class="project-tech-tag">Elementor Pro</span>
              <span class="project-tech-tag">Online Ordering</span>
              <span class="project-tech-tag">Menu Architecture</span>
              <span class="project-tech-tag">Local SEO</span>
              <span class="project-tech-tag">Mobile Responsive</span>
              <span class="project-tech-tag">Figma</span>
            </div>
            <div class="project-box-footer">
              <div class="project-footer-actions">
                <a href="https://thecloveglenview.com/" target="_blank" rel="noopener noreferrer" class="btn-project-primary">
                  <span>Visit Live Website</span>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path></svg>
                </a>
                <button type="button" class="btn-project-secondary" data-lightbox="images/theclove.png" data-caption="The Clove Restaurant — Glenview, IL Showcase Mockup">
                  <span>🔍 View Mockup</span>
                </button>
                <button type="button" class="btn-project-secondary" data-lightbox="images/theclove-live.png" data-caption="The Clove Restaurant — Live Homepage Screenshot">
                  <span>🖥️ Live Screenshot</span>
                </button>
              </div>
            </div>
          </div>
        </article>

        <!-- Project 2: Azigau Environmental Engineering -->
        <article class="project-box" data-category="web">
          <div class="project-box-hero" data-lightbox="images/azigau.png" data-caption="Azigau Environmental Engineering Ltd. — Corporate Web Platform &amp; Systems" title="Click to view full image mockup">
            <div class="project-box-hero-bg" style="background-image: url('images/azigau.png');"></div>
            <div class="project-box-hero-overlay"></div>
            <div class="project-box-hero-inner">
              <div class="project-box-badges">
                <span class="project-pill-tag featured">Full Stack · Bootstrap · ERMS</span>
                <span class="project-status-pill pending">Domain Renewal in Progress</span>
              </div>
              <div class="project-box-hero-title-wrap">
                <h3 class="project-box-title">A.E.E.L — Azigau Environmental Engineering</h3>
                <span class="project-box-client">Azigau Environmental Engineering Ltd. · Port Moresby, PNG</span>
              </div>
            </div>
          </div>
          <div class="project-box-body">
            <p class="project-box-desc">
              Corporate engineering web platform and internal enterprise dashboard systems developed for an environmental engineering, procurement, and technical staffing firm.
            </p>
            <ul class="project-bullets">
              <li>Architected the corporate web platform utilizing <strong>Bootstrap</strong>, modern <strong>JavaScript (ES6+)</strong>, and custom <strong>Figma</strong> UI design system.</li>
              <li>Engineered a custom <strong>ERMS (Employee Relationship Management System)</strong> analytics dashboard monitoring retention rates and essential KPIs for 50+ enterprise personnel.</li>
              <li>Created secure inter-agency collaboration modules for cross-governmental forestry policy and compliance workflows.</li>
              <li>Authored photography showcases and company portfolios reflecting real on-site engineering projects.</li>
            </ul>
            <div class="project-tech-tags">
              <span class="project-tech-tag">Bootstrap 5</span>
              <span class="project-tech-tag">JavaScript (ES6+)</span>
              <span class="project-tech-tag">Figma Design</span>
              <span class="project-tech-tag">ERMS Dashboard</span>
              <span class="project-tech-tag">Enterprise Portal</span>
              <span class="project-tech-tag">Technical SEO</span>
            </div>
            <div class="project-box-footer">
              <div class="project-footer-actions">
                <a href="https://azigau.com/" target="_blank" rel="noopener noreferrer" class="btn-project-primary">
                  <span>Visit azigau.com</span>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path></svg>
                </a>
                <button type="button" class="btn-project-secondary" data-lightbox="images/azigau.png" data-caption="A.E.E.L — Azigau Environmental Engineering Website Showcase">
                  <span>🔍 View Site Mockup</span>
                </button>
              </div>
              <span class="project-note-badge">⏳ Domain fee renewal pending with registrar (Live shortly)</span>
            </div>
          </div>
        </article>

        <!-- Project 3: PNG Diwai Holdings Limited -->
        <article class="project-box" data-category="web">
          <div class="project-box-hero" data-lightbox="images/pngdhl.png" data-caption="PNG Diwai Holdings Limited — Sustainable Forestry Portal" title="Click to view full image screenshot">
            <div class="project-box-hero-bg" style="background-image: url('images/pngdhl.png');"></div>
            <div class="project-box-hero-overlay"></div>
            <div class="project-box-hero-inner">
              <div class="project-box-badges">
                <span class="project-pill-tag featured">Lead Frontend Takeover · SEO &amp; Analytics</span>
                <span class="project-status-pill live">Live Production Portal</span>
              </div>
              <div class="project-box-hero-title-wrap">
                <h3 class="project-box-title">PNG Diwai Holdings Limited (PNGDHL)</h3>
                <span class="project-box-client">A Government of PNG Undertaking · Port Moresby, Papua New Guinea</span>
              </div>
            </div>
          </div>
          <div class="project-box-body">
            <p class="project-box-desc">
              Essentially created and took over frontend development and digital architecture from the previous frontend team for Papua New Guinea's governmental undertaking in sustainable forestry management and timber exports.
            </p>
            <ul class="project-bullets">
              <li>Took over and modernized legacy codebase into a responsive, high-performance web experience for national and international audiences.</li>
              <li>Showcased the <strong>National Reforestation and Afforestation Programme (NRAP 2025–2030)</strong>, Regional Forest Industrial Parks, and public galleries.</li>
              <li>Implemented <strong>Google Analytics (GA4)</strong> tracking infrastructure, SEO keyword hierarchy, and fast Core Web Vitals.</li>
            </ul>
            <div class="project-tech-tags">
              <span class="project-tech-tag">Lead Frontend</span>
              <span class="project-tech-tag">Bootstrap</span>
              <span class="project-tech-tag">HTML5 &amp; CSS3</span>
              <span class="project-tech-tag">JavaScript / jQuery</span>
              <span class="project-tech-tag">Google Analytics 4</span>
              <span class="project-tech-tag">Gov Platform</span>
            </div>
            <div class="project-box-footer">
              <div class="project-footer-actions">
                <a href="https://www.pngdhl.com.pg/" target="_blank" rel="noopener noreferrer" class="btn-project-primary">
                  <span>Visit Live Portal</span>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path></svg>
                </a>
                <button type="button" class="btn-project-secondary" data-lightbox="images/pngdhl.png" data-caption="PNG Diwai Holdings Limited — Official Production Homepage">
                  <span>🖥️ View Live Screenshot</span>
                </button>
                <button type="button" class="btn-project-secondary" data-lightbox="images/pngdhl-banner.webp" data-caption="PNG Diwai Holdings Limited — Official Launching Ceremony Banner">
                  <span>🖼️ Official Ceremony Banner</span>
                </button>
              </div>
            </div>
          </div>
        </article>

        <!-- Project 4: Cloud Resume Challenge (Azure Architecture) -->
        <article class="project-box" data-category="cloud">
          <div class="project-box-hero" data-lightbox="images/cloud-resume.jpg" data-caption="Cloud Resume Challenge — Serverless Architecture on Microsoft Azure" title="Click to view full architecture diagram">
            <div class="project-box-hero-bg" style="background-image: url('images/cloud-resume.jpg');"></div>
            <div class="project-box-hero-overlay"></div>
            <div class="project-box-hero-inner">
              <div class="project-box-badges">
                <span class="project-pill-tag featured">Microsoft Azure · Serverless · CI/CD</span>
                <span class="project-status-pill live">Active Azure Workload</span>
              </div>
              <div class="project-box-hero-title-wrap">
                <h3 class="project-box-title">Cloud Resume Challenge (Azure Architecture)</h3>
                <span class="project-box-client">Self-Engineered Cloud Architecture · Microsoft Azure</span>
              </div>
            </div>
          </div>
          <div class="project-box-body">
            <p class="project-box-desc">
              Production-grade serverless cloud infrastructure built for the Cloud Resume Challenge, demonstrating enterprise-grade resilience, edge caching, and automated CI/CD pipelines.
            </p>
            <ul class="project-bullets">
              <li>Deployed static Bento-grid resume on <strong>Azure Blob Storage</strong> enabled with static website hosting.</li>
              <li>Configured <strong>Azure CDN</strong> for worldwide edge caching, custom domain SSL/TLS certificate, and HTTPS enforcement.</li>
              <li>Created a serverless visitor counter utilizing an <strong>Azure Function (Python)</strong> connected to an <strong>Azure Cosmos DB</strong> NoSQL database.</li>
              <li>Automated infrastructure deployments, automated testing, and code synchronization using <strong>GitHub Actions CI/CD</strong> workflow.</li>
            </ul>
            <div class="project-tech-tags">
              <span class="project-tech-tag">Microsoft Azure</span>
              <span class="project-tech-tag">Azure Blob Storage</span>
              <span class="project-tech-tag">Azure CDN</span>
              <span class="project-tech-tag">Azure Functions</span>
              <span class="project-tech-tag">Cosmos DB</span>
              <span class="project-tech-tag">GitHub Actions</span>
              <span class="project-tech-tag">Python API</span>
            </div>
            <div class="project-box-footer">
              <div class="project-footer-actions">
                <a href="https://github.com/a-josuke?tab=repositories" target="_blank" rel="noopener noreferrer" class="btn-project-primary">
                  <span>GitHub Repository</span>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path></svg>
                </a>
                <button type="button" class="btn-project-secondary" data-lightbox="images/cloud-resume.jpg" data-caption="Cloud Resume Challenge — Serverless Azure Architecture Diagram">
                  <span>🔍 Architecture Diagram</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      `
    },
    services: {
      subtitle: "Specialization & Capabilities",
      title: "Services Offering",
      content: `
        <p style="margin-bottom: 20px; font-size: 14.5px; color: #b5b5b5;">
          Bridging the gap between reliable cloud infrastructure and intuitive frontend user experiences.
        </p>
        <div class="modal-timeline-item">
          <div class="timeline-role">☁️ Cloud & Azure Infrastructure</div>
          <div class="timeline-company">Solutions Architecture & Deployment</div>
          <ul class="timeline-bullets" style="margin-top: 8px;">
            <li>Static web hosting, Azure Storage Accounts & Blob containers.</li>
            <li>Azure CDN configuration, SSL/TLS certificates & DNS management.</li>
            <li>Serverless Azure Functions & API integration.</li>
            <li>Resource Group lifecycle & Azure Cost Management.</li>
          </ul>
        </div>
        <div class="modal-timeline-item">
          <div class="timeline-role">💻 Full Stack & Frontend Engineering</div>
          <div class="timeline-company">Modern Web Development</div>
          <ul class="timeline-bullets" style="margin-top: 8px;">
            <li>Single Page Applications (SPA) with React.js.</li>
            <li>Tailwind CSS, Bootstrap, and pixel-perfect vanilla CSS design systems.</li>
            <li>Bento Grid layouts, responsive UI/UX, and accessibility compliance.</li>
          </ul>
        </div>
        <div class="modal-timeline-item">
          <div class="timeline-role">⚡ WordPress & Managed Hosting</div>
          <div class="timeline-company">CMS & Platform Optimization</div>
          <ul class="timeline-bullets" style="margin-top: 8px;">
            <li>Custom WordPress theme development & Elementor kit customization.</li>
            <li>Managed hosting setup, caching layers & security hardening.</li>
            <li>Technical SEO audits and Core Web Vitals performance tuning.</li>
          </ul>
        </div>
      `
    },
    techstack: {
      subtitle: "Tools & Technologies",
      title: "Skills & Tech Stack",
      content: `
        <h4 style="color: #fff; font-size: 16px; margin-bottom: 10px;">Cloud & DevOps</h4>
        <div class="skills-tags-wrap">
          <span class="skill-tag featured">Microsoft Azure</span>
          <span class="skill-tag">Azure Blob Storage</span>
          <span class="skill-tag">Azure CDN</span>
          <span class="skill-tag">Azure Functions</span>
          <span class="skill-tag">Cosmos DB</span>
          <span class="skill-tag">GitHub Actions CI/CD</span>
        </div>

        <h4 style="color: #fff; font-size: 16px; margin: 22px 0 10px 0;">Frontend Development</h4>
        <div class="skills-tags-wrap">
          <span class="skill-tag featured">React.js</span>
          <span class="skill-tag">JavaScript (ES6+)</span>
          <span class="skill-tag">HTML5 & Semantic Web</span>
          <span class="skill-tag">CSS3 & Modern Bento Grids</span>
          <span class="skill-tag">Tailwind CSS</span>
          <span class="skill-tag">Bootstrap</span>
        </div>

        <h4 style="color: #fff; font-size: 16px; margin: 22px 0 10px 0;">CMS & Web Operations</h4>
        <div class="skills-tags-wrap">
          <span class="skill-tag">WordPress Development</span>
          <span class="skill-tag">Managed Hosting</span>
          <span class="skill-tag">Elementor Pro</span>
          <span class="skill-tag">SEO Optimization</span>
          <span class="skill-tag">Git & Version Control</span>
        </div>
      `
    },
    contact: {
      subtitle: "Let's Connect",
      title: "Get in Touch",
      content: `
        <p style="margin-bottom: 16px; font-size: 15px; color: #cfcfcf;">
          Whether you're looking to discuss cloud infrastructure, hire a full stack engineer, or build your next project — my inbox is always open!
        </p>
        <div class="contact-grid">
          <div class="contact-card">
            <span class="contact-label">Direct Email</span>
            <a href="mailto:dahal.ankit7@gmail.com" class="contact-value">dahal.ankit7@gmail.com</a>
            <span class="btn-copy" id="copyEmailBtn">📋 Copy email address</span>
          </div>
          <div class="contact-card">
            <span class="contact-label">LinkedIn</span>
            <a href="https://www.linkedin.com/in/ankit-dahal28/" target="_blank" rel="noopener noreferrer" class="contact-value">in/ankit-dahal28 ↗</a>
          </div>
          <div class="contact-card">
            <span class="contact-label">Location</span>
            <span class="contact-value">Kathmandu, Nepal</span>
          </div>
          <div class="contact-card">
            <span class="contact-label">GitHub</span>
            <a href="https://github.com/a-josuke?tab=repositories" target="_blank" rel="noopener noreferrer" class="contact-value">github.com/a-josuke ↗</a>
          </div>
        </div>
      `
    }
  };

  // --- 3. Lightbox Management ---
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

  function openLightbox(src, caption) {
    if (!lightboxBackdrop || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightboxBackdrop.classList.add('is-open');
  }

  function closeLightbox() {
    if (!lightboxBackdrop) return;
    lightboxBackdrop.classList.remove('is-open');
    if (lightboxImg) lightboxImg.src = '';
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', (e) => {
      if (e.target === lightboxBackdrop) closeLightbox();
    });
  }

  // Open Modal Helper
  function openModal(key) {
    const data = modalData[key];
    if (!data) return;

    modalSubtitle.textContent = data.subtitle;
    modalTitle.textContent = data.title;
    modalBody.innerHTML = data.content;

    // Apply specific modal class modifier for responsive width
    modalContainer.className = 'modal-container modal-' + key;

    modalBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Hook copy button if in contact modal
    const copyBtn = document.getElementById('copyEmailBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('dahal.ankit7@gmail.com').then(() => {
          copyBtn.textContent = '✅ Copied to clipboard!';
          setTimeout(() => {
            copyBtn.textContent = '📋 Copy email address';
          }, 2500);
        });
      });
    }

    // Hook project lightbox preview triggers
    modalBody.querySelectorAll('[data-lightbox]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        e.preventDefault();
        e.stopPropagation();
        const src = trigger.getAttribute('data-lightbox');
        const caption = trigger.getAttribute('data-caption') || '';
        openLightbox(src, caption);
      });
    });

    // Hook project category filters
    const filterBtns = modalBody.querySelectorAll('.btn-filter');
    const projectCards = modalBody.querySelectorAll('.project-box');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.getAttribute('data-filter');
        projectCards.forEach(card => {
          const category = card.getAttribute('data-category') || '';
          if (filter === 'all' || category.includes(filter)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Close Modal Helper
  function closeModal() {
    modalBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Event Listeners for Opening Modals
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      // If clicking directly on an anchor inside that goes to an external link, let it navigate
      if (e.target.closest('a') && !e.target.closest('.card-arrow')) {
        return;
      }
      e.preventDefault();
      const modalKey = trigger.getAttribute('data-modal');
      openModal(modalKey);
    });
  });

  // Close Modal Handlers
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightboxBackdrop && lightboxBackdrop.classList.contains('is-open')) {
        closeLightbox();
      } else if (modalBackdrop.classList.contains('is-open')) {
        closeModal();
      }
    }
  });
});


const API_URL = window.CRC_CONFIG.apiUrl;

// Which website sent this visitor here? Only the host name is sent (e.g. "www.linkedin.com").
function referrerHost() {
  try {
    const host = new URL(document.referrer).hostname;
    return host === location.hostname ? '' : host;
  } catch {
    return ''; // no referrer = typed the address or used a bookmark
  }
}

async function updateCounter() {
  const el = document.getElementById('visitor-count');
  try {
    const res = await fetch(`${API_URL}?ref=${encodeURIComponent(referrerHost())}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { count, uniqueCount } = await res.json();
    el.textContent = `${count.toLocaleString()} views · ${(uniqueCount ?? 0).toLocaleString()} unique visitors`;
  } catch (err) {
    console.error('Visitor counter failed:', err);
    el.textContent = '-';
  }
}
document.addEventListener('DOMContentLoaded', updateCounter);