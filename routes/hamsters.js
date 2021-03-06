const getDatabase = require('../database.js')
const db = getDatabase()
const express = require('express')
const router = express.Router()
    router.get('/', async (req, res) => {
    let snapshot;
	try {
		snapshot = await db.collection('Hamsters').get();
	}
	catch(error) {
		console.log(error.message);
		res.status(500).send(error.message);
	}
	if (snapshot.empty) {
		res.sendStatus(400);
		return;
	}
    const hamsterObject = []
	snapshot.forEach(doc => {
		const data = doc.data();
		data.id = doc.id;
		hamsterObject.push(data);
	});
	res.status(200).send(hamsterObject);
});
    router.get('/random', async (req, res) => {
	let docRef;
	try {
		docRef = await db.collection("Hamsters").get();
	}
	catch(error) {
		console.log(error.message)
		res.status(500).send(error.message)
	}
  if (docRef.empty) {
    res.status(404).send('Hamster does not exists');
    return;
  }
  let hamsterObject = [];
  let getRandom;
  docRef.forEach((doc) => {
    const data = doc.data();
	data.id = doc.id;
    hamsterObject.push(data);
	getRandom = hamsterObject[Math.floor(Math.random()*hamsterObject.length)];
  });
    res.send(getRandom)
})
    router.get('/:id', async (req, res) => {
        const id = req.params.id
	    const docRef = await db.collection('Hamsters').doc(id).get();
        if (!docRef.exists) {
            res.status(404).send('Hamster does not exists');
            return;
        };
        const data = docRef.data();
        res.status(200).send(data);
})
router.post('/', async (req, res) => {
	const object = req.body;
	if(!isHamsterItem(object)) {
		res.status(400).send('Hamster does not exists')
		return;
	}
    let docRef;
	try {
		docRef = await db.collection('Hamsters').add(object);
		const newItem = { id: docRef.id };
		res.send(newItem);
	}
	catch(error) {
		console.log(error.message);
		res.status(500).send(error.message);
	}
});
router.put('/:id', async (req, res) => {
	const object = req.body
	const id = req.params.id
    const docRef = db.collection('Hamsters').doc(id);
	let hamsterRef;
    if(!object || !id ) {
		res.sendStatus(400);
		return;
	}
    try {
		hamsterRef = await docRef.get();
	}
	catch(error) {
		console.log(error.message);
		res.status(500).send(error.message);
        return
	}
	if(!hamsterRef.exists) {
		res.status(404).send();
		return;
	}
    try {
		await docRef.set(object, { merge: true });
		if(Object.keys(object).length === 0) {
			res.sendStatus(400);
			return;
		}
		res.sendStatus(200);
	}
	catch(error) {
		console.log(error.message);
		res.status(500).send(error.message);
	}
});
function isHamsterItem(itm) {
     if( itm && ['name', 'age', 'favFood', 'loves', 'imgName', 'wins', 'defeats', 'games'].every(o => itm.hasOwnProperty(o)) ) {
            return true;
        }
    if( itm.id )
            return true
        return false;
}
router.delete('/:id', async (req, res) => {
	const id = req.params.id
	if(!id) {
		res.status(400).send('Hamster does not exists')
		return
    }
    let docRef;
	try {
		docRef = await db.collection('Hamsters').doc(id).get();
	}
	catch(error) {
		console.log(error.message);
		res.status(500).send(error.message);
	}
    if(!docRef.exists) {
        res.status(404).send();
        return;
    }
	await db.collection('Hamsters').doc(id).delete()
	res.status(200).send('Hamster removed')
})
module.exports = router;
