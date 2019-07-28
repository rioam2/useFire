import * as React from 'react';
import { useFire } from 'usefire'; // yarn add usefire
import FirebaseApp from './app';

// Using authentication and firestore features
import 'firebase/firestore';
import 'firebase/auth';

// Export hooks bound to your application's React and Firebase instances
export const { useFirestore, useFireauth } = useFire(React, FirebaseApp);
