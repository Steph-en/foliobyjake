import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AnalyticsSummary } from '../../types';
import {
  FolderKanban, Star, Eye, MessageSquare, Plus,
  Layers, Image as ImageIcon, ExternalLink, RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

interface DashboardProps {
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ onNavigateToTab }: DashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    setRefreshing(true);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4" aria-busy="true">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
        <p className="text-xs font-mono tracking-widest text-zinc-500 uppercase">Loading analytics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Projects',
      value: analytics?.totalProjects || 0,
      icon: <FolderKanban className="text-zinc-400" size={20} />,
      desc: 'Overall portfolio projects count',
      tab: 'projects'
    },
    {
      title: 'Featured Works',
      value: analytics?.featuredProjects || 0,
      icon: <Star className="text-amber-400" size={20} />,
      desc: 'Works in home carousel hero',
      tab: 'projects'
    },
    {
      title: 'Accumulated Views',
      value: analytics?.totalViews || 0,
      icon: <Eye className="text-blue-400" size={20} />,
      desc: 'Overall page clicks tracking',
      tab: null
    },
    {
      title: 'Contact Submissions',
      value: analytics?.contactRequests || 0,
      icon: <MessageSquare className="text-emerald-400" size={20} />,
      desc: 'Leads generated from portfolio',
      tab: null
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in font-sans text-zinc-200">
      
      {/* Upper Title Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-2xl uppercase tracking-tight font-display">SYSTEM INTELLIGENCE</h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">Real-time engagement telemetry & aggregations</p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono uppercase tracking-wider text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Sync Data'}
        </button>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => card.tab && onNavigateToTab(card.tab)}
            className={`bg-zinc-950 border border-zinc-900 rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-all ${card.tab ? 'cursor-pointer' : ''}`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{card.title}</span>
              <div className="h-9 w-9 bg-zinc-900 rounded-xl flex items-center justify-center">
                {card.icon}
              </div>
            </div>
            <div className="text-3xl font-display font-medium text-white tracking-widest">
              {card.value}
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 font-mono">{card.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* area views over time */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 relative overflow-hidden">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-6">Views Traffic Dynamics</h3>
          <div className="h-70">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.viewsOverTime || []}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                  labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="views" name="Clicks" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart - Project Popularity */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-6">Popular Projects</h3>
          <div className="h-70">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.projectViews || []} layout="vertical" margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" horizontal={false} />
                <XAxis type="number" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#52525b" fontSize={10} width={100} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Bar dataKey="views" name="Views" radius={[0, 4, 4, 0]}>
                  {(analytics?.projectViews || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ffffff' : '#52525b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid of Category Views & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category breakdown bar Chart */}
        <div className="lg:col-span-1 bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-6 font-semibold">Category Views Allocation</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.categoryViews || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="category" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Bar dataKey="views" name="Views" strokeWidth={0} fill="#a1a1aa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => onNavigateToTab('project-editor')}
                className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-1 focus:ring-white"
              >
                <div className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center shrink-0">
                  <Plus size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Create Work</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">Draft a new portfolio entry</p>
                </div>
              </button>

              <button
                onClick={() => onNavigateToTab('categories')}
                className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-1 focus:ring-white"
              >
                <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                  <Layers size={16} className="text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Manage Categories</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">Set catalog classifications</p>
                </div>
              </button>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-1 focus:ring-white"
              >
                <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                  <ExternalLink size={16} className="text-zinc-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Public Portfolio</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">Go to live frontend site</p>
                </div>
              </a>
            </div>
          </div>
          <div className="border-t border-zinc-900/50 pt-4 mt-6 flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>Analytics updated in real time.</span>
            <span>Accra, Ghana</span>
          </div>
        </div>

      </div>

    </div>
  );
}