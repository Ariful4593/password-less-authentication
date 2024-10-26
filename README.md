
---

# **Passwordless Authentication using WebAuthn in React**

This project demonstrates how to implement **passwordless authentication** in a **React.js** application using the **WebAuthn API**. It supports **passkey-based registration and sign-in**, allowing for a more secure and user-friendly login experience without passwords.

---

## **Features**
- **Passwordless Authentication**: Users can register and log in using passkeys (WebAuthn credentials) instead of passwords.
- **Base64 Encoding**: Credentials are stored securely in `localStorage` using Base64 encoding.
- **Challenge-based Authentication**: Secure authentication using a cryptographic challenge to prevent replay attacks.
- **User Verification Support**: Attempts biometric verification if available (or falls back to other options).

---

## **Prerequisites**
1. **HTTPS**: WebAuthn works only on secure contexts (HTTPS). Use tools like **ngrok** to expose `localhost` for mobile testing.
2. **Modern Browser**: Ensure you are using a browser that supports WebAuthn (e.g., Chrome, Firefox).
3. **Same Device Registration and Sign-in**: Credentials are typically device-bound, so register and sign in on the same device.

---

## **Project Setup**

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd <your-project-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Expose localhost for mobile testing (optional):
   ```bash
   npx ngrok http 3000
   ```

---

## **How It Works**

### **1. Registration**
When the user clicks the **Register** button, the following process occurs:
1. A **challenge** is generated to ensure secure credential creation.
2. The **`navigator.credentials.create()`** method requests the browser to create a new WebAuthn credential.
3. The **credential ID** is encoded to **Base64** and stored in **localStorage**.
4. The user state is updated to simulate login.

### **2. Sign-in**
When the user clicks the **Sign In** button, the following happens:
1. The stored **credential ID** is retrieved from `localStorage` and **decoded**.
2. A new **challenge** is generated for authentication.
3. The **`navigator.credentials.get()`** method requests the browser to authenticate the user using the credential.
4. Upon successful authentication, an assertion is returned.

---

## **Code Breakdown**

### **Base64 Utility Functions**
```javascript
const encodeBase64 = (arrayBuffer) =>
    btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

const decodeBase64 = (base64) =>
    Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
```
- Converts **ArrayBuffer** to Base64 for safe storage and vice-versa.

---

### **Generate Challenge Function**
```javascript
const generateChallenge = (length) => {
    const challenge = new Uint8Array(length);
    window.crypto.getRandomValues(challenge);
    return challenge;
};
```
- Generates a **cryptographically secure challenge** for both registration and sign-in.

---

### **Registration Function**
```javascript
const registerUser = async () => {
    const publicKeyOptions = {
        challenge: generateChallenge(32),
        rp: { name: "My WebAuthn App" },
        user: {
            id: new TextEncoder().encode("user-id-123"),
            name: "arif@example.com",
            displayName: "Arif",
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: { userVerification: "preferred" },
        timeout: 60000,
    };

    try {
        const credential = await navigator.credentials.create({
            publicKey: publicKeyOptions,
        });

        console.log("Registration successful:", credential);

        localStorage.setItem(
            "webauthnCredentialId",
            encodeBase64(credential.rawId)
        );

        setUser({ username: "arif" });
    } catch (error) {
        console.error("Registration failed:", error);
    }
};
```
- **Registers a new user** by creating a passkey and storing its ID in **localStorage**.

---

### **Sign-in Function**
```javascript
const signInUser = async () => {
    try {
        const storedCredentialId = localStorage.getItem("webauthnCredentialId");

        if (!storedCredentialId) {
            console.error("No registered credential found.");
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

        const assertion = await navigator.credentials.get({
            publicKey: publicKeyRequest,
        });

        console.log("Sign-in successful:", assertion);
    } catch (error) {
        console.error("Sign-in failed:", error);
    }
};
```
- **Authenticates the user** by retrieving the stored credential ID and using it for sign-in.

---

### **Component Layout**
```javascript
return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>WebAuthn with React</h1>
        <button onClick={registerUser} style={{ marginRight: "10px" }}>
            Register
        </button>
        <button onClick={signInUser}>Sign In</button>
    </div>
);
```
- **UI Layout**: A simple interface with two buttons for **Register** and **Sign In**.

---

## **Troubleshooting Tips**
1. **HTTPS Requirement**: Use **ngrok** to expose your localhost over HTTPS.
2. **Credential Errors**: Ensure the same device is used for both registration and login to avoid credential issues.
3. **Check Browser Support**: Verify that your browser supports **WebAuthn**.
4. **Use Developer Tools**: Open your browser's DevTools to check for console errors and verify **localStorage** entries.

---

## **License**
This project is licensed under the **MIT License**.

---

## **Conclusion**
This project demonstrates a working **WebAuthn-based passwordless authentication** system in **React.js**. It simplifies the authentication process, providing a secure and user-friendly alternative to traditional password-based logins. You can extend this code to integrate with your backend for full-fledged authentication solutions.

---
