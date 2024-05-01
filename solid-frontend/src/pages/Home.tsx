import { useNavigate } from "@solidjs/router";

export const Home = () => {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate("/login")}>Login</button>
    )
}

