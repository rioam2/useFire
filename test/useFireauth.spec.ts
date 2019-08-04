import { assert } from 'chai';
import * as React from 'react';

import { useFire } from '../src';
import {
    cleanupHooks,
    eventually,
    renderNewHook,
    TEST_EMAIL,
    TEST_FIREBASE_APP,
    TEST_PASSWORD,
} from './util';

describe('useFireauth', function() {
    this.timeout(0);
    const { useFireauth } = useFire(React, TEST_FIREBASE_APP);
    const hooksToUnmount: any[] = [];

    beforeEach(async function logoutUser() {
        const { result } = renderNewHook(hooksToUnmount, useFireauth);
        await result.current.logout();
        assert(result.current.user === null, 'User is null before logging in');
    });

    afterEach(() => cleanupHooks(hooksToUnmount));

    it('should have expected API', () => {
        const { result } = renderNewHook(hooksToUnmount, useFireauth);
        assert(typeof result.current === 'object', 'Return hook is an object');
        const actualKeys = Object.keys(result.current);
        const expectedKeys = ['isLoading', 'login', 'logout', 'register', 'user'];
        assert(
            JSON.stringify(actualKeys) === JSON.stringify(expectedKeys),
            'Hook API has the documented object keys'
        );
    });

    it('logs test user in', async () => {
        const { result } = renderNewHook(hooksToUnmount, useFireauth);
        await result.current.login.withEmailAndPassword(TEST_EMAIL, TEST_PASSWORD);
        const { user } = result.current;
        assert(user !== null, 'User is not null after logging in');
        assert(user && user.email === TEST_EMAIL, 'Logs in the correct user');
    });

    it('loads authentication status', async () => {
        const { result } = renderNewHook(hooksToUnmount, useFireauth);
        assert(result.current.isLoading === true, 'Hook must initially be loading');
        await eventually(() => {
            assert(result.current.isLoading === false);
        });
    });
});
