import { useState, useEffect } from 'react'
import Header from './components/Header'
import Pedidos from './pages/Pedidos'
import Clientes from './pages/Clientes'
import Produtos from './pages/Produtos'
import Caixa from './pages/Caixa'
import Relatorio from './pages/Relatorio'

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function App() {
  const [tab, setTab] = useState('pedidos')
  const [orders,   setOrders]   = useState(() => load('doisirmaos-orders'))
  const [clients,  setClients]  = useState(() => load('doisirmaos-clients'))
  const [products, setProducts] = useState(() => load('doisirmaos-products'))
  const [toast, setToast] = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => { localStorage.setItem('doisirmaos-orders',   JSON.stringify(orders))   }, [orders])
  useEffect(() => { localStorage.setItem('doisirmaos-clients',  JSON.stringify(clients))  }, [clients])
  useEffect(() => { localStorage.setItem('doisirmaos-products', JSON.stringify(products)) }, [products])

  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const notify = msg => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  /* ---- Orders ---- */
  const addOrder = order => {
    setOrders(p => [...p, { ...order, id: uid('o'), createdAt: new Date().toISOString() }])
    notify('Pedido cadastrado!')
  }
  const toggleOrder = id => {
    setOrders(p => p.map(o => o.id === id ? { ...o, status: o.status === 'delivered' ? 'pending' : 'delivered' } : o))
  }
  const deleteOrder = id => {
    setOrders(p => p.filter(o => o.id !== id))
    notify('Pedido excluído.')
  }

  /* ---- Clients ---- */
  const addClient = data => {
    setClients(p => [...p, { ...data, id: uid('c'), createdAt: new Date().toISOString() }])
    notify('Cliente cadastrado!')
  }
  const editClient = (id, data) => {
    setClients(p => p.map(c => c.id === id ? { ...c, ...data } : c))
    notify('Cliente atualizado.')
  }
  const deleteClient = id => {
    setClients(p => p.filter(c => c.id !== id))
    notify('Cliente removido.')
  }

  /* ---- Products ---- */
  const addProduct = data => {
    setProducts(p => [...p, { ...data, id: uid('p'), createdAt: new Date().toISOString() }])
    notify('Produto cadastrado!')
  }
  const editProduct = (id, data) => {
    setProducts(p => p.map(pr => pr.id === id ? { ...pr, ...data } : pr))
    notify('Produto atualizado.')
  }
  const deleteProduct = id => {
    setProducts(p => p.filter(pr => pr.id !== id))
    notify('Produto removido.')
  }

  /* ---- PWA install ---- */
  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
  }

  const pendingToday = orders.filter(o =>
    o.status === 'pending' && o.callDate === new Date().toISOString().split('T')[0]
  ).length

  const TABS = [
    { key: 'pedidos',   label: '📋 Pedidos',   badge: pendingToday },
    { key: 'clientes',  label: '👤 Clientes',  badge: 0 },
    { key: 'produtos',  label: '🥩 Produtos',  badge: 0 },
    { key: 'caixa',     label: '💰 Caixa',     badge: 0 },
    { key: 'relatorio', label: '📊 Relatório', badge: 0 },
  ]

  return (
    <div className="app">
      <Header showInstall={!!installPrompt} onInstall={handleInstall} />

      <nav className="tab-nav" role="navigation">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span className="tab-label">{t.label}</span>
            {t.badge > 0 && <span className="tab-badge">{t.badge}</span>}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {tab === 'pedidos' && (
          <Pedidos
            orders={orders}
            clients={clients}
            products={products}
            onAdd={addOrder}
            onToggle={toggleOrder}
            onDelete={deleteOrder}
          />
        )}
        {tab === 'clientes' && (
          <Clientes
            clients={clients}
            onAdd={addClient}
            onEdit={editClient}
            onDelete={deleteClient}
          />
        )}
        {tab === 'produtos' && (
          <Produtos
            products={products}
            onAdd={addProduct}
            onEdit={editProduct}
            onDelete={deleteProduct}
          />
        )}
        {tab === 'caixa'     && <Caixa orders={orders} />}
        {tab === 'relatorio' && <Relatorio orders={orders} />}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
