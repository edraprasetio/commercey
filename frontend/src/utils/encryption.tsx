import * as forge from 'node-forge'

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

const decryptMessageWithAES = async (
    encryptedMessage: BufferSource,
    aesKey: CryptoKey,
    iv: any
) => {
    const decryptedMessage = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv, // The IV used for encryption
        },
        aesKey,
        encryptedMessage
    )

    const decoder = new TextDecoder()
    return decoder.decode(decryptedMessage)
}

export const decryptIfPossible = (cipherText: string, privateKey: string) => {
    try {
        // Simple heuristic: RSA-encrypted messages are base64-encoded and often long
        if (!cipherText || cipherText.length < 50) return cipherText
        return rsaDecrypt(cipherText, privateKey)
    } catch (e) {
        console.warn('Decryption failed:', e)
        return cipherText // Fallback to showing raw message
    }
}

export function generateRSAKeys() {
    // Generate RSA key pair
    const keys = forge.pki.rsa.generateKeyPair(2048) // 2048-bit key

    // Convert the keys to PEM format (base64-encoded string)
    const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey)
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey)

    // Return the keys
    return {
        publicKey: publicKeyPem,
        privateKey: privateKeyPem,
    }
}

export function rsaEncrypt(plainText: string, publicKey: string) {
    const rsa = forge.pki.publicKeyFromPem(publicKey)
    return forge.util.encode64(rsa.encrypt(plainText, 'RSA-OAEP'))
}

export function rsaDecrypt(cipherText: string, privateKey: string) {
    const rsa = forge.pki.privateKeyFromPem(privateKey)
    const decoded = forge.util.decode64(cipherText)
    return rsa.decrypt(decoded, 'RSA-OAEP')
}
