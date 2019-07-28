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
