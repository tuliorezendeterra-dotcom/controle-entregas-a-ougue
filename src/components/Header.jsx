import { useState, useEffect } from 'react'

export default function Header({ showInstall, onInstall }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const dateStr = now.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-titles">
          <h1 className="header-title">Açougue Dois Irmãos</h1>
          <p className="header-subtitle">Fundada em 1983 · Controle de Entregas</p>
        </div>
      </div>
      <div className="header-right">
        {showInstall && (
          <button className="install-btn" onClick={onInstall} title="Instalar app no dispositivo">
            📲 Instalar
          </button>
        )}
        <div className="header-datetime">
          <span className="header-date">{dateStr}</span>
          <span className="header-time">{timeStr}</span>
        </div>
      </div>
    </header>
  )
}
