export default function Money({ visibleActions, actionHandlers }) {
  return (
    <div className="invest-panel">
      <div className="invest-actions">
        {visibleActions.map(action => (
          <div key={action.id}>
            <h4>{action.group}</h4>
            <button onClick={actionHandlers[action.id]}>{action.label}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
