export default function Lightbox({ open, src, caption, onClose }) {
  return (
    <div
      className={`lightbox-backdrop${open ? ' is-open' : ''}`}
      id="lightboxBackdrop"
      role="dialog"
      aria-modal="true"
      aria-label="High-resolution Preview"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="lightbox-content">
        <button type="button" className="lightbox-close" id="lightboxCloseBtn" aria-label="Close image preview" onClick={onClose}>
          &times;
        </button>
        <img src={open ? src : undefined} alt="Project Preview" className="lightbox-img" id="lightboxImg" />
        <div className="lightbox-caption" id="lightboxCaption">{caption}</div>
      </div>
    </div>
  )
}