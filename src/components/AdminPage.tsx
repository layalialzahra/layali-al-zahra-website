import React, { useEffect, useState } from 'react';
import { CheckCircle2, Database, ExternalLink, FileText, Image, LayoutDashboard, Loader2, LockKeyhole, LogOut, Menu, Plus, Settings, Sparkles, Store, Tag, Users, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import AdminContentManager from './AdminContentManager';
import logo from '../assets/logo.png';

const AUTH_URL = '/api/admin/auth';
const SETUP_URL = '/api/admin/setup';
const PASSWORD_URL = '/api/admin/password';
const DEMO_URL = '/api/admin/seed-demo-content';

type View = 'dashboard' | 'content' | 'settings';

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

const navSections: Array<{ label: string; icon: any; view: View; disabled?: boolean }> = [
  { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
  { label: 'Content', icon: FileText, view: 'content' },
  { label: 'Website', icon: Store, view: 'dashboard', disabled: true },
  { label: 'Media', icon: Image, view: 'dashboard', disabled: true },
  { label: 'Settings', icon: Settings, view: 'settings' },
];

export default function AdminPage() {
  const [status, setStatus] = useState<'checking' | 'login' | 'setup' | 'authenticated'>('checking');
  const [view, setView] = useState<View>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
  const [demoLoading, setDemoLoading] = useState(false);
  const [stats, setStats] = useState({ blog: 0, tip: 0, news: 0 });

  useEffect(() => {
    document.body.style.background = '#fff7f9';
    document.body.style.fontFamily = 'Montserrat, sans-serif';
    let active = true;
    fetch(AUTH_URL, { credentials: 'include' })
      .then(readJson)
      .then(({ response, data }) => {
        if (!active) return;
        if (!response.ok || !data.success) throw new Error('Unable to check admin session');
        if (data.authenticated) {
          setAdminUsername(data.admin?.username || 'Admin');
          setStatus('authenticated');
        } else setStatus(data.setupRequired ? 'setup' : 'login');
      })
      .catch(() => {
        if (active) {
          setError('Unable to connect to the admin service. Please try again.');
          setStatus('login');
        }
      });
    return () => { active = false; document.body.style.background = ''; document.body.style.fontFamily = ''; };
  }, []);

  const loadStats = async () => {
    const types = ['blog', 'tip', 'news'];
    const values = await Promise.all(types.map(async type => {
      try {
        const response = await fetch(`/api/admin/content?type=${type}&limit=1`, { credentials: 'include' });
        const data = await response.json().catch(() => ({}));
        return Number(data.total || 0);
      } catch { return 0; }
    }));
    setStats({ blog: values[0], tip: values[1], news: values[2] });
  };

  useEffect(() => {
    if (status === 'authenticated') loadStats();
  }, [status, view]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); clearMessages(); setBusy(true);
    try {
      const { response, data } = await readJson(await fetch(AUTH_URL, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }));
      if (!response.ok || !data.success) throw new Error(data.message || 'Invalid credentials');
      setAdminUsername(data.admin?.username || username.trim().toLowerCase()); setPassword(''); setStatus('authenticated');
    } catch (err) { setError(err instanceof Error ? err.message : 'Login failed'); } finally { setBusy(false); }
  };

  const handleSetup = async (event: React.FormEvent) => {
    event.preventDefault(); clearMessages();
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
    event.preventDefault(); clearMessages();
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
    clearMessages(); setBusy(true);
    try { await fetch(AUTH_URL, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logout: true }) }); }
    finally { setBusy(false); setStatus('login'); setView('dashboard'); setAdminUsername(''); setPassword(''); }
  };

  const seedDemoContent = async () => {
    clearMessages(); setDemoLoading(true);
    try {
      const { response, data } = await readJson(await fetch(DEMO_URL, { method: 'POST', credentials: 'include' }));
      if (!response.ok || !data.success) throw new Error(data.message || 'Demo content could not be loaded');
      setSuccess(`${data.created || 0} demo items are ready. ${data.skipped || 0} already existed.`);
      await loadStats();
      setView('content');
    } catch (err) { setError(err instanceof Error ? err.message : 'Demo content could not be loaded'); } finally { setDemoLoading(false); }
  };

  const navigate = (nextView: View) => { if (nextView === 'dashboard' || nextView === 'content' || nextView === 'settings') { setView(nextView); clearMessages(); setMobileNavOpen(false); } };

  if (status === 'checking') return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100"><div className="text-center"><img src={logo} alt="Layali Al Zahra" className="mx-auto h-20 w-auto" /><Loader2 className="mx-auto mt-5 h-7 w-7 animate-spin text-rose-700" /><p className="mt-3 text-sm text-rose-900/60">Preparing your workspace…</p></div></div>;

  if (status !== 'authenticated') return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 p-4 sm:p-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-rose-900/10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-rose-600 via-pink-600 to-rose-800 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" /><div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-white/10" />
          <div className="relative"><img src={logo} alt="Layali Al Zahra Beauty Lounge" className="h-20 w-auto brightness-0 invert" /><p className="mt-8 font-tangerine text-6xl leading-none">Beauty, beautifully managed.</p><p className="mt-5 max-w-sm text-sm leading-7 text-white/80">A private workspace for managing the Layali Al Zahra website content, stories and updates.</p></div>
          <div className="relative flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/70"><Sparkles className="h-4 w-4" /> Layali Al Zahra Admin</div>
        </div>
        <div className="flex items-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8 lg:hidden"><img src={logo} alt="Layali Al Zahra Beauty Lounge" className="mx-auto h-16 w-auto" /></div>
            <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">Private workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-rose-950">{status === 'setup' ? 'Create your admin account' : 'Welcome back'}</h1><p className="mt-2 text-sm leading-6 text-gray-500">{status === 'setup' ? 'Complete the one-time secure setup for the website CMS.' : 'Sign in to manage your website content.'}</p></div>
            {success && <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">{success}</div>}
            <form onSubmit={status === 'setup' ? handleSetup : handleLogin} className="space-y-5">
              {status === 'setup' && <div><label className="mb-2 block text-sm font-medium text-gray-700">Setup token</label><Input type="password" autoComplete="off" value={setupToken} onChange={e => setSetupToken(e.target.value)} required className="h-12 rounded-xl" /></div>}
              <div><label className="mb-2 block text-sm font-medium text-gray-700">Admin email</label><Input type="email" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required className="h-12 rounded-xl" /></div>
              <div><label className="mb-2 block text-sm font-medium text-gray-700">Password</label><Input type="password" autoComplete={status === 'setup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} minLength={12} required className="h-12 rounded-xl" /></div>
              {status === 'setup' && <div><label className="mb-2 block text-sm font-medium text-gray-700">Confirm password</label><Input type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={12} required className="h-12 rounded-xl" /></div>}
              {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{error}</div>}
              <Button type="submit" className="h-12 w-full rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{status === 'setup' ? 'Create Admin Account' : 'Sign In'}</Button>
            </form>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400"><LockKeyhole className="h-3.5 w-3.5" /> Secure authenticated access</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-[#fff8f0] text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <header className="sticky top-0 z-40 border-b border-rose-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3"><button type="button" className="rounded-xl p-2 text-rose-700 hover:bg-rose-50 lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open admin navigation"><Menu className="h-5 w-5" /></button><img src={logo} alt="Layali Al Zahra Beauty Lounge" className="h-11 w-auto" /><div className="hidden border-l border-rose-100 pl-4 sm:block"><p className="text-sm font-semibold text-rose-950">Admin Workspace</p><p className="text-xs text-gray-500">Layali Al Zahra Beauty Lounge</p></div></div>
          <div className="flex items-center gap-2"><a href="/home" target="_blank" rel="noreferrer" className="hidden rounded-xl px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 md:inline-flex"><ExternalLink className="mr-2 h-4 w-4" />View website</a><span className="hidden rounded-full bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 sm:inline">{adminUsername}</span><Button variant="outline" onClick={handleLogout} disabled={busy} className="rounded-xl border-rose-100 text-rose-800 hover:bg-rose-50"><LogOut className="mr-2 h-4 w-4" />Logout</Button></div>
        </div>
      </header>

      {mobileNavOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-rose-950/40" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} /><aside className="relative h-full w-[290px] bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><img src={logo} alt="Layali Al Zahra" className="h-12 w-auto" /><button onClick={() => setMobileNavOpen(false)} className="rounded-xl p-2 text-gray-500 hover:bg-rose-50"><X className="h-5 w-5" /></button></div><AdminNav view={view} onNavigate={navigate} /></aside></div>}

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-rose-100 bg-white/75 px-4 py-7 lg:block"><div className="px-3"><p className="font-tangerine text-4xl text-rose-800">Your workspace</p><p className="mt-1 text-xs leading-5 text-gray-500">Simple tools for publishing beautiful content without touching code.</p></div><AdminNav view={view} onNavigate={navigate} /><div className="mt-8 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 text-white shadow-lg shadow-rose-600/10"><Sparkles className="h-5 w-5" /><p className="mt-3 text-sm font-semibold">Keep it beautiful.</p><p className="mt-1 text-xs leading-5 text-white/80">Publish, review and update your website from one place.</p></div></aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          {error && <div className="mb-5 rounded-2xl border border-rose-100 bg-white px-5 py-4 text-sm text-rose-800 shadow-sm" role="alert">{error}</div>}
          {success && <div className="mb-5 flex items-center gap-2 rounded-2xl border border-green-100 bg-white px-5 py-4 text-sm text-green-800 shadow-sm" role="status"><CheckCircle2 className="h-4 w-4" />{success}</div>}

          {view === 'content' ? <AdminContentManager onBack={() => navigate('dashboard')} /> : view === 'settings' ? <SettingsView adminUsername={adminUsername} busy={busy} error={error} success={success} currentPassword={currentPassword} newPassword={newPassword} confirmNewPassword={confirmNewPassword} setCurrentPassword={setCurrentPassword} setNewPassword={setNewPassword} setConfirmNewPassword={setConfirmNewPassword} onSubmit={handlePasswordChange} onBack={() => navigate('dashboard')} /> : <Dashboard stats={stats} onContent={() => navigate('content')} onSeed={seedDemoContent} demoLoading={demoLoading} />}
        </main>
      </div>
    </div>
  );
}

