import { useState, useMemo } from 'react'

const PHONE_MASK = v => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  return v
}

const blank = () => ({ name: '', phone: '', address: '' })

function ClientForm({ initial = blank(), onSave, onCancel, submitLabel = 'Salvar' }) {
  const [form, setForm] = useState(initial)
  const [err, setErr] = useState({})

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = e => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nome obrigatório'
    if (Object.keys(errs).length) { setErr(errs); return }
    onSave(form)
  }

  return (
    <form className="inline-form" onSubmit={submit} noValidate>
      <div className="inline-form-grid">
        <div className="form-group">
          <label>Nome <span className="req">*</span></label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Nome completo"
            autoFocus
          />
          {err.name && <span className="field-error">{err.name}</span>}
        </div>
        <div className="form-group">
          <label>Telefone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => set('phone', PHONE_MASK(e.target.value))}
            placeholder="(00) 00000-0000"
            inputMode="numeric"
          />
        </div>
        <div className="form-group inline-form-full">
          <label>Endereço</label>
          <input
            type="text"
            value={form.address}
            onChange={e => set('address', e.target.value)}
            placeholder="Rua, número, bairro"
          />
        </div>
      </div>
      <div className="inline-form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-save">{submitLabel}</button>
      </div>
    </form>
  )
}

export default function Clientes({ clients, onAdd, onEdit, onDelete }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [askDelete, setAskDelete] = useState(null)

  const filtered = useMemo(() =>
    clients.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    ).sort((a, b) => a.name.localeCompare(b.name, 'pt'))
  , [clients, search])

  return (
    <div className="page clientes-page">
      <div className="page-top-bar">
        <h2 className="page-title">👤 Clientes</h2>
        <button
          className="btn-add-primary"
          onClick={() => { setShowAdd(v => !v); setEditingId(null) }}
        >
          {showAdd ? '✕ Cancelar' : '+ Novo Cliente'}
        </button>
      </div>

      {showAdd && (
        <div className="inline-form-wrap">
          <ClientForm
            onSave={data => { onAdd(data); setShowAdd(false) }}
            onCancel={() => setShowAdd(false)}
            submitLabel="✓ Cadastrar Cliente"
          />
        </div>
      )}

      <div className="list-search-bar">
        <input
          type="search"
          className="search-input"
          placeholder="🔍 Buscar por nome ou telefone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="list-count">{filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p>{search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}</p>
          {!search && (
            <button className="btn-add-order-empty" onClick={() => setShowAdd(true)}>
              + Cadastrar primeiro cliente
            </button>
          )}
        </div>
      ) : (
        <div className="clients-list">
          {filtered.map(client => (
            <div key={client.id} className={`client-card ${editingId === client.id ? 'editing' : ''}`}>
              {editingId === client.id ? (
                <ClientForm
                  initial={{ name: client.name, phone: client.phone, address: client.address }}
                  onSave={data => { onEdit(client.id, data); setEditingId(null) }}
                  onCancel={() => setEditingId(null)}
                  submitLabel="✓ Salvar Alterações"
                />
              ) : (
                <>
                  <div className="client-info">
                    <span className="client-name-big">{client.name}</span>
                    <div className="client-details">
                      {client.phone && (
                        <a href={`tel:${client.phone}`} className="client-phone">📞 {client.phone}</a>
                      )}
                      {client.address && (
                        <span className="client-address">📍 {client.address}</span>
                      )}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn-edit"
                      onClick={() => { setEditingId(client.id); setShowAdd(false) }}
                    >✏️ Editar</button>
                    {askDelete === client.id ? (
                      <div className="delete-confirm">
                        <button className="btn-confirm-yes" onClick={() => { onDelete(client.id); setAskDelete(null) }}>Excluir</button>
                        <button className="btn-confirm-no" onClick={() => setAskDelete(null)}>Cancelar</button>
                      </div>
                    ) : (
                      <button className="delete-btn" onClick={() => setAskDelete(client.id)}>🗑</button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
