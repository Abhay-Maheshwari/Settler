const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const configContent = fs.readFileSync('firebase-config.js', 'utf8');
const cleanedContent = configContent.replace('const firebaseConfig =', 'var firebaseConfig =');
eval(cleanedContent);
const config = firebaseConfig;

const app = initializeApp(config);
const db = getFirestore(app);

async function count() {
    console.log("Getting docs from transactions...");
    const snapshot = await getDocs(collection(db, 'transactions'));
    console.log(`Found ${snapshot.size} transactions.`);
    process.exit(0);
}
count();
