import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAh_bEIjSlXmoVzjvPPK0Kj9CFKjnmPdCI",
  authDomain: "smart-city-project-e4062.firebaseapp.com",
  projectId: "smart-city-project-e4062",
  storageBucket: "smart-city-project-e4062.firebasestorage.app",
  messagingSenderId: "816977319976",
  appId: "1:816977319976:web:da3bbf5e46c9d628217d1d",
  measurementId: "G-R7N8RMKR0N"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();