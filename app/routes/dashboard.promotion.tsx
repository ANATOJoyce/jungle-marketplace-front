import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

type PromotionStatus = 'Active' | 'Campaign expired' | 'Campaign scheduled';
type PromotionMethod = 'Automatic' | 'Promotion code';
type StatusColor = 'green' | 'red' | 'orange';

interface Promotion {
  id: number;
  code: string;
  method: PromotionMethod;
  status: PromotionStatus;
  statusColor: StatusColor;
}

const PromotionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const promotions: Promotion[] = [
    {
      id: 1,
      code: 'WINTER24',
      method: 'Automatic',
      status: 'Campaign expired',
      statusColor: 'red'
    },
    {
      id: 2,
      code: 'EMPLOYEE25',
      method: 'Automatic',
      status: 'Active',
      statusColor: 'green'
    },
    {
      id: 3,
      code: 'B2B10',
      method: 'Automatic',
      status: 'Active',
      statusColor: 'green'
    },
    {
      id: 4,
      code: 'EURSUMMER24',
      method: 'Promotion code',
      status: 'Campaign scheduled',
      statusColor: 'orange'
    },
    {
      id: 5,
      code: 'VIP10',
      method: 'Promotion code',
      status: 'Active',
      statusColor: 'green'
    },
    {
      id: 6,
      code: 'WEBLAPTOPBUNDLE',
      method: 'Promotion code',
      status: 'Active',
      statusColor: 'green'
    },
    {
      id: 7,
      code: 'BLACKFRIDAY',
      method: 'Automatic',
      status: 'Campaign expired',
      statusColor: 'red'
    },
    {
      id: 8,
      code: 'Test',
      method: 'Automatic',
      status: 'Active',
      statusColor: 'green'
    }
  ];

  const getStatusColor = (color: StatusColor): string => {
    const colors: Record<StatusColor, string> = {
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800'
    };
    return colors[color];
  };

  const getStatusDot = (color: StatusColor): string => {
    const colors: Record<StatusColor, string> = {
      green: 'bg-green-400',
      red: 'bg-red-400',
      orange: 'bg-orange-400'
    };
    return colors[color];
  };

  const filteredPromotions = promotions.filter(promotion =>
    promotion.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalResults = filteredPromotions.length;
  const itemsPerPage = 8;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <button className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium">
            Create
          </button>
        </div>

        {/* Tableau des promotions */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Barre de recherche et filtres */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Add filter</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
                  />
                </div>
                <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* En-têtes du tableau */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
            <div className="col-span-4">Code</div>
            <div className="col-span-3">Method</div>
            <div className="col-span-4">Status</div>
            <div className="col-span-1"></div>
          </div>

          {/* Lignes du tableau */}
          <div className="divide-y divide-gray-200">
            {paginatedPromotions.length > 0 ? (
              paginatedPromotions.map((promotion) => (
                <div 
                  key={promotion.id} 
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="col-span-4">
                    <span className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                      {promotion.code}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm text-gray-600">
                      {promotion.method}
                    </span>
                  </div>
                  <div className="col-span-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion.statusColor)}`}>
                      <div className={`w-2 h-2 ${getStatusDot(promotion.statusColor)} rounded-full mr-1`}></div>
                      {promotion.status}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No promotions found matching your search criteria
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalResults > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {`${(currentPage - 1) * itemsPerPage + 1} — ${Math.min(currentPage * itemsPerPage, totalResults)} of ${totalResults} results`}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{currentPage} of {totalPages} pages</span>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionsPage;