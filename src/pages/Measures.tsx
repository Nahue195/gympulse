import { useState, useEffect } from 'react';
import { Plus, Scale, TrendingDown, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Measure } from '../types';
import { Button, Card, AddMeasureModal } from '../components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function Measures() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadMeasures();
    }
  }, [user]);

  async function loadMeasures() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('measures')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        const measuresData = data.map((m: any) => ({
          id: m.id,
          userId: m.user_id,
          date: m.date,
          heightCm: m.height_cm,
          weightKg: m.weight_kg,
          neckCm: m.neck_cm,
          chestCm: m.chest_cm,
          waistCm: m.waist_cm,
          hipCm: m.hip_cm,
          armCm: m.arm_cm,
          thighCm: m.thigh_cm,
          bodyFatPct: m.body_fat_pct,
          notes: m.notes,
          createdAt: m.created_at
        }));

        setMeasures(measuresData);
      }
    } catch (error) {
      console.error('Error loading measures:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta medición?')) {
      return;
    }

    try {
      const { error } = await supabase.from('measures').delete().eq('id', id);

      if (error) throw error;

      await loadMeasures();
    } catch (error) {
      console.error('Error deleting measure:', error);
      alert('Error al eliminar la medición');
    }
  }

  // Preparar datos para gráficos
  const weightChartData = measures
    .slice()
    .reverse()
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      peso: m.weightKg,
      grasa: m.bodyFatPct
    }));

  const bodyMeasuresChartData = measures
    .slice()
    .reverse()
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      pecho: m.chestCm,
      cintura: m.waistCm,
      cadera: m.hipCm,
      brazo: m.armCm,
      muslo: m.thighCm
    }));

  // Calcular estadísticas
  const latestMeasure = measures[0];
  const oldestMeasure = measures[measures.length - 1];
  const weightChange =
    latestMeasure && oldestMeasure ? latestMeasure.weightKg - oldestMeasure.weightKg : 0;
  const bodyFatChange =
    latestMeasure && oldestMeasure && latestMeasure.bodyFatPct && oldestMeasure.bodyFatPct
      ? latestMeasure.bodyFatPct - oldestMeasure.bodyFatPct
      : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Cargando mediciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Medidas</h1>
          <p className="text-slate-400 mt-1">Registra tu peso y medidas corporales</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Agregar Medidas
        </Button>
      </div>

      {measures.length > 0 ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Peso Actual</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {latestMeasure?.weightKg} <span className="text-lg text-slate-400">kg</span>
                  </p>
                </div>
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <Scale size={24} className="text-blue-400" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Cambio de Peso</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`text-3xl font-bold ${weightChange > 0 ? 'text-orange-400' : weightChange < 0 ? 'text-emerald-400' : 'text-white'}`}>
                      {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} <span className="text-lg text-slate-400">kg</span>
                    </p>
                    {weightChange !== 0 && (
                      weightChange > 0 ? (
                        <TrendingUp size={20} className="text-orange-400" />
                      ) : (
                        <TrendingDown size={20} className="text-emerald-400" />
                      )
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {latestMeasure?.bodyFatPct && (
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Grasa Corporal</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {latestMeasure.bodyFatPct} <span className="text-lg text-slate-400">%</span>
                    </p>
                    {bodyFatChange !== null && (
                      <p className={`text-sm mt-1 ${bodyFatChange > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                        {bodyFatChange > 0 ? '+' : ''}{bodyFatChange.toFixed(1)}% desde el inicio
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Weight Chart */}
          {weightChartData.length > 1 && (
            <Card>
              <h2 className="text-xl font-bold text-white mb-4">Evolución del Peso</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    name="Peso (kg)"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                  />
                  {weightChartData.some(d => d.grasa) && (
                    <Line
                      type="monotone"
                      dataKey="grasa"
                      name="Grasa (%)"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', r: 5 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Body Measures Chart */}
          {bodyMeasuresChartData.length > 1 && bodyMeasuresChartData.some(d => d.pecho || d.cintura || d.cadera) && (
            <Card>
              <h2 className="text-xl font-bold text-white mb-4">Evolución de Medidas Corporales</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bodyMeasuresChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  {bodyMeasuresChartData.some(d => d.pecho) && (
                    <Line type="monotone" dataKey="pecho" name="Pecho (cm)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {bodyMeasuresChartData.some(d => d.cintura) && (
                    <Line type="monotone" dataKey="cintura" name="Cintura (cm)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {bodyMeasuresChartData.some(d => d.cadera) && (
                    <Line type="monotone" dataKey="cadera" name="Cadera (cm)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {bodyMeasuresChartData.some(d => d.brazo) && (
                    <Line type="monotone" dataKey="brazo" name="Brazo (cm)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {bodyMeasuresChartData.some(d => d.muslo) && (
                    <Line type="monotone" dataKey="muslo" name="Muslo (cm)" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Measures History */}
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Historial de Mediciones</h2>
            <div className="space-y-3">
              {measures.map((measure) => (
                <div
                  key={measure.id}
                  className="p-4 bg-slate-900 rounded-lg border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-slate-400" />
                      <div>
                        <p className="font-bold text-white">
                          {new Date(measure.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-lg text-blue-400 font-bold">{measure.weightKg} kg</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(measure.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Body Measurements Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {measure.heightCm && (
                      <div>
                        <p className="text-slate-500">Altura</p>
                        <p className="text-white font-semibold">{measure.heightCm} cm</p>
                      </div>
                    )}
                    {measure.bodyFatPct && (
                      <div>
                        <p className="text-slate-500">Grasa</p>
                        <p className="text-white font-semibold">{measure.bodyFatPct}%</p>
                      </div>
                    )}
                    {measure.neckCm && (
                      <div>
                        <p className="text-slate-500">Cuello</p>
                        <p className="text-white font-semibold">{measure.neckCm} cm</p>
                      </div>
                    )}
                    {measure.chestCm && (
                      <div>
                        <p className="text-slate-500">Pecho</p>
                        <p className="text-white font-semibold">{measure.chestCm} cm</p>
                      </div>
                    )}
                    {measure.waistCm && (
                      <div>
                        <p className="text-slate-500">Cintura</p>
                        <p className="text-white font-semibold">{measure.waistCm} cm</p>
                      </div>
                    )}
                    {measure.hipCm && (
                      <div>
                        <p className="text-slate-500">Cadera</p>
                        <p className="text-white font-semibold">{measure.hipCm} cm</p>
                      </div>
                    )}
                    {measure.armCm && (
                      <div>
                        <p className="text-slate-500">Brazo</p>
                        <p className="text-white font-semibold">{measure.armCm} cm</p>
                      </div>
                    )}
                    {measure.thighCm && (
                      <div>
                        <p className="text-slate-500">Muslo</p>
                        <p className="text-white font-semibold">{measure.thighCm} cm</p>
                      </div>
                    )}
                  </div>

                  {measure.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-sm text-slate-400">{measure.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
            <Scale size={48} className="text-slate-600" />
            <h3 className="text-xl font-semibold text-white">No hay medidas registradas</h3>
            <p className="text-slate-400">
              Comienza a registrar tu peso y medidas para ver tu progreso
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              Agregar Primera Medición
            </Button>
          </div>
        </Card>
      )}

      {/* Add Measure Modal */}
      {showAddModal && (
        <AddMeasureModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            loadMeasures();
          }}
        />
      )}
    </div>
  );
}
