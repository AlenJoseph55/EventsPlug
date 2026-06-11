import { validateForm } from '@eventflow/validators';

// Dynamic Widget Loader Script
 
class EventWidget extends HTMLElement {
  private shadow: ShadowRoot;
  private apiBase: string = 'http://localhost:5001/api';
  private lastLoadedEvent: any = null;
  private organization: any = null;
  private isMounted = false;
 
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['layout', 'limit', 'org'];
  }

  attributeChangedCallback(_name: string, oldValue: string, newValue: string) {
    if (!this.isMounted || !this.shadowRoot) return;
    if (oldValue !== newValue) {
      const orgSlug = this.getAttribute('org') || '';
      if (orgSlug) {
        this.fetchAndRenderEvents(orgSlug);
      }
    }
  }
 
  connectedCallback() {
    this.isMounted = true;
    const orgSlug = this.getAttribute('org');
    if (!orgSlug) {
      this.shadow.innerHTML = `
        <div style="color: #ef4444; padding: 15px; border: 1px solid #ef4444; border-radius: 8px; font-weight: 600;">
          Error: Missing required "org" attribute on &lt;event-widget&gt; element.
        </div>
      `;
      return;
    }
 
    // Defer rendering slightly to let async host stylesheets settle
    requestAnimationFrame(() => {
      this.renderStructure();
      this.fetchAndRenderEvents(orgSlug);
    });
  }

  private renderStructure() {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 100%;
          overflow: visible !important;
          position: relative;
          font-family: 'Plus Jakarta Sans', sans-serif;
          /* CSS Variable Theme Cascades */
          --bg-card: var(--card-bg, #111827);
          --bg-input: var(--card-bg, #1f2937);
          --border-color: rgba(255, 255, 255, 0.08);
          --text-main: var(--text-color, #f3f4f6);
          --text-muted: #9ca3af;
          --primary: var(--primary-color, #6366f1);
          --primary-contrast: var(--primary-contrast-color, #ffffff);
          --primary-hover: var(--primary-hover, #4f46e5);
          --accent: #a855f7;
          --success: #10b981;
          --error: #ef4444;
        }

        .widget-container {
          width: 100%;
          box-sizing: border-box;
          background-color: var(--bg-color, transparent);
          color: var(--text-color, #f3f4f6);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
        }

        /* Grid Layout */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 20px;
        }

        /* Event Card */
        .event-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .event-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px -10px rgba(99, 102, 241, 0.3);
          border-color: var(--primary);
        }

        .event-poster {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-bottom: 1px solid var(--border-color);
          background: #0f111a;
        }

        .event-poster-placeholder {
          width: 100%;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
          color: #a5b4fc;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, #312e81 0%, #581c87 100%);
          border-bottom: 1px solid var(--border-color);
        }

        .event-details {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .event-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 10px 0;
          line-height: 1.3;
        }

        .event-desc {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0 0 20px 0;
          flex-grow: 1;
        }

        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .meta-item svg {
          width: 16px;
          height: 16px;
          fill: var(--primary);
        }

        /* Capacity Progress Bar */
        .capacity-container {
          margin-bottom: 20px;
        }

        .capacity-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--text-muted);
        }

        .capacity-bar {
          width: 100%;
          height: 8px;
          background-color: var(--bg-input);
          border-radius: 99px;
          overflow: hidden;
        }

        .capacity-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          transition: width 0.5s ease;
        }

        .capacity-full-fill {
          background: var(--error) !important;
        }

        /* Unified Event Details layouts styling */
        .event-details-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .event-details-action {
          display: flex;
          flex-direction: column;
        }

        /* -------------------------------------------------------------
           Layout: List Layout
           ------------------------------------------------------------- */
        .layout-list .events-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .layout-list .event-card {
          flex-direction: row;
          align-items: stretch;
          min-height: 200px;
        }

        .layout-list .event-poster,
        .layout-list .event-poster-placeholder {
          width: 220px;
          height: 100%;
          min-height: 200px;
          border-bottom: none;
          border-right: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .layout-list .event-details {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: 24px 32px;
          gap: 32px;
          flex-grow: 1;
        }

        .layout-list .event-desc {
          margin-bottom: 8px;
          flex-grow: 0;
        }

        .layout-list .event-meta {
          flex-direction: row;
          gap: 16px;
          margin-bottom: 0px;
        }

        .layout-list .event-details-action {
          width: 260px;
          flex-shrink: 0;
          gap: 16px;
        }

        .layout-list .capacity-container {
          margin-bottom: 0px;
        }

        /* Responsive List Layout */
        @media (max-width: 768px) {
          .layout-list .event-card {
            flex-direction: column;
          }
          .layout-list .event-poster,
          .layout-list .event-poster-placeholder {
            width: 100%;
            height: 180px;
            min-height: 180px;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }
          .layout-list .event-details {
            flex-direction: column;
            align-items: stretch;
            padding: 24px;
            gap: 20px;
          }
          .layout-list .event-details-action {
            width: 100%;
          }
          .layout-list .event-meta {
            flex-direction: column;
            gap: 8px;
          }
        }

        @media (max-width: 480px) {
          .layout-list .event-card {
            flex-direction: column !important;
          }
        }

        /* -------------------------------------------------------------
           Layout: Carousel Layout
           ------------------------------------------------------------- */
        .layout-carousel {
          position: relative;
          width: 100%;
        }

        .layout-carousel .events-grid {
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          gap: 24px;
          padding: 8px 4px 16px 4px;
          margin-top: 20px;
        }

        .layout-carousel .events-grid::-webkit-scrollbar {
          display: none;
        }

        .layout-carousel .event-card {
          flex: 0 0 320px;
          scroll-snap-align: start;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* Carousel Nav triggers */
        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 1.1rem;
          opacity: 0.85;
          user-select: none;
        }

        .carousel-nav:hover {
          opacity: 1;
          transform: translateY(-50%) scale(1.08);
          background: var(--primary);
          color: var(--primary-contrast);
          border-color: transparent;
        }

        .carousel-nav.prev {
          left: 12px;
        }

        .carousel-nav.next {
          right: 12px;
        }

        @media (max-width: 640px) {
          .carousel-nav {
            display: none;
          }
          .layout-carousel .event-card {
            flex: 0 0 280px;
          }
        }

        /* Action Button */
        .btn-register {
          display: block;
          width: 100%;
          padding: 12px 24px;
          background-color: var(--primary);
          border: none;
          color: var(--primary-contrast);
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease;
          text-align: center;
          box-sizing: border-box;
        }

        .btn-register:hover {
          background-color: var(--primary-hover);
        }

        .btn-register:disabled {
          background-color: var(--border-color) !important;
          color: var(--text-muted);
          cursor: not-allowed;
        }

        /* Loading / Error States */
        .widget-status {
          text-align: center;
          padding: 60px 20px;
          font-size: 1.1rem;
          color: var(--text-muted);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Dialog Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(3, 7, 18, 0.85);
          backdrop-filter: blur(8px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .modal-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }

        .modal-window {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          width: 100%;
          max-width: 540px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          transform: scale(0.95) translateY(10px);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-sizing: border-box;
          position: relative;
        }

        .modal-overlay.active .modal-window {
          transform: scale(1) translateY(0);
        }

        .modal-header {
          padding: 24px 24px 16px 24px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .modal-header-title {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .modal-header-subtitle {
          margin: 4px 0 0 0;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.5rem;
          line-height: 1;
          padding: 4px;
          border-radius: 50%;
          transition: background-color 0.2s ease, color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }

        .modal-close:hover {
          background-color: var(--bg-input);
          color: var(--text-main);
        }

        .modal-body {
          padding: 24px;
        }

        /* Dynamic Form Inputs */
        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-main);
        }

        .form-label .required-indicator {
          color: var(--error);
          margin-left: 2px;
        }

        .form-control {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 16px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          border-radius: 10px;
          font-family: inherit;
          font-size: 0.95rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        textarea.form-control {
          resize: vertical;
          min-height: 80px;
        }

        /* Options for Select / Radios */
        .options-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: var(--text-main);
          font-size: 0.95rem;
        }

        .radio-option input {
          width: 18px;
          height: 18px;
          accent-color: var(--primary);
        }

        /* Validation Error Messaging */
        .form-group.has-error .form-control {
          border-color: var(--error);
        }

        .field-error-message {
          color: var(--error);
          font-size: 0.8rem;
          font-weight: 500;
          margin-top: 6px;
          display: none;
        }

        .form-group.has-error .field-error-message {
          display: block;
        }

        /* Success & Success Checkmark State */
        .success-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
        }

        .checkmark-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: rgba(16, 185, 129, 0.1);
          border: 3px solid var(--success);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          color: var(--success);
          animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .checkmark-circle svg {
          width: 42px;
          height: 42px;
          fill: none;
          stroke: currentColor;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: drawCheck 0.3s 0.3s ease forwards;
        }

        @keyframes scaleUp {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }

        .success-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0 0 10px 0;
        }

        .success-message {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0 0 24px 0;
        }
      </style>

      <div class="widget-container">
        <div id="events-loader" class="widget-status">
          <div class="spinner"></div>
          <div>Loading events...</div>
        </div>
        <div id="events-grid" class="events-grid" style="display: none;"></div>
        <div id="widget-error" class="widget-status" style="display: none; color: var(--error);"></div>
      </div>

      <!-- Registration Modal -->
      <div id="reg-modal" class="modal-overlay">
        <div class="modal-window">
          <div class="modal-header">
            <div>
              <h2 id="modal-title" class="modal-header-title">Event Registration</h2>
              <div id="modal-subtitle" class="modal-header-subtitle">Provide details to register</div>
            </div>
            <button id="modal-close-btn" class="modal-close">&times;</button>
          </div>
          <div id="modal-content" class="modal-body">
            <!-- Dynamic Form or Success Content injected here -->
          </div>
        </div>
      </div>
    `;

    // Bind Close Button
    const modal = this.shadow.getElementById('reg-modal') as HTMLElement;
    const closeBtn = this.shadow.getElementById('modal-close-btn') as HTMLButtonElement;
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      // Revert back to organization default theme
      if (this.lastLoadedEvent) {
        this.applyThemeForEventOrOrg(this.lastLoadedEvent);
      }
    });
  }

  private async fetchAndRenderEvents(orgSlug: string) {
    const loader = this.shadow.getElementById('events-loader') as HTMLElement;
    const grid = this.shadow.getElementById('events-grid') as HTMLElement;
    const errorEl = this.shadow.getElementById('widget-error') as HTMLElement;

    try {
      const response = await fetch(`${this.apiBase}/organizations/${orgSlug}/events`);
      if (!response.ok) {
        throw new Error('Failed to retrieve events. Check organization slug.');
      }
      
      const data = await response.json();
      this.organization = data.organization || null;
      const events = data.events || [];
      
      loader.style.display = 'none';

      if (events.length === 0) {
        errorEl.textContent = 'No upcoming events found for this organization.';
        errorEl.style.display = 'block';
        return;
      }

      // Populate caching context and cascade branding styles
      if (events[0]) {
        this.lastLoadedEvent = events[0];
        this.applyThemeForEventOrOrg(events[0]);
      }

      // Resolve layout cascade
      const layoutAttr = this.getAttribute('layout');
      const layout = layoutAttr || this.organization?.defaultLayout || 'GRID';
      const cleanLayout = String(layout).toUpperCase(); // GRID, LIST, or CAROUSEL

      // Update widget-container layout class
      const container = this.shadow.querySelector('.widget-container');
      if (container) {
        container.classList.remove('layout-grid', 'layout-list', 'layout-carousel');
        container.classList.add(`layout-${cleanLayout.toLowerCase()}`);
      }

      // Resolve display limit preferences safely and defensively
      const rawLimit = this.getAttribute('limit') ?? String(this.organization?.defaultLimit ?? '');
      const limitVal = rawLimit ? parseInt(rawLimit, 10) : null;
      const safeLimit = limitVal && !isNaN(limitVal) && limitVal > 0 ? limitVal : null;
      const displayEvents = safeLimit ? events.slice(0, safeLimit) : events;

      grid.innerHTML = '';
      displayEvents.forEach((event: any) => {
        const isSoldOut = event.maxRegistrations !== null && event._count?.registrations >= event.maxRegistrations;
        
        let posterHTML = `<div class="event-poster-placeholder">${event.title.substring(0, 3).toUpperCase()}</div>`;
        if (event.posterUrl) {
          posterHTML = `<img class="event-poster" src="${event.posterUrl}" alt="${event.title} poster"/>`;
        }

        let capacityHTML = '';
        if (event.maxRegistrations !== null) {
          const filled = event._count?.registrations || 0;
          const pct = Math.min((filled / event.maxRegistrations) * 100, 100);
          capacityHTML = `
            <div class="capacity-container">
              <div class="capacity-label">
                <span>Filled Seats</span>
                <span>${filled} / ${event.maxRegistrations}</span>
              </div>
              <div class="capacity-bar">
                <div class="capacity-fill ${isSoldOut ? 'capacity-full-fill' : ''}" style="width: ${pct}%;"></div>
              </div>
            </div>
          `;
        } else {
          capacityHTML = `
            <div class="capacity-container">
              <div class="capacity-label">
                <span>Capacity</span>
                <span>Unlimited Seats</span>
              </div>
              <div class="capacity-bar">
                <div class="capacity-fill" style="width: 100%;"></div>
              </div>
            </div>
          `;
        }

        const dateStr = new Date(event.date).toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
          ${posterHTML}
          <div class="event-details">
            <div class="event-details-main">
              <h3 class="event-title">${event.title}</h3>
              <p class="event-desc">${event.description.substring(0, 140)}${event.description.length > 140 ? '...' : ''}</p>
              <div class="event-meta">
                <div class="meta-item">
                  <svg viewBox="0 0 24 24"><path d="M19,4H18V2H16V4H8V2H6V4H5C3.89,4 3,4.9 3,6V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V6A2,2 0 0,0 19,4M19,20H5V9H19V20M5,7V6H19V7H5Z"/></svg>
                  <span>${dateStr}</span>
                </div>
                <div class="meta-item">
                  <svg viewBox="0 0 24 24"><path d="M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2M12,4A5,5 0 0,1 17,9C17,12.54 13.12,17.43 12,18.8C10.88,17.43 7,12.54 7,9A5,5 0 0,1 12,4M12,6A3,3 0 0,0 9,9A3,3 0 0,0 12,12A3,3 0 0,0 15,9A3,3 0 0,0 12,6Z"/></svg>
                  <span>${event.location}</span>
                </div>
              </div>
            </div>
            <div class="event-details-action">
              ${capacityHTML}
              <button class="btn-register" ${isSoldOut ? 'disabled' : ''}>
                ${isSoldOut ? 'Sold Out' : 'Register Now'}
              </button>
            </div>
          </div>
        `;

        // Bind registration handler
        const regBtn = card.querySelector('.btn-register') as HTMLButtonElement;
        if (!isSoldOut) {
          regBtn.addEventListener('click', () => this.openRegistrationForm(event));
        }

        grid.appendChild(card);
      });

      // Clear previous carousel navigation buttons and set them up if carousel is active
      this.shadow.querySelectorAll('.carousel-nav').forEach(btn => btn.remove());
      if (cleanLayout === 'CAROUSEL') {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-nav prev';
        prevBtn.innerHTML = '&#10094;';
        prevBtn.addEventListener('click', () => {
          grid.scrollBy({ left: -344, behavior: 'smooth' });
        });

        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-nav next';
        nextBtn.innerHTML = '&#10095;';
        nextBtn.addEventListener('click', () => {
          grid.scrollBy({ left: 344, behavior: 'smooth' });
        });

        if (container) {
          container.appendChild(prevBtn);
          container.appendChild(nextBtn);
        }
      }

      // Clear the inline display none so the class styling applies cleanly
      grid.style.display = '';

    } catch (err: any) {
      loader.style.display = 'none';
      errorEl.textContent = `Error: ${err.message || 'Unable to connect to events service.'}`;
      errorEl.style.display = 'block';
    }
  }

  private escapeHtml(str: string): string {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  private openRegistrationForm(event: any) {
    const modal = this.shadow.getElementById('reg-modal') as HTMLElement;
    const titleEl = this.shadow.getElementById('modal-title') as HTMLElement;
    const subtitleEl = this.shadow.getElementById('modal-subtitle') as HTMLElement;
    const contentEl = this.shadow.getElementById('modal-content') as HTMLElement;

    // Apply event specific override theme when modal opens!
    this.applyThemeForEventOrOrg(event);

    titleEl.textContent = `Register: ${event.title}`;
    subtitleEl.textContent = `Fill out the required information below to confirm your seat.`;

    const fields = event.formFields || [];
    if (fields.length === 0) {
      contentEl.innerHTML = `<div style="color: var(--error);">Error: This event does not have any registration fields configured.</div>`;
      modal.classList.add('active');
      return;
    }

    // Build form inputs dynamically
    let formHTML = `<form id="registration-form" novalidate>`;
    fields.forEach((field: any) => {
      const isReq = field.required;
      const safeLabel = this.escapeHtml(field.label);
      const safePlaceholder = this.escapeHtml(field.placeholder || '');
      const labelHTML = `<label class="form-label">${safeLabel}${isReq ? '<span class="required-indicator">*</span>' : ''}</label>`;
      
      let inputHTML = '';
      const fType = String(field.type).toLowerCase();

      if (fType === 'textarea') {
        inputHTML = `<textarea class="form-control" name="${field.id}" placeholder="${safePlaceholder}" ${isReq ? 'required' : ''}></textarea>`;
      } else if (fType === 'select') {
        let allowedOptions: string[] = [];
        try {
          if (typeof field.options === 'string') {
            allowedOptions = JSON.parse(field.options);
          } else if (Array.isArray(field.options)) {
            allowedOptions = field.options;
          }
        } catch {
          allowedOptions = [];
        }

        const optionsHTML = allowedOptions.map((o) => `<option value="${this.escapeHtml(o)}">${this.escapeHtml(o)}</option>`).join('');
        inputHTML = `
          <select class="form-control" name="${field.id}" ${isReq ? 'required' : ''}>
            <option value="" disabled selected>${safePlaceholder || 'Select an option'}</option>
            ${optionsHTML}
          </select>
        `;
      } else if (fType === 'checkbox') {
        inputHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" name="${field.id}" id="chk-${field.id}" ${isReq ? 'required' : ''} style="margin: 0;" />
            <label for="chk-${field.id}" style="font-size: 0.85rem; color: var(--text-muted); cursor: pointer;">${safeLabel} ${isReq ? '<span class="required-indicator">*</span>' : ''}</label>
          </div>
        `;
      } else {
        // text, email, number
        inputHTML = `<input class="form-control" type="${fType}" name="${field.id}" placeholder="${safePlaceholder}" ${isReq ? 'required' : ''}/>`;
      }

      formHTML += `
        <div class="form-group" data-field="${field.id}">
          ${fType === 'checkbox' ? '' : labelHTML}
          ${inputHTML}
          <div class="field-error-message">This field is required.</div>
        </div>
      `;
    });

    formHTML += `
      <div id="form-error-summary" style="display: none; color: var(--error); font-size: 0.9rem; font-weight: 600; margin-bottom: 20px;"></div>
      <button type="submit" id="submit-reg-btn" class="btn-register">Confirm Registration</button>
    </form>`;

    contentEl.innerHTML = formHTML;
    modal.classList.add('active');

    // Bind form submit
    const form = this.shadow.getElementById('registration-form') as HTMLFormElement;
    form.addEventListener('submit', (e) => this.handleFormSubmit(e, event, fields));
  }

  private async handleFormSubmit(e: Event, event: any, fields: any[]) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const submitBtn = this.shadow.getElementById('submit-reg-btn') as HTMLButtonElement;
    const errorSummary = this.shadow.getElementById('form-error-summary') as HTMLElement;
    
    // Clear previous errors
    const formGroups = form.querySelectorAll('.form-group');
    formGroups.forEach((g) => g.classList.remove('has-error'));
    errorSummary.style.display = 'none';

    // 1. Gather form values
    const answers: Record<string, any> = {};
    const formData = new FormData(form);
    
    fields.forEach((field) => {
      const fType = String(field.type).toLowerCase();
      if (fType === 'checkbox') {
        answers[field.id] = form.querySelector(`input[name="${field.id}"]`) ? (form.querySelector(`input[name="${field.id}"]`) as HTMLInputElement).checked : false;
      } else {
        answers[field.id] = formData.get(field.id);
      }
    });

    // 2. Client-side dynamic validation using @eventflow/validators
    const validation = validateForm(answers, fields, 'id');
    const errors = validation.errors;

    if (!validation.success) {
      // Display field errors
      Object.keys(errors).forEach((fieldId) => {
        const group = form.querySelector(`.form-group[data-field="${fieldId}"]`) as HTMLElement;
        if (group) {
          group.classList.add('has-error');
          const errorMsg = group.querySelector('.field-error-message') as HTMLElement;
          if (errorMsg) {
            errorMsg.textContent = errors[fieldId];
          }
        }
      });
      return;
    }

    // 3. Submit to backend
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    try {
      const response = await fetch(`${this.apiBase}/events/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed. Please check the fields or try again.');
      }

      // 4. Success State!
      this.displaySuccessState(event);

      // 5. Dynamic Counter update in background!
      const orgSlug = this.getAttribute('org')!;
      this.fetchAndRenderEvents(orgSlug);

    } catch (err: any) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Registration';
      errorSummary.textContent = err.message || 'An unexpected connection error occurred.';
      errorSummary.style.display = 'block';
    }
  }

  private displaySuccessState(event: any) {
    const contentEl = this.shadow.getElementById('modal-content') as HTMLElement;
    const titleEl = this.shadow.getElementById('modal-title') as HTMLElement;
    const subtitleEl = this.shadow.getElementById('modal-subtitle') as HTMLElement;

    titleEl.textContent = 'Success!';
    subtitleEl.textContent = 'Your registration is complete.';

    contentEl.innerHTML = `
      <div class="success-overlay">
        <div class="checkmark-circle">
          <svg viewBox="0 0 52 52">
            <polyline points="14,27 22,35 38,17"></polyline>
          </svg>
        </div>
        <h3 class="success-title">You're Registered!</h3>
        <p class="success-message">
          Awesome! You have successfully secured your spot for <strong>${this.escapeHtml(event.title)}</strong>. 
          A confirmation record has been saved. We look forward to seeing you at ${this.escapeHtml(event.location)}!
        </p>
        <button id="success-close-btn" class="btn-register" style="max-width: 200px;">Close Window</button>
      </div>
    `;

    // Bind Close Button inside Success State
    const modal = this.shadow.getElementById('reg-modal') as HTMLElement;
    const successCloseBtn = this.shadow.getElementById('success-close-btn') as HTMLButtonElement;
    successCloseBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      // Revert back to organization default theme
      if (this.lastLoadedEvent) {
        this.applyThemeForEventOrOrg(this.lastLoadedEvent);
      }
    });
  }

  private deriveThemeVariables(theme: any, mode: 'dark' | 'light'): any {
    // If the theme is legacy or missing, use system defaults
    let baseMode = theme?.baseMode;
    let accentHue = theme?.accentHue;
    let accentChroma = theme?.accentChroma;
    let surfaceTone = theme?.surfaceTone;
    let skinId = theme?.skinId;
    let fontPairingId = theme?.fontPairingId;

    const isLegacy = (accentHue === undefined || accentHue === null);

    if (isLegacy) {
      // Check if theme has legacy cssVariables
      if (theme?.cssVariables) {
        return theme.cssVariables;
      }
      // System defaults fallback
      baseMode = 'dark';
      accentHue = 250;
      accentChroma = 0.18;
      surfaceTone = 'mid';
      skinId = 'frosted';
      fontPairingId = 'inter-inter';
    } else {
      baseMode = baseMode || 'dark';
      accentHue = typeof accentHue === 'number' ? accentHue : 250;
      accentChroma = typeof accentChroma === 'number' ? accentChroma : 0.18;
      surfaceTone = surfaceTone || 'mid';
      skinId = skinId || 'frosted';
      fontPairingId = fontPairingId || 'inter-inter';
    }

    // Standard RGB and HEX conversion helpers
    const hexToRgb = (hex: string) => {
      const cleanHex = hex.replace(/^#/, '');
      const bigint = parseInt(cleanHex, 16);
      return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    };

    const rgbToHex = (r: number, g: number, b: number) => {
      const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
      return '#' + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1);
    };

    const getLuminance = (r: number, g: number, b: number) => {
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const getContrastRatio = (hex1: string, hex2: string) => {
      const rgb1 = hexToRgb(hex1);
      const rgb2 = hexToRgb(hex2);
      const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
      const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };

    const oklchToRgb = (l: number, c: number, h: number) => {
      const hRad = (h * Math.PI) / 180;
      const a = c * Math.cos(hRad);
      const b = c * Math.sin(hRad);
      const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
      const lLinear = l_ * l_ * l_;
      const mLinear = m_ * m_ * m_;
      const sLinear = s_ * s_ * s_;
      const rL = +4.0767416621 * lLinear - 3.3077115913 * mLinear + 0.2309699292 * sLinear;
      const gL = -1.2684380046 * lLinear + 2.6097574011 * mLinear - 0.3413193965 * sLinear;
      const bL = -0.0041960863 * lLinear - 0.7034186142 * mLinear + 1.7076147004 * sLinear;
      const gamma = (val: number) => val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
      return {
        r: Math.max(0, Math.min(255, Math.round(gamma(rL) * 255))),
        g: Math.max(0, Math.min(255, Math.round(gamma(gL) * 255))),
        b: Math.max(0, Math.min(255, Math.round(gamma(bL) * 255)))
      };
    };

    const oklchToHex = (l: number, c: number, h: number) => {
      const rgb = oklchToRgb(l, c, h);
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    };

    // background tone
    let bgL = 0.10, bgC = 0.012;
    if (mode === 'light') {
      bgL = surfaceTone === 'soft' ? 0.98 : surfaceTone === 'mid' ? 0.96 : 0.94;
      bgC = surfaceTone === 'soft' ? 0.005 : surfaceTone === 'mid' ? 0.008 : 0.012;
    } else {
      bgL = surfaceTone === 'deep' ? 0.06 : surfaceTone === 'mid' ? 0.10 : 0.14;
      bgC = surfaceTone === 'deep' ? 0.008 : surfaceTone === 'mid' ? 0.012 : 0.016;
    }
    const bgColor = oklchToHex(bgL, bgC, accentHue);

    // contrast-adjusted accent
    let currentL = mode === 'dark' ? 0.65 : 0.50;
    let primaryColor = oklchToHex(currentL, accentChroma, accentHue);
    let ratio = getContrastRatio(primaryColor, bgColor);
    const bgLuminance = getLuminance(hexToRgb(bgColor).r, hexToRgb(bgColor).g, hexToRgb(bgColor).b);
    const shouldLighten = bgLuminance < 0.5;
    
    let attempts = 0;
    while (ratio < 4.5 && attempts < 50) {
      currentL = shouldLighten ? Math.min(1.0, currentL + 0.02) : Math.max(0.0, currentL - 0.02);
      primaryColor = oklchToHex(currentL, accentChroma, accentHue);
      ratio = getContrastRatio(primaryColor, bgColor);
      attempts++;
    }

    // textColor and cardBg
    let textColor = mode === 'dark' ? oklchToHex(0.98, 0.004, accentHue) : oklchToHex(0.15, 0.012, accentHue);
    let cardBg = mode === 'dark'
      ? (skinId === 'frosted' ? 'rgba(255, 255, 255, 0.045)' : 'rgba(255, 255, 255, 0.025)')
      : (skinId === 'sharp' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.75)');

    return {
      '--primary-color': primaryColor,
      '--primary-contrast-color': shouldLighten ? '#ffffff' : '#0f172a',
      '--bg-color': bgColor,
      '--text-color': textColor,
      '--card-bg': cardBg,
    };
  }

  private applyThemeForEventOrOrg(event: any) {
    // Cascade Hierarchy: Event Override -> Org Default -> Static Constants Fallback
    const theme = event?.theme || this.organization?.defaultTheme;

    let cssVariables;

    if (theme?.slug === 'magic-adaptive') {
      cssVariables = this.harvestHostBranding();
    } else {
      const baseMode = theme?.baseMode || 'dark';
      let mode: 'dark' | 'light' = 'dark';
      if (baseMode === 'light') {
        mode = 'light';
      } else if (baseMode === 'auto' || baseMode === 'adaptive') {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
          mode = 'light';
        }
      }
      cssVariables = this.deriveThemeVariables(theme, mode);
    }

    this.applyThemeStyle(cssVariables);
  }

  private applyThemeStyle(cssVariables: any) {
    const vars = Object.entries(cssVariables || {})
      .map(([name, val]) => `${name}: ${val};`)
      .join('\n');

    let style = this.shadow.querySelector('#widget-theme-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'widget-theme-styles';
      this.shadow.appendChild(style);
    }
    style.textContent = `:host { ${vars} }`;
  }

  private isColorDark(color: string): boolean {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return true;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      // Perceived luminance formula
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
    } catch {
      return true; // Fallback to dark
    }
  }

  private isValidBrandColor(colorStr: string): boolean {
    if (!colorStr) return false;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      ctx.fillStyle = colorStr;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      
      // If transparent, reject
      if (a < 0.1) return false;

      // Reject absolute white / extremely light grays
      if (r > 240 && g > 240 && b > 240) return false;

      // Reject absolute black / extremely dark grays
      if (r < 15 && g < 15 && b < 15) return false;

      // Check if it's too grayscale (r, g, b are almost identical)
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      // If the difference between channel extremes is less than 15, it's grayscale
      if (max - min < 15) return false;

      return true;
    } catch {
      return false;
    }
  }

  private harvestHostBranding(): any {
    let primary = null;
    let bg = null;

    // 1. Try Meta Theme Color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme?.getAttribute('content')) {
      primary = metaTheme.getAttribute('content');
    }

    // 2. Try Host Global CSS Variables
    if (!primary) {
      const styles = window.getComputedStyle(document.documentElement);
      const commonVars = ['--primary', '--primary-color', '--accent', '--brand-color'];
      for (const prop of commonVars) {
        const val = styles.getPropertyValue(prop).trim();
        if (val && (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl'))) {
          primary = val;
          break;
        }
      }
    }

    // 3. Scan host elements for a valid brand color
    if (!primary) {
      // Find buttons, headers, links, and accented tags
      const candidates = document.querySelectorAll('button, [class*="btn"], [class*="button"], h1, h2, a, strong');
      for (const el of Array.from(candidates)) {
        const computedStyles = window.getComputedStyle(el);
        const bgc = computedStyles.backgroundColor;
        const color = computedStyles.color;
        
        // Try background color first
        if (bgc && bgc !== 'transparent' && bgc !== 'rgba(0, 0, 0, 0)') {
          if (this.isValidBrandColor(bgc)) {
            primary = bgc;
            break;
          }
        }
        
        // Fallback to text color
        if (color) {
          if (this.isValidBrandColor(color)) {
            primary = color;
            break;
          }
        }
      }
    }

    // 4. Sample background color traversing up from the widget element itself
    let currentEl: HTMLElement | null = this;
    while (currentEl && currentEl !== document.documentElement) {
      const computedStyles = window.getComputedStyle(currentEl);
      const bgc = computedStyles.backgroundColor;
      if (bgc && bgc !== 'transparent' && bgc !== 'rgba(0, 0, 0, 0)') {
        bg = bgc;
        break;
      }
      currentEl = currentEl.parentElement;
    }

    if (!bg) {
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      if (bodyBg && bodyBg !== 'transparent' && bodyBg !== 'rgba(0, 0, 0, 0)') {
        bg = bodyBg;
      }
    }

    const finalPrimary = primary || '#6366f1';
    const finalBg = bg || '#0d1321';

    const isBgDark = this.isColorDark(finalBg);
    const textColor = isBgDark ? '#f8fafc' : '#0f172a';
    const cardBg = isBgDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)';

    // Compute contrast color for the primary button (must be readable on finalPrimary background)
    const isPrimaryDark = this.isColorDark(finalPrimary);
    const primaryContrastColor = isPrimaryDark ? '#ffffff' : '#0f172a';

    return {
      '--primary-color': finalPrimary,
      '--primary-contrast-color': primaryContrastColor,
      '--bg-color': finalBg,
      '--text-color': textColor,
      '--card-bg': cardBg,
    };
  }
}

// Register the custom element globally!
customElements.define('event-widget', EventWidget);
