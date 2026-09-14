import React, { useEffect, useState } from 'react';
import { LogOut, LockKeyhole, Loader2, ShieldCheck, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const AUTH_URL = '/api/admin/auth';
const SETUP_URL = '/api/admin/setup';
const PASSWORD_URL = '/api/admin/password';

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export default function AdminPage() {
  const [status, setStatus] = useState<'checking' | 'login' | 'setup' | 'authenticated'>('checking');
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminUsername, setAdminUsername] = useState('');

  useEffect(() => {
    let active = true;
    fetch(AUTH_URL, { credentials: 'include' })
      .then(readJson)
      .then(({ response, data }) => {
        if (!active) return;
        if (!response.ok || !data.success) throw new Error('Unable to check admin session');
        if (data.authenticated) {
          setAdminUsername(data.admin?.username || 'Admin');
          setStatus('authenticated');
        } else {
          setStatus(data.setupRequired ? 'setup' : 'login');
        }
      })
      .catch(() => { if (active) { setError('Unable to connect to the admin service. Please try again.'); setStatus('login'); } });
    return () => { active = false; };
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSuccess(''); setBusy(true);
    try {
      const { response, data } = await readJson(await fetch(AUTH_URL, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }));
      if (!response.ok || !data.success) throw new Error(data.message || 'Invalid credentials');
      setAdminUsername(data.admin?.username || username.trim().toLowerCase()); setPassword(''); setStatus('authenticated');
    } catch (err) { setError(err instanceof Error ? err.message : 'Login failed'); } finally { setBusy(false); }
  };

  const handleSetup = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSuccess('');
    if (password.length < 12) { setError('Password must be at least 12 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      const { response, data } = await readJson(await fetch(SETUP_URL, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ setupToken, username, password }) }));
      if (!response.ok || !data.success) throw new Error(data.message || 'Admin setup failed');
      setSetupToken(''); setPassword(''); setConfirmPassword(''); setAdminUsername(data.admin?.username || username.trim().toLowerCase()); setStatus('authenticated');
    } catch (err) { setError(err instanceof Error ? err.message : 'Admin setup failed'); } finally { setBusy(false); }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSuccess('');
    if (newPassword.length < 12) { setError('New password must be at least 12 characters.'); return; }
    if (newPassword !== confirmNewPassword) { setError('New passwords do not match.'); return; }
    setBusy(true);
    try {
      const { response, data } = await readJson(await fetch(PASSWORD_URL, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword, confirmPassword: confirmNewPassword }) }));
      if (!response.ok || !data.success) throw new Error(data.message || 'Password change failed');
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); setSuccess('Password changed. Please sign in again.'); setStatus('login');
    } catch (err) { setError(err instanceof Error ? err.message : 'Password change failed'); } finally { setBusy(false); }
  };

  const handleLogout = async () => {
    setError(''); setSuccess(''); setBusy(true);
    try {
      await fetch(AUTH_URL, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logout: true }) });
      setStatus('login'); setView('dashboard'); setAdminUsername(''); setPassword('');
    } finally { setBusy(false); }
  };

  if (status === 'checking') return <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]"><Loader2 className="h-7 w-7 animate-spin" /></div>;

  if (status !== 'authenticated') return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4 py-12">
      <Card className="w-full max-w-md border-stone-200 shadow-sm">
        <CardHeader className="text-center space-y-3"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100"><LockKeyhole className="h-5 w-5" /></div><CardTitle>{status === 'setup' ? 'Set up Admin Account' : 'Admin Login'}</CardTitle></CardHeader>
        <CardContent>
          {success && <p className="mb-4 text-sm text-green-700" role="status">{success}</p>}
          <form onSubmit={status === 'setup' ? handleSetup : handleLogin} className="space-y-4">
            {status === 'setup' && <div><label className="mb-1 block text-sm font-medium">Setup Token</label><Input type="password" autoComplete="off" value={setupToken} onChange={e => setSetupToken(e.target.value)} required /></div>}
            <div><label className="mb-1 block text-sm font-medium">Admin Email</label><Input type="email" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required /></div>
            <div><label className="mb-1 block text-sm font-medium">Password</label><Input type="password" autoComplete={status === 'setup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} minLength={12} required /></div>
            {status === 'setup' && <div><label className="mb-1 block text-sm font-medium">Confirm Password</label><Input type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={12} required /></div>}
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{status === 'setup' ? 'Create Admin Account' : 'Sign In'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="border-b border-stone-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5" /><div><p className="font-semibold">Layali Al Zahra</p><p className="text-xs text-stone-500">Admin Dashboard</p></div></div><div className="flex items-center gap-2"><Button variant="outline" onClick={() => { setView('settings'); setError(''); setSuccess(''); }}><Settings className="mr-2 h-4 w-4" />Settings</Button><Button variant="outline" onClick={handleLogout} disabled={busy}><LogOut className="mr-2 h-4 w-4" />Logout</Button></div></div></header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        {view === 'settings' ? (
          <div className="max-w-xl">
            <div className="mb-8"><Button variant="ghost" onClick={() => { setView('dashboard'); setError(''); setSuccess(''); }}>← Back to Dashboard</Button><p className="mt-6 text-sm text-stone-500">Settings</p><h1 className="text-3xl font-semibold">Admin Account</h1><p className="mt-2 text-sm text-stone-500">Signed in as {adminUsername}</p></div>
            <Card><CardHeader><CardTitle>Change Password</CardTitle></CardHeader><CardContent><form onSubmit={handlePasswordChange} className="space-y-4"><div><label className="mb-1 block text-sm font-medium">Current Password</label><Input type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></div><div><label className="mb-1 block text-sm font-medium">New Password</label><Input type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={12} required /></div><div><label className="mb-1 block text-sm font-medium">Confirm New Password</label><Input type="password" autoComplete="new-password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} minLength={12} required /></div>{error && <p className="text-sm text-red-600" role="alert">{error}</p>}{success && <p className="text-sm text-green-700" role="status">{success}</p>}<Button type="submit" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Change Password</Button></form></CardContent></Card>
          </div>
        ) : (
          <><div className="mb-8"><p className="text-sm text-stone-500">Signed in as</p><h1 className="text-3xl font-semibold">{adminUsername}</h1></div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{[['Content','Manage Blog, Tips & News'],['Website','Manage Services & Packages'],['Media','Manage Gallery & Images'],['Settings','SEO, Contact & Account']].map(([title, desc]) => <Card key={title} className="cursor-pointer" onClick={() => title === 'Settings' && setView('settings')}><CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader><CardContent><p className="text-sm text-stone-500">{desc}</p><p className="mt-4 text-xs text-stone-400">CMS module coming in the next stage.</p></CardContent></Card>)}</div></>
        )}
      </main>
    </div>
  );
}
