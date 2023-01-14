import { CeramicClient } from '@ceramicnetwork/http-client'
import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { DIDDataStore } from '@glazed/did-datastore'
import { DIDSession } from '@glazed/did-session'
    
const walletBtn = document.getElementById('walletBtn')
const getDataBtn = document.getElementById('getData')
const updateDataBtn = document.getElementById('updateData')
const clearDataBtn = document.getElementById('clearData')

const ceramic = new CeramicClient("https://ceramic-clay.3boxlabs.com")

const aliases = {
    schemas: {
        basicProfile: 'ceramic://k3y52l7qbv1frxt706gqfzmq6cbqdkptzk8uudaryhlkf6ly9vx21hqu4r6k1jqio',

    },
    definitions: {
        BasicProfile: 'kjzl6cwe1jw145cjbeko9kil8g9bxszjhyde21ob8epxuxkaon1izyqsu8wgcic',
    },
    tiles: {},
}

const datastore = new DIDDataStore({ ceramic, model: aliases })

async function authenticateWithEthereum(ethereumProvider) {
    const accounts = await ethereumProvider.request({
    method: 'eth_requestAccounts',
    })
    const authProvider = new EthereumAuthProvider(ethereumProvider, accounts[0])
    const session = new DIDSession({ authProvider })
    const did = await session.authorize()
    console.log("DID - ", did);
    ceramic.did = did
}
    
async function auth() {
    if (window.ethereum == null) {
    throw new Error('No injected Ethereum provider found')
    }
    await authenticateWithEthereum(window.ethereum)
} 

async function getProfileFromCeramic() {
    try {
        return await datastore.get('BasicProfile')
    } catch (error) {
    console.error(error)
    }
}

async function clearProfileFromCeramic() {
    try {
        await datastore.remove('BasicProfile')
    } catch (error) {
    console.error(error)
    }
}

async function updateProfileOnCeramic() {
    try {
        const profile = await getProfileFromCeramic();
        const updatedProfile = {
            name : "Gowtham S",
            country: "India",
            gender: "Male",
            update_count: profile?.update_count ? profile.update_count + 1: 1
        }

        await datastore.set('BasicProfile', updatedProfile)
        console.log("Data - ", await getProfileFromCeramic())
    } catch (error) {
    console.error(error)
    }
}

walletBtn.addEventListener('click', async () => {
    await auth()
    await getProfileFromCeramic();
})

getDataBtn.addEventListener('click', async (e) => {
    console.log("Data - ", await getProfileFromCeramic())
})

updateDataBtn.addEventListener('click', async (e) => {
    await updateProfileOnCeramic()
})

clearDataBtn.addEventListener('click', async (e) => {
    await clearProfileFromCeramic()
})
