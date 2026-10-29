export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="error-state">
      <div className="error-state-icon">⚠️</div>
      <h3>Error</h3>
      <p>{message}</p>
      {onRetry && <button className="btn btn-secondary" onClick={onRetry}>Try Again</button>}
    </div>
  );
}
