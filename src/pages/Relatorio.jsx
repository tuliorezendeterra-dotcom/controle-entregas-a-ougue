import { useState, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const BRL = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

function weekBounds(offset) {
  const now = new Date()
  now.setDate(now.getDate() + offset * 7)
  const day = now.getDay()
  const start = new Date(now)
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1))
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

const CHART_COLORS = [
  '#C0392B','#E74C3C','#D4A017','#F4D03F',
  '#1A1A2E','#2C3E50','#2980B9','#1ABC9C','#8E44AD','#27AE60'
]

export default function Relatorio({ orders }) {
  const [offset, setOffset] = useState(0)
  const [chartType, setChartType] = useState('bar')
  const [metric, setMetric] = useState('revenue')

  const { start, end } = useMemo(() => weekBounds(offset), [offset])

  const weekOrders = useMemo(
    () => orders.filter(o => {
      const d = new Date(o.callDate + 'T00:00:00')
      return d >= start && d <= end
    }),
    [orders, start, end]
  )

  const productStats = useMemo(() => {
    const map = {}
    weekOrders.forEach(order => {
      ;(order.items || []).forEach(item => {
        if (!item.product?.trim()) return
        if (!map[item.product]) map[item.product] = { quantity: 0, revenue: 0, orders: 0 }
        map[item.product].quantity += parseFloat(item.quantity) || 0
        map[item.product].revenue += parseFloat(item.totalValue) || 0
        map[item.product].orders += 1
      })
    })
    return Object.entries(map)
      .map(([product, d]) => ({ product, ...d }))
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, 10)
  }, [weekOrders, metric])

  const labels = productStats.map(p => p.product)
  const dataVals = productStats.map(p => metric === 'revenue' ? p.revenue : p.quantity)
  const metricLabel = metric === 'revenue' ? 'Receita (R$)' : 'Quantidade'

  const barData = {
    labels,
    datasets: [{
      label: metricLabel,
      data: dataVals,
      backgroundColor: CHART_COLORS.map(c => c + 'CC'),
      borderColor: CHART_COLORS,
      borderWidth: 1,
      borderRadius: 4,
    }]
  }

  const pieData = {
    labels,
    datasets: [{
      data: dataVals,
      backgroundColor: CHART_COLORS,
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => metric === 'revenue'
            ? BRL(ctx.parsed.y)
            : `${ctx.parsed.y.toFixed(2)} (qtd)`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: v => metric === 'revenue' ? `R$ ${Number(v).toFixed(0)}` : v
        }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: ctx => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
            const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0
            return ` ${ctx.label}: ${metric === 'revenue' ? BRL(ctx.parsed) : ctx.parsed.toFixed(2)} (${pct}%)`
          }
        }
      }
    }
  }

  const totalRevenue = weekOrders.reduce((s, o) => s + (o.totalValue || 0), 0)
  const fmtDay = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

  return (
    <div className="page relatorio-page">
      <div className="relatorio-header">
        <h2 className="page-title">Relatório Semanal</h2>
        <div className="week-nav">
          <button className="week-btn" onClick={() => setOffset(v => v - 1)}>← Anterior</button>
          <span className="week-range">{fmtDay(start)} – {fmtDay(end)}</span>
          <button
            className="week-btn"
            onClick={() => setOffset(v => v + 1)}
            disabled={offset >= 0}
          >Próxima →</button>
        </div>
      </div>

      <div className="report-kpis">
        <div className="kpi-card">
          <span className="kpi-val">{weekOrders.length}</span>
          <span className="kpi-lbl">Pedidos</span>
        </div>
        <div className="kpi-card kpi-revenue">
          <span className="kpi-val">{BRL(totalRevenue)}</span>
          <span className="kpi-lbl">Receita</span>
        </div>
        <div className="kpi-card kpi-delivered">
          <span className="kpi-val">{weekOrders.filter(o => o.status === 'delivered').length}</span>
          <span className="kpi-lbl">Entregues</span>
        </div>
        <div className="kpi-card kpi-pending">
          <span className="kpi-val">{weekOrders.filter(o => o.status === 'pending').length}</span>
          <span className="kpi-lbl">Pendentes</span>
        </div>
      </div>

      {productStats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>Nenhum dado para esta semana</p>
        </div>
      ) : (
        <>
          <div className="chart-controls">
            <div className="chart-toggle-group">
              <span className="ctrl-label">Gráfico:</span>
              <button className={`chart-toggle ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')}>📊 Barras</button>
              <button className={`chart-toggle ${chartType === 'pie' ? 'active' : ''}`} onClick={() => setChartType('pie')}>🥧 Pizza</button>
            </div>
            <div className="chart-toggle-group">
              <span className="ctrl-label">Métrica:</span>
              <button className={`chart-toggle ${metric === 'revenue' ? 'active' : ''}`} onClick={() => setMetric('revenue')}>R$ Receita</button>
              <button className={`chart-toggle ${metric === 'quantity' ? 'active' : ''}`} onClick={() => setMetric('quantity')}>Quantidade</button>
            </div>
          </div>

          <div className="chart-box">
            {chartType === 'bar'
              ? <Bar data={barData} options={barOptions} />
              : <Pie data={pieData} options={pieOptions} />
            }
          </div>

          <div className="ranking-section">
            <h3 className="section-title">🏆 Ranking de Produtos</h3>
            <div className="ranking-table-wrap">
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Receita</th>
                    <th>Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  {productStats.map((p, i) => (
                    <tr key={p.product} className={i === 0 ? 'rank-first' : i === 1 ? 'rank-second' : i === 2 ? 'rank-third' : ''}>
                      <td className="rank-pos">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </td>
                      <td className="rank-product">{p.product}</td>
                      <td>{p.quantity.toFixed(2)}</td>
                      <td className="rank-revenue">{BRL(p.revenue)}</td>
                      <td>{p.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
