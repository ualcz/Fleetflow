import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import KPICard from '../components/KPICard'
import { TrendingUp, Fuel, Wrench, Car } from 'lucide-react'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm">
        <p className="text-white font-medium">{payload[0].name}</p>
        <p className="text-brand-400">R$ {Number(payload[0].value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [vehicleAnalytics, setVehicleAnalytics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/analytics/dashboard'), api.get('/vehicles')])
      .then(async ([dash, veh]) => {
        setDashboard(dash.data.data)
        const vList = veh.data.data.vehicles.slice(0, 5)
        setVehicles(vList)
        // Buscar análise individual por veículo
        const analytics = await Promise.all(vList.map(v => api.get(`/analytics/vehicle/${v.id}`).then(r => r.data.data)))
        setVehicleAnalytics(analytics)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Carregando relatórios analíticos..." />

  const { summary, breakdown } = dashboard || {}

  const barData = vehicleAnalytics.map(a => ({
    name: a.vehicle?.name?.split(' ')[0] || 'N/A',
    Receita: a.analytics?.totalRevenue || 0,
    'Custo Combustível': a.analytics?.totalFuelCost || 0,
    'Custo Manutenção': a.analytics?.totalMaintenanceCost || 0,
  }))

  const pieData = [
    { name: 'Disponível', value: breakdown?.vehiclesByStatus?.AVAILABLE || 0 },
    { name: 'Em Viagem', value: breakdown?.vehiclesByStatus?.ON_TRIP || 0 },
    { name: 'Em Manutenção', value: breakdown?.vehiclesByStatus?.IN_SHOP || 0 },
    { name: 'Inativo', value: breakdown?.vehiclesByStatus?.RETIRED || 0 },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Receita Total" value={`R$ ${(summary?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={TrendingUp} color="emerald" />
        <KPICard title="Custo de Combustível" value={`R$ ${(summary?.totalFuelCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={Fuel} color="amber" />
        <KPICard title="Manutenção" value={`R$ ${(summary?.totalMaintenanceCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={Wrench} color="red" />
        <KPICard title="Lucro Líquido" value={`R$ ${(summary?.netProfit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={TrendingUp} color={summary?.netProfit >= 0 ? 'emerald' : 'red'} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras: Receita vs Custos */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Receita vs Custos (Por Veículo)</h3>
          {barData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Nenhuma viagem concluída ainda</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                <Bar dataKey="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Custo Combustível" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Custo Manutenção" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico de Pizza: Distribuição da Frota */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Distribuição do Status da Frota</h3>
          {pieData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Nenhum veículo cadastrado</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Veículos']} contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tabela de Desempenho por Veículo */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h3 className="font-semibold text-white">Desempenho por Veículo</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Veículo', 'Viagens', 'KM Rodados', 'Efic. (km/L)', 'Combustível', 'Manutenção', 'Receita', 'ROI %'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {vehicleAnalytics.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-gray-500 py-8">Nenhum dado disponível ainda</td></tr>
            ) : vehicleAnalytics.map((a, i) => (
              <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                <td className="p-4 text-white font-medium">{a.vehicle?.name}</td>
                <td className="p-4 text-gray-400">{a.analytics?.completedTrips}</td>
                <td className="p-4 text-gray-400">{a.analytics?.totalKmCovered?.toLocaleString('pt-BR')} km</td>
                <td className="p-4">
                  <span className={a.analytics?.fuelEfficiencyKmPerLiter ? 'text-emerald-400' : 'text-gray-500'}>
                    {a.analytics?.fuelEfficiencyKmPerLiter ?? '–'}
                  </span>
                </td>
                <td className="p-4 text-amber-400">R$ {a.analytics?.totalFuelCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="p-4 text-red-400">R$ {a.analytics?.totalMaintenanceCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="p-4 text-emerald-400">R$ {a.analytics?.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="p-4">
                  {a.analytics?.roiPercent !== null ? (
                    <span className={a.analytics?.roiPercent >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                      {a.analytics?.roiPercent}%
                    </span>
                  ) : '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
