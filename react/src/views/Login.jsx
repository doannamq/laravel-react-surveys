import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { Link } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

export default function Login() {
    const { setCurrentUser, setUserToken } = useStateContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState({ __html: "" });

    const [csrfToken, setCsrfToken] = useState("");

    useEffect(() => {
        // Fetch CSRF token when component mounts
        axiosClient
            .get("/csrf-token")
            .then((response) => {
                setCsrfToken(response.data.csrf_token);
            })
            .catch((error) => {
                console.error("Error fetching CSRF token:", error);
            });
    }, []);

    const onSubmit = (ev) => {
        ev.preventDefault();
        setError({ __html: "" });

        axiosClient
            .post(
                "/login",
                {
                    email,
                    password,
                },
                {
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                    },
                }
            )
            .then(({ data }) => {
                setCurrentUser(data.user);
                setUserToken(data.token);
            })
            .catch((error) => {
                if (error.response) {
                    const errors = error.response.data.errors;
                    if (errors) {
                        // Hiển thị lỗi từ server
                        const finalErrors = Object.values(errors).reduce(
                            (accum, next) => [...accum, ...next],
                            []
                        );
                        setError({ __html: finalErrors.join("<br>") });
                    } else {
                        setError({ __html: "Login failed. Please try again." });
                    }
                } else {
                    setError({ __html: "An unexpected error occurred." });
                }
                console.error(error);
            });
    };

    return (
        <>
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                Sign in to your account
            </h2>

            {error.__html && (
                <div
                    className="bg-red-500 rounded py-2 px-3 text-white"
                    dangerouslySetInnerHTML={error}
                ></div>
            )}

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form
                    onSubmit={onSubmit}
                    action="#"
                    method="POST"
                    className="space-y-6"
                >
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium leading-6 text-gray-900"
                        >
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                autoComplete="email"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium leading-6 text-gray-900"
                            >
                                Password
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                autoComplete="current-password"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Sign in
                        </button>
                    </div>
                    <div>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            <Link to="/signup">Sign up for free</Link>
                        </p>
                    </div>
                </form>
            </div>
        </>
    );
}
