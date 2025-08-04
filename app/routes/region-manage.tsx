import React, { useState, useEffect } from 'react';
import { CountryForm, CountryList } from '~/components/sections/countries';
import { RegionForm, RegionList, TaxCalculator } from '~/components/sections/region';
import { GeoHeader } from '~/components/sections/shared/GeoHeader';
import { GeoNavigation } from '~/components/sections/shared/GeoNavigation';
import { Country, Region as IRegion, Currency } from '~/types/country';
import axios from 'axios';

type Region = IRegion;

const API_BASE_URL = 'http://localhost:3000/regions'; // Adaptez selon votre configuration backend

const RegionManagePage = () => {
  const [activeSection, setActiveSection] = useState<'regions' | 'countries' | 'tax'>('regions');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données initiales depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Charger les régions
        const regionsResponse = await axios.get(`${API_BASE_URL}`);
        setRegions(regionsResponse.data);

        // Charger les pays
        const countriesResponse = await axios.get(`${API_BASE_URL}/countries`);
        setCountries(countriesResponse.data);

        // Charger les devises (si nécessaire)
        const mockCurrencies: Currency[] = [
          { code: 'USD', name: 'Dollar américain', symbol: '$' },
          { code: 'EUR', name: 'Euro', symbol: '€' },
          { code: 'CFA', name: 'CFA', symbol: 'CFA' }
        ];
        setCurrencies(mockCurrencies);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRegionSubmit = async (data: Partial<Region>) => {
    setIsLoading(true);
    try {
      if (data.id) {
        // Mise à jour de la région
        const response = await axios.patch(`${API_BASE_URL}/${data.id}`, data);
        setRegions(regions.map(r => r.id === data.id ? response.data : r));
      } else {
        // Création d'une nouvelle région
        const response = await axios.post(`${API_BASE_URL}`, data);
        setRegions([...regions, response.data]);
      }
      setSelectedRegion(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la région:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySubmit = async (data: Partial<Country>) => {
    setIsLoading(true);
    try {
      if (data.id) {
        // Mise à jour du pays
        const response = await axios.put(`${API_BASE_URL}/countries/${data.id}`, data);
        setCountries(countries.map(c => c.id === data.id ? response.data : c));
      } else {
        // Création d'un nouveau pays
        const response = await axios.post(`${API_BASE_URL}/create-country`, data);
        setCountries([...countries, response.data]);
      }
      setSelectedCountry(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du pays:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRegion = async (id: string) => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      setRegions(regions.filter(r => r.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la région:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCountry = async (id: string) => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/countries/${id}`);
      setCountries(countries.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du pays:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryCancel = () => {
    setSelectedCountry(null);
  };

  return (
    <div className="region-management p-4">
      <section className="geo-header-section mb-6">
        <GeoHeader title="Gestion des Régions et Pays" />
      </section>

      <section className="geo-navigation-section mb-8">
        <GeoNavigation 
          activeTab={activeSection}
          onTabChange={setActiveSection}
          tabs={[
            { id: 'regions', label: 'Régions' },
            { id: 'countries', label: 'Pays' },
            { id: 'tax', label: 'Calculateur Fiscal' }
          ]}
        />
      </section>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">Chargement...</div>
        </div>
      )}

      {activeSection === 'regions' && (
        <div className="regions-section grid md:grid-cols-2 gap-6">
          <section className="region-form-section bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              {selectedRegion ? 'Modifier Région' : 'Ajouter une Région'}
            </h2>
            <RegionForm
              initialData={selectedRegion || undefined}
              currencies={currencies}
              onSubmit={handleRegionSubmit}
              onCancel={() => setSelectedRegion(null)}
            />
          </section>

          <section className="region-list-section bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Liste des Régions</h2>
            <RegionList 
              regions={regions}
              currencies={currencies}
              onEdit={setSelectedRegion}
              onDelete={handleDeleteRegion}
              onCountrySelect={(region) => {
                setSelectedRegion(region);
                setActiveSection('countries');
              }}
            />
          </section>
        </div>
      )}

      {activeSection === 'countries' && (
        <div className="countries-section grid md:grid-cols-2 gap-6">
          <section className="country-form-section bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              {selectedCountry ? 'Modifier Pays' : 'Ajouter un Pays'}
            </h2>
            <CountryForm 
              initialData={selectedCountry || undefined}
              regions={regions}
              onSubmit={handleCountrySubmit}
              onCancel={handleCountryCancel}
            />
          </section>

          <section className="country-list-section bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Liste des Pays</h2>
            <CountryList 
              countries={selectedRegion ? 
                countries.filter(c => c.region?.id === selectedRegion.id) : 
                countries}
              regions={regions}
              onEdit={setSelectedCountry}
              onDelete={handleDeleteCountry}
            />
          </section>
        </div>
      )}

      {activeSection === 'tax' && (
        <section className="tax-calculator-section bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Calculateur Fiscal par Région</h2>
          <TaxCalculator regions={regions} />
        </section>
      )}
    </div>
  );
};

export default RegionManagePage;