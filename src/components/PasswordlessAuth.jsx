import React, { useEffect } from "react";
const encodeBase64 = (arrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

const decodeBase64 = (base64) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

// Generate random challenge
const generateChallenge = (length) => {
    const challenge = new Uint8Array(length);
    window.crypto.getRandomValues(challenge);
    return challenge;
};

const PasswordlessAuth = () => {
    useEffect(() => {
        navigator.bluetooth.getAvailability().then((available) => {
            if (!available) alert("Bluetooth not available on this device.");
        });
    }, []);
    const registerUser = async () => {
        const publicKeyOptions = {
            challenge: generateChallenge(32),
            rp: { name: "My WebAuthn App" },
            user: {
                id: new TextEncoder().encode("user-id-123"),
                name: "Arif",
                displayName: "Arif",
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: { userVerification: "preferred" },
            timeout: 60000,
        };

        console.log({
            publicKey: publicKeyOptions,
        });
        try {
            const credential = await navigator.credentials.create({
                publicKey: publicKeyOptions,
            });

            console.log("Registration successful:", credential);
            localStorage.setItem("webauthnCredentialId", encodeBase64(credential.rawId));
            alert("Registration successful");
        } catch (error) {
            console.warn(error);
            alert("Registration failed");
        }
    };

    const signInUser = async () => {
        try {
            const storedCredentialId = localStorage.getItem("webauthnCredentialId");
            if (!storedCredentialId) {
                alert("No registered credential found.");
                return;
            }

            const publicKeyRequest = {
                challenge: generateChallenge(32),
                allowCredentials: [
                    {
                        type: "public-key",
                        id: decodeBase64(storedCredentialId),
                    },
                ],
                userVerification: "preferred",
                timeout: 60000,
            };

            console.log(publicKeyRequest);

            const assertion = await navigator.credentials.get({
                publicKey: publicKeyRequest,
            });

            console.log("Sign-in successful:", assertion);
            console.log(encodeBase64(assertion.response?.authenticatorData));
            console.log(encodeBase64(assertion.response?.clientDataJSON));
            alert("Sign-in successful");
        } catch (error) {
            console.error("Sign-in failed:", error);
            alert("Sign-in failed");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Passwordless Authentication</h1>
            <button onClick={registerUser} style={{ marginRight: "10px" }} className="btn btn-primary">
                Register
            </button>
            <button onClick={signInUser} className="btn btn-success">
                Sign In
            </button>
        </div>
    );
};

export default PasswordlessAuth;
