import { useState, useEffect } from 'react'
import { Input } from './ui/Input'

interface Region {
  _id: string
  name: string
  code: string
}

interface RegionSelectorProps {
  selectedRegions: string[]
  onSelect: (ids: string[]) => void
  className?: string
}

export const RegionSelector = ({ 
  selectedRegions, 
  onSelect,
  className = '' 
}: RegionSelectorProps) => {
  const [regions, setRegions] = useState<Region[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRegions = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          throw new Error('Authentication token not found')
        }

        const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/regions`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch regions: ${res.statusText}`)
        }

        const data: Region[] = await res.json()
        setRegions(data || [])
      } catch (err: unknown) {
        console.error('Failed to load regions', err)
        setError(
          err instanceof Error 
            ? err.message 
            : 'An error occurred while loading regions'
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadRegions()
  }, [])

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleRegion = (regionId: string) => {
    const newSelection = selectedRegions.includes(regionId)
      ? selectedRegions.filter(id => id !== regionId)
      : [...selectedRegions, regionId]
    onSelect(newSelection)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Input
        label="Rechercher des régions"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Nom ou code de région..."
      />
      
      <div className="max-h-60 overflow-y-auto border rounded-md p-2">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Chargement...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : filteredRegions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {searchTerm ? 'Aucun résultat' : 'Aucune région disponible'}
          </div>
        ) : (
          filteredRegions.map(region => (
            <div 
              key={region._id} 
              className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
              onClick={() => toggleRegion(region._id)}
            >
              <input
                type="checkbox"
                id={`region-${region._id}`}
                checked={selectedRegions.includes(region._id)}
                onChange={() => toggleRegion(region._id)}
                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label 
                htmlFor={`region-${region._id}`} 
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                {region.name} ({region.code})
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  )
}