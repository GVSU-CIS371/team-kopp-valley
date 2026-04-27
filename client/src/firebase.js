import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyACIi_yxrGyNEBZZcgdtiroDgYuRImgOJ8",
    authDomain: "team-kopp-valley.firebaseapp.com",
    projectId: "team-kopp-valley",
    storageBucket: "team-kopp-valley.firebasestorage.app",
    messagingSenderId: "113886937506",
    appId: "1:113886937506:web:2c5afcdc9c70215a5072fb"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)