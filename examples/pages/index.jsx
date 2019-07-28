import { UserAuth } from '../components/UserAuth';
import { CounterExample } from '../components/Counter';

export default function Main() {
    return (
        <>
            <h1>useFire Example Site</h1>
            <strong>
                useFire is a declarative React hook library for quick and easy Firebase/Firestore integration.{' '}
            </strong>
            <hr />
            <UserAuth />
            <CounterExample />
        </>
    );
}
