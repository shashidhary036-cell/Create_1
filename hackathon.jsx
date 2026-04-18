import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBrainStore } from '../store/brainStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Brain, Eye, Zap, Target } from 'lucide-react';

export default function Insights() {
  const { knowledgeNodes, weeklyRetention, focusHeatmap } = useBrainStore();

  const subjectStats = useMemo(() => {
    const subjects = [...new Set(knowledgeNodes.map(n => n.subject))];
    return subjects.map(s => {
      const nodes = knowledgeNodes.filter(n => n.subject === s);
      const avgR = Math.round(nodes.reduce((sum, n) => sum + n.retrievability, 0) / nodes.length);
      return { subject: s, avgR, nodeCount: nodes.length };
    });
  }, [knowledgeNodes]);

  const retentionForecast = useMemo(() => {
    const data = [];
    for (let d = 0; d <= 30; d++) {
      const current = Math.round(75 * Math.exp(-d * 0.02) + 10);
      const optimal = Math.round(85 * Math.exp(-d * 0.008) + 10);
      data.push({ day: d, Current: current, 'VBLS Optimal': optimal });
    }
    return data;
  }, []);

  const heatmapGrid = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array(17).fill(0));
    focusHeatmap.forEach(([hour, day, val]) => {
      if (day < 7 && hour >= 6 && hour <= 22) grid[day][hour - 6] = val;
    });
    return grid;
  }, [focusHeatmap]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  return (
    <div className="h-full flex flex-col gap-5 overflow-y-auto pb-8 custom-scrollbar">
      <div>
        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-accent to-green-strong">Cognitive Analytics</h1>
        <p className="text-xs text-gray-500">Retention forecasts, focus patterns, and your personalized brain model</p>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {subjectStats.map(s => (
          <div key={s.subject} className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-stable" /><span className="text-sm font-bold text-white">{s.subject}</span></div>
            <div className="text-3xl font-black text-white">{s.avgR}%</div>
            <div className="text-xs text-gray-500">{s.nodeCount} nodes · Avg Retention</div>
            <div className="mt-2 h-1.5 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-cyan-accent rounded-full" style={{ width: `${s.avgR}%` }} /></div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly Retention */}
        <div className="glass-panel p-5">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2"><TrendingUp size={18} className="text-cyan-accent" /> Knowledge Growth (8 weeks)</h3>
          <p className="text-xs text-gray-500 mb-4">Avg retention per domain over time</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyRetention} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="#555" tick={{ fill: '#666', fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#555" tick={{ fill: '#666', fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="chemistry" name="Chemistry" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.1} strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="physics" name="Physics" stroke="#FF8800" fill="#FF8800" fillOpacity={0.1} strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="spanish" name="Spanish" stroke="#A78BFA" fill="#A78BFA" fillOpacity={0.1} strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Retention Forecast */}
        <div className="glass-panel p-5">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2"><Target size={18} className="text-green-strong" /> 30-Day Retention Forecast</h3>
          <p className="text-xs text-gray-500 mb-4">Current trajectory vs. VBLS optimal plan</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={retentionForecast} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#555" tick={{ fill: '#666', fontSize: 11 }} label={{ value: 'Days', position: 'insideBottomRight', offset: -5, fill: '#666', fontSize: 10 }} />
              <YAxis domain={[0, 100]} stroke="#555" tick={{ fill: '#666', fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="VBLS Optimal" stroke="#00FF88" fill="#00FF88" fillOpacity={0.15} strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Current" stroke="#FF8800" fill="#FF8800" fillOpacity={0.1} strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Focus Heatmap */}
      <div className="glass-panel p-5">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2"><Eye size={18} className="text-purple-accent" /> Focus Heatmap</h3>
        <p className="text-xs text-gray-500 mb-4">Your cognitive performance by time of day</p>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex gap-1 mb-1 ml-10">
              {hours.map(h => <div key={h} className="flex-1 text-[9px] text-gray-600 text-center">{h > 12 ? h - 12 + 'p' : h + 'a'}</div>)}
            </div>
            {heatmapGrid.map((row, di) => (
              <div key={di} className="flex gap-1 items-center mb-1">
                <span className="w-8 text-[10px] text-gray-500 text-right mr-1">{days[di]}</span>
                {row.map((val, hi) => (
                  <div key={hi} className="flex-1 h-6 rounded" style={{ backgroundColor: `rgba(0, 212, 255, ${Math.max(0.05, val / 100)})` }}
                    title={`${days[di]} ${hours[hi]}:00 — ${val}%`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brain Profile */}
      <div className="glass-panel p-5">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2"><Brain size={18} className="text-purple-accent" /> Your Brain Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: Brain, color: '#FF6B6B', name: 'Forgetting Rate', value: 'θ = 1.3', desc: "30% faster than average in Math (auto-compensated)" },
            { icon: Eye, color: '#00D4FF', name: 'Focus Peak', value: 'λ = 0.8', desc: "You're sharpest at 9-11am" },
            { icon: Zap, color: '#FF8800', name: 'Difficulty Sweet Spot', value: 'β = 0.15', desc: "You learn best at difficulty 1.8/3.0" },
          ].map(p => (
            <div key={p.name} className="bg-black/40 border border-gray-700 rounded-2xl p-4" style={{ borderColor: p.color + '30' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.color + '20' }}><p.icon size={16} style={{ color: p.color }} /></div>
                <span className="text-sm font-bold text-white">{p.name}</span>
              </div>
              <div className="text-lg font-black text-white mb-1">{p.value}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}