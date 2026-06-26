import { useState, useEffect } from 'react'

export default function Header() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = now.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-wrap">
          <img
            src="./logo.png"
            alt="Logo"
            className="logo-img"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
          <div className="logo-icon-fallback">🥩</div>
        </div>
        <div className="header-titles">
          <h1 className="header-title">Casa de Carnes Dois Irmãos</h1>
          <p className="header-subtitle">Fundada em 1983 · Controle de Entregas</p>
        </div>
      </div>
      <div className="header-datetime">
        <span className="header-date">{dateStr}</span>
        <span className="header-time">{timeStr}</span>
      </div>
    </header>
  )
}
