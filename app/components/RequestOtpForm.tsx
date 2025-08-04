import { useState } from 'react';

export default function RequestOtpForm({ onOtpSent }: { onOtpSent: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${process.env.NEST_API_URL}/vendors/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      alert('Code OTP envoyé par mail');
      onOtpSent(email);
    } else {
      alert('Erreur lors de l’envoi du code OTP');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
      </label>
      <button type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Envoyer le code OTP'}</button>
    </form>
  );
}
