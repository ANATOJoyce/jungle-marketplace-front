import { useState } from 'react';

export default function VerifyOtpForm({ email, onVerified }: { email: string; onVerified: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${process.env.NEST_API_URL}/vendors/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    setLoading(false);
    if (res.ok) {
      alert('Code vérifié avec succès');
      onVerified();
    } else {
      alert('Code invalide ou expiré');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Code OTP
        <input value={code} onChange={e => setCode(e.target.value)} required />
      </label>
      <button type="submit" disabled={loading}>{loading ? 'Vérification...' : 'Vérifier'}</button>
    </form>
  );
}
