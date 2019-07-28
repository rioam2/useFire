import firebase from 'firebase/app';

// This is a demo site. Use your own when you create your application.
const projectId = 'usefire-example';
const apiKey = 'AIzaSyDYWWNs2ebIUYW_XhqUdP4NNEiE66VBhFI';

// Initialize a new Firebase app if one isn't already loaded.
const app =
    firebase.apps[0] ||
    firebase.initializeApp({
        apiKey,
        authDomain: `${projectId}.firebaseapp.com`,
        databaseURL: `https://${projectId}.firebaseio.com`,
        projectId
    });

export default app;
