import React, { useState } from 'react';
import { MoreHorizontal, Filter, ChevronLeft, ChevronRight, Folder } from 'lucide-react';

const CollectionDetailPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const products = [
    {
      id: 1,
      name: 'Gaming PC',
      image: '/api/placeholder/40/40',
      collection: 'Gaming',
      salesChannels: 'Webshop',
      variants: '1 variant',
      status: 'Published'
    },
    {
      id: 2,
      name: 'Gaming bundle',
      image: '/api/placeholder/40/40',
      collection: 'Gaming',
      salesChannels: 'Webshop',
      variants: '1 variant',
      status: 'Published'
    }
  ];

  const breadcrumb = [
    { name: 'Computer & Tablets', path: '#' },
    { name: 'Desktop computers', path: '#' },
    { name: 'Gaming PC', path: '#', current: true }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalResults = filteredProducts.length;
  const totalPages = 1;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Détails de la collection */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête de la collection */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">Gaming PC</h1>
                  <div className="flex space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                      Active
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                      Public
                    </span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Détails de la collection */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <div className="text-sm text-gray-500">-</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Handle</label>
                    <div className="text-sm text-gray-900 font-mono">/gaming-pc</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Produits */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Barre de filtres */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Add filter</span>
                  </button>
                  
                  <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* En-têtes du tableau */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                <div className="col-span-1">
                  <input type="checkbox" className="rounded border-gray-300" />
                </div>
                <div className="col-span-3">Product</div>
                <div className="col-span-2">Collection</div>
                <div className="col-span-2">Sales Channels</div>
                <div className="col-span-2">Variants</div>
                <div className="col-span-2">Status</div>
              </div>

              {/* Lignes des produits */}
              <div className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-1 flex items-center">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </div>
                    <div className="col-span-3 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center">
                        <div className="w-6 h-6 bg-gray-600 rounded"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                        {product.name}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-gray-600">{product.collection}</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-gray-600">{product.salesChannels}</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-gray-600">{product.variants}</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        {product.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  1 — {Math.min(2, totalResults)} of {totalResults} results
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">1 of {totalPages} pages</span>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <span className="text-sm text-gray-600 px-2">Prev</span>
                    
                    <span className="text-sm text-gray-600 px-2">Next</span>
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
            </div>
          </div>

          {/* Colonne droite - Organisation */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Organize</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Chemin de navigation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Path</label>
                  <div className="space-y-2">
                    {breadcrumb.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Folder className="w-4 h-4 text-blue-500" />
                        <span className={`text-sm ${item.current ? 'text-gray-900 font-medium' : 'text-blue-600 hover:text-blue-700 cursor-pointer'}`}>
                          {item.name}
                        </span>
                        {index < breadcrumb.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Children */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                  <div className="text-sm text-gray-500">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionDetailPage;