import { useState } from 'react';
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MoreHorizontal, Filter, ChevronLeft, ChevronRight, Folder, Search } from 'lucide-react';
import { getAuthToken } from '~/utils/auth.server';

// Types pour vos données
interface Product {
  id: number;
  name: string;
  image: string;
  collection: string;
  salesChannels: string;
  variants: string;
  status: string;
}

interface CollectionDetails {
  name: string;
  handle: string;
  description: string;
  status: string;
  visibility: string;
}

interface LoaderData {
  collection: CollectionDetails;
  products: Product[];
  breadcrumb: Array<{ name: string; path: string; current?: boolean }>;
}
export const loader: LoaderFunction = async ({ request }) => {
  const apiUrl = process.env.PUBLIC_NEST_API_URL || "http://localhost:3000";
  
  try {
    const response = await fetch(`${apiUrl}/products/collections`, {
      headers: {
        'Authorization': `Bearer ${await getAuthToken(request)}`
      }
    });

    if (!response.ok) {
      throw new Response(await response.text(), {
        status: response.status
      });
    }

    const collections = await response.json();
    return json({ collections });
  } catch (error) {
    throw new Response("Failed to load collections", { status: 500 });
  }
};

const CollectionDetailPage = () => {
  const { collection, products: initialProducts, breadcrumb } = useLoaderData<LoaderData>();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const filteredProducts = initialProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalResults = filteredProducts.length;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fonction pour obtenir la classe de statut
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête de la collection */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">{collection.name}</h1>
                  <div className="flex space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      collection.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-1 ${
                        collection.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      {collection.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      collection.visibility === 'public' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-1 ${
                        collection.visibility === 'public' ? 'bg-blue-400' : 'bg-gray-400'
                      }`}></div>
                      {collection.visibility === 'public' ? 'Public' : 'Private'}
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
                    <div className="text-sm text-gray-500">
                      {collection.description || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Handle</label>
                    <div className="text-sm text-gray-900 font-mono">
                      /{collection.handle}
                    </div>
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
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search products"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
                    />
                  </div>
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
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="col-span-1 flex items-center">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </div>
                      <div className="col-span-3 flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 bg-gray-400 rounded"></div>
                          )}
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
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(product.status)}`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            product.status === 'Published' ? 'bg-green-400' : 
                            product.status === 'Draft' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`}></div>
                          {product.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No products found matching your search criteria
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
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}
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