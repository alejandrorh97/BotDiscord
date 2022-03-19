const { initializeApp } =  require("firebase/app");
const { getFirestore, collection, getDocs } =  require("firebase/firestore/lite");
const configdb = require('./configdb.json');

class DB {
    constructor() {
        let app = initializeApp(configdb);
        this.db = getFirestore(app);
    }

    async getMaterias() {
        const materiasCol = collection(this.db, "materias");
        const materias = await getDocs(materiasCol);
        return materias.docs.map((doc) => doc.data());
    }
}

module.exports = DB;