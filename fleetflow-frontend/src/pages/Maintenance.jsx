import { useEffect, useState } from 'react'
import { Plus, CheckCheck, Wrench } from 'lucide-react'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import InputField from '../components/InputField'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Maintenance() {
  const [logs, setLogs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/maintenance'), api.get('/vehicles')])
      .then(([m, v]) => { setLogs(m.data.data.logs); setVehicles(v.data.data.vehicles) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleComplete = async (id) => {
    try { await api.patch(`/maintenance/${id}/complete`); toast.success('Manutenção concluída! Veículo retornado para DISPONÍVEL.'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Falha ao concluir manutenção') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{logs.length} registro(s) de manutenção</p>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Nova Manutenção
        </button>
      </div>

      {loading ? <LoadingSpinner text="Carregando manutenções..." /> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Veículo', 'Descrição', 'Custo', 'Data', 'Status', 'Ações'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-500 py-10">Nenhum registro de manutenção</td></tr>
              ) : logs.map(l => (
                <tr key={l.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 text-white font-medium">{l.vehicle?.name}</td>
                  <td className="p-4 text-gray-400 max-w-xs truncate">{l.description}</td>
                  <td className="p-4 text-gray-400">R$ {l.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-gray-400">{new Date(l.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${l.completed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                      <Wrench size={10} className="mr-1" />
                      {l.completed ? 'Concluída' : 'Em Andamento'}
                    </span>
                  </td>
                  <td className="p-4">
                    {!l.completed && (
                      <button onClick={() => handleComplete(l.id)}
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors p-1.5 rounded-lg hover:bg-emerald-900/20">
                        <CheckCheck size={14} /> Concluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddMaintenanceModal isOpen={showCreate} onClose={() => setShowCreate(false)} vehicles={vehicles} onSave={() => { setShowCreate(false); load() }} />
    </div>
  )
}

function AddMaintenanceModal({ isOpen, onClose, vehicles, onSave }) {
  const [form, setForm] = useState({ description: '', cost: '', date: '', vehicleId: '' })
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handle = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/maintenance', { ...form, cost: +form.cost, vehicleId: +form.vehicleId })
      toast.success('Manutenção registrada! Veículo alterado para EM MANUTENÇÃO.')
      onSave()
    } catch (err) { toast.error(err.response?.data?.message || 'Falha ao registrar manutenção') }
    finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Registro de Manutenção">
      <form onSubmit={handle} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Veículo</label>
          <select value={form.vehicleId} onChange={set('vehicleId')} required className="input-field">
            <option value="">Selecione o veículo</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.status})</option>)}
          </select>
        </div>
        <InputField label="Descrição" value={form.description} onChange={set('description')} required placeholder="Troca de pastilhas de freio e óleo" />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Custo (R$)" type="number" value={form.cost} onChange={set('cost')} required placeholder="1500" />
          <InputField label="Data" type="date" value={form.date} onChange={set('date')} required />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Salvando...' : 'Salvar Manutenção'}</button>
        </div>
      </form>
    </Modal>
  )
}
