export const generateRSAKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048, // Key length in bits
            publicExponent: new Uint8Array([1, 0, 1]), // 65537
            hash: { name: 'SHA-256' },
        },
        true, // Whether the key can be exported
        ['encrypt', 'decrypt'] // Usable for encryption and decryption
    )

    return keyPair
}

export const encryptMessageWithAES = async (
    message: string | undefined,
    aesKey: CryptoKey
) => {
    const encoder = new TextEncoder()
    const encodedMessage = encoder.encode(message)

    const iv = window.crypto.getRandomValues(new Uint8Array(16)) // Random Initialization Vector (IV)

    const encryptedMessage = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv, // IV for AES encryption
        },
        aesKey,
        encodedMessage
    )

    return {
        encryptedMessage,
        iv,
    }
}
