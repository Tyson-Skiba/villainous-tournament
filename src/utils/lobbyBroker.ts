import { initializeApp } from 'firebase/app'
import {
	collection,
	doc,
	getDoc,
	getFirestore,
	increment,
	onSnapshot,
	serverTimestamp,
	setDoc,
	updateDoc,
} from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { GameResult, Lobby, LobbyPlayer } from '../types'

/* RULES

rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /lobbies/{lobbyId} {
      allow read, write: if request.auth != null;

      match /players/{playerId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
*/

const app = initializeApp({
	apiKey: 'AIzaSyBWs8leUsqhw5macJQECPboOuPZHWeJweQ',
	authDomain: 'villainous-tournament-a25ee.firebaseapp.com',
	projectId: 'villainous-tournament-a25ee',
	storageBucket: 'villainous-tournament-a25ee.firebasestorage.app',
	messagingSenderId: '332103579655',
	appId: '1:332103579655:web:c8ec95660b986c1dae92a2',
})

export const db = getFirestore(app)
export const auth = getAuth(app)

export class LobbyBroker {
	currentLobby?: string

	async openConnection() {
		return await signInAnonymously(auth)
	}

	async reserve() {
		let retries = 5
		while (retries > 0) {
			const code = Math.floor(1000 + Math.random() * 9000).toString()
			const ref = doc(db, 'lobbies', code)
			const snap = await getDoc(ref)

			if (!snap.exists()) return code
			retries -= 1
		}
		throw new Error('Could not reserve a unique lobby code.')
	}

	async createLobby() {
		if (this.currentLobby) return this.currentLobby

		const code = await this.reserve()

		await setDoc(doc(db, 'lobbies', code), {
			hostUid: auth.currentUser!.uid,
			started: false,
			stateVersion: 0,
			created: serverTimestamp(),
			expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour
		})

		this.currentLobby = code

		return code
	}

	async joinLobby(code: string, playerName: string) {
		const uid = auth.currentUser!.uid

		await setDoc(doc(db, 'lobbies', code, 'players', uid), {
			name: playerName,
			joined: Date.now(),
		})
	}

	subscribe(code: string, onUpdate: (players: LobbyPlayer[]) => void) {
		return onSnapshot(
			collection(db, 'lobbies', code, 'players'),
			(snapshot) => {
				const players = snapshot.docs.map((d) => ({
					id: d.id,
					...(d.data() as Omit<LobbyPlayer, 'id'>),
				}))

				onUpdate(players)
			},
		)
	}

	async startGame(code: string, fixture: string) {
		await updateDoc(doc(db, 'lobbies', code), {
			started: true,
			stateVersion: 1,
			fixture,
		})
	}

	async waitForGameToStart(code: string, onStart: (fixture: string) => void) {
		onSnapshot(doc(db, 'lobbies', code), (snap) => {
			const lobby = snap.data()

			if (lobby?.started) onStart(lobby.fixture)
		})
	}

	waitForUpdates(code: string, onUpdate: (lobby: Lobby) => void) {
		return onSnapshot(doc(db, 'lobbies', code), (snap) => {
			if (!snap.exists()) {
				return
			}

			onUpdate(snap.data() as Lobby)
		})
	}

	async update(code: string, results: GameResult) {
		await updateDoc(doc(db, 'lobbies', code), {
			stateVersion: increment(1),
			results,
		})
	}

	async isCurrentPlayerConnected(code: string) {
		const uid = auth.currentUser!.uid

		const snap = await getDoc(doc(db, 'lobbies', code, 'players', uid))

		return snap.exists()
	}
}
