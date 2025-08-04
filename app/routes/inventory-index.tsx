import { json } from '@remix-run/node';
import { validateInventoryItems } from '~/validators/inventory';

export const loader = async () => {
  const response = await fetch(`${process.env.PUBLIC_NEST_API_URL}/inventory`);
  
  if (!response.ok) {
    throw json(
      { message: 'Failed to fetch inventory' },
      { status: response.status }
    );
  }

  const data = await response.json();

  if (!validateInventoryItems(data)) {
    console.error('Invalid inventory data structure:', data);
    throw json(
      { message: 'Invalid inventory data structure' },
      { status: 500 }
    );
  }

  return json(data);
};