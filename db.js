const sqlite = require('sqlite3');

function conectar() {
	let db = new sqlite.Database("./database.db", (err) => {
		if (err) {
			console.log(err);
			throw err;
		}

		db.run(`CREATE TABLE IF NOT EXISTS recordatorios 
		(id integer primary key not null, fecha text not null, fechaNode text not null,
			materia tetxt not null, actividad text not null, mensaje text)`);
		console.log("Conectado a la db");
	});
	return db;
}

function getRecordatoriosSemanales() {
	let db = conectar();
	db.all(
		`SELECT * FROM recordatorios WHERE fecha BETWEEN date('now') AND date('now', '+7 day'); `,
		[],
		(err, filas) => {
			if (err) {
				console.log(err);
			}
			db.close();
			return filas;
		}
	);
}

	
function getRecordatoriosDiarios(){
	let db = conectar();
	db.all(
		`SELECT * FROM recordatorios WHERE fecha = date('now');`,
		[],
		(err, filas) => {
			if (err) {
				console.log(err);
			}
			db.close();
			return filas;
		}
	);
	
}
function getRecordatoriosMateria(materia){
	let db = conectar();
	db.all(
		`SELECT * FROM recordatorios WHERE materia = ?;`,
		[materia],
		(err, filas) => {
			if (err) {
				console.log(err);
			}
			db.close();
			return filas;
		}
	);
}

function setRecordatorio({fecha, fechanode, materia, actividad, mensaje, hora}){
    let db = conectar();
    db.run(
        'INSERT INTO recordatorios(fecha, fechaNode, materia, mensaje, actividad, hora) VALUES (?,?,?,?,?,?)',
        [fecha,fechanode, materia, actividad, mensaje, hora],
        err => {
            if (err) {
                console.log("Hubo un error al guardar el recordatorio");
            }
            console.log("Recordatorio guardado");
        }
    )
}

function updateRecordatorio({id, fecha, fechanode, materia, actividad, mensaje, hora}){
    let db = conectar();
    db.run(
        'UPDATE recordatorios SET fecha = ? , fechaNode  = ? , materia  = ? , actividad  = ? , mensaje  = ? ,hora  = ? WHERE id = ?',
        [fecha,fechanode, materia, actividad, mensaje, hora, id],
        err => {
            if (err) {
                console.log("Hubo un error al actualizar el recordatorio");
            }
            console.log("Recordatorio actualizar");
        }
    )
    db.close();
}

function deleteRecordatorio({id}){
    let db = conectar();
    db.run(
        'DELETE FROM recordatorios WHERE id = ?',
        [id],
        err => {
            if (err) {
                console.log(err)
            }
            console.log('Recordatorio eliminado');
        }
    )
}