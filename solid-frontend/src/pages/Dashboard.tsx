import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { create, type CredentialCreationOptionsJSON } from "@github/webauthn-json";

export const Dashboard = () => {
    const [isLoading, setIsLoading] = createSignal(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/logout', {
                method: 'POST',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Logout successful:', data);
                navigate('/login');
            } else {
                console.error('Logout failed:', data.message);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const registerPasskey = async () => {
        setIsLoading(true);
        try {
            const createOptionsResponse = await fetch("http://localhost:3000/passkeys/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ start: true, finish: false, credential: null }),
            });

            const { createOptions } = await createOptionsResponse.json();
            console.log("createOptions", createOptions);

            const credential = await create(createOptions as CredentialCreationOptionsJSON);
            console.log(credential);

            const response = await fetch("http://localhost:3000/passkeys/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ start: false, finish: true, credential }),
            });
            console.log(response);

            if (response.ok) {
                console.log("Registration successful");
            } else {
                const errorData = await response.json();
                console.error(`Registration failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div class="p-4">
            <h1>Dashboard</h1>
            <button onClick={handleLogout} class="mt-4">Logout</button>
            <div>
                <button
                    onClick={registerPasskey}
                    class="mt-4 text-white font-bold py-2 px-4 rounded"
                >
                    Register a new passkey
                </button>
            </div>
            {isLoading() && <p>Loading...</p>}
        </div>
    );
};