import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { get } from "@github/webauthn-json";

export const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal("");

    const loginUser = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.status === 200) {
                console.log("Login successful:", data);
                navigate("/dashboard"); // Navigate to dashboard on successful login
                return true;
            } else {
                console.error("Login failed:", data.message);
                setError(data.message);
                return false;
            }
        } catch (error) {
            console.error("Error during login:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithPasskey = async () => {
        setIsLoading(true);
        try {
            const createOptionsResponse = await fetch("http://localhost:3000/passkeys/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ start: true, finish: false, credential: null }),
            });

            const { loginOptions } = await createOptionsResponse.json();

            const options = await get(loginOptions);

            const response = await fetch("http://localhost:3000/passkeys/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ start: false, finish: true, options }),
            });

            if (response.ok) {
                console.log("User logged in with passkey");
                navigate("/dashboard");
            } else {
                const errorData = await response.json();
                setError(errorData.message);
            }
        } catch (error) {
            console.error("Error during passkey login:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        await loginUser(email(), password());
    };

    return (
        <div class="flex flex-col">
            <form onSubmit={handleSubmit}>
                <div class="flex flex-col space-y-4 w-96">
                    <div>
                        <label for="email" class="block text-md text-gray-300 text-left">Email</label>
                        <input
                            id="email"
                            required
                            name="email"
                            type="email"
                            value={email()}
                            onInput={(e) => setEmail(e.currentTarget.value)}
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label for="password" class="block text-md text-gray-300 text-left">Password</label>
                        <input
                            id="password"
                            required
                            name="password"
                            type="password"
                            value={password()}
                            onInput={(e) => setPassword(e.currentTarget.value)}
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Sign in
                    </button>
                </div>
            </form>
            <button onClick={signInWithPasskey} class="mt-4 w-full">Sign in with a passkey</button>
        </div>
    );
}
