import { useState, useEffect } from 'react'
import Header from './components/Header'
import Pedidos from './pages/Pedidos'
import Caixa from './pages/Caixa'
import Relatorio from './pages/Relatorio'

function loadOrders() {
  try {
    const saved = localStorage.getItem('doisirmaos-orders')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export default function App() {
  const [tab, setTab] = useState('pedidos')
  const [orders, setOrders] = useState(loadOrders)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem('doisirmaos-orders', JSON.stringify(orders))
  }, [orders])

  const showToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  const handleAdd = order => {
    setOrders(prev => [
      ...prev,
      { ...order, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString() }
    ])
    showToast('Pedido cadastrado com sucesso!')
  }

  const handleToggle = id => {
    setOrders(prev => prev.map(o =>
      o.id === id ? { ...o, status: o.status === 'delivered' ? 'pending' : 'delivered' } : o
    ))
  }

  const handleDelete = id => {
    setOrders(prev => prev.filter(o => o.id !== id))
    showToast('Pedido excluído.')
  }

  const TABS = [
    { key: 'pedidos', label: '📋 Pedidos', badge: orders.filter(o => o.status === 'pending' && o.callDate === new Date().toISOString().split('T')[0]).length },
    { key: 'caixa',   label: '💰 Caixa',   badge: 0 },
    { key: 'relatorio', label: '📊 Relatório', badge: 0 },
  ]

  return (
    <div className="app">
      <Header />

      <nav className="tab-nav" role="navigation">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.badge > 0 && <span className="tab-badge">{t.badge}</span>}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {tab === 'pedidos' && (
          <Pedidos orders={orders} onAdd={handleAdd} onToggle={handleToggle} onDelete={handleDelete} />
        )}
        {tab === 'caixa' && <Caixa orders={orders} />}
        {tab === 'relatorio' && <Relatorio orders={orders} />}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
