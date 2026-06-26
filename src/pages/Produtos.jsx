import { useState, useMemo } from 'react'

const UNITS = ['kg', 'g', 'un', 'pc', 'maço', 'dz', 'l', 'ml', 'cx']
const BRL = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

const blank = () => ({ code: '', name: '', unit: 'kg', unitValue: '' })

function ProductForm({ initial = blank(), onSave, onCancel, submitLabel = 'Salvar' }) {
  const [form, setForm] = useState(initial)
  const [err, setErr] = useState({})

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = e => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nome obrigatório'
    if (!form.unitValue || isNaN(parseFloat(form.unitValue))) errs.unitValue = 'Valor inválido'
    if (Object.keys(errs).length) { setErr(errs); return }
    onSave({ ...form, unitValue: parseFloat(form.unitValue) })
  }

  return (
    <form className="inline-form" onSubmit={submit} noValidate>
      <div className="inline-form-grid product-form-grid">
        <div className="form-group">
          <label>Código</label>
          <input
            type="text"
            value={form.code}
            onChange={e => set('code', e.target.value.toUpperCase())}
            placeholder="Ex: 001"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label>Nome do Produto <span className="req">*</span></label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ex: Picanha, Fraldinha…"
          />
          {err.name && <span className="field-error">{err.name}</span>}
        </div>
        <div className="form-group">
          <label>Unidade</label>
          <select value={form.unit} onChange={e => set('unit', e.target.value)}>
            {UNITS.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Valor Unitário <span className="req">*</span></label>
          <input
            type="number"
            value={form.unitValue}
            onChange={e => set('unitValue', e.target.value)}
            placeholder="0,00"
            min="0"
            step="0.01"
            inputMode="decimal"
          />
          {err.unitValue && <span className="field-error">{err.unitValue}</span>}
        </div>
      </div>
      <div className="inline-form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-save">{submitLabel}</button>
      </div>
    </form>
  )
}

export default function Produtos({ products, onAdd, onEdit, onDelete }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [askDelete, setAskDelete] = useState(null)

  const filtered = useMemo(() =>
    products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => a.name.localeCompare(b.name, 'pt'))
  , [products, search])

  return (
    <div className="page produtos-page">
      <div className="page-top-bar">
        <h2 className="page-title">🥩 Produtos</h2>
        <button
          className="btn-add-primary"
          onClick={() => { setShowAdd(v => !v); setEditingId(null) }}
        >
          {showAdd ? '✕ Cancelar' : '+ Novo Produto'}
        </button>
      </div>

      {showAdd && (
        <div className="inline-form-wrap">
          <ProductForm
            onSave={data => { onAdd(data); setShowAdd(false) }}
            onCancel={() => setShowAdd(false)}
            submitLabel="✓ Cadastrar Produto"
          />
        </div>
      )}

      <div className="list-search-bar">
        <input
          type="search"
          className="search-input"
          placeholder="🔍 Buscar por código ou nome…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="list-count">{filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🥩</div>
          <p>{search ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado ainda'}</p>
          {!search && (
            <button className="btn-add-order-empty" onClick={() => setShowAdd(true)}>
              + Cadastrar primeiro produto
            </button>
          )}
        </div>
      ) : (
        <div className="products-table-wrap">
          <table className="products-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Produto</th>
                <th>Unidade</th>
                <th>Preço Unit.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                editingId === product.id ? (
                  <tr key={product.id} className="edit-row">
                    <td colSpan={5} style={{ padding: 0 }}>
                      <ProductForm
                        initial={{ code: product.code, name: product.name, unit: product.unit, unitValue: String(product.unitValue) }}
                        onSave={data => { onEdit(product.id, data); setEditingId(null) }}
                        onCancel={() => setEditingId(null)}
                        submitLabel="✓ Salvar"
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={product.id} className="product-row">
                    <td className="td-code">{product.code || '—'}</td>
                    <td className="td-product-name">{product.name}</td>
                    <td className="td-unit">{product.unit}</td>
                    <td className="td-price">{BRL(product.unitValue)}</td>
                    <td className="td-actions">
                      <button
                        className="btn-edit"
                        onClick={() => { setEditingId(product.id); setShowAdd(false) }}
                      >✏️</button>
                      {askDelete === product.id ? (
                        <div className="delete-confirm">
                          <button className="btn-confirm-yes" onClick={() => { onDelete(product.id); setAskDelete(null) }}>✓</button>
                          <button className="btn-confirm-no" onClick={() => setAskDelete(null)}>✕</button>
                        </div>
                      ) : (
                        <button className="delete-btn" onClick={() => setAskDelete(product.id)}>🗑</button>
                      )}
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
