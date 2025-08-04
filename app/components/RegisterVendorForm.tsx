import { useState } from 'react';

export default function RegisterVendorForm({ email }: { email: string }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    const res = await fetch(`${process.env.NEST_API_URL}/vendors/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...formData }),
    });
    setLoading(false);
    if (res.ok) {
      alert('Compte créé avec succès !');
      window.location.href = '/login';
    } else {
      alert('Erreur lors de la création du compte');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Prénom
        <input name="first_name" value={formData.first_name} onChange={handleChange} required />
      </label>
      <label>
        Nom
        <input name="last_name" value={formData.last_name} onChange={handleChange} required />
      </label>
      <label>
        Téléphone
        <input name="phone" value={formData.phone} onChange={handleChange} required />
      </label>
      <label>
        Mot de passe
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
      </label>
      <label>
        Confirmer mot de passe
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
      </label>
      <button type="submit" disabled={loading}>{loading ? 'Création...' : 'Créer mon compte'}</button>
    </form>
  );
}
