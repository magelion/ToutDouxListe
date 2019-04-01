M2 GI
Projet Mobile
2018-2019
-----------------------------

Thomas MEDARD
Maxence GINET
-----------------------------

Tout Doux Liste

=============================

Repo GitHub : 
https://github.com/magelion/ToutDouxListe

nos pseudo GitHub :
Thomas : WaffleBuffer
Maxence : magelion

============================

Liste des fonctionalités implémentées :

* Gestion des contact : demande d'ajout de contact, acceptation/refus, suppréssion contact
* Connexion SSO Google
* Partage de liste avec un ou des contacts (choisis)
* Déconnection
* Création de liste
* Création d'item (nom + description)
* Modification de liste
* Modification d'item
* Suppréssion d'item
* Suppréssion de liste

Liste des fonctionnalités échouées :

* SSO Facebook : les informations de connexion renvoyés par Facebook sont erronnées
* Suppréssion du compte : manque de temps
* Suppréssion de contact : certains scénario ne sont pas pris en compte + suppréssion des listes paratagées avec le contact
* Blockage de contact : manque de temps
* Gestion des différents droits lors du partage : manque de temps

============================

Compilation
-----------

ionic serve -scl

Déploiement
-----------

ionic cordova android run

Export des règles firebase
--------------------------

// Allow read/write access on all documents to any user signed in to the application
service cloud.firestore {
  match /databases/{database}/documents {
    //match /{document=**} {
      //allow read, write: if request.auth.uid != null;
      //allow read, write;
    //}
    
    // Check that you can only access to your lists
    // TODO : create a PublicTodoLists with read only rights
    match /TodoLists/{TodoList} {
    	allow read, write: if request.auth != null && request.auth != null && (request.auth.uid == resource.data.owner ||
      	get(/databases/$(database)/documents/PublicUsers/$(get(/databases/$(database)/documents/Users/$(request.auth.uid)).data.publicUid)).data.uid in resource.data.sharedTo);
      allow create: if request.auth != null && request.auth.uid != null;
    	//Tests
    	//allow read, write;
    }
    
    // Make sure the uid of the requesting user matches name of the user
    // document. The wildcard expression {userId} makes the userId variable
    // available in rules.
    match /Users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.auth.uid != null;
      // Tests
      // allow read, write;
    }
    
    // Ensure that only you can edit your public user profile
    match /PublicUsers/{publicUserId} {
    
      allow update, delete: if request.auth != null && get(/databases/$(database)/documents/Users/$(request.auth.uid)).data.publicUid == resource.data.uid;
      allow read, create: if request.auth != null && request.auth.uid != null;
      // Tests
      // allow read, write;
    }
    
    // Ensure that only involved users can act on contact request
    // TODO : ensure that each request is unique
    match /PendingContactRequests/{PendingContactRequestsId} {
    	allow create: if request.auth != null && request.auth.uid != null;
      allow read, update, delete: if request.auth != null && request.auth.uid != null 
      && ((get(/databases/$(database)/documents/PublicUsers/$(get(/databases/$(database)/documents/Users/$(request.auth.uid)).data.publicUid)).data.uid == resource.data.to) 
      || (get(/databases/$(database)/documents/PublicUsers/$(get(/databases/$(database)/documents/Users/$(request.auth.uid)).data.publicUid)).data.uid == resource.data.from));
      // Tests
      // allow read, write;
    }

  }
}

