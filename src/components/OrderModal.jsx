import { useState } from 'react'

const UNITS = ['kg', 'g', 'un', 'pc', 'maço', 'dz', 'l', 'ml']
const BRL = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

const blankItem = () => ({ product: '', quantity: '', unit: 'kg', unitValue: '', totalValue: 0 })

function phoneMask(v) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  return v
}

export default function OrderModal({ onClose, onSave }) {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  const [form, setForm] = useState({
    clientName: '', phone: '', callDate: todayStr, callTime: timeStr, address: ''
  })
  const [items, setItems] = useState([blankItem()])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const updateItem = (idx, field, val) => {
    setItems(prev => {
      const next = prev.map((it, i) => i !== idx ? it : { ...it, [field]: val })
      const it = next[idx]
      const qty = parseFloat(field === 'quantity' ? val : it.quantity) || 0
      const uv = parseFloat(field === 'unitValue' ? val : it.unitValue) || 0
      next[idx] = { ...it, totalValue: qty * uv }
      return next
    })
  }

  const addItem = () => setItems(p => [...p, blankItem()])
  const removeItem = idx => setItems(p => p.filter((_, i) => i !== idx))

  const totalValue = items.reduce((s, it) => s + (it.totalValue || 0), 0)

  const validate = () => {
    const e = {}
    if (!form.clientName.trim()) e.clientName = 'Nome obrigatório'
    if (!form.address.trim()) e.address = 'Endereço obrigatório'
    if (!items.some(it => it.product.trim())) e.items = 'Adicione ao menos um item'
    return e
  }

  const handleSubmit = e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    onSave({ ...form, items: items.filter(it => it.product.trim()), totalValue })
  }

  return (
    <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <h2>Novo Pedido</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="order-form" noValidate>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Nome do Cliente <span className="req">*</span></label>
              <input
                type="text"
                value={form.clientName}
                onChange={e => setF('clientName', e.target.value)}
                placeholder="Ex: João Silva"
                autoFocus
              />
              {errors.clientName && <span className="field-error">{errors.clientName}</span>}
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setF('phone', phoneMask(e.target.value))}
                placeholder="(00) 00000-0000"
                inputMode="numeric"
              />
            </div>

            <div className="form-group">
              <label>Data da Ligação</label>
              <input
                type="date"
                value={form.callDate}
                onChange={e => setF('callDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Horário da Ligação</label>
              <input
                type="time"
                value={form.callTime}
                onChange={e => setF('callTime', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Endereço de Entrega <span className="req">*</span></label>
            <input
              type="text"
              value={form.address}
              onChange={e => setF('address', e.target.value)}
              placeholder="Rua, número, bairro, complemento"
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <div className="items-section">
            <div className="items-section-head">
              <label>Itens do Pedido <span className="req">*</span></label>
              <button type="button" className="add-item-btn" onClick={addItem}>+ Item</button>
            </div>
            {errors.items && <span className="field-error">{errors.items}</span>}

            <div className="items-head-row">
              <span>Produto</span>
              <span>Qtd</span>
              <span>Un.</span>
              <span>R$ Unit.</span>
              <span>Total</span>
              <span></span>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="item-row">
                <input
                  type="text"
                  placeholder="Produto"
                  value={item.product}
                  onChange={e => updateItem(idx, 'product', e.target.value)}
                  className="item-product"
                />
                <input
                  type="number"
                  placeholder="0"
                  value={item.quantity}
                  onChange={e => updateItem(idx, 'quantity', e.target.value)}
                  className="item-qty"
                  min="0"
                  step="0.001"
                  inputMode="decimal"
                />
                <select
                  value={item.unit}
                  onChange={e => updateItem(idx, 'unit', e.target.value)}
                  className="item-unit"
                >
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
                <input
                  type="number"
                  placeholder="0,00"
                  value={item.unitValue}
                  onChange={e => updateItem(idx, 'unitValue', e.target.value)}
                  className="item-uv"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                />
                <span className="item-total-val">{BRL(item.totalValue)}</span>
                <button
                  type="button"
                  className="remove-item-btn"
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                  title="Remover item"
                >✕</button>
              </div>
            ))}

            <div className="items-footer">
              <strong>Total do Pedido: {BRL(totalValue)}</strong>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Salvando…' : '✓ Salvar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