function AdminNav({ view, onNavigate }: { view: View; onNavigate: (view: View) => void }) {
  return <nav className="mt-8 space-y-1">{navSections.map(item => { const Icon = item.icon; const active = item.view === view && !item.disabled; return <button key={item.label} type="button" disabled={item.disabled} onClick={() => !item.disabled && onNavigate(item.view)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${active ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/15' : item.disabled ? 'cursor-not-allowed text-gray-300' : 'text-gray-600 hover:bg-rose-50 hover:text-rose-900'}`}><Icon className="h-4 w-4" /><span>{item.label}</span>{item.disabled && <span className="ml-auto text-[10px] uppercase tracking-wide">Soon</span>}</button>; })}</nav>;
}

function Dashboard({ stats, onContent, onSeed, demoLoading }: { stats: { blog: number; tip: number; news: number }; onContent: () => void; onSeed: () => void; demoLoading: boolean }) {
  const total = stats.blog + stats.tip + stats.news;
  const statCards = [
    { label: 'Beauty Journal', value: stats.blog, icon: FileText, color: 'bg-rose-50 text-rose-700' },
    { label: 'Beauty Tips', value: stats.tip, icon: Sparkles, color: 'bg-pink-50 text-pink-700' },
    { label: 'Salon News', value: stats.news, icon: Tag, color: 'bg-amber-50 text-amber-700' },
  ];
  return <div className="space-y-8">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">Dashboard</p><h1 className="mt-2 font-tangerine text-6xl leading-none text-rose-950 md:text-7xl">Welcome back.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">Everything you need to keep the Layali Al Zahra website fresh, useful and beautiful.</p></div><Button onClick={onContent} className="rounded-xl bg-rose-600 px-5 py-3 text-white shadow-lg shadow-rose-600/15 hover:bg-rose-700"><Plus className="mr-2 h-4 w-4" />Create content</Button></div>
    <div className="grid gap-4 md:grid-cols-3">{statCards.map(item => { const Icon = item.icon; return <Card key={item.label} className="rounded-2xl border-rose-100 bg-white shadow-sm"><CardContent className="p-5"><div className="flex items-center justify-between"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}><Icon className="h-5 w-5" /></div><span className="text-3xl font-semibold text-rose-950">{item.value}</span></div><p className="mt-4 text-sm font-medium text-gray-700">{item.label}</p><p className="mt-1 text-xs text-gray-500">Published and draft items</p></CardContent></Card>; })}</div>
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <Card className="rounded-2xl border-rose-100 bg-white shadow-sm"><CardHeader><CardTitle className="text-xl text-rose-950">Content workspace</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3">{[
        { title: 'Blog', desc: 'Beauty Journal articles', icon: FileText }, { title: 'Tips', desc: 'Practical beauty advice', icon: Sparkles }, { title: 'News', desc: 'Salon updates & stories', icon: Tag },
      ].map(item => { const Icon = item.icon; return <button key={item.title} onClick={onContent} className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 text-left transition hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-md"><Icon className="h-5 w-5 text-rose-700" /><p className="mt-4 text-sm font-semibold text-rose-950">{item.title}</p><p className="mt-1 text-xs leading-5 text-gray-500">{item.desc}</p></button>; })}</CardContent></Card>
      <Card className="rounded-2xl border-rose-100 bg-gradient-to-br from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/15"><CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Database className="h-5 w-5" /> Demo content</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-white/85">Load researched sample Blogs, Tips and News into the CMS and public website for management review. The action is safe to repeat and skips existing demo slugs.</p><Button onClick={onSeed} disabled={demoLoading} className="mt-5 rounded-xl bg-white text-rose-800 hover:bg-rose-50">{demoLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Load demo content</Button><p className="mt-3 text-xs text-white/60">Current content items: {total}</p></CardContent></Card>
    </div>
    <div className="grid gap-5 md:grid-cols-3">{[
      { title: 'Website', desc: 'Services and Packages management will be enabled in a later module.', icon: Store },
      { title: 'Media', desc: 'Images are already stored securely through the connected media system.', icon: Image },
      { title: 'Testimonials', desc: 'Client reviews and ratings will be managed in a later module.', icon: Users },
    ].map(item => { const Icon = item.icon; return <Card key={item.title} className="rounded-2xl border-rose-100 bg-white/70 opacity-75 shadow-sm"><CardContent className="p-5"><Icon className="h-5 w-5 text-rose-500" /><p className="mt-4 text-sm font-semibold text-rose-950">{item.title}</p><p className="mt-1 text-xs leading-5 text-gray-500">{item.desc}</p><span className="mt-4 inline-block text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">Coming later</span></CardContent></Card>; })}</div>
  </div>;
}

function SettingsView(props: { adminUsername: string; busy: boolean; error: string; success: string; currentPassword: string; newPassword: string; confirmNewPassword: string; setCurrentPassword: (v: string) => void; setNewPassword: (v: string) => void; setConfirmNewPassword: (v: string) => void; onSubmit: (event: React.FormEvent) => void; onBack: () => void }) {
  return <div className="max-w-3xl space-y-7"><div><button onClick={props.onBack} className="text-sm font-medium text-rose-700 hover:text-rose-900">← Dashboard</button><p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">Settings</p><h1 className="mt-2 font-tangerine text-6xl text-rose-950">Admin account</h1><p className="mt-2 text-sm text-gray-500">Signed in as {props.adminUsername}</p></div><Card className="rounded-2xl border-rose-100 bg-white shadow-sm"><CardHeader><CardTitle className="text-xl text-rose-950">Change password</CardTitle></CardHeader><CardContent><form onSubmit={props.onSubmit} className="max-w-xl space-y-5"><div><label className="mb-2 block text-sm font-medium text-gray-700">Current password</label><Input type="password" autoComplete="current-password" value={props.currentPassword} onChange={e => props.setCurrentPassword(e.target.value)} required className="h-12 rounded-xl" /></div><div><label className="mb-2 block text-sm font-medium text-gray-700">New password</label><Input type="password" autoComplete="new-password" value={props.newPassword} onChange={e => props.setNewPassword(e.target.value)} minLength={12} required className="h-12 rounded-xl" /></div><div><label className="mb-2 block text-sm font-medium text-gray-700">Confirm new password</label><Input type="password" autoComplete="new-password" value={props.confirmNewPassword} onChange={e => props.setConfirmNewPassword(e.target.value)} minLength={12} required className="h-12 rounded-xl" /></div>{props.error && <p className="text-sm text-rose-700">{props.error}</p>}{props.success && <p className="text-sm text-green-700">{props.success}</p>}<Button type="submit" disabled={props.busy} className="rounded-xl bg-rose-600 text-white hover:bg-rose-700">{props.busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Change password</Button></form></CardContent></Card></div>;
}
