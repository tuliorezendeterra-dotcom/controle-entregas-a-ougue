import { useMemo } from 'react'

const BRL = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtDate = s => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}` }

function weekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function StatCard({ title, icon, data, accent }) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-card-title">
        <span className="stat-icon">{icon}</span>
        <span>{title}</span>
      </div>
      <div className="stat-card-total">{BRL(data.total)}</div>
      <div className="stat-card-rows">
        <div className="stat-row">
          <span>Pedidos</span>
          <strong>{data.count}</strong>
        </div>
        <div className="stat-row delivered-row">
          <span>✓ Entregues</span>
          <strong className="green-val">{data.delivered}</strong>
        </div>
        <div className="stat-row pending-row">
          <span>⏳ Pendentes</span>
          <strong className="red-val">{data.pending}</strong>
        </div>
        {data.count > 0 && (
          <div className="stat-progress">
            <div
              className="stat-progress-bar"
              style={{ width: `${Math.round((data.delivered / data.count) * 100)}%` }}
            />
          </div>
        )}
        {data.count > 0 && (
          <div className="stat-pct">
            {Math.round((data.delivered / data.count) * 100)}% entregue
          </div>
        )}
      </div>
    </div>
  )
}

export default function Caixa({ orders }) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const ws = weekStart(now)
  const ms = monthStart(now)

  const stats = useMemo(() => {
    const calc = list => ({
      total: list.reduce((s, o) => s + (o.totalValue || 0), 0),
      count: list.length,
      delivered: list.filter(o => o.status === 'delivered').length,
      pending: list.filter(o => o.status === 'pending').length,
    })

    const todayOrders = orders.filter(o => o.callDate === today)
    const weekOrders = orders.filter(o => new Date(o.callDate + 'T00:00:00') >= ws)
    const monthOrders = orders.filter(o => new Date(o.callDate + 'T00:00:00') >= ms)

    return { today: calc(todayOrders), week: calc(weekOrders), month: calc(monthOrders) }
  }, [orders, today, ws, ms])

  const todayOrders = orders
    .filter(o => o.callDate === today)
    .sort((a, b) => b.callTime.localeCompare(a.callTime))

  return (
    <div className="page caixa-page">
      <h2 className="page-title">Gestão de Caixa</h2>

      <div className="stats-grid">
        <StatCard title="Hoje" icon="📅" data={stats.today} accent="today" />
        <StatCard title="Esta Semana" icon="📆" data={stats.week} accent="week" />
        <StatCard title="Este Mês" icon="🗓" data={stats.month} accent="month" />
      </div>

      <div className="today-orders-section">
        <h3 className="section-title">Pedidos de Hoje</h3>
        {todayOrders.length === 0 ? (
          <p className="no-orders-msg">Nenhum pedido registrado hoje.</p>
        ) : (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Cliente</th>
                  <th>Endereço</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayOrders.map(o => (
                  <tr key={o.id} className={`trow-${o.status}`}>
                    <td className="td-time">{o.callTime}</td>
                    <td className="td-client">
                      <strong>{o.clientName}</strong>
                      {o.phone && <span className="td-phone">{o.phone}</span>}
                    </td>
                    <td className="td-addr">{o.address}</td>
                    <td className="td-val">{BRL(o.totalValue)}</td>
                    <td>
                      <span className={`status-badge ${o.status}`}>
                        {o.status === 'delivered' ? '✓ Entregue' : '⏳ Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="tfoot-total">
                  <td colSpan={3}><strong>Total</strong></td>
                  <td colSpan={2}><strong>{BRL(todayOrders.reduce((s, o) => s + (o.totalValue || 0), 0))}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
