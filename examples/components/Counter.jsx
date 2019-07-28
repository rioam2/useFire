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
