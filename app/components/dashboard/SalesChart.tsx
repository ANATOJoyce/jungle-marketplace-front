import { Bar } from "react-chartjs-2";

export function SalesChart() {
  const data = {
    labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
    datasets: [
      {
        label: 'Ventes Hebdomadaires',
        data: [12, 19, 3, 5, 2, 3, 9],
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
      }
    ]
  };

  return <Bar data={data} />;
}