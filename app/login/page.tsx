'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const initialState = { error: '' };
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 p-4 relative overflow-hidden">
      {/* Círculos decorativos de fondo con difuminado (glow) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/60 p-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-emerald-500/10 z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 shadow-lg shadow-emerald-600/20 mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestion de Inasistencias - EP n° 15</h1>
          <p className="text-slate-600 text-sm mt-2">
            Partido de Tres Arroyos - Buenos Aires
          </p>
          <br/>
          <p className="text-slate-600 text-sm mt-2">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block" htmlFor="email">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@absence.com"
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 pl-10 pr-4 py-3 rounded-xl transition-all duration-200 outline-none text-sm placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 block" htmlFor="password">
                Contraseña
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 pl-10 pr-4 py-3 rounded-xl transition-all duration-200 outline-none text-sm placeholder:text-slate-500"
              />
            </div>
          </div>

          {state?.error && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs text-center font-medium animate-pulse">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 text-white font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/15"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>
        </form>       
      </div>
    </div>
  );
}
