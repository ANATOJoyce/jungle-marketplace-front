import { useState, useEffect } from 'react';
import { Input } from './ui/Input';

interface CustomerGroup {
  _id: string;
  name: string;
}

interface CustomerGroupSelectorProps {
  selectedGroups: string[];
  onSelect: (ids: string[]) => void;
  className?: string;
}

export const CustomerGroupSelector: React.FC<CustomerGroupSelectorProps> = ({
  selectedGroups = [],
  onSelect,
  className = '',
}) => {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/customer-groups`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        const data = await res.json();
        setGroups(data);
      } catch (error) {
        console.error('Failed to load customer groups', error);
      }
    };

    loadGroups();
  }, []);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleGroup = (groupId: string) => {
    const newSelection = selectedGroups.includes(groupId)
      ? selectedGroups.filter((id) => id !== groupId)
      : [...selectedGroups, groupId];
    onSelect(newSelection);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Input
        label="Rechercher des groupes"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Nom du groupe..."
      />

      <div className="max-h-60 overflow-y-auto border rounded-md p-2">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <div key={group._id} className="flex items-center p-2 hover:bg-gray-50">
              <input
                type="checkbox"
                id={`group-${group._id}`}
                checked={selectedGroups.includes(group._id)}
                onChange={() => toggleGroup(group._id)}
                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor={`group-${group._id}`} className="ml-2 text-sm text-gray-700">
                {group.name}
              </label>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 p-2">Aucun groupe trouvé</p>
        )}
      </div>
    </div>
  );
};