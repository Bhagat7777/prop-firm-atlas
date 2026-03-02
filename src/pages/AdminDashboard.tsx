import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { LogOut, Download, Users, MousePointerClick, Globe, Monitor, Store } from 'lucide-react';

type DateRange = 'daily' | 'weekly' | 'monthly';
type SiteFilter = 'all' | 'main' | 'store';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [clicks, setClicks] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('daily');
  const [siteFilter, setSiteFilter] = useState<SiteFilter>('all');
  const [adCostPlatform, setAdCostPlatform] = useState('');
  const [adCostAmount, setAdCostAmount] = useState('');

  useEffect(() => {
    checkAuth();
    fetchData();

    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitors' }, () => fetchData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'clicks' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/admin/login'); return; }
    const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!data) { navigate('/admin/login'); }
  };

  const fetchData = async () => {
    const [v, c, s] = await Promise.all([
      supabase.from('visitors').select('*').order('created_at', { ascending: false }),
      supabase.from('clicks').select('*').order('created_at', { ascending: false }),
      supabase.from('sessions').select('*').order('created_at', { ascending: false }),
    ]);
    setVisitors(v.data || []);
    setClicks(c.data || []);
    setSessions(s.data || []);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Filtered data based on site selection
  const filteredVisitors = useMemo(() =>
    siteFilter === 'all' ? visitors : visitors.filter(v => (v.site || 'main') === siteFilter),
    [visitors, siteFilter]
  );

  const filteredClicks = useMemo(() =>
    siteFilter === 'all' ? clicks : clicks.filter(c => (c.site || 'main') === siteFilter),
    [clicks, siteFilter]
  );

  // Metrics
  const totalVisitors = filteredVisitors.length;
  const uniquDevices = new Set(filteredVisitors.map(v => v.device)).size;
  const discordClicks = filteredClicks.filter(c => c.button_name === 'Discord').length;
  const telegramClicks = filteredClicks.filter(c => c.button_name === 'Telegram').length;
  const discountClicks = filteredClicks.filter(c => c.button_name === 'Discount').length;
  const journalClicks = filteredClicks.filter(c => c.button_name === 'Journal').length;
  const totalClicks = filteredClicks.length;
  const conversionRate = totalVisitors > 0 ? ((totalClicks / totalVisitors) * 100).toFixed(1) : '0';

  // Store-specific stats
  const storeVisitors = visitors.filter(v => (v.site || 'main') === 'store').length;
  const mainVisitors = visitors.filter(v => (v.site || 'main') === 'main').length;
  const storeClicks = clicks.filter(c => (c.site || 'main') === 'store').length;
  const mainClicks = clicks.filter(c => (c.site || 'main') === 'main').length;

  // Traffic chart data
  const trafficData = useMemo(() => {
    const now = new Date();
    const groups: Record<string, { main: number; store: number }> = {};
    const days = dateRange === 'daily' ? 7 : dateRange === 'weekly' ? 28 : 90;

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = dateRange === 'monthly'
        ? d.toLocaleDateString('en-US', { month: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      groups[key] = { main: 0, store: 0 };
    }

    visitors.forEach(v => {
      const d = new Date(v.created_at);
      const key = dateRange === 'monthly'
        ? d.toLocaleDateString('en-US', { month: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (groups[key] !== undefined) {
        const site = (v.site || 'main') as 'main' | 'store';
        groups[key][site]++;
      }
    });

    return Object.entries(groups).map(([date, counts]) => ({
      date,
      main: counts.main,
      store: counts.store,
      total: counts.main + counts.store,
    }));
  }, [visitors, dateRange]);

  // Device breakdown
  const deviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredVisitors.forEach(v => {
      const d = v.device || 'unknown';
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredVisitors]);

  // Click breakdown
  const clickData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClicks.forEach(c => {
      counts[c.button_name] = (counts[c.button_name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredClicks]);

  // CSV Export
  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddCost = async () => {
    if (!adCostPlatform || !adCostAmount) return;
    await supabase.from('ad_costs').insert({
      platform: adCostPlatform,
      cost: parseFloat(adCostAmount),
    });
    setAdCostPlatform('');
    setAdCostAmount('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="gold-gradient-text text-xl font-bold animate-pulse">Loading Dashboard...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Visitors', value: totalVisitors, icon: Users },
    { label: 'Total Clicks', value: totalClicks, icon: MousePointerClick },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Globe },
    { label: 'Devices', value: uniquDevices, icon: Monitor },
  ];

  const clickCards = [
    { label: 'Discord Clicks', value: discordClicks },
    { label: 'Telegram Clicks', value: telegramClicks },
    { label: 'Discount Clicks', value: discountClicks },
    { label: 'Journal Clicks', value: journalClicks },
  ];

  const siteFilters: { label: string; value: SiteFilter }[] = [
    { label: 'All Sites', value: 'all' },
    { label: 'Main Site', value: 'main' },
    { label: 'Store', value: 'store' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold gold-gradient-text">Admin Dashboard</h1>
          <p className="text-muted-foreground text-xs">PropFirm Knowledge Analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => exportCSV(visitors, 'visitors')} className="glass-card px-3 py-2 text-xs font-medium text-foreground hover:border-primary/40 transition-all flex items-center gap-1">
            <Download className="w-3 h-3" /> Export
          </button>
          <button onClick={handleSignOut} className="glass-card px-3 py-2 text-xs font-medium text-foreground hover:border-destructive/40 transition-all flex items-center gap-1">
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Site Filter */}
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mr-2">Filter by site:</span>
          {siteFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setSiteFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                siteFilter === f.value
                  ? 'gold-gradient text-primary-foreground'
                  : 'glass-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Site Comparison Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Main Site Visitors</p>
            <p className="text-xl font-bold text-foreground">{mainVisitors}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Store Visitors</p>
            <p className="text-xl font-bold gold-gradient-text">{storeVisitors}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Main Site Clicks</p>
            <p className="text-xl font-bold text-foreground">{mainClicks}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Store Clicks</p>
            <p className="text-xl font-bold gold-gradient-text">{storeClicks}</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Click Tracking */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {clickCards.map((card) => (
            <div key={card.label} className="glass-card p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
              <p className="text-xl font-bold gold-gradient-text">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Traffic Chart - now shows main vs store */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-foreground">Traffic Overview</h2>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as DateRange[]).map(r => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    dateRange === r
                      ? 'gold-gradient text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4 mb-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(42, 48%, 57%)' }} />
              Main Site
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(200, 70%, 55%)' }} />
              Store
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trafficData}>
              <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={11} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(219, 37%, 17%)',
                  border: '1px solid hsl(219, 30%, 22%)',
                  borderRadius: '8px',
                  color: 'hsl(210, 17%, 98%)',
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="main" stroke="hsl(42, 48%, 57%)" strokeWidth={2} dot={false} name="Main Site" />
              <Line type="monotone" dataKey="store" stroke="hsl(200, 70%, 55%)" strokeWidth={2} dot={false} name="Store" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="font-semibold text-foreground mb-4">Device Breakdown</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deviceData}>
                <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={11} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(219, 37%, 17%)', border: '1px solid hsl(219, 30%, 22%)', borderRadius: '8px', color: 'hsl(210, 17%, 98%)', fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(42, 48%, 57%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-semibold text-foreground mb-4">Click Breakdown</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={clickData}>
                <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={11} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(219, 37%, 17%)', border: '1px solid hsl(219, 30%, 22%)', borderRadius: '8px', color: 'hsl(210, 17%, 98%)', fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(43, 71%, 69%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ad Cost Input */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-foreground mb-4">Ad Cost Input (ROI Tracking)</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" value={adCostPlatform} onChange={(e) => setAdCostPlatform(e.target.value)} placeholder="Platform (e.g. Meta, Google)" className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="number" value={adCostAmount} onChange={(e) => setAdCostAmount(e.target.value)} placeholder="Cost (₹)" className="w-full sm:w-32 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={handleAddCost} className="gold-gradient text-primary-foreground px-6 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all">Add Cost</button>
          </div>
        </div>

        {/* Recent Visitors Table */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Visitors</h2>
            <button onClick={() => exportCSV(filteredVisitors, 'visitors')} className="text-xs text-primary hover:underline flex items-center gap-1">
              <Download className="w-3 h-3" /> CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border/30">
                  <th className="text-left py-2 px-3 font-medium">Site</th>
                  <th className="text-left py-2 px-3 font-medium">Device</th>
                  <th className="text-left py-2 px-3 font-medium">Source</th>
                  <th className="text-left py-2 px-3 font-medium">UTM Source</th>
                  <th className="text-left py-2 px-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.slice(0, 20).map((v) => (
                  <tr key={v.id} className="border-b border-border/10 hover:bg-secondary/30">
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        (v.site || 'main') === 'store'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {(v.site || 'main') === 'store' ? 'Store' : 'Main'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-foreground">{v.device || '—'}</td>
                    <td className="py-2 px-3 text-foreground">{v.source || 'direct'}</td>
                    <td className="py-2 px-3 text-foreground">{v.utm_source || '—'}</td>
                    <td className="py-2 px-3 text-muted-foreground">{new Date(v.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVisitors.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">No visitors yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
