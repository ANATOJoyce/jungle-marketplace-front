type TabId = 'countries' | 'regions' | 'tax';

interface TabConfig {
  id: TabId;
  label: string;
}

interface GeoNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  tabs?: TabConfig[];
}

export function GeoNavigation({ 
  activeTab, 
  onTabChange,
  tabs = [
    { id: 'countries', label: 'Pays' },
    { id: 'regions', label: 'Régions & Taxes' },
    { id: 'tax', label: 'Calculateur Fiscal' }
  ]
}: GeoNavigationProps) {
  return (
    <div className="flex border-b mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-4 py-2 font-medium ${
            activeTab === tab.id
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-gray-500'
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}