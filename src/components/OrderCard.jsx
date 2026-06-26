import { useState } from 'react'

const BRL = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtDate = s => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}` }

export default function OrderCard({ order, onToggle, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [askDelete, setAskDelete] = useState(false)

  const delivered = order.status === 'delivered'

  return (
    <div className={`order-card ${delivered ? 'delivered' : 'pending'}`}>
      <div className="order-card-header" onClick={() => setExpanded(v => !v)}>
        <div className="order-status-bar" />
        <div className="order-info">
          <span className="order-client">{order.clientName}</span>
          <span className="order-meta">
            {order.callTime} · {fmtDate(order.callDate)}
            {order.phone && <> · <a href={`tel:${order.phone}`} onClick={e => e.stopPropagation()}>{order.phone}</a></>}
          </span>
        </div>
        <div className="order-right">
          <span className="order-total-val">{BRL(order.totalValue)}</span>
          <span className={`status-badge ${delivered ? 'delivered' : 'pending'}`}>
            {delivered ? 'Entregue' : 'Pendente'}
          </span>
          <span className="expand-caret">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="order-details">
          <p className="detail-row"><strong>Endereço:</strong> {order.address || '—'}</p>
          {order.items && order.items.length > 0 && (
            <div className="items-table-wrap">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.product}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{BRL(item.unitValue)}</td>
                      <td>{BRL(item.totalValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="order-grand-total"><strong>Total: {BRL(order.totalValue)}</strong></p>
        </div>
      )}

      <div className="order-actions">
        <button
          className={`toggle-status-btn ${delivered ? 'undo' : 'deliver'}`}
          onClick={() => onToggle(order.id)}
        >
          {delivered ? '↩ Marcar Pendente' : '✓ Marcar Entregue'}
        </button>
        {askDelete ? (
          <div className="delete-confirm">
            <button className="btn-confirm-yes" onClick={() => onDelete(order.id)}>Excluir</button>
            <button className="btn-confirm-no" onClick={() => setAskDelete(false)}>Cancelar</button>
          </div>
        ) : (
          <button className="delete-btn" onClick={() => setAskDelete(true)} title="Excluir pedido">🗑</button>
        )}
      </div>
    </div>
  )
}
