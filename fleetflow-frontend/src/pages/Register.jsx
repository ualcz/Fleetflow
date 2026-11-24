import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'MANAGER', label: 'Gerente (MANAGER)' },
  { value: 'DISPATCHER', label: 'Despachante (DISPATCHER)' },
  { value: 'SAFETY', label: 'Segurança (SAFETY)' },
  { value: 'FINANCE', label: 'Financeiro (FINANCE)' },
]

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'DISPATCHER' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      toast.success('Conta criada com sucesso! Faça login para continuar.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4 shadow-lg shadow-brand-600/30">
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
          <p className="text-gray-500 text-sm mt-1">Junte-se ao FleetFlow hoje</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Nome Completo</label>
            <input required value={form.name} onChange={set('name')} placeholder="Alex Silva" className="input-field" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">E-mail</label>
            <input type="email" required value={form.email} onChange={set('email')} placeholder="voce@frota.com" className="input-field" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Senha</label>
            <input type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres" className="input-field" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Perfil / Função</label>
            <select value={form.role} onChange={set('role')} className="input-field">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Já possui uma conta?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Faça login</Link>
        </p>
      </div>
    </div>
  )
}
