import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Filter } from 'lucide-react'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import InputField, { SelectField } from '../components/InputField'
import LoadingSpinner from '../components/LoadingSpinner'
import useAuthStore from '../store/useAuthStore'
import toast from 'react-hot-toast'

const STATUSES = [
  { value: 'ALL', label: 'Todos' },
  { value: 'AVAILABLE', label: 'Disponível' },
  { value: 'ON_TRIP', label: 'Em Viagem' },
  { value: 'IN_SHOP', label: 'Em Manutenção' },
  { value: 'RETIRED', label: 'Inativo' },
]

const EMPTY = { name: '', licensePlate: '', maxCapacity: '', acquisitionCost: '', odometer: '' }

export default function Vehicles() {
  const { role } = useAuthStore()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [modal, setModal] = useState({ open: false, mode: 'add', vehicle: null })

  const canMutate = ['MANAGER'].includes(role)

  const load = () => {
    setLoading(true)
    api.get('/vehicles').then(r => setVehicles(r.data.data.vehicles)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'ALL' ? vehicles : vehicles.filter(v => v.status === filter)

  const openAdd = () => setModal({ open: true, mode: 'add', vehicle: null })
  const openEdit = (v) => setModal({ open: true, mode: 'edit', vehicle: v })
  const closeModal = () => setModal({ open: false, mode: 'add', vehicle: null })

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir este veículo?')) return
    try {
      await api.delete(`/vehicles/${id}`)
      toast.success('Veículo excluído com sucesso')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Falha ao excluir veículo') }
  }

  return (
    <div className="space-y-5">
      {/* Barra de Ferramentas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={15} className="text-gray-500" />
          {STATUSES.map(s => (
            <button key={s.value} onClick={() => setFilter(s.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${filter === s.value ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {s.label}
            </button>
          ))}
        </div>
        {canMutate && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Novo Veículo
          </button>
        )}
      </div>

      {/* Tabela */}
      {loading ? <LoadingSpinner text="Carregando veículos..." /> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Nome', 'Placa', 'Capacidade (kg)', 'Odômetro', 'Custo Aquisição', 'Status', canMutate ? 'Ações' : ''].filter(Boolean).map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-10">Nenhum veículo encontrado</td></tr>
              ) : filtered.map(v => (
                <tr key={v.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 font-medium text-white">{v.name}</td>
                  <td className="p-4 text-gray-400 font-mono text-xs">{v.licensePlate}</td>
                  <td className="p-4 text-gray-400">{v.maxCapacity.toLocaleString('pt-BR')} kg</td>
                  <td className="p-4 text-gray-400">{v.odometer.toLocaleString('pt-BR')} km</td>
                  <td className="p-4 text-gray-400">R$ {v.acquisitionCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-4"><StatusBadge status={v.status} /></td>
                  {canMutate && (
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(v)} title="Editar" className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(v.id)} title="Excluir" className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Adicionar/Editar */}
      <VehicleModal
        isOpen={modal.open}
        onClose={closeModal}
        mode={modal.mode}
        vehicle={modal.vehicle}
        onSave={() => { closeModal(); load() }}
      />
    </div>
  )
}

function VehicleModal({ isOpen, onClose, mode, vehicle, onSave }) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (vehicle && mode === 'edit') {
      setForm({ name: vehicle.name, licensePlate: vehicle.licensePlate, maxCapacity: vehicle.maxCapacity, acquisitionCost: vehicle.acquisitionCost, odometer: vehicle.odometer })
    } else {
      setForm(EMPTY)
    }
  }, [vehicle, mode, isOpen])

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, maxCapacity: +form.maxCapacity, acquisitionCost: +form.acquisitionCost, odometer: +form.odometer }
    try {
      if (mode === 'add') { await api.post('/vehicles', payload); toast.success('Veículo cadastrado com sucesso!') }
      else { await api.patch(`/vehicles/${vehicle.id}`, payload); toast.success('Veículo atualizado com sucesso!') }
      onSave()
    } catch (err) { toast.error(err.response?.data?.message || 'Falha ao salvar veículo') }
    finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? 'Adicionar Novo Veículo' : 'Editar Veículo'}>
      <form onSubmit={handle} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Nome do Veículo" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Caminhão Alfa" />
          <InputField label="Placa" value={form.licensePlate} onChange={e => setForm(p => ({ ...p, licensePlate: e.target.value }))} required placeholder="ABC-1234" />
          <InputField label="Capacidade Máxima (kg)" type="number" value={form.maxCapacity} onChange={e => setForm(p => ({ ...p, maxCapacity: e.target.value }))} required placeholder="5000" />
          <InputField label="Custo de Aquisição (R$)" type="number" value={form.acquisitionCost} onChange={e => setForm(p => ({ ...p, acquisitionCost: e.target.value }))} required placeholder="150000" />
          <InputField label="Odômetro (km)" type="number" value={form.odometer} onChange={e => setForm(p => ({ ...p, odometer: e.target.value }))} placeholder="0" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Salvando...' : 'Salvar Veículo'}</button>
        </div>
      </form>
    </Modal>
  )
}
