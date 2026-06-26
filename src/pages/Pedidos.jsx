import { useState, useMemo } from 'react'
import OrderCard from '../components/OrderCard'
import OrderModal from '../components/OrderModal'

export default function Pedidos({ orders, clients = [], products = [], onAdd, onToggle, onDelete }) {
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('today')
  const [search, setSearch] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const filtered = useMemo(() => {
    return orders
      .filter(o => dateFilter === 'all' || o.callDate === today)
      .filter(o => statusFilter === 'all' || o.status === statusFilter)
      .filter(o => o.clientName.toLowerCase().includes(search.toLowerCase().trim()))
      .sort((a, b) => {
        const dc = b.callDate.localeCompare(a.callDate)
        return dc !== 0 ? dc : a.callTime.localeCompare(b.callTime)
      })
  }, [orders, statusFilter, dateFilter, search, today])

  const pendingCount   = filtered.filter(o => o.status === 'pending').length
  const deliveredCount = filtered.filter(o => o.status === 'delivered').length
  const totalVal = filtered.reduce((s, o) => s + (o.totalValue || 0), 0)
  const BRL = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div className="page pedidos-page">
      <div className="page-toolbar">
        <div className="toolbar-top">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="search"
              className="search-input"
              placeholder="Buscar cliente…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-add-order" onClick={() => setShowModal(true)}>
            + Novo Pedido
          </button>
        </div>

        <div className="toolbar-filters">
          <div className="filter-group">
            <span className="filter-label">Período:</span>
            <button className={`filter-chip ${dateFilter === 'today' ? 'active' : ''}`} onClick={() => setDateFilter('today')}>Hoje</button>
            <button className={`filter-chip ${dateFilter === 'all'   ? 'active' : ''}`} onClick={() => setDateFilter('all')}>Todos</button>
          </div>
          <div className="filter-group">
            <span className="filter-label">Status:</span>
            <button className={`filter-chip ${statusFilter === 'all'       ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>Todos</button>
            <button className={`filter-chip pending-chip   ${statusFilter === 'pending'   ? 'active' : ''}`} onClick={() => setStatusFilter('pending')}>🔴 Pendentes</button>
            <button className={`filter-chip delivered-chip ${statusFilter === 'delivered' ? 'active' : ''}`} onClick={() => setStatusFilter('delivered')}>🟢 Entregues</button>
          </div>
        </div>

        <div className="summary-bar">
          <div className="summary-item">
            <span className="summary-num">{filtered.length}</span>
            <span className="summary-lbl">pedidos</span>
          </div>
          <div className="summary-item pending-item">
            <span className="summary-num">{pendingCount}</span>
            <span className="summary-lbl">pendentes</span>
          </div>
          <div className="summary-item delivered-item">
            <span className="summary-num">{deliveredCount}</span>
            <span className="summary-lbl">entregues</span>
          </div>
          <div className="summary-item total-item">
            <span className="summary-num">{BRL(totalVal)}</span>
            <span className="summary-lbl">total</span>
          </div>
        </div>
      </div>

      <div className="orders-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>Nenhum pedido encontrado</p>
            <button className="btn-add-order-empty" onClick={() => setShowModal(true)}>
              + Cadastrar primeiro pedido
            </button>
          </div>
        ) : (
          filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {showModal && (
        <OrderModal
          clients={clients}
          products={products}
          onClose={() => setShowModal(false)}
          onSave={order => { onAdd(order); setShowModal(false) }}
        />
      )}
    </div>
  )
}
