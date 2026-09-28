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
          <div class="timeline-company">Azigau Environmental Engineering Ltd.</div>
          <div class="timeline-date">Jan 2025 – June 2026</div>
          <ul class="timeline-bullets">
            <li>Created secure web applications for cross-government collaboration on high-level forestry logging policies.</li>
            <li>Architected and built an ERMS (Employee Relationship Management System) dashboard to track essential KPIs for employee engagement and retention for over 50+ staff members.</li>
            <li>Initiated and executed a comprehensive digital marketing campaign and SEO optimization for the company's web platforms, driving notable organic visibility.</li>
          </ul>
        </div>

        <h4 style="color: #fff; font-size: 18px; margin: 24px 0 14px 0;">Education & Certifications</h4>
        <div class="modal-timeline-item">
          <div class="timeline-role">B.Sc (HONS) Computing (Software Engineering)</div>
          <div class="timeline-company">University of Northampton</div>
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
        <div class="modal-timeline-item">
          <div class="timeline-role">Cloud Resume Challenge (Azure Architecture)</div>
          <div class="timeline-company">Cloud / DevOps · Azure Blob Storage, CDN & Functions</div>
          <div class="timeline-date">Featured Project · 2026</div>
          <ul class="timeline-bullets">
            <li>Deployed this static Bento-grid resume on <strong>Azure Blob Storage</strong> enabled with static website hosting.</li>
            <li>Configured <strong>Azure CDN</strong> for worldwide low-latency caching, custom domain SSL/TLS certificate, and HTTPS enforcement.</li>
            <li>Created a serverless visitor counter utilizing an <strong>Azure Function (Python/Node)</strong> connected to an <strong>Azure Cosmos DB</strong> database.</li>
            <li>Automated infrastructure deployments and code pushes using <strong>GitHub Actions CI/CD</strong> workflow.</li>
          </ul>
        </div>
        <div class="modal-timeline-item">
          <div class="timeline-role">Employee Relationship Management System (ERMS)</div>
          <div class="timeline-company">Full Stack Web Dashboard · Azigau</div>
          <div class="timeline-date">Enterprise Solution</div>
          <ul class="timeline-bullets">
            <li>Engineered an interactive analytics dashboard monitoring retention rates, satisfaction indicators, and engagement metrics for 50+ enterprise personnel.</li>
            <li>Built responsive frontend with modern UI states and secure backend data management.</li>
          </ul>
        </div>
        <div class="modal-timeline-item">
          <div class="timeline-role">Forestry Policy Collaboration Platform</div>
          <div class="timeline-company">Governmental Digital Infrastructure</div>
          <div class="timeline-date">Web Application</div>
          <ul class="timeline-bullets">
            <li>Facilitated inter-departmental policy coordination, review pipelines, and logging compliance reporting tools.</li>
          </ul>
        </div>
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

  // Open Modal Helper
  function openModal(key) {
    const data = modalData[key];
    if (!data) return;

    modalSubtitle.textContent = data.subtitle;
    modalTitle.textContent = data.title;
    modalBody.innerHTML = data.content;

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
    if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
      closeModal();
    }
  });
});


const API_URL = 'https://func-crc-ad-c4b7bahhchd4aacb.centralindia-01.azurewebsites.net/api/visitorCount';

async function updateCounter() {
  const el = document.getElementById('visitor-count');
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { count } = await res.json();
    el.textContent = count.toLocaleString();
  } catch (err) {
    console.error('Visitor counter failed:', err);
    el.textContent = '-';
  }
}
document.addEventListener('DOMContentLoaded', updateCounter);