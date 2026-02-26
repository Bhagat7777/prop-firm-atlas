import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check admin role
    const { data: roleData } = await supabase.rpc('has_role', {
      _user_id: data.user.id,
      _role: 'admin',
    });

    if (!roleData) {
      setError('Access denied. Admin privileges required.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    navigate('/admin');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold gold-gradient-text mb-2">Admin Login</h1>
        <p className="text-muted-foreground text-sm mb-6">PropFirm Knowledge Dashboard</p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="admin@propfirmknowledge.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-primary-foreground py-3 rounded-lg font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <a href="/" className="block text-center text-sm text-muted-foreground mt-4 hover:text-primary transition-colors">
          ← Back to website
        </a>
      </motion.div>
    </div>
  );
}
