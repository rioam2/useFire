import 'firebase/auth';

import * as firebase from 'firebase/app';

import { React } from './util';

export function useFireauth({ useState, useEffect }: React, app: firebase.app.App, ...args: any[]) {
    const [user, setUser] = useState(app.auth().currentUser);
    const [isLoading, setIsLoading] = useState(!user);

    /** When authentication status changes, update state accordingly */
    useEffect(() => {
        return app.auth().onAuthStateChanged((userParam) => {
            setUser(userParam);
            if (isLoading) {
                setIsLoading(false);
            }
        });
    }, [null] /* Don't reinitialize effect */);

    return {
        isLoading,
        login: {
            anonymously: () => app.auth().signInAnonymously(),
            withCredential: (credential: firebase.auth.AuthCredential) =>
                app.auth().signInWithCredential(credential),
            withEmailAndPassword: (email: string, password: string) =>
                app.auth().signInWithEmailAndPassword(email, password),
            withEmailLink: (email: string, emailLink?: string | undefined) =>
                app.auth().signInWithEmailLink(email, emailLink),
            withFacebook: () => app.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider()),
            withGithub: () => app.auth().signInWithPopup(new firebase.auth.TwitterAuthProvider()),
            withGoogle: () => app.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()),
            withToken: (token: string) => app.auth().signInWithCustomToken(token)
        },
        logout: () => app.auth().signOut(),
        register: {
            withEmailAndPassword: (email: string, password: string) =>
                app.auth().createUserWithEmailAndPassword(email, password)
        },
        user
    };
}
