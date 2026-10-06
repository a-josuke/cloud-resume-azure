import { MODALS } from '../data/modals.jsx'

// The popup stays in the page and only gets the "is-open" class, so your CSS fade
// animation still works. "modalKey" is which content to show, "openId" changes on
// every open so the content (for example the project filter) starts fresh.
export default function Modal({ modalKey, isOpen, openId, onClose, openLightbox }) {
  const data = modalKey ? MODALS[modalKey] : null
  const Body = data ? data.Body : null

  return (
    <div
      className={`modal-backdrop${isOpen ? ' is-open' : ''}`}
      id="modalBackdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`modal-container modal-${modalKey ?? ''}`} id="modalContainer">
        <button type="button" className="modal-close-btn" id="modalCloseBtn" aria-label="Close dialog" onClick={onClose}>
          &times;
        </button>
        <div className="modal-header">
          <span className="modal-subtitle" id="modalSubtitle">{data ? data.subtitle : 'Details'}</span>
          <h3 className="modal-title" id="modalTitle">{data ? data.title : 'Information'}</h3>
        </div>
        <div className="modal-body" id="modalBody">
          {Body && <Body key={openId} openLightbox={openLightbox} />}
        </div>
      </div>
    </div>
  )
}