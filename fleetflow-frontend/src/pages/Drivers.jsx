import { useEffect, useState } from 'react'
import { Plus, Pencil, AlertTriangle } from 'lucide-react'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import InputField, { SelectField } from '../components/InputField'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const EMPTY = { name: '', licenseNumber: '', licenseExpiry: '', safetyScore: 100, status: 'ON_DUTY' }
const DRIVER_STATUSES = [
  { value: 'ON_DUTY', label: 'Em Serviço' },
  { value: 'OFF_DUTY', label: 'Fora de Serviço' },
  { value: 'SUSPENDED', label: 'Suspenso' },
]

function isExpiringSoon(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = (d - now) / (1000 * 60 * 60 * 24)
  return diff < 30
}

function isExpired(date) {
  return new Date(date) < new Date()
}

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, mode: 'add', driver: null })

  const load = () => {
    setLoading(true)
    api.get('/drivers').then(r => setDrivers(r.data.data.drivers)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openAdd = () => setModal({ open: true, mode: 'add', driver: null })
  const openEdit = (d) => setModal({ open: true, mode: 'edit', driver: d })
  const closeModal = () => setModal({ open: false, mode: 'add', driver: null })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{drivers.length} motorista(s) no total</p>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Novo Motorista
        </button>
      </div>

      {loading ? <LoadingSpinner text="Carregando motoristas..." /> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Nome', 'Nº CNH', 'Validade CNH', 'Score de Segurança', 'Status', 'Ações'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {drivers.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-500 py-10">Nenhum motorista encontrado</td></tr>
              ) : drivers.map(d => {
                const expired = isExpired(d.licenseExpiry)
                const expiring = !expired && isExpiringSoon(d.licenseExpiry)
                return (
                  <tr key={d.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 font-medium text-white">{d.name}</td>
                    <td className="p-4 text-gray-400 font-mono text-xs">{d.licenseNumber}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={expired ? 'text-red-400' : expiring ? 'text-amber-400' : 'text-gray-400'}>
                          {new Date(d.licenseExpiry).toLocaleDateString('pt-BR')}
                        </span>
                        {(expired || expiring) && (
                          <span title={expired ? 'CNH vencida!' : 'CNH vencendo em breve'}>
                            <AlertTriangle size={13} className={expired ? 'text-red-400' : 'text-amber-400'} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full w-16">
                          <div className={`h-full rounded-full ${d.safetyScore >= 80 ? 'bg-emerald-500' : d.safetyScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${d.safetyScore}%` }} />
                        </div>
                        <span className="text-gray-400 text-xs">{d.safetyScore}</span>
                      </div>
                    </td>
                    <td className="p-4"><StatusBadge status={d.status} /></td>
                    <td className="p-4">
                      <button onClick={() => openEdit(d)} title="Editar" className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <DriverModal isOpen={modal.open} onClose={closeModal} mode={modal.mode} driver={modal.driver} onSave={() => { closeModal(); load() }} />
    </div>
  )
}

function DriverModal({ isOpen, onClose, mode, driver, onSave }) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (driver && mode === 'edit') {
      setForm({ name: driver.name, licenseNumber: driver.licenseNumber, licenseExpiry: driver.licenseExpiry?.split('T')[0], safetyScore: driver.safetyScore, status: driver.status })
    } else { setForm(EMPTY) }
  }, [driver, mode, isOpen])

  const handle = async (e) => {
    e.preventDefault(); setLoading(true)
    const payload = { ...form, safetyScore: +form.safetyScore }
    try {
      if (mode === 'add') { await api.post('/drivers', payload); toast.success('Motorista cadastrado com sucesso!') }
      else { await api.patch(`/drivers/${driver.id}`, payload); toast.success('Motorista atualizado com sucesso!') }
      onSave()
    } catch (err) { toast.error(err.response?.data?.message || 'Falha ao salvar motorista') }
    finally { setLoading(false) }
  }

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? 'Novo Motorista' : 'Editar Motorista'}>
      <form onSubmit={handle} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Nome Completo" value={form.name} onChange={set('name')} required placeholder="Carlos Eduardo" />
          <InputField label="Número da CNH" value={form.licenseNumber} onChange={set('licenseNumber')} required placeholder="12345678900" />
          <InputField label="Validade da CNH" type="date" value={form.licenseExpiry} onChange={set('licenseExpiry')} required />
          <InputField label="Score de Segurança (0 a 100)" type="number" min="0" max="100" value={form.safetyScore} onChange={set('safetyScore')} />
          <SelectField label="Status" value={form.status} onChange={set('status')}>
            {DRIVER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </SelectField>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Salvando...' : 'Salvar Motorista'}</button>
        </div>
      </form>
    </Modal>
  )
}
