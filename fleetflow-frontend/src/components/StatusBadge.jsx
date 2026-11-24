const STATUS_CONFIG = {
  // Veículo
  AVAILABLE: { label: 'Disponível', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  ON_TRIP: { label: 'Em Viagem', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  IN_SHOP: { label: 'Em Manutenção', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  RETIRED: { label: 'Inativo', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  // Motorista
  ON_DUTY: { label: 'Em Serviço', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  OFF_DUTY: { label: 'Fora de Serviço', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  SUSPENDED: { label: 'Suspenso', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  // Viagem
  DRAFT: { label: 'Rascunho', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  DISPATCHED: { label: 'Despachada', cls: 'bg-brand-500/20 text-brand-400 border-brand-500/30' },
  COMPLETED: { label: 'Concluída', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  CANCELLED: { label: 'Cancelada', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {config.label}
    </span>
  )
}
