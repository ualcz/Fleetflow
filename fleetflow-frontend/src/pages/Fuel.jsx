import { useEffect, useState } from 'react'
import { Plus, Fuel as FuelIcon } from 'lucide-react'
import api from '../api/axios'
import Modal from '../components/Modal'
import InputField from '../components/InputField'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Fuel() {
  const [logs, setLogs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ vehicleId: '', liters: '', cost: '', date: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/fuel'), api.get('/vehicles')])
      .then(([f, v]) => { setLogs(f.data.data.logs); setVehicles(v.data.data.vehicles) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handle = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/fuel', { ...form, liters: +form.liters, cost: +form.cost, vehicleId: +form.vehicleId })
      toast.success('Abastecimento registrado com sucesso!')
      setShowCreate(false)
      setForm({ vehicleId: '', liters: '', cost: '', date: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Falha ao registrar abastecimento') }
    finally { setSaving(false) }
  }

  const totalLiters = logs.reduce((s, l) => s + l.liters, 0)
  const totalCost = logs.reduce((s, l) => s + l.cost, 0)
  const avgCostPerLiter = totalLiters > 0 ? (totalCost / totalLiters).toFixed(2) : 0

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="space-y-5">
      {/* Cartões de Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 mb-1">Total em Litros</p>
          <p className="text-2xl font-bold text-white">{totalLiters.toLocaleString('pt-BR')} L</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 mb-1">Custo Total</p>
          <p className="text-2xl font-bold text-white">R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 mb-1">Média R$/Litro</p>
          <p className="text-2xl font-bold text-white">R$ {avgCostPerLiter}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{logs.length} registro(s) de combustível</p>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Novo Abastecimento
        </button>
      </div>

      {loading ? <LoadingSpinner text="Carregando abastecimentos..." /> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Veículo', 'Litros', 'Custo Total', 'R$/Litro', 'Data'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-500 py-10">Nenhum registro de combustível</td></tr>
              ) : logs.map(l => (
                <tr key={l.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 text-white font-medium">{l.vehicle?.name}</td>
                  <td className="p-4 text-gray-400">{l.liters.toLocaleString('pt-BR')} L</td>
                  <td className="p-4 text-gray-400">R$ {l.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-gray-500 text-xs">R$ {(l.cost / l.liters).toFixed(2)}</td>
                  <td className="p-4 text-gray-400">{new Date(l.date).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Adicionar Registro de Abastecimento">
        <form onSubmit={handle} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Veículo</label>
            <select value={form.vehicleId} onChange={set('vehicleId')} required className="input-field">
              <option value="">Selecione o veículo</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Litros" type="number" step="0.01" value={form.liters} onChange={set('liters')} required placeholder="50" />
            <InputField label="Custo (R$)" type="number" step="0.01" value={form.cost} onChange={set('cost')} required placeholder="320.00" />
            <InputField label="Data" type="date" value={form.date} onChange={set('date')} required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Salvando...' : 'Salvar Abastecimento'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
