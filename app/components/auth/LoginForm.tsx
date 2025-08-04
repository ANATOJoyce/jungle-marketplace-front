// src/components/auth/LoginForm.tsx
import React from "react";

type LoginFormProps = {
  error?: string;
};

export default function LoginForm({ error }: LoginFormProps) {
  return (
    <div style={styles.container}>
      <form method="post" style={styles.form}>
        <h2 style={styles.title}>Connexion</h2>
        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>
          Téléphone
          <input
            type="text"
            name="phone"
            placeholder="+22870310380"
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Mot de passe
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            required
            style={styles.input}
          />
        </label>

        <button type="submit" style={styles.button}>Se connecter</button>
      </form>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: 20,
    marginTop: 50,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: 320,
    padding: 30,
    border: "1px solid #ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  label: {
    marginBottom: 12,
    fontWeight: "bold",
    fontSize: 14,
    color: "#444",
  },
  input: {
    marginTop: 6,
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    marginTop: 20,
    padding: 12,
    fontSize: 16,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    color: "white",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  error: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#fdd",
    color: "#900",
    borderRadius: 4,
    textAlign: "center",
  },
};
