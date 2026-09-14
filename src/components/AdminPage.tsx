import React, { useEffect, useState } from 'react';
import { LogOut, LockKeyhole, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const AUTH_URL = '/api/admin/auth';
const SETUP_URL = '/api/admin/setup';

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export default function AdminPage() {
  const [status, setStatus] = useState<'checking' | 'login' | 'setup' | 'authenticated'>('checking');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [adminUsername, setAdminUsername] = useState('');

  useEffect(() => {
    let active = true;
    fetch(AUTH_URL, { credentials: 'include' })
      .then(readJson)
      .then(({ response, data }) => {
        if (!active) return;
        if (response.ok && data.authenticated) {
          setAdminUsername(data.admin?.username || '');
          setStatus('authenticated');
        } else {
          setStatus(data.setupRequired ? 'setup' : 'login');
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to check your session. Please try again.');
          setStatus('login');
        }
      });
    return () => { active = false; };
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { response, data } = await readJson(fetch(AUTH_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      }));
      if (!response.ok) throw new Error(data.message || 'Invalid credentials');
      setAdminUsername(data.admin?.username || username);
      setPassword('');
      setStatus('authenticated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleSetup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const { response, data } = await readJson(fetch(SETUP_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupToken, username, password }),
      }));
      if (!response.ok) throw new Error(data.message || 'Unable to create admin account.');
      setAdminUsername(data.admin?.username || username);
      setPassword('');
      setConfirmPassword('');
      setSetupToken('');
      setStatus('authenticated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create the admin account.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    setBusy(true);
    try {
      await fetch(AUTH_URL, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logout: true }) });
    } finally {
      setAdminUsername('');
      setPassword('');
      setStatus('login');
      setBusy(false);
    }
  };

  if (status === 'checking') {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;
  }

  if (status !== 'authenticated') {
    const isSetup = status === 'setup';
    return (
      <div className="min-h-screen pt-8 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-rose-500" /></div>
            <CardTitle className="text-rose-900">{isSetup ? 'Set Up Admin Account' : 'Admin Login'}</CardTitle>
            <p className="text-sm text-gray-500 mt-2">Layali Al Zahra Beauty Lounge</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={isSetup ? handleSetup : handleLogin} className="space-y-4">
              {isSetup && <div><label htmlFor="setupToken" className="block text-gray-700 mb-2">Setup Token</label><Input id="setupToken" type="password" value={setupToken} onChange={(e) => setSetupToken(e.target.value)} required autoComplete="off" /></div>}
              <div><label htmlFor="username" className="block text-gray-700 mb-2">Admin Email</label><Input id="username" type="email" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" placeholder="admin@example.com" /></div>
              <div><label htmlFor="password" className="block text-gray-700 mb-2">Password</label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} autoComplete={isSetup ? 'new-password' : 'current-password'} /></div>
              {isSetup && <div><label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirm Password</label><Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={12} autoComplete="new-password" /></div>}
              {error && <div role="alert" className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
              <Button type="submit" disabled={busy} className="w-full bg-rose-500 hover:bg-rose-600 text-white">{busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isSetup ? 'Creating account…' : 'Signing in…'}</> : isSetup ? 'Create Admin Account' : 'Login'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8 gap-4"><div><h1 className="font-tangerine text-6xl text-rose-900">Admin Dashboard</h1><p className="text-sm text-gray-500 mt-1">Signed in as {adminUsername}</p></div><Button onClick={handleLogout} disabled={busy} variant="outline" className="border-rose-500 text-rose-500 hover:bg-rose-50"><LogOut className="w-4 h-4 mr-2" />Logout</Button></div>
        <Card><CardHeader><CardTitle className="text-rose-900 flex items-center gap-2"><LockKeyhole className="w-5 h-5" />Secure admin session active</CardTitle></CardHeader><CardContent><p className="text-gray-600">Authentication is now connected to the server. The existing CMS dashboard will be replaced with the database-driven content management workspace in the next stages.</p></CardContent></Card>
      </div>
    </div>
  );
}
