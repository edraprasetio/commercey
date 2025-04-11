import { generateRSAKeys } from './encryption'

export function openDatabase() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('EncryptionDB', 1)

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBRequest).result
            if (db) {
                const objectStore = db.createObjectStore('keys', {
                    keyPath: 'id',
                })
                objectStore.createIndex('id', 'id', { unique: true })
            }
        }

        request.onsuccess = (event) => {
            const db = (event.target as IDBRequest).result
            resolve(db)
        }

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error)
        }
    })
}

function storePrivateKey(db: IDBDatabase, privateKey: string) {
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('keys', 'readwrite')
        const objectStore = transaction.objectStore('keys')

        // Create an object to store the private key
        const keyObject = {
            id: 'private_key', // A unique ID for the private key
            value: privateKey, // The private key value you want to store
        }

        // Add the private key to the object store
        const request = objectStore.add(keyObject)

        request.onsuccess = (event) => {
            const target = event.target
            if (target && target instanceof IDBRequest) {
                console.log('Private key stored successfully.')
                resolve()
            }
        }

        request.onerror = (event) => {
            const target = event.target
            if (target && target instanceof IDBRequest) {
                console.error('Error storing private key:', target.error)
                reject(target.error)
            }
        }
    })
}

function storePublicKey(db: IDBDatabase, publicKey: string) {
    const transaction = db.transaction(['keys'], 'readwrite')
    const store = transaction.objectStore('keys')

    const publicKeyData = { id: 'publicKey', value: publicKey }

    const request = store.put(publicKeyData)

    request.onsuccess = function () {
        console.log('Public key stored successfully.')
    }

    request.onerror = function (event) {
        console.error('Error storing public key: ', event.target)
    }
}

export function getPrivateKey(db: IDBDatabase): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('keys', 'readonly')
        const objectStore = transaction.objectStore('keys')

        const request = objectStore.get('private_key') // Get the private key by its ID

        request.onsuccess = (event) => {
            const target = event.target
            if (target && target instanceof IDBRequest) {
                const result = target.result // This should be the stored private key object
                if (result) {
                    resolve(result.value) // Return the value of the private key
                } else {
                    resolve(null) // No private key found
                }
            }
        }

        request.onerror = (event) => {
            const target = event.target
            if (target && target instanceof IDBRequest) {
                console.error('Error retrieving private key:', target.error)
                reject(target.error)
            }
        }
    })
}

export function getPublicKey(db: IDBDatabase): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['keys'], 'readonly')
        const store = transaction.objectStore('keys')

        const request = store.get('publicKey')

        request.onsuccess = function () {
            if (request.result) {
                console.log('Public key retrieved successfully.')
                resolve(request.result.value)
            } else {
                console.error('Public key not found.')
                resolve(null) // No public key found
            }
        }

        request.onerror = function (event) {
            console.error('Error retrieving public key: ', event.target)
            reject(event.target)
        }
    })
}

export function generateAndStoreKeys() {
    openDatabase().then((db) => {
        getPrivateKey(db).then((storedPrivateKey) => {
            if (!storedPrivateKey) {
                // If no private key exists, generate new keys
                const { publicKey, privateKey } = generateRSAKeys() // Generate the RSA keys
                storePrivateKey(db, privateKey) // Store private key in IndexedDB
                storePublicKey(db, publicKey) // Store public key in IndexedDB
                console.log('Generated and stored new public and private keys.')
            } else {
                // If the private key already exists, just load the public key
                getPublicKey(db).then((storedPublicKey) => {
                    if (storedPublicKey) {
                        console.log(
                            'Loaded stored public key:',
                            storedPublicKey
                        )
                    } else {
                        console.error('Public key not found.')
                    }
                })
                console.log('Private key already stored.')
            }
        })
    })
}
