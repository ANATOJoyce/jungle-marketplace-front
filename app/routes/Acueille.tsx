import { FiMessageSquare, FiShoppingBag, FiPackage, FiUser, FiLogIn, FiCreditCard } from 'react-icons/fi';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/Jungle_logo05.png" 
              alt="Jungle Logo" 
              className="h-20 mr-3"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button 
            onClick={() => window.location.href = '/register'}
            className="flex items-center text-gray-600 hover:text-[#fbb344] transition-colors duration-300">
              <FiLogIn className="mr-2" /> Créer un compte
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-[#fbb344] hover:bg-[#faa533] text-white px-4 py-2 rounded-full flex items-center transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              <FiLogIn className="mr-2" />
              Se connecter
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Marketplace conversationnel révolutionnaire
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Dites simplement ce que vous voulez à notre bot, il s'occupe de tout !
            </p>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#fbb344] max-w-md mx-auto">
              <div className="bg-[#fccf8a] bg-opacity-30 rounded-lg p-4 mb-4 text-left">
                <p>Vous: Je cherche un ordinateur portable pour étudiant</p>
              </div>
              <div className="bg-[#fccf8a] rounded-lg p-4 text-left">
                <p className="font-medium">JungleBot: J'ai sélectionné 3 modèles adaptés. Budget idéal ?</p>
              </div>
              <button className="mt-6 bg-[#fbb344] hover:bg-[#faa533] text-white px-8 py-3 rounded-full font-medium shadow-md transition-all duration-300 transform hover:scale-105">
                Essayer maintenant
              </button>
            </div>
          </div>
        </section>

        {/* Mobile Demo Section */}
        <section className="bg-gray-50 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Une expérience mobile intuitive
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Commandez par chat et gérez votre boutique en quelques clics, directement depuis votre smartphone.
                </p>
                <p className="text-gray-500">
                  Notre interface conversationnelle simplifie vos achats et votre gestion de boutique.
                </p>
              </div>
              
              {/* Phone Mockup */}
              <div className="md:w-1/2 flex justify-center">
                <div className="relative border-8 border-gray-800 rounded-3xl h-[500px] w-[250px] bg-gray-900 overflow-hidden shadow-xl">
                  <div className="absolute inset-0 flex flex-col">
                    {/* Phone Status Bar */}
                    <div className="bg-gray-800 h-8 flex items-center justify-center">
                      <div className="w-16 h-1 bg-gray-600 rounded-full"></div>
                    </div>
                    
                    {/* Chat Content */}
                    <div className="flex-1 bg-gray-100 p-3 overflow-y-auto">
                      <div className="bg-[#fccf8a] rounded-lg p-3 mb-3 text-left max-w-[80%]">
                        <p className="text-sm">Bienvenue ! Que cherchez-vous aujourd'hui ?</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 mb-3 text-left max-w-[80%] ml-auto border border-gray-200">
                        <p className="text-sm">Je veux un nouveau smartphone milieu de gamme</p>
                      </div>
                      <div className="bg-[#fccf8a] rounded-lg p-3 mb-3 text-left max-w-[80%]">
                        <p className="text-sm">Voici 3 excellents choix. Préférez-vous Android ou iOS ?</p>
                      </div>
                      <div className="flex space-x-2 mb-3">
                        <button className="bg-white text-xs py-1 px-2 rounded border border-gray-300">Android</button>
                        <button className="bg-[#fbb344] text-white text-xs py-1 px-2 rounded">iOS</button>
                      </div>
                    </div>
                    
                    {/* Message Input */}
                    <div className="bg-white border-t border-gray-200 p-2">
                      <div className="flex items-center">
                        <input 
                          type="text" 
                          placeholder="Tapez votre message..." 
                          className="flex-1 bg-gray-100 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#fbb344]"
                        />
                        <button className="ml-2 bg-[#fbb344] text-white p-2 rounded-full hover:bg-[#faa533] transition-colors">
                          <FiMessageSquare size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Comment ça marche ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-t-4 border-[#fbb344]">
              <div className="bg-[#fccf8a] bg-opacity-20 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FiMessageSquare className="text-2xl text-[#fbb344]" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-center text-gray-800">1. Demandez</h3>
              <p className="text-gray-600 text-center">
                Décrivez votre besoin en langage naturel comme vous le feriez avec un ami
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-t-4 border-[#fbb344]">
              <div className="bg-[#fccf8a] bg-opacity-20 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FiShoppingBag className="text-2xl text-[#fbb344]" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-center text-gray-800">2. Choisissez</h3>
              <p className="text-gray-600 text-center">
                Sélectionnez parmi les options personnalisées proposées par notre bot
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-t-4 border-[#fbb344]">
              <div className="bg-[#fccf8a] bg-opacity-20 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FiPackage className="text-2xl text-[#fbb344]" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-center text-gray-800">3. Recevez</h3>
              <p className="text-gray-600 text-center">
                Suivez votre commande en temps réel jusqu'à la livraison
              </p>
            </div>
          </div>
        </section>

        {/* Vendor Section */}
        <section className="bg-gray-50 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Pour les vendeurs</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Dashboard optimisé</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Un espace de gestion simplifié pour suivre vos produits, vos ventes et vos statistiques en temps réel.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="bg-[#fbb344] text-white rounded-full p-1 mr-3 mt-1">
                      <FiShoppingBag className="text-sm" />
                    </span>
                    <span>Gestion simplifiée des produits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#fbb344] text-white rounded-full p-1 mr-3 mt-1">
                      <FiCreditCard className="text-sm" />
                    </span>
                    <span>Statistiques de ventes détaillées</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#fbb344] text-white rounded-full p-1 mr-3 mt-1">
                      <FiPackage className="text-sm" />
                    </span>
                    <span>Suivi des commandes en direct</span>
                  </li>
                </ul>
                <button className="mt-6 bg-[#fbb344] hover:bg-[#faa533] text-white px-6 py-3 rounded-full font-medium shadow-md transition-all duration-300">
                  Créer ma boutique
                </button>
              </div>
              <div className="flex justify-center">
                <img 
                  src="/image.png" 
                  alt="Dashboard Jungle" 
                  className="rounded-lg shadow-lg max-h-96 border-4 border-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#0c2444] py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <img
              src="/Jungle_logo05.png"
              alt="Logo Jungle"
              className="w-40 h-auto mx-auto mb-8 animate-float"
            />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Prêt à révolutionner votre expérience d'achat ?
            </h2>
            <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
              Rejoignez la nouvelle génération de marketplace conversationnel
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-white text-[#fbb344] hover:bg-gray-100 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                <FiMessageSquare className="inline mr-2" /> Essayer maintenant
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-[#fbb344] px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105">
                <FiUser className="inline mr-2" /> Créer ma boutique
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-#0c2444 text-#0c2444 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img 
                src="/Jungle_logo05.png" 
                alt="Jungle Logo" 
                className="h-12 mr-3"
              />
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-gray-100 transition-colors duration-300">Conditions</a>
              <a href="#" className="hover:text-gray-100 transition-colors duration-300">Confidentialité</a>
              <a href="#" className="hover:text-gray-100 transition-colors duration-300">Contact</a>
            </div>
          </div>
          <div className="mt-6 text-center text-white opacity-80">
            © {new Date().getFullYear()} Jungle. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* Animation CSS */}

    </div>
  );
}