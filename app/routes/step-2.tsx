import { useState } from "react";
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { getSession, commitSession } from "~/utils/session.server";

export default function VendorStep2() {
  const [phone, setPhone] = useState("");
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Informations personnelles
        </h1>

        {actionData?.error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-4">
          <input
            type="text"
            name="first_name"
            placeholder="Prénom"
            required
            className="w-full border border-gray-300 rounded px-4 py-2"
          />

          <input
            type="text"
            name="last_name"
            placeholder="Nom"
            required
            className="w-full border border-gray-300 rounded px-4 py-2"
          />

          <input
            type="text"
            name="city"
            placeholder="Ville de résidence"
            required
            className="w-full border border-gray-300 rounded px-4 py-2"
          />

          <div>
            <label className="block mb-1 text-sm text-gray-600">Téléphone</label>
            <PhoneInput
              country={"tg"}
              value={phone}
              onChange={setPhone}
              inputProps={{
                name: "phone",
                required: true,
                className: "w-full border border-gray-300 rounded px-4 py-2",
              }}
              containerClass="w-full"
              inputClass="w-full"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Continuer
          </button>
        </Form>
      </div>
    </div>
  );
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;

  if (!first_name || !last_name || !phone || !city) {
    return json({ error: "Tous les champs sont requis." }, { status: 400 });
  }

  const session = await getSession(request.headers.get("Cookie"));

  session.set("register", {
    ...session.get("register"),
    first_name,
    last_name,
    phone,
    city,
  });

  return redirect("/register-vendor", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
/*ok  j'ai revue le step de jumia , 
step1 mail et on enverra un code a 6 chiffre au mail pour verifier 
l'adreese , donc une page pour qu'il puisse vérifier en tapant le code, 
apres un autre formulaire viens ou il tapera son mail et creer un mot de passe a 8 lettre obligatoire il 
confirme le mot de passe, apres il met ces donné personnel tel que sont nom ,
 prenomn, date de naissance numero , et unj'ai lu et confirme les condition 
 puis cela le conduit sur une page ou il va donner les information de sont entreprise c'est a
  dire le nom de l'entreprise il cellectionne l'address ou se citura l'entreprise et  un mlessage qui lui demande 
s'il est sur de vouloir creer la boutique s'il dit oui on l'amene sur une page de confirmation avec son mail son numero et son mot de passe si
 c'est correct il aura enfin acess a son dashbord ou sera toute les information concernant sa boutique
 
 
 
 Sur le dashborad du vendeur on verra les informations suivant 
 
 1- order qui nous donne un tableau affichant un tableau comprenant : Order, Date, Customer, Sales channel, Payement , Fulfillement , Order Total
 Voici une version réduite, phrase par phrase, sous forme de fonctionnalités :

Gestion centralisée des commandes : Gérez toutes les commandes de votre boutique depuis un seul endroit, quel que soit le canal de vente.

Consultation des détails de commande : Accédez facilement aux informations complètes de chaque commande.

Capture de paiement : Effectuez la capture des paiements directement depuis l’interface.

Création d’envois et de traitements : Gérez les expéditions et les traitements des commandes de manière fluide.

Gestion des retours et échanges : Enregistrez et suivez les retours ou échanges de produits.

Fonctionnalités avancées : Bénéficiez d’options supplémentaires pour un traitement complet des commandes.


Résumé des articles achetés : Affiche un récapitulatif des produits commandés par le client.

Totaux de la commande : Présente les totaux liés aux taxes, à la livraison, et autres frais.

Vue d’ensemble rapide : Permet d’obtenir un aperçu global de la commande en un coup d’œil.

Gestion des retours et échanges : Facilite la création de retours ou d’échanges.

Modification des détails de la commande : Offre un accès direct à la gestion des informations de la commande.

Suivi des activités de commande : Affiche un résumé des modifications apportées à la commande.

Historique des paiements et expéditions : Montre les paiements capturés, les retours et les envois effectués.

Vue rapide de l’historique : Permet de consulter rapidement l’historique et les actions réalisées sur la commande.

Voici la version traduite et réduite en fonctionnalités, phrase par phrase :

Autorisation du paiement : Le paiement est autorisé par le fournisseur choisi dès qu’une commande est passée.

Capture de paiement : Gérez la commande en capturant les paiements.

Remboursements et montants dus : Traitez les remboursements ou gérez les montants en attente.

Affichage du statut de paiement : Consultez le statut de paiement de la commande en haut de la page de détails.

Paiement autorisé : Statut par défaut après commande, sauf si le paiement est capturé automatiquement.

Paiement partiellement autorisé : Une partie du paiement est autorisée, souvent après modification de la commande.

Paiement capturé : Le paiement a été entièrement capturé et traité.

Paiement partiellement capturé : Une partie seulement du paiement a été capturée, souvent suite à un échange ou ajustement.

Paiement remboursé : Le client a été intégralement remboursé.

Paiement partiellement remboursé : Une partie du montant a été remboursée au client
 
 2-CES PRODUIT 
  sur la page on a un tableau qui contient : Porduct(image du produit et son nom), Collection,  Sale channel, Variant, Statut , une icone pour exporter en pdf
    2-1 collections du poruidt qui est une page egalement 
    2-2 Categories du produit qui est une page sur laquel on peu crée les categorie de produit , avoir un tableau qui affiche les categorie existante

    Produit simple : Créez un produit sans variantes, comme une peinture.

Produit avec variantes : Gérez des variantes comme tailles et couleurs, par exemple pour un t-shirt.

Produit multi-composants : Créez des produits composés de plusieurs parties, chacun avec son propre kit d’inventaire (ex. : vélo avec cadre, roues, guidon).

Produit en bundle : Proposez des ensembles de produits vendus ensemble, chaque variante ayant son propre inventaire (ex. : pack appareil photo).

Saisie des informations générales : Entrez le nom du produit dans le champ Titre (obligatoire).

Champs optionnels : Ajoutez un sous-titre, un identifiant (Handle) unique pour l’URL, et une description.

Gestion du Handle : Utilisé pour créer une URL lisible et unique, généré automatiquement si non renseigné.

Ajout d’images : Téléchargez des images dans la section Medusa.

Définir une vignette : Choisissez une image comme miniature via le menu associé.

Variantes de produit : Activez le bouton pour indiquer que le produit a des variantes (couleurs, tailles).

Options de variantes : Ajoutez des options avec titres (ex. : Couleur) et valeurs (ex. : Noir, Blanc) séparées par des virgules.

Création automatique des variantes : Les variantes sont générées automatiquement selon les options, avec possibilité de désactiver certaines.

Étape Détails
Saisie du nom : Entrez le nom du produit (champ obligatoire).

Champs optionnels : Ajoutez un sous-titre, un identifiant URL (Handle) unique, et une description.

Gestion du Handle : Généré automatiquement si non renseigné, pour une URL lisible.

Ajout d’images : Téléchargez des images et définissez une vignette.

Variantes : Activez l’option pour produits avec variantes (couleurs, tailles) et ajoutez des options.

Création automatique des variantes : Variantes générées selon options, possibilité de désactiver certaines.

Validation : Cliquez sur « Continuer » pour passer à l’étape suivante.

2. Étape Organisation
Contrôle des remises : Activez ou désactivez la possibilité d’appliquer des remises.

Type de produit : Choisissez un type de produit (créé dans les paramètres).

Collections et catégories : Ajoutez le produit à des collections et catégories.

Tags : Ajoutez des tags pour faciliter la recherche.

Profil de livraison : Sélectionnez un profil définissant les conditions d’expédition.

Canaux de vente : Choisissez les canaux où le produit sera disponible.

Validation : Cliquez sur « Enregistrer », puis « Continuer ».

3. Étape Variantes
Modification en masse : Éditez titre, SKU, gestion des stocks, prix pour chaque variante.

Gestion des stocks : Activez ou non la gestion d’inventaire, gérez les quantités par emplacement.

Commandes en attente : Autorisez ou non les commandes en rupture de stock (backorders).

Kits d’inventaire : Activez pour gérer produits multi-parties ou bundles (optionnelle).

Prix par devise/région : Définissez les prix selon les monnaies et régions.

Taxes : Prix hors taxe ou TTC selon configuration.

Validation : Cliquez sur « Publier » ou « Continuer » pour la suite.

4. Étape Kits d’Inventaire (Optionnelle)
Création de kits : Ajoutez des composants pour produits multi-parties ou bundles.

Gestion des composants : Sélectionnez les articles d’inventaire et indiquez les quantités nécessaires par variante.

Ajout d’articles : Ajoutez plusieurs articles au kit.

Validation : Cliquez sur « Publier » pour finaliser.


Guide pour modifier les détails d’un produit dans Medusa Admin
Ouvrir les détails du produit

Accédez à la page Produits via la barre latérale.

Sélectionnez un produit pour ouvrir sa page de détails.

Gérer les détails généraux

Consultez et modifiez les informations générales du produit (titre, statut, description, etc.).

Statuts possibles :

Publié : produit disponible et achetable.

Brouillon : produit en cours de modification, non disponible.

Proposé : produit non approuvé, non disponible.

Rejeté : produit refusé, non disponible.

Modifier les détails du produit

Cliquez sur l’icône d’édition dans la section générale.

Modifiez le statut, titre, sous-titre, handle, matériau, description et si le produit est discountable.

Sauvegardez les modifications.

Supprimer un produit

Cliquez sur l’icône d’édition et choisissez “Supprimer”.

Confirmez la suppression (irréversible).

Gérer les médias du produit

Ajoutez, réorganisez, définissez une image miniature ou supprimez des images.

Utilisez les icônes et options “Modifier”, glisser-déposer, et raccourcis clavier (T pour miniature, D pour supprimer).

Gérer les options du produit

Ajoutez, modifiez ou supprimez des options (ex. : couleur, taille).

Pour les options existantes, les variantes doivent être créées manuellement.

Section Variantes

Affichez, recherchez, filtrez et modifiez les variantes.

Pour plus de détails, consultez le guide spécifique sur les variantes.

Gérer les métadonnées du produit

Ajoutez, modifiez ou supprimez des paires clé-valeur pour des données personnalisées.

Utilisez les options “Insérer ligne” ou “Supprimer ligne”.

Gérer les canaux de vente

Ajoutez ou retirez le produit des canaux de vente (impacte la disponibilité à l’achat).

Sauvegardez les modifications.

Gérer la configuration d’expédition

Choisissez ou modifiez le profil d’expédition du produit.

Gérer l’organisation du produit

Modifiez le type, la collection, les catégories et les tags du produit.

Gérer les attributs du produit

Modifiez les dimensions, poids, codes (MID, HS), et pays d’origine.


Collections de Produits pour Organiser les Produits
Qu’est-ce qu’une collection ?
Une collection est un groupe de produits partageant un thème commun (ex : collection été avec maillots, lunettes, serviettes). Elle facilite la navigation pour les clients.

Un produit peut appartenir à une seule collection.

Liste des Collections
Accédez à Produits → Collections pour voir, filtrer et rechercher toutes les collections.

Créer une Collection
Allez sur Produits → Collections.

Cliquez sur Créer en haut à droite.

Remplissez le formulaire :

Titre : nom de la collection (obligatoire).

Handle : identifiant URL unique (lettres minuscules, chiffres, tirets). Si vide, généré automatiquement.

Cliquez sur Créer.

Voir les Détails d’une Collection
Depuis la liste des collections, cliquez sur celle que vous souhaitez consulter.

Modifier une Collection
Dans la page détails de la collection, cliquez sur l’icône d’édition en haut à droite.

Choisissez Modifier.

Modifiez le titre et le handle.

Cliquez sur Enregistrer.

Modifier les Métadonnées d’une Collection
Dans la section Métadonnées, cliquez sur l’icône d’édition.

Ajoutez, modifiez ou supprimez des paires clé-valeur.

Sauvegardez.

Gérer les Produits d’une Collection
Ajouter des produits

Dans la page détails de la collection, allez à la section Produits.

Cliquez sur l’icône en haut à droite, puis Ajouter.

Cochez les produits à ajouter.

Sauvegardez.

Retirer un produit

Trouvez le produit dans la section Produits.

Cliquez sur l’icône à droite du produit, choisissez Retirer.

Confirmez la suppression.

Supprimer une Collection
Dans la page détails de la collection, cliquez sur l’icône en haut à droite, puis choisissez Supprimer.


Voici un résumé clair et structuré pour gérer les catégories de produits dans Medusa Admin :

Catégories de Produits pour Organiser les Produits
Qu’est-ce qu’une catégorie ?
Une catégorie regroupe des produits similaires (ex : catégorie « Chaussures » avec baskets, bottes, sandales).
Les catégories peuvent être imbriquées (ex : « Chaussures » dans « Femme »).
Un produit peut appartenir à plusieurs catégories.

Liste des Catégories
Allez dans Produits → Catégories pour voir, filtrer et chercher toutes les catégories.

Créer une Catégorie
Allez dans Produits → Catégories.

Cliquez sur Créer en haut à droite.

Remplissez les étapes du formulaire :

Détails :

Titre (obligatoire).

Handle (URL unique, minuscules, chiffres, tirets) — généré automatiquement si vide.

Description (optionnelle).

Statut : Active (visible) ou Inactive (non visible).

Visibilité : Public (clients voient la catégorie) ou Privé (seulement admin).
Cliquez sur Continuer.

Organisation :

Déplacez la catégorie avec l’icône de glisser-déposer pour modifier son ordre.

Imbriquez-la sous une autre catégorie en la décalant à droite.
Cliquez sur Enregistrer.

Voir les Détails d’une Catégorie
Cliquez sur une catégorie dans la liste pour accéder à sa page détails.

Statut et Visibilité d’une Catégorie
En haut à droite de la section principale :

Statut : Active / Inactive.

Visibilité : Public / Privé.

Modifier une Catégorie
Allez dans Produits → Catégories.

Cliquez sur la catégorie (dépliez la catégorie parente si besoin).

Cliquez sur l’icône d’édition dans la première section.

Modifiez titre, handle, description, statut, visibilité.

Cliquez sur Enregistrer.

Modifier les Métadonnées d’une Catégorie
Dans la section Métadonnées, cliquez sur l’icône d’édition.

Ajoutez, modifiez ou supprimez des paires clé-valeur.

Sauvegardez.

Gérer les Produits d’une Catégorie
Ajouter des produits

Dans la page détails, section Produits, cliquez sur l’icône.

Choisissez Ajouter.

Cochez les produits à ajouter.

Sauvegardez.

Retirer des produits

Dans la section Produits, cochez les produits à retirer.

Cliquez sur Retirer (ou appuyez sur R).

Confirmez.

Modifier le Classement et Hiérarchie des Catégories
Allez dans Produits → Catégories.

Cliquez sur Modifier le classement.

Déplacez les catégories pour changer leur ordre ou imbriquer.

Les modifications sont sauvegardées automatiquement.

Supprimer une Catégorie
Dans la liste, cliquez sur l’icône à droite de la catégorie.

Choisissez Supprimer.

Confirmez (action irréversible).

Exporter des Produits en CSV
Utilité :
Télécharger un fichier CSV avec les détails des produits, pratique pour intégrations externes ou sauvegardes.

Étapes pour Exporter
Allez sur la page Produits.

(Optionnel) Appliquez des filtres pour sélectionner un sous-ensemble de produits.

Cliquez sur le bouton Exporter en haut à droite.

Dans la fenêtre latérale, vérifiez les filtres appliqués.

Cliquez sur Exporter pour lancer l’export.

Pour suivre la progression, cliquez sur l’icône d’état en haut à droite.

Une fois prêt, cliquez sur l’icône pour télécharger le fichier CSV.



Confirmez la suppression (irréversible).
 3- Inventory

 Vue d’ensemble de l’inventaire dans Medusa Admin
Le domaine Inventaire vous permet de :

Gérer les articles d’inventaire

Suivre les quantités disponibles dans différents emplacements

Gérer les réservations de stock

Points clés
Quand la gestion des stocks est activée sur une variante de produit ("Gérer l’inventaire"), des articles d’inventaire sont automatiquement créés pour cette variante afin de suivre la quantité disponible.

Vous pouvez aussi créer des articles d’inventaire indépendamment et les lier plus tard à des variantes, ce qui est pratique pour les produits complexes comme les kits ou les produits composés.

Pour voir la liste des articles d’inventaire, allez dans le menu Inventaire dans la barre latérale.

La liste affiche des détails comme :

Le titre

Le SKU (référence produit)

La quantité en stock

Vous pouvez rechercher, filtrer et trier les articles pour trouver rapidement ce que vous cherchez.

Pour gérer les emplacements de stock, rendez-vous dans les Paramètres.

Vous pouvez aussi gérer les réservations, c’est-à-dire les stocks réservés pour des commandes.

Créer un article d’inventaire
Allez sur la page Inventaire dans la barre latérale.

Cliquez sur le bouton Créer en haut à droite.

Remplissez le formulaire en deux étapes :

Étape 1 : Détails
Entrez le titre et le SKU de l’article.

(Optionnel) Ajoutez une description.

Désactivez l’option "Nécessite une expédition" si l’article est un produit digital par exemple.

(Optionnel) Ajoutez les attributs (largeur, longueur, hauteur, poids, code MID, code SH, pays d’origine, matériau).

Cliquez sur Suivant.

Étape 2 : Disponibilité (éditeur en masse)
Si vous avez des emplacements créés dans les Paramètres, définissez la quantité disponible dans chaque emplacement.

Cliquez sur Enregistrer.

Voir les détails d’un article d’inventaire
Dans la page Inventaire, cliquez sur l’article dont vous voulez voir les détails.

Modifier les détails d’un article d’inventaire
Sur la page des détails de l’article, cliquez sur l’icône ✏️ en haut à droite de la première section.

Choisissez Modifier.

Modifiez le titre et le SKU.

Cliquez sur Enregistrer.

Modifier les attributs d’un article d’inventaire
Dans la section Attributs, cliquez sur l’icône ✏️ à droite.

Choisissez Modifier.

Modifiez les attributs (hauteur, largeur, longueur, poids, codes, pays d’origine, etc.).

Cliquez sur Enregistrer.

Modifier les métadonnées
Les métadonnées sont des paires clé-valeur personnalisées pour des intégrations ou informations supplémentaires.

Dans la section Métadonnées, cliquez sur l’icône correspondante.

Ajoutez, modifiez ou supprimez des paires clé-valeur.

Cliquez sur Enregistrer.

Gérer la disponibilité par emplacement
Dans la page de l’article, cliquez sur Gérer les emplacements dans la section Emplacements.

Cochez/décochez les emplacements où l’article est disponible.

Cliquez sur Enregistrer.

Gérer la quantité disponible par emplacement
Dans la section Emplacements, trouvez l’emplacement voulu et cliquez sur l’icône ⚙️.

Choisissez Modifier.

Modifiez la quantité en stock.

Cliquez sur Enregistrer.

Gérer les réservations d’un article
Les réservations bloquent des quantités d’articles pour des commandes en attente de traitement.

Créer une réservation
Dans la section Réservations, cliquez sur Créer.

Choisissez un emplacement.

Entrez la quantité à réserver (le tableau affiche la quantité disponible).

(Optionnel) Ajoutez une description.

Cliquez sur Créer.

Modifier une réservation
Trouvez la réservation, cliquez sur l’icône ⚙️ à droite.

Choisissez Modifier.

Modifiez emplacement, quantité ou description.

Cliquez sur Enregistrer.

Supprimer une réservation
Attention : cette action est irréversible et peut nécessiter une réallocation dans la commande.

Trouvez la réservation, cliquez sur l’icône ⚙️.

Choisissez Supprimer.

Confirmez en cliquant sur Supprimer.

Supprimer un article d’inventaire
Attention : cette action est irréversible et peut affecter les variantes liées.

Dans la page Inventaire, trouvez l’article à supprimer.

Cliquez sur l’icône ⚙️ à droite.

Choisissez Supprimer.

Confirmez en cliquant sur Supprimer.

Qu’est-ce qu’une réservation ?
Une réservation correspond à une quantité réservée d’un article d’inventaire.
Medusa crée automatiquement des réservations pour les articles d’inventaire dont les variantes ont été achetées. Cela permet d’éviter que cet article soit vendu à un autre client pendant que la commande est en cours de traitement. Une fois la commande exécutée (fulfillée), la réservation est supprimée.

Il est aussi possible de créer des réservations manuellement, par exemple pour une vente hors ligne ou pour un client ayant demandé une réservation.

Voir les réservations
Allez dans Inventaire via la barre latérale, puis cliquez sur le sous-menu Réservations.

Vous verrez la liste des réservations avec des détails comme le SKU et la quantité réservée.

Vous pouvez chercher, filtrer et trier les réservations pour trouver celle que vous voulez.

Créer une réservation manuellement
Allez dans Inventaire → Réservations.

Cliquez sur Créer en haut à droite.

Dans le formulaire :

Dans Article à réserver, choisissez ou saisissez le SKU de l’article.

Sélectionnez le Lieu où la réservation est effectuée.

Indiquez la Quantité à réserver.

Le tableau affiche la disponibilité actuelle et se met à jour selon la quantité saisie.

(Optionnel) Ajoutez une description.

Cliquez sur Créer.

Voir les détails d’une réservation
Dans Inventaire → Réservations, cliquez sur la réservation souhaitée pour ouvrir sa page de détails.

Modifier une réservation
Dans la liste des réservations, cliquez sur l’icône ⚙️ à droite de la réservation.

Sélectionnez Modifier.

Dans la fenêtre latérale, modifiez le lieu, la quantité ou la description.

Cliquez sur Enregistrer.

Modifier les métadonnées d’une réservation
Dans la page de détails, cliquez sur l’icône à droite de la section Métadonnées.

Ajoutez, modifiez ou supprimez des paires clé-valeur.

Cliquez sur Enregistrer.

Supprimer une réservation
Attention : cette action est irréversible. Si la réservation est liée à une commande, vous devrez peut-être réallouer l’article dans la commande.

Dans Inventaire → Réservations, trouvez la réservation.

Cliquez sur l’icône ⚙️ à droite, puis sur Supprimer.

Confirmez la suppression.


 4-Customers ou ils auras le tableau montrant le mail et le numero de ces customers, ajouter des customer a un groupe
 
 Vue d’ensemble des Clients dans Medusa Admin
Le domaine Clients vous permet de gérer les clients et les groupes de clients dans votre boutique en ligne.

Vous pouvez gérer les clients qui se sont enregistrés sur votre site ainsi que les clients invités (guest) qui ont passé une commande sans créer de compte.

Il est possible de segmenter ces clients en groupes afin de leur offrir des promotions spécifiques ou des listes de prix personnalisées.

Liste des Clients
Pour voir la liste complète des clients, cliquez sur Clients dans le menu latéral.

Dans cette liste, vous verrez des informations comme l’email, le nom, et le type de compte (client enregistré ou invité).

Vous pouvez chercher, filtrer et trier les clients pour trouver facilement celui que vous cherchez.

Gestion des Clients
Depuis cette interface, vous pouvez gérer les informations des clients, leurs groupes, et leurs interactions dans votre boutique.

Voir les commandes d’un client
Dans la page du client, onglet Commandes, vous pouvez consulter ses commandes.

En cliquant sur une commande, vous pouvez voir ses détails.

Transférer une commande à un autre client
Utile si un client invité s’est enregistré ou pour transférer une commande créée hors ligne.

La propriété de la commande sera transférée seulement après approbation du client original via une notification.

Impossible de transférer vers un client invité.

Pour transférer :

Aller à la page du client.

Dans les commandes, cliquer sur l’icône à droite d’une commande → Transférer propriété.

Choisir le nouveau client propriétaire.

Enregistrer.

Gérer les groupes de clients
Ajouter un client à plusieurs groupes pour appliquer des promotions ou tarifs spécifiques.

Ajouter un client à un groupe :

Aller à la page du client.

Dans la section Groupes de clients, cliquer sur Ajouter.

Cocher les groupes souhaités.

Enregistrer.

Retirer un client d’un groupe :

Dans la section Groupes de clients, cocher les groupes à retirer.

Cliquer sur Retirer ou appuyer sur R.

Confirmer.

Modifier les métadonnées d’un client
Données personnalisées en paires clé-valeur, souvent pour intégrations.

Pour modifier :

Aller à la page du client.

Cliquer sur l’icône dans la section Métadonnées.

Ajouter, modifier ou supprimer des paires clé-valeur.

Enregistrer.

Gérer les adresses d’un client
Depuis la version v2.7.0 de Medusa.

Ajouter une adresse :

Aller à la page du client.

Dans la section Adresses, cliquer sur Ajouter.

Remplir le formulaire d’adresse.

Enregistrer.

Supprimer une adresse :

Trouver l’adresse dans la section.

Cliquer sur l’icône à droite → Supprimer.

Confirmer en entrant le nom de l’adresse.

Supprimer un client
Suppression irréversible.

Pour supprimer :

Aller à la page du client.

Cliquer sur l’icône en haut à droite dans la section principale → Supprimer.

Confirmer en entrant l’email du client.

Gérer les groupes de clients dans Medusa Admin
Ce guide explique comment créer et gérer des groupes de clients.

Segmenter les clients avec des groupes
Un groupe de clients permet de segmenter vos clients selon certains critères. Cela permet par exemple d’appliquer des promotions ou tarifs spécifiques.

Exemples :

Un groupe VIP avec une remise de 10%.

Un groupe grossiste avec des prix réduits sur les grosses commandes.

Voir la liste des groupes de clients
Aller dans Clients → Groupes de clients.

Vous y verrez la liste complète, avec options de recherche et filtrage.

Créer un groupe de clients
Aller à Clients → Groupes de clients.

Cliquer sur Créer.

Entrer le nom du groupe.

Cliquer sur Créer.

Voir les détails d’un groupe
Dans Clients → Groupes de clients, cliquer sur un groupe pour voir ses détails.

Modifier un groupe de clients
Aller à la page du groupe.

Cliquer sur l’icône en haut à droite dans la première section.

Choisir Modifier.

Modifier le nom.

Enregistrer.

Gérer les clients dans un groupe
Ajouter des clients
Dans la page du groupe, section Clients, cliquer sur Ajouter.

Cocher les clients à ajouter.

Enregistrer.

Retirer des clients
Dans la section Clients, cocher les clients à retirer.

Cliquer sur Retirer ou appuyer sur R.

Confirmer.

Modifier les métadonnées d’un groupe
Données personnalisées en paires clé-valeur, pour intégrations ou informations supplémentaires.

Aller à la page du groupe.

Cliquer sur l’icône dans la section Métadonnées.

Ajouter, modifier ou supprimer des paires clé-valeur.

Enregistrer.

Supprimer un groupe de clients
Suppression irréversible.

Les clients du groupe ne sont pas supprimés.

Aller à la page du groupe.

Cliquer sur l’icône en haut à droite dans la première section.

Choisir Supprimer.

Confirmer.
 5-Promotions ou il peut crrer des promotion et l'attribuer a un groupe de customer VIP , etc..

 Promotions dans Medusa Admin
Le domaine Promotions vous permet de créer et gérer les réductions et campagnes dans votre boutique. Vous pouvez créer différents types de promotions, comme un montant ou pourcentage de réduction, ou des offres du type "achetez X, obtenez Y gratuitement".

Les promotions font partie de campagnes, ce qui vous permet de gérer les budgets, les dates de début et de fin, et bien plus encore, vous offrant un contrôle précis sur vos promotions.

Vous pouvez voir la liste des promotions de votre boutique en cliquant sur Promotions dans le menu latéral.

Dans cette liste, vous verrez des détails comme le code de la promotion et son statut. Vous pouvez aussi rechercher, filtrer et trier les promotions pour trouver celle que vous cherchez.

Astuce : Retrouvez des conseils pour utiliser efficacement les listes dans ce guide.

Gestion des promotions
Créer une promotion

Gérer les promotions

Gérer les campagne
Créer une promotion dans Medusa Admin
Ce guide vous explique comment créer différents types de promotions avec leurs configurations.

Étapes pour créer une promotion :
1. Aller dans Promotions
Cliquez sur Créer pour ouvrir le formulaire de création en 3 étapes :

Type

Détails

Campagne

Étape 1 : Choisir le type de promotion
Sélectionnez l’un des types suivants :

Montant sur produits : remise fixe sur certains produits selon des conditions.

Montant sur commande : remise fixe sur le total de la commande.

Pourcentage sur produit : remise en % sur certains produits selon des conditions.

Pourcentage sur commande : remise en % sur le total de la commande.

Achetez X, obtenez Y : achetez X quantité, obtenez Y gratuitement.

Cliquez sur Continuer.

Étape 2 : Détails (varie selon le type choisi)
a. Montant sur produits
Méthode : code promo (client doit saisir un code) ou automatique (appliqué si conditions remplies).

Statut : Brouillon ou Actif.

Code : code promo sans espaces (ex : 50OFF).

Inclure taxes : promotion appliquée avant ou après taxes.

Conditions d’utilisation (ex : groupe client, région, pays, canal de vente).

Valeur promotion : montant de la remise.

Quantité max : nombre max d’articles sur lesquels la promo s’applique.

Articles concernés (produit, catégorie, collection, type, tag).

b. Montant sur commande
Similaire au précédent, mais la remise s’applique sur le total de la commande.

c. Pourcentage sur produit
Comme le montant sur produits, mais la remise est un pourcentage.

d. Pourcentage sur commande
Comme le montant sur commande, mais la remise est un pourcentage.

e. Achetez X, obtenez Y
Méthode, statut, code promo, conditions d’utilisation : mêmes options que précédemment.

Conditions "Achetez X" : définir la quantité minimale et produits concernés.

Conditions "Obtenez Y" : définir la quantité et produits offerts.

Étape 3 : Campagne
Associez la promotion à une campagne pour gérer budget, dates, etc.
Options :

Continuer sans campagne

Continuer avec une campagne existante

Créer une nouvelle campagne (nom, identifiant, description, dates, budget par usage ou montant)

Une fois la promotion créée, vous pouvez la gérer depuis la liste des promotions.

Voir les détails d’une promotion
Allez dans Promotions dans la barre latérale → sélectionnez une promotion → consultez les détails.

Les sections peuvent varier selon le type de promotion.

Statuts d’une promotion
Brouillon : Non active, inutilisable.

Active : Utilisable.

Inactivée : Désactivée manuellement, inutilisable.

Planifiée : Début dans le futur.

Expirée : Date de fin dépassée, inutilisable.

Modifier les détails généraux de la promotion
Depuis la page de détails → cliquez sur l’icône modifier en haut à droite → choisissez Modifier.

Changez le statut (Brouillon, Active, Inactivée).

Modifiez la méthode (manuelle ou automatique), le code.

Ajustez le type de remise (montant fixe ou pourcentage) et la valeur.

Définissez si la promotion s’applique à chaque article applicable ou sur l’ensemble des articles.

Enregistrez.

Modifier qui peut utiliser la promotion
Dans la section Qui peut utiliser ce code ? → cliquez sur l’icône modifier → Modifier.

Ajoutez/modifiez des conditions selon les attributs :

Groupe client, Région, Pays, Canal de vente, Code monnaie.

Choisissez l’opérateur : Dans, Égale, Pas dans.

Définissez les valeurs (ex. : groupe client B2B).

Enregistrez.

Modifier les articles auxquels s’applique la promotion
Dans la section À quels articles la promotion s’applique-t-elle ? → cliquez sur l’icône modifier → Modifier.

Ajoutez/modifiez des conditions selon les attributs produits :

Produit, Catégorie, Collection, Type, Étiquette.

Opérateurs : Dans, Égale, Pas dans.

Définissez les valeurs (ex. : catégorie « Ordinateurs de bureau professionnels »).

Enregistrez.

Modifier la condition « Acheter X » (pour promotions "Buy X Get Y")
Dans la section Que faut-il dans le panier pour débloquer la promotion ? → cliquez sur l’icône modifier → Modifier.

Modifiez la quantité minimale ou ajoutez des conditions.

Enregistrez.

Ajouter une promotion à une campagne
Dans la section Campagne → cliquez sur Ajouter à une campagne.

Sélectionnez Campagne existante → choisissez la campagne (la devise doit correspondre si remise en montant fixe).

Enregistrez.

Changer la campagne d’une promotion
Dans la section Campagne → cliquez sur l’icône modifier → Modifier.

Sélectionnez Sans campagne pour retirer ou choisissez une autre campagne.

Enregistrez.

Supprimer une promotion
Depuis la page détails → cliquez sur l’icône modifier → Supprimer.

Confirmez en entrant le code promotionnel → cliquez sur Supprimer.

Attention : cette action est irréversible.

Qu’est-ce qu’une campagne ?
Une campagne est un ensemble de promotions liées à des objectifs marketing ou commerciaux spécifiques. Elle permet de contrôler finement l’utilisation des promotions, notamment en définissant des dates de début et de fin, ainsi qu’un budget d’utilisation. Lorsque ce budget est dépassé, les promotions de la campagne ne peuvent plus être utilisées.

Voir les campagnes
Allez dans Promotions > Campagnes dans la barre latérale.

La liste affiche le nom, la description et l’identifiant de chaque campagne.

Vous pouvez rechercher, filtrer et trier pour trouver facilement une campagne.

Créer une campagne
Allez dans Promotions > Campagnes.

Cliquez sur Créer en haut à droite.

Remplissez le formulaire :

Nom et identifiant de la campagne.

Optionnel : description, date de début, date de fin.

Budget de campagne (type Usage ou Dépense) :

Usage : nombre maximal d’utilisations des promotions.

Dépense : montant total maximal des remises.

Si vous choisissez Dépense, sélectionnez la devise.

Saisissez la limite de budget selon le type choisi.

Cliquez sur Créer.

Voir les détails d’une campagne
Depuis Promotions > Campagnes, cliquez sur la campagne.

La page détail affiche toutes les infos sur la campagne.

Statuts d’une campagne
Planifiée : date de début dans le futur.

Active : campagne active, promotions utilisables.

Expirée : date de fin dépassée, campagne et promotions expirées.

Modifier les détails d’une campagne
Depuis la page détail, cliquez sur l’icône modifier en haut à droite.

Choisissez Modifier.

Modifiez nom, description, identifiant, dates.

Enregistrez.

Modifier la limite de budget d’une campagne
Depuis la page détail, cliquez sur l’icône modifier dans la section Budget.

Choisissez Modifier.

Modifiez la limite (usage ou dépense).

Enregistrez.

Gérer les promotions d’une campagne
Ajouter des promotions à une campagne
Vous ne pouvez ajouter que des promotions qui ne sont pas déjà associées à une autre campagne.

Depuis la page détail de la campagne, cliquez sur Ajouter dans la section Promotions.

Sélectionnez les promotions à ajouter.

Enregistrez.

Retirer des promotions d’une campagne
Depuis la page détail, dans la section Promotions, sélectionnez les promotions à retirer.

Cliquez sur Supprimer ou appuyez sur la touche R.

Confirmez dans la fenêtre pop-up.

Supprimer une campagne
Attention : la suppression est irréversible.

Supprimer une campagne ne supprime pas ses promotions.

Depuis la page détail, cliquez sur l’icône modifier → Supprimer.

Confirmez la suppression.


 6- Price Lists

 Listes de prix dans Medusa Admin
Le domaine Listes de prix vous permet de gérer des tarifs produits personnalisés pour des groupes de clients dans votre boutique. Ces prix peuvent correspondre à des promotions ou à des tarifs qui remplacent les prix par défaut pour certains groupes de clients.

Par exemple, vous pouvez utiliser les listes de prix pour offrir aux clients du groupe B2B des tarifs différents, ce qui vous permet de gérer simultanément des clients B2B et B2C dans la même boutique.

Voir les listes de prix
Cliquez sur Listes de prix dans le menu latéral.

La liste affiche les détails comme le titre et le statut de chaque liste de prix.

Vous pouvez rechercher, filtrer et trier les listes de prix pour trouver celle que vous cherchez.

Gérer les listes de prix
Créer une liste de prix

Modifier ou supprimer une liste de prix

Pour créer une liste de prix :
Allez dans Listes de prix depuis le menu latéral.

Cliquez sur le bouton Créer en haut à droite.

Un formulaire en 3 étapes s’ouvre : Détails, Produits, et Tarifs.

Étape 1 : Détails
Dans cette première étape, vous renseignez les informations générales de la liste de prix :

Type : choisissez entre

Promotion (Sale) : Utile si vous créez une promotion temporaire sur certains produits.

Remplacement (Override) : Utile si vous souhaitez remplacer les prix par défaut de façon permanente pour un segment de clients.

Titre : entrez le nom de la liste de prix.

Statut : choisissez l’un des statuts suivants :

Active : la liste de prix est active et utilisable. Si une date de début est définie, la liste sera active à partir de cette date.

Brouillon (Draft) : la liste de prix n’est pas active et ne peut pas être utilisée.

Description : ajoutez une description pour votre liste de prix.

Date de début (optionnel) : choisissez la date à partir de laquelle la liste sera active.

Date d’expiration (optionnel) : choisissez la date après laquelle la liste de prix expirera automatiquement.

Disponibilité clients : spécifiez les groupes de clients auxquels cette liste de prix s’applique. Les clients de ces groupes verront les prix définis dans cette liste.

Cliquez sur Parcourir (Browse).

Cochez les groupes de clients concernés.

Une fois terminé, cliquez sur Enregistrer, puis sur Continuer pour passer à l’étape suivante.

Étape 2 : Produits
Dans cette étape, sélectionnez les produits dont vous souhaitez modifier les prix dans cette liste.

Cochez les produits à inclure.

Utilisez la recherche, le filtrage ou le tri pour trouver facilement les produits désirés.

Cliquez sur Continuer pour passer à l’étape suivante.

Étape 3 : Tarifs
Dernière étape : utilisez l’éditeur en masse (Bulk Editor) pour saisir les nouveaux prix des variantes des produits sélectionnés.

Vous pouvez définir les prix pour chaque devise et région de votre boutique.

Quand vous avez fini, cliquez sur Enregistrer pour créer la liste de prix.

Vous pouvez maintenant gérer la liste de prix que vous venez de créer.

Gérer les listes de prix dans Medusa Admin
Dans ce guide, vous apprendrez à gérer les listes de prix et leurs informations associées.

Voir les détails d’une liste de prix
Pour consulter les détails d’une liste de prix :

Allez sur la page Listes de prix depuis le menu latéral.

Cliquez sur la liste de prix que vous souhaitez consulter.

La page de détails de la liste de prix s’ouvrira.

Statut d’une liste de prix
En haut à droite de la première section, vous trouverez le statut de la liste de prix. Il peut être :

Statut	Description
Brouillon	La liste de prix n’est pas active et ne peut pas être utilisée.
Active	La liste de prix est active et peut être utilisée.
Planifiée	La liste de prix a une date de début dans le futur. Elle devient active à cette date.
Expirée	La liste de prix a une date de fin dépassée. Elle ne peut plus être utilisée.

Modifier les détails d’une liste de prix
Pour modifier les détails d’une liste de prix :

Astuce : Pour modifier les dates de début et de fin ou la disponibilité client, reportez-vous à la section Modifier les configurations de la liste de prix.

Allez sur la page de détails de la liste de prix.

Cliquez sur l’icône en haut à droite de la première section.

Sélectionnez Modifier dans le menu déroulant.

Dans la fenêtre latérale, vous pouvez modifier le type, le titre, le statut et la description de la liste de prix.

Si vous changez le statut en Active alors que la date de début est dans le futur, la liste aura le statut Planifiée et deviendra active à la date prévue.

Cliquez sur Enregistrer quand vous avez terminé.

Modifier les configurations d’une liste de prix
Les configurations incluent les dates de début, d’expiration, et la disponibilité des groupes de clients.

Allez sur la page de détails de la liste de prix.

Cliquez sur l’icône en haut à droite de la section Configuration.

Choisissez Modifier dans le menu déroulant.

Dans la fenêtre latérale, modifiez les dates de début, de fin et les groupes de clients concernés.

Pour changer les groupes de clients, cliquez sur Parcourir, sélectionnez les groupes, puis cliquez sur Enregistrer.

Cliquez sur Enregistrer à nouveau pour confirmer les modifications.

Gérer les produits dans une liste de prix
Ajouter des produits à une liste de prix
Allez sur la page de détails de la liste de prix.

Dans la section Produits, cliquez sur l’icône .

Sélectionnez Ajouter des produits dans le menu déroulant.

Cochez les produits que vous souhaitez ajouter.

Cliquez sur Continuer.

À l’étape suivante, utilisez l’éditeur en masse (Bulk Editor) pour fixer les prix des variantes des produits ajoutés, pour chaque devise et région.

Cliquez sur Enregistrer.

Retirer des produits d’une liste de prix
Allez sur la page de détails de la liste de prix.

Dans la section Produits, cochez les produits à retirer.

Appuyez sur la touche D ou cliquez sur Supprimer en bas au centre.

Confirmez la suppression en cliquant sur Supprimer dans la fenêtre pop-up.

Modifier les prix dans une liste de prix
Pour modifier les prix des produits dans la liste :

Allez sur la page de détails de la liste de prix.

Dans la section Produits, cliquez sur l’icône .

Sélectionnez Modifier les prix dans le menu déroulant.

L’éditeur en masse s’ouvre pour modifier les prix des variantes des produits, pour chaque devise et région.

Cliquez sur Enregistrer une fois les modifications terminées.

Supprimer une liste de prix
⚠️ Attention : La suppression d’une liste de prix est irréversible.

Allez sur la page de détails de la liste de prix.

Cliquez sur l’icône en haut à droite de la première section.

Sélectionnez Supprimer dans le menu déroulant.

Dans la fenêtre pop-up, saisissez le titre de la liste de prix puis cliquez sur Supprimer.

7-setting 

Paramètres dans Medusa Admin
Les paramètres de votre boutique Medusa vous permettent de gérer les détails de la boutique, les régions, les canaux de vente, et bien plus encore.

Vous pouvez accéder aux paramètres de votre boutique en cliquant sur l’élément Paramètres en bas du menu latéral. Cela ouvre un panneau de paramètres avec une barre latérale différente pour gérer les données de votre boutique.

Pour revenir au menu principal, cliquez sur l’icône en haut de la barre latérale.

Gérer les paramètres
Gérer la boutique

Gérer les utilisateurs

Gérer les régions

Gérer les régions fiscales

Gérer les motifs de retour

Gérer les canaux de vente

Gérer les types de produits

Gérer les tags produits

Gérer les paramètres de localisation et d’expédition


Gérer les exécutions de workflows

Gérer le profil

Gérer la boutique dans Medusa Admin
Dans ce guide, vous apprendrez à modifier les détails de la boutique et les devises disponibles.

Voir les détails de la boutique
Pour voir les détails de votre boutique, allez dans Paramètres → Boutique. Là, vous pouvez consulter et gérer les informations de la boutique ainsi que ses devises disponibles.

Modifier les détails de la boutique
Pour modifier les détails de la boutique :

Allez dans Paramètres → Boutique.

Cliquez sur l’icône en haut à droite de la section Boutique.

Choisissez Modifier dans le menu déroulant.

Dans la fenêtre latérale qui s’ouvre, vous pouvez modifier le nom de la boutique, la devise par défaut, la région par défaut, le canal de vente par défaut, et l’emplacement par défaut. Ces paramètres sont utilisés dans la vitrine si aucune autre valeur n’est fournie.

Une fois terminé, cliquez sur Enregistrer.

Gérer les devises
Votre boutique peut supporter plusieurs devises, ce qui permet aux clients de voir les prix dans la devise de leur choix. Vous pouvez ajouter ou supprimer des devises dans les paramètres de la boutique.

Ajouter des devises
Pour ajouter des devises à votre boutique :

Allez dans Paramètres → Boutique.

Cliquez sur l’icône en haut à droite de la section Devises.

Choisissez Ajouter dans le menu déroulant.

Dans la liste qui s’ouvre, cochez les devises que vous souhaitez ajouter.

Pour activer la tarification TTC (taxe incluse) pour une devise, activez le bouton bascule à droite de la devise.

Cliquez sur Enregistrer.

Modifier la configuration TTC d’une devise
Dans les paramètres de la boutique, vous pouvez gérer si une devise utilise une tarification TTC ou HT. Lors du passage en caisse, après que Medusa ait calculé la taxe d’un produit ou de la livraison, il peut soit :

Ajouter la taxe au prix du produit (tarification HT).

Inclure la taxe dans le prix du produit (tarification TTC).

Pour modifier ce réglage pour une devise :

Allez dans Paramètres → Boutique.

Cliquez sur l’icône à droite de la devise à modifier.

Choisissez Activer la tarification TTC ou Désactiver la tarification TTC selon le réglage souhaité.

Supprimer des devises
Vous pouvez supprimer n’importe quelle devise qui n’est pas la devise par défaut. Vous pourrez la rajouter plus tard si besoin.

Pour supprimer une devise :

Allez dans Paramètres → Boutique.

Dans la section Devises, cochez les devises à supprimer.

Appuyez sur la touche R ou cliquez sur le bouton Supprimer en bas au centre.

Confirmez la suppression en cliquant sur Supprimer dans la fenêtre pop-up.

Gérer les métadonnées de la boutique
Les métadonnées sont des données personnalisées associées à la boutique sous forme de paires clé-valeur. Elles sont souvent utilisées par les développeurs pour des intégrations personnalisées ou pour stocker des informations supplémentaires.

Pour modifier les métadonnées de la boutique :

Cliquez sur l’icône à droite de la section Métadonnées.

Dans la fenêtre latérale qui s’ouvre :

Gérez les paires clé-valeur dans le tableau.

Pour ajouter une nouvelle ligne avant ou après une ligne existante : survolez la ligne, cliquez sur l’icône à droite, puis choisissez Insérer une ligne au-dessus ou Insérer une ligne en dessous.

Pour supprimer une ligne : survolez la ligne, cliquez sur l’icône à droite, puis choisissez Supprimer la ligne.

Une fois terminé, cliquez sur Enregistrer.

Voir les détails du profil
Pour voir les détails de votre profil, allez dans Paramètres → Profil.
Vous pouvez aussi cliquer sur votre nom en bas à droite de la barre latérale, puis choisir Paramètres du profil dans le menu.

Sur la page des détails de votre profil, vous pouvez consulter des informations comme votre nom, votre adresse email et les paramètres de langue.

Modifier les détails du profil
Pour modifier les détails et paramètres de votre profil :

Allez dans Paramètres → Profil.

Cliquez sur l’icône en haut à droite de la page.

Choisissez Modifier dans le menu déroulant.

Dans la fenêtre latérale qui s’ouvre, vous pouvez modifier votre prénom, nom et la langue de l’interface Medusa Admin.

Note : Cela change uniquement la langue de l’interface d’administration, pas la langue de la boutique.

Cela ne modifie pas non plus la langue pour les autres utilisateurs.

Une fois terminé, cliquez sur Enregistrer.

Astuce : Vous ne trouvez pas votre langue ? Découvrez comment contribuer en traduisant l’admin dans d’autres langues ici.


 7- STATISTIQUE DES CES VENTES
 
 Vérifier les notifications
En haut à droite, vous trouverez une icône 🔔. En cliquant sur cette icône, une fenêtre latérale s’ouvre pour afficher les notifications que vous pourriez avoir. Utilisez-la pour consulter des notifications telles que les exportations de produits terminées.
*/

