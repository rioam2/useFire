# useFire

[![Build Status](https://travis-ci.com/rioam2/useFire.svg?branch=master)](https://travis-ci.com/rioam2/useFire)
[![Coverage Status](https://coveralls.io/repos/github/rioam2/useFire/badge.svg?branch=master)](https://coveralls.io/github/rioam2/useFire?branch=master)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![NPM Version](https://img.shields.io/npm/v/usefire.svg)](https://www.npmjs.com/package/usefire)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://img.shields.io/badge/license-MIT-blue.svg)

Declarative React Hooks for quick and easy Firebase/Firestore integration.  

# Overview

Firebase has as wonderful API, but it's notoriously difficult to integrate with React because of it's imperative nature. `useFire` aims to eliminate this frustration. For example, using React hooks and `useFire`, we can write clean and declarative code to access real-time data from a Firestore database:

```js
// ...

const defaultData = {}; // Default used to initialize document if it doesn't exist.
const fallbackData = {}; // Fallback used when not authorized to access resource.
const [ data, setData, setDataPerms ] = useFirestore(`/users/1234`, defaultData, fallbackData);

// When an update happens on the database, a re-render will automatically be triggered
// and `data` will reflect the updates. This all happens real-time. You also get access
// to dynamic permission management out-of-the-box!

// ...
```


Usually, using only firebase's native APIs, you would need to slew the following imperative code all over your react component to access data in real-time. Because React has put so much focus on eliminating imperative code, this is particularly undesirable...

```js
// ...

// Access document: /users/<user-uid>
const fallbackData = {};
const defaultData = {};
const docRef = db.doc("users/1234");

docRef.onSnapshot(function(snap) {
    // Document has been updated remotely, sync changes to local state...
    snap.get().then(function(doc) {
        const data = doc.data();
        this.setState(data)
    }).catch(function() {
        // Failed to get document, use fallback...
        this.setState(fallbackData);
    })
}, function() {
    // Snapshot error, use fallback...
    this.setState(fallbackData);
});

// ...
```

# Quick Start

Using yarn:

`yarn add useFire`

or NPM:

`npm i useFire`

# Usage

The default export of this package is a factory function that returns the hooks wrapped in an object. This is done so that the resulting hooks can be explicitly bound to your application's React and Firebase instances. Below is the recommended pattern for binding and accessing/re-exporting the hooks from within your app:

```js
// examples/firebase/hooks.js

import * as React from 'react';
import { useFire } from 'usefire'; // yarn add usefire
import FirebaseApp from './app';

// Using authentication and firestore features
import 'firebase/firestore';
import 'firebase/auth';

// Export hooks bound to your application's React and Firebase instances
export const { useFirestore, useFireauth } = useFire(React, FirebaseApp);

```

Now, you will be able to access `useFire` hooks by importing them from your version of the file above.

# API Reference

 - #### `useFireauth ()`
   - Declarative Hook wrapper for Firebase's authentication APIs. The returned hook is an object, because the contents of the hook do not have a clear order of importance.
   - #### Returned Hook: ` { user, isLoading, login, logout, register } `
     - `user: firebase.User | null` - The currently logged in firebase user or null
     - `isLoading: boolean` - True while firebase is initializing after a new page visit or refresh. Validity of the user is not guaranteed until loading is complete.
     - `login: object`: All of the following are the same as Firebase provides out-of-the-box. See Firebase's official documentation for more details.
       - `withCredential: (credential: firebase.auth.AuthCredential) => Promise<firebase.auth.UserCredential>` 
       - `withEmailAndPassword: (email: string, password: string) => Promise<firebase.auth.UserCredential>`
       - `withEmailLink: (email: string, emailLink?: string | undefined) => Promise<firebase.auth.UserCredential>`
       - `withFacebook: () => Promise<firebase.auth.UserCredential>`
       - `withGithub: () => Promise<firebase.auth.UserCredential>`
       - `withGoogle: () => Promise<firebase.auth.UserCredential>`
       - `withToken: (token: string) => Promise<firebase.auth.UserCredential>`
     - `logout: () => Promise<void>` - Logs out the currently signed-in user. If logged out already, this method is a no-op.
     - `register: object`: Creates a new user with the provided username and password. If successful, the user will be logged in. See Firebase's official documentation for more details.
       - `withEmailAndPassword: (user: string, password: string) => Promise<firebase.auth.UserCredential>` - Th 

 - #### `useFirestore<T> ( path: string, initialValue: T, fallbackValue: T )`
   - Hook wrapper for Firestore's native APIs with added support for permission handling, dot-walking, initial and fallback values. Data is bound to Firestore using `DocumentReference.onSnapshot()` for real-time data-linking.
   - **Parameters:**
     - **` path: string `** - Path of the document to use. Supports dot-walking to specific document fields or nested maps and '$' as a substitute for `/users/<user-uid>`.
       - Example: ` path = '$.favoriteColor' ` accesses the 'favoriteColor' field on the document `/users/<user-uid>`
     - **` initialValue: T `** - Used as an initial value if the document or field does not already exist. Must be an object if a document is referenced in the path instead of a specific field.
     - **` fallbackValue: T `** - Fallback value shown to unauthorized users. If not provided, `initialValue` is used.
   - #### Returned Hook: ` [ data, setData, setDocPerm ] `
     - **`data: T`** - real-time document or field data referenced by the provided database path.
     - **`setData: (newData: T) => Promise<void>`** - sets the data referenced by the provided database path both remotely and locally. Causes a re-render of the enclosing React component.
     - **`setDocPerm: (uid: string, perms: PermissionMap) => Promise<void>`** - See ['Using Permissions'](#using-permissions) below. Sets document access permissions for the user who's uid is provided. 'perms' should be an object with boolean entries for the `read`, `write`, `get`, `list`, `create`, `update`, and `delete` permissions. The latter 4 more granular permissions will take precedence over the more general permissions `read` and `write` when both present.
       - **Warning:** This sets permissions for the entire document even if a specific field is referenced by the provided path.
       - Example: `setDocPerm('1234', { read: true, write: false })` gives read-only access to the user with uid '1234' on the document referenced by the path provided to the hook.

# Using Permissions

This hook API assumes that you are using an extension of the following basic Firestore rules:

```js
// examples/firestore.rules

service cloud.firestore {
  match /databases/{database}/documents {
  
    // Users have access to their own scope
    match /users/{pathUID} {
      allow read, write: if pathUID == request.auth.uid;
    	match /{nested=**} {
        allow read, write: if pathUID == request.auth.uid;      
      }
    }
    
    // Default behavior: check permissions map on document
    match /{defaultSchema=**} {
      function userCan(perm) { 
        return resource != null &&
               exists(resource["__name__"]) &&
               ('permissions') in resource.data && 
               resource.data.permissions is map &&
               (request.auth.uid) in resource.data.permissions && 
               resource.data.permissions[request.auth.uid] is map &&
               (perm) in resource.data.permissions[request.auth.uid] && 
               resource.data.permissions[request.auth.uid][perm] is bool &&
               resource.data.permissions[request.auth.uid][perm]; 
      }
      allow get: if userCan('get');
      allow list: if userCan('list');
      allow create: if userCan('create');
      allow update: if userCan('update');
      allow delete: if userCan('delete');
    }
  }
}

```

In summary, each user has full access to their own "user scope" (`/user/<user-uid>/**`) by default. For any document that is not in the default "user scope", a you must have explicit permission to either `get`, `list`, `create`, `update` or `delete` a document in it's `permissions` map/field. The permissions map is of the following shape:

```json
"permissions": {
    [uid]: {
        "get": true | false,
        "list": true | false,
        "create": true | false,
        "update": true | false,
        "delete": true | false,
    }, 
    ...
}
```

Calling `setDocPerm(uid: string, perm: PermissionMap)` on a document will set the permissions for a given user by modifying the document's permission field accordingly. 


# Examples

```js
// examples/components/UserAuth.jsx

import { useFireauth } from '../firebase/hooks';

export function UserAuth() {
    const { user, isLoading, login, logout } = useFireauth();

    return (
        <>
            <h1>User Authentication Example</h1>
            <strong>Login, logout and manage your authentication status</strong>
            {(isLoading && <p>Loading...</p>) || (
                <>
                    <p>{(user && `Hello, ${user.displayName}`) || 'You are logged out'}</p>
                    <button disabled={user} onClick={login.withGoogle}>
                        Login with Google
                    </button>
                    <button disabled={!user} onClick={logout}>
                        Logout
                    </button>
                </>
            )}
            <hr />
        </>
    );
}

```

```js
// examples/components/Counter.jsx

import { useFirestore, useFireauth } from '../firebase/hooks';

export function CounterExample() {
    const { user, isLoading } = useFireauth();

    const path = '$.count'; // Same as `/users/${user.uid}.count`
    const defaultCount = 0; // Used to initialize remote data if it does not exist in Firestore
    const fallbackCount = -999; // Used when access to resource is denied.
    const [count, setCount] = useFirestore(path, defaultCount, fallbackCount);

    return (
        <>
            <h1>Counter Example</h1>
            <strong>
                This count is stored in Firestore, so it will be persisted across devices, sessions and
                reloads.
            </strong>
            {(isLoading && <p>Loading...</p>) || (
                <>
                    <p>{getCountInformation(isLoading, user, path)}</p>
                    <p>The current count is: {count}</p>
                    <button disabled={!user} onClick={() => setCount(count + 1)}>
                        {(user && 'Increase the count!') || 'Login to increase the count'}
                    </button>
                </>
            )}
            <hr />
        </>
    );
}

function getCountInformation(isLoading, user, path) {
    // Format the path nicely for display on the site...
    const fullPath = 'firestore:/' + path.replace('$', `/users/${user && user.uid}`);
    // Display information according to loading and user status
    if (isLoading) {
        return 'Loading...';
    } else if (!user) {
        return `User is logged out and denied access to ${fullPath}, so fallback count is being used`;
    } else {
        return `Count is being accessed from user's local data here: ${fullPath}`;
    }
}

```