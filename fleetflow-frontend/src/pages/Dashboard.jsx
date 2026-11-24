import { useEffect, useState } from 'react'
import { Truck, Users, Route, Wrench, TrendingUp, Activity } from 'lucide-react'
import api from '../api/axios'
import KPICard from '../components/KPICard'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Carregando painel..." />

  const { summary, breakdown } = data || {}

  const vehicleStats = [
    { label: 'Disponíveis', val: breakdown?.vehiclesByStatus?.AVAILABLE, color: 'bg-emerald-500' },
    { label: 'Em Viagem', val: breakdown?.vehiclesByStatus?.ON_TRIP, color: 'bg-amber-500' },
    { label: 'Em Manutenção', val: breakdown?.vehiclesByStatus?.IN_SHOP, color: 'bg-red-500' },
    { label: 'Inativos', val: breakdown?.vehiclesByStatus?.RETIRED, color: 'bg-gray-500' },
  ]

  const tripStats = [
    { label: 'Rascunho', val: breakdown?.tripsByStatus?.DRAFT, color: 'bg-gray-500' },
    { label: 'Despachadas', val: breakdown?.tripsByStatus?.DISPATCHED, color: 'bg-brand-500' },
    { label: 'Concluídas', val: breakdown?.tripsByStatus?.COMPLETED, color: 'bg-emerald-500' },
    { label: 'Canceladas', val: breakdown?.tripsByStatus?.CANCELLED, color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-xl font-bold text-white">Visão Geral</h2>
        <p className="text-gray-500 text-sm">Status em tempo real da frota e métricas de desempenho</p>
      </div>

      {/* Cartões de KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total de Veículos" value={summary?.totalVehicles} icon={Truck} color="brand" subtitle="Na frota" />
        <KPICard title="Motoristas Ativos" value={breakdown?.driversByStatus?.ON_DUTY} icon={Users} color="emerald" subtitle="Em serviço" />
        <KPICard title="Viagens Ativas" value={breakdown?.tripsByStatus?.DISPATCHED} icon={Route} color="amber" subtitle="Despachadas" />
        <KPICard title="Em Manutenção" value={breakdown?.vehiclesByStatus?.IN_SHOP} icon={Wrench} color="red" subtitle="Na oficina" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Receita Total" value={`R$ ${(summary?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={TrendingUp} color="emerald" subtitle="De viagens concluídas" />
        <KPICard title="Custo de Combustível" value={`R$ ${(summary?.totalFuelCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={Activity} color="amber" subtitle="Total investido" />
        <KPICard title="Custo de Manutenção" value={`R$ ${(summary?.totalMaintenanceCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={Wrench} color="red" subtitle="Total investido" />
        <KPICard title="Lucro Líquido" value={`R$ ${(summary?.netProfit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={TrendingUp} color={summary?.netProfit >= 0 ? 'emerald' : 'red'} subtitle="Receita menos despesas" />
      </div>

      {/* Detalhamento de Veículos e Viagens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status dos Veículos */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Truck size={16} className="text-brand-400" /> Status da Frota
          </h3>
          <div className="space-y-3">
            {vehicleStats.map(({ label, val, color }) => {
              const pct = summary?.totalVehicles ? Math.round((val || 0) / summary.totalVehicles * 100) : 0
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{val || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Status das Viagens */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Route size={16} className="text-amber-400" /> Status das Viagens
          </h3>
          <div className="space-y-3">
            {tripStats.map(({ label, val, color }) => {
              const total = summary?.totalTrips || 1
              const pct = Math.round((val || 0) / total * 100)
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{val || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
