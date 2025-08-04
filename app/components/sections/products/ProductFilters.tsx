/*Proposition de composants front-end pour ton dashboard multivendeur
1. Composants communs (UI et gestion formulaire)
InputText : input simple text/email/password avec label, erreur, etc.

SelectDropdown : liste déroulante avec options, multi-select possible

Button : bouton avec loader / désactivé / styles variés

Modal : fenêtre modale pour confirmations, détails, formulaires

Table : tableau avec tri, pagination, sélection des lignes

Pagination : navigation par pages (liée au tableau)

SearchBar : barre de recherche filtrant une liste

Tabs : onglets pour organiser des vues

Notification : affichage d’alertes succès/erreur/info

Loader : spinner ou barre de chargement

2. Composants Clients
ClientList : tableau listant clients avec recherche/filtre/sort

ClientGroupSelector : sélection ou création de groupe de clients

ClientForm : formulaire création / édition client

ClientDetails : vue détaillée d’un client

AssignPromotionToClient : UI pour affecter promotions/prix

3. Composants Produits
ProductList : tableau produits avec filtres (tags, types)

ProductForm : création / édition produit (nom, prix, variantes)

VariantForm : gestion des variantes (taille, couleur...)

TagSelector : ajout/suppression tags produit

PriceListSelector : associer prix personnalisés

4. Composants Listes de Prix
PriceListManager : gestion des listes de prix (création, modification)

PriceListForm : formulaire liste prix (validité, régions, canaux)

PriceListAssignment : associer liste prix à groupes clients

5. Composants Promotions & Campagnes
CampaignList : liste des campagnes marketing

CampaignForm : création / édition campagne (budget, dates, restrictions)

PromotionList : liste promotions avec types de réduction

PromotionForm : création / édition promotion

AssignPromotionToCampaign : affecter/supprimer promotions dans campagnes

6. Composants Commandes & Paiements
OrderList : liste des commandes, filtres, statuts

OrderDetails : détail d’une commande (items, statuts, paiement)

PaymentCapture : interface capture paiement manuelle/auto

7. Composants Paramètres
StoreSettings : formulaire paramètres boutique (nom, devise, etc.)

UserManagement : liste utilisateurs, rôles, accès

RegionCurrencySettings : gestion régions et devises

TaxRuleSettings : règles fiscales

ReturnReasonsSettings : gestion raisons retour produit

ApiKeysManagement : gestion clés API publiques et secrètes

8. Composants Profil Utilisateur
ProfileForm : mise à jour infos perso, langue, mot de passe*/