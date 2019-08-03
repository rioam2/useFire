import 'firebase/firestore';

import { assert } from 'chai';
import * as firebase from 'firebase';
import * as React from 'react';

import { useFire } from '../src';
import {
    cleanupHooks,
    CONSTANT_STRING,
    CONSTANT_STRING_VALUE,
    eventually,
    READABLE_DOCUMENT_PATH,
    renderNewHook,
    TEST_EMAIL,
    TEST_FIREBASE_APP,
    TEST_PASSWORD,
    UNAUTHORIZED_DOCUMENT_PATH,
    WRITABLE_DOCUMENT_PATH,
} from './util';

describe('useFirestore', () => {
    const { useFireauth, useFirestore } = useFire(React, TEST_FIREBASE_APP);
    const hooksToUnmount: any[] = [];

    beforeEach(async function authenticateTestUser() {
        const { result } = renderNewHook(hooksToUnmount, useFireauth);
        await result.current.login.withEmailAndPassword(TEST_EMAIL, TEST_PASSWORD);
        assert(result.current.user !== null, 'User was logged in for testing firestore');
    });

    afterEach(() => cleanupHooks(hooksToUnmount));

    it('uses the correct initial value', () => {
        const initialValue = { initial: 'foo' };
        const { result } = renderNewHook(hooksToUnmount, () =>
            useFirestore(READABLE_DOCUMENT_PATH, initialValue)
        );

        const [data] = result.current;
        assert.equal(data, initialValue);
    });

    it(`uses fallback for firestore:/${UNAUTHORIZED_DOCUMENT_PATH} `, async () => {
        const initialValue = { loading: true, denied: false };
        const fallbackValue = { loading: false, denied: true };
        const { result } = renderNewHook(hooksToUnmount, () =>
            useFirestore(UNAUTHORIZED_DOCUMENT_PATH, initialValue, fallbackValue)
        );

        assert.equal(result.current[0], initialValue, 'Uses correct initial value');
        await eventually(() => {
            const [data] = result.current;
            assert.equal(data, fallbackValue, 'Uses correct fallback value');
        });
    });

    it(`reads constant string from firestore:/${READABLE_DOCUMENT_PATH}`, async () => {
        const { result } = renderNewHook(hooksToUnmount, () =>
            useFirestore(READABLE_DOCUMENT_PATH, { [CONSTANT_STRING]: '' })
        );

        await eventually(() => {
            const [data] = result.current;
            assert.equal(data[CONSTANT_STRING], CONSTANT_STRING_VALUE);
        });
    });

    it(`updates count in firestore:/${WRITABLE_DOCUMENT_PATH}`, async () => {
        // Get rid of any previous state
        await firebase
            .firestore()
            .doc(WRITABLE_DOCUMENT_PATH)
            .delete();

        const fieldPath = WRITABLE_DOCUMENT_PATH + '.count';
        const initialCount = 0;
        let expectedCount = initialCount;
        const { result } = renderNewHook(hooksToUnmount, () => useFirestore(fieldPath, initialCount));

        const [, setCount] = result.current;
        while (expectedCount < 3) {
            await setCount(++expectedCount);
            const [actualCount] = result.current;
            assert.equal(
                actualCount,
                expectedCount,
                `Count was updated from ${expectedCount - 1} to ${expectedCount}`
            );
        }
    });
});
