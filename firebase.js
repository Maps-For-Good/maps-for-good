import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaS6gP-v7t36F0X71GK97gDYwtY_aKRbE",
  authDomain: "maps-for-good.firebaseapp.com",
  projectId: "maps-for-good",
  storageBucket: "maps-for-good.firebasestorage.app",
  messagingSenderId: "443749353060",
  appId: "1:443749353060:web:9f419ff0d1e939d49a8171",
  measurementId: "G-TD2TSM5WG1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const likesCollection = collection(db, "likes");

async function get_like_ref(id) {
  const q = query(likesCollection, where("id", "==", id));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].ref;
  } else {
    const ref = doc(likesCollection);
    await setDoc(ref, {
      id: id,
      num_likes: 0,
      num_dislikes: 0,
    });
    return ref;
  }
}

export async function getLikesById(id) {
  const docRef = await get_like_ref(id);
  const docSnap = await getDoc(docRef);
  return docSnap.data();
}

export async function incrementLikes(id) {
  const docRef = await get_like_ref(id);
  await updateDoc(docRef, {
    num_likes: increment(1),
  });
}
export async function incrementDislikes(id) {
  const docRef = await get_like_ref(id);
  await updateDoc(docRef, {
    num_dislikes: increment(1),
  });
}

export async function decrementLikes(id) {
  const docRef = await get_like_ref(id);
  await updateDoc(docRef, {
    num_likes: increment(-1),
  });
}
export async function decrementDislikes(id) {
  const docRef = await get_like_ref(id);
  await updateDoc(docRef, {
    num_dislikes: increment(-1),
  });
}