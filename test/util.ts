import { renderHook, RenderHookResult } from '@testing-library/react-hooks';
import * as dotenv from 'dotenv';
import * as firebase from 'firebase/app';

// Firebase Authentication constants
dotenv.config();
export const TEST_EMAIL = process.env.TEST_EMAIL || '';
export const TEST_PASSWORD = process.env.TEST_PASSWORD || '';

// Firebase Test API Information
export const TEST_PROJECT_ID = 'usefire-example';
export const TEST_API_KEY = 'AIzaSyDYWWNs2ebIUYW_XhqUdP4NNEiE66VBhFI';

// Firebase Firestore constants
export const CONSTANT_STRING = 'CONSTANT_STRING';
export const CONSTANT_STRING_VALUE = 'data on firestore';
export const READABLE_DOCUMENT_PATH = '/integration_tests/read';
export const WRITABLE_DOCUMENT_PATH = '/integration_tests/write';
export const UNAUTHORIZED_DOCUMENT_PATH = '/integration_tests/unauthorized';

// Initialize a new Firebase app if one isn't already loaded.
export const TEST_FIREBASE_APP =
    firebase.apps[0] ||
    firebase.initializeApp({
        apiKey: TEST_API_KEY,
        authDomain: `${TEST_PROJECT_ID}.firebaseapp.com`,
        databaseURL: `https://${TEST_PROJECT_ID}.firebaseio.com`,
        projectId: TEST_PROJECT_ID
    });

export function renderNewHook<P = unknown, R = unknown>(
    hookUnmountList: any[],
    hookFn: (...args: P[]) => R
): RenderHookResult<P, R> {
    const hook = renderHook(hookFn);
    hookUnmountList.push(hook);
    return hook;
}

export function cleanupHooks(hooksToUnmount: any[]) {
    while (hooksToUnmount.length) {
        const hook = hooksToUnmount.pop();
        if (hook) {
            hook.unmount();
        }
    }
}

export async function eventually(test: () => any, timeout = 3000, retryFreq = 150) {
    let attemptNum = 0;
    const attemptMax = Math.floor(timeout / retryFreq);

    const makeAttempt = async () => {
        let err = null;
        let res = null;

        if (!attemptNum) {
            console.log(`\n\t\x1b[2m  -------------------------------- \x1b[0m`);
        }

        try {
            res = await test();
        } catch (e) {
            err = e;
        }

        const prefix = err ? '\t\x1b[2m |' : '\t\x1b[32m ↓';
        const status = err ? 'failed' : 'passed';
        console.log(`${prefix} Eventually: attempt ${++attemptNum}/${attemptMax} ${status}\x1b[0m`);

        if (err) {
            throw err;
        } else {
            return res;
        }
    };

    try {
        await makeAttempt();
    } catch (assertionErr) {
        await new Promise(async (res, rej) => {
            const testJobId = setInterval(async () => {
                try {
                    await makeAttempt();
                    clearInterval(testJobId);
                    res();
                } catch {}
            }, retryFreq);
            setTimeout(() => {
                clearInterval(testJobId);
                rej(assertionErr);
            }, timeout);
        });
    }
}
