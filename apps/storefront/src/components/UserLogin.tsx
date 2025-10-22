import { useState } from 'react';

import { lookupCustomer } from '@/lib/api';
import { useCustomerStore } from '@/lib/store';
import type { CustomerProfile } from '@/lib/types';
import { Button } from './atoms/button';
import { TextInput } from './atoms/text-input';

type UserLoginProps = {
  onAuthenticated?: (profile: CustomerProfile) => void;
};

export function UserLogin({ onAuthenticated }: UserLoginProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setCustomer = useCustomerStore((state) => state.setCustomer);
  const clearCustomer = useCustomerStore((state) => state.clearCustomer);
  const profile = useCustomerStore((state) => state.profile);
  const recentOrders = useCustomerStore((state) => state.recentOrders);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await lookupCustomer(email);
      setCustomer(response.customer, response.recentOrders);
      setStatus('success');
      onAuthenticated?.(response.customer);
    } catch (error) {
      clearCustomer();
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to find that email. Please try again.',
      );
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Identify yourself</h2>
          <p className="text-sm text-slate-400">
            Enter the email we have on file so orders and support responses stay personalized.
          </p>
        </div>
        {profile && (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">
            {profile.email}
          </span>
        )}
      </header>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <TextInput
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          hint="Used to fetch customer profile and recent orders."
        />
        {status === 'error' && errorMessage && (
          <p className="rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-200">{errorMessage}</p>
        )}
        {status === 'success' && profile && (
          <p className="rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200">
            Welcome back, {profile.name.split(' ')[0]}! Recent orders loaded.
          </p>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit" isLoading={status === 'loading'} disabled={!email}>
            Save identity
          </Button>
          {profile && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                clearCustomer();
                setEmail('');
                setStatus('idle');
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </form>
      {profile && recentOrders.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
          <h3 className="text-sm font-semibold text-slate-100">Recent orders</h3>
          <ul className="mt-2 space-y-2">
            {recentOrders.map((order) => (
              <li key={order.orderId} className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-500">{order.orderId}</span>
                <span className="text-slate-200">{order.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
