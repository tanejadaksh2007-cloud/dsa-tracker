import Modal from './Modal';

// Syllabus (Lectures 61-66) & Feature 3: Reusable Confirmation Dialog
export default function ConfirmDialog({
  isOpen,
  title = 'Please Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = true,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      footer={
        <div className="modal-actions">
          <button
            type="button"
            className="qa-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={isDanger ? 'danger-btn' : 'primary-btn'}
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <p className="modal-text">{message}</p>
    </Modal>
  );
}
