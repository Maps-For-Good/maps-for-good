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
//initialize fb 
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const likesCollection = collection(db, "likes");
//create query to find doc w given id 
async function get_like_ref(id) {
  const q = query(likesCollection, where("id", "==", id));
  const querySnapshot = await getDocs(q);
//if doc exists return ref 
  if (!querySnapshot.empty) {
    //Just create if empty
    return querySnapshot.docs[0].ref;
  } else { //or create new doc
    const ref = doc(likesCollection);
    await setDoc(ref, {
      id: id,
      num_likes: 0,
      num_dislikes: 0,
    });
    return ref;
  }
}
//get likes/dislikes 
export async function getLikesById(id) {
  const docRef = await get_like_ref(id);
  const docSnap = await getDoc(docRef);
  return docSnap.data();
}
//increment like count by 1 
export async function incrementLikes(id) {
  const docRef = await get_like_ref(id);
  await updateDoc(docRef, {
    num_likes: increment(1),
  });
}
//decrement like count by 1 
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

export async function uploadFeature (data) {
  const addedFeaturesCollection = collection(db, "new_features");
  await setDoc(doc(addedFeaturesCollection), {data: JSON.stringify(data)});
}


export async function addAdditionalInfo(id, text) {
  const additionalCollection = collection(db, "additional");
  await setDoc(doc(additionalCollection), {
      id,
      text
  });
}