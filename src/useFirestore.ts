import * as firebase from 'firebase/app';
import { dotGen, dotGet, PermissionMap, React, splitPermissions } from './util';

type useFirestoreHook<T> = [
    T,
    (data: T) => Promise<void>,
    (user: string | null, perms: PermissionMap) => Promise<void>
];

export function useFirestore<T>(
    { useEffect, useState }: React,
    app: firebase.app.App,
    path: string,
    initialValue: T,
    fallbackValue?: T
): useFirestoreHook<T> {
    const [data, setData] = useState(initialValue);
    const user = app.auth().currentUser;
    path = path.charAt(0) === '$' ? path.replace('$', `/users/${user && user.uid}`) : path;
    const [, docPath, fieldPath] = /((?:\/[^\/\.]+)+)\.?((?:.{0,1}[^.]+)*)/g.exec(path) as RegExpMatchArray;
    const docRef = app.firestore().doc(docPath);

    // Validate proper input values
    if (!fieldPath && !['object', 'undefined'].includes(typeof initialValue)) {
        throw new TypeError('Default value of a Firestore Document must be an Object');
    }

    // Subscribe to real-time updates
    useEffect(
        function subscribe() {
            function onSnapUpdate(snap: firebase.firestore.DocumentSnapshot) {
                if (!snap.exists) {
                    return onSnapError();
                }
                const contents = snap.data();
                const remoteData = (contents && dotGet(contents, fieldPath)) || initialValue;
                setData(!fieldPath ? splitPermissions(remoteData)[1] : remoteData);
            }
            function onSnapError() {
                setDocPerm(user && user.uid, { read: true, write: true })
                    .then(() => setRemoteData(initialValue))
                    .catch(() => setData(fallbackValue || initialValue));
            }
            const unsubscribe = docRef.onSnapshot(onSnapUpdate, onSnapError);
            return unsubscribe;
        },
        [user, path]
    );

    function setRemoteData(newData: T) {
        newData = fieldPath ? newData : splitPermissions(newData)[1];
        return docRef.set(dotGen(fieldPath, newData), { merge: true }).catch(() => {
            console.warn(`You have insufficient permissions to access firestore:/${path}`);
        });
    }

    function setDocPerm(userId: string | null, perms: PermissionMap): Promise<void> {
        if (!userId) {
            return Promise.reject('User must be provided');
        }
        if (fieldPath) {
            console.warn(
                `You are setting permissions for the entire document firestore:/${docPath}.`,
                'This may not be your intended behavior.'
            );
        }
        // Expand 'read' and 'write' macropermissions...
        if (perms.read !== undefined) {
            perms.list = perms.list === undefined ? perms.read : perms.read && perms.list;
            perms.get = perms.get === undefined ? perms.read : perms.read && perms.get;
        }
        if (perms.write !== undefined) {
            perms.update = perms.update === undefined ? perms.write : perms.write && perms.update;
            perms.create = perms.create === undefined ? perms.write : perms.write && perms.create;
            perms.delete = perms.delete === undefined ? perms.write : perms.write && perms.delete;
        }
        const { read, write, ...permsTrunc } = perms;
        return docRef.set({ permissions: { [userId]: permsTrunc } }, { merge: true });
    }

    return [data, setRemoteData, setDocPerm];
}
