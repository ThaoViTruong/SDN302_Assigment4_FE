function FeedbackModal({
  title,
  message,
  buttonLabel = "Close",
  variant = "success",
  onClose,
}) {
  return (
    <div className="modal fade show d-block modal-backdrop-custom" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className={`modal-title text-${variant}`}>{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-danger" onClick={onClose}>
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;
