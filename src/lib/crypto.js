// All encryption/decryption happens in the browser using Web Crypto API.
// The user's key NEVER leaves the browser — only the encrypted blob goes to the server.
// A random salt is generated per secret and stored in Redis alongside the ciphertext.

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(plaintext, password) {
  // Generate a unique 16-byte random salt for PBKDF2 key derivation
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  return {
    encryptedData: bufToBase64(new Uint8Array(ciphertext)),
    iv: bufToBase64(iv),
    salt: bufToBase64(salt),
  };
}

export async function decrypt(encryptedData, ivStr, password, saltStr) {
  const salt = base64ToBuf(saltStr);
  const key = await deriveKey(password, salt);
  const iv = base64ToBuf(ivStr);
  const data = base64ToBuf(encryptedData);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

function bufToBase64(buf) {
  return btoa(String.fromCharCode(...buf));
}

function base64ToBuf(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
