export default function DeletePopup({ onConfirm, onCancel }) {
  return (
    <div className="popup-overlay" onClick={onCancel}>
      <div className="order-popup-box" onClick={(e) => e.stopPropagation()}>
        <h3>Confirm Delete</h3>
        <p>Are you sure?</p>

        <div className="order-popup-actions">
          <button onClick={onConfirm} className="order-popup-delete">
            Yes Delete
          </button>

          <button onClick={onCancel} className="order-popup-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}