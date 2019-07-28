import { useFireauth } from './useFireauth';
import { useFirestore } from './useFirestore';
import { React } from './util';

export const useFire = (react: React, app: firebase.app.App) => ({
    /**
     * Declarative Hook wrapper for Firebase's authentication APIs.
     *
     * Returned hook is of the shape: `{ user, isLoading, login, logout, register }`
     */
    useFireauth() {
        return useFireauth(react, app);
    },

    /**
     * Declarative Hook wrapper for Firestore's native APIs with added support for permission handling,
     * dot-walking, initial and fallback values. Data is bound to Firestore using
     * `DocumentReference.onSnapshot()` for real-time data-linking.
     *
     * Returned hook is of the shape: `[ data, setData, setDocPerm ]`
     *
     * @param path  Path of the document to use. Supports dot-walking and `$` to substitute
     *      `/users/${user.uid}`.
     * @param initialValue Used as an initial value if the document or field does not already exist.
     * @param fallbackValue Fallback value shown to unauthorized users. If not provided, `initialValue`
     *      is used.
     */
    useFirestore<T = unknown>(path: string, initialValue: T, fallbackValue?: T) {
        return useFirestore<T>(react, app, path, initialValue, fallbackValue);
    }
});
