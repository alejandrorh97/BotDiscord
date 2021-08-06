const sqlite3 = require("sqlite3");

class DB {
	constructor() {
		this.conexion = new sqlite3.Database("./database.db", (error) => {
			if (error) console.error(`Error al conectarse a la DB ${DB}`);
			this.conexion.run(`CREATE TABLE IF NOT EXISTS "recordatorios" (
                "id"	INTEGER NOT NULL,
                "fecha"	TEXT NOT NULL,
                "fechanode"	TEXT NOT NULL,
                "materia"	TEXT NOT NULL,
                "actividad"	TEXT NOT NULL,
                "mensaje"	TEXT,
                "hora"	TEXT NOT NULL,
				"canal" TEXT NOT NULL,
                PRIMARY KEY("id" AUTOINCREMENT)
            )`);
			console.log("Conectado a la DB");
		});
	}

	getRecordatoriosSemanales() {
		return new Promise((resuelta, rechazada) => {
			this.conexion.all(
				`SELECT * FROM recordatorios WHERE fecha BETWEEN date('now') AND date('now', '+7 day');`,
				[],
				(error, filas) => {
					if (error) {
						console.error(`Error al obtener los recordatorios semanales: ${error}`);
						rechazada(error);
					} else {
						resuelta(filas);
					}
				}
			);
		});
	}

	getRecordatoriosDiarios() {
		return new Promise((resuelta, rechazada) => {
			this.conexion.all(
				`SELECT * FROM recordatorios WHERE fecha = date('now');`,
				[],
				(error, filas) => {
					if (error) {
						console.error(`Error al obtener los recordatorios diarios: ${error}`);
						rechazada(error);
					} else {
						resuelta(filas);
					}
				}
			);
		});
	}

	getRecordatoriosMateria(materia) {
		return new Promise((resuelta, rechazada) => {
			this.conexion.all(
				`SELECT * FROM recordatorios WHERE materia = ?;`,
				[materia],
				(error, filas) => {
					if (error) {
						console.error(`Error al obtener los recordatorios diarios: ${error}`);
						rechazada(error);
					} else {
						resuelta(filas);
					}
				}
			);
		});
	}

	setRecordatorios({ fecha, fechanode, materia, actividad, mensaje, hora, canal}) {
		return new Promise((resuelta, rechazada) => {
			this.conexion.run(
				`INSERT INTO recordatorios(fecha, fechanode, materia, actividad, mensaje, hora, canal) VALUES (?,?,?,?,?,?,?);`,
				[fecha, fechanode, materia, actividad, mensaje, hora,canal],
				(error) => {
					if (error) {
						console.error(`Error al guardar el recordatorio: ${error}`);
						rechazada(error);
					} else {
						resuelta();
					}
				}
			);
		});
	}

	updateRecordatorio({ id, fecha, fechanode, materia, actividad, mensaje, hora, canal}) {
		return new Promise((resuelta, rechazada) => {
			this.conexion.run(
				"UPDATE recordatorios SET fecha = ? , fechaNode  = ? , materia  = ? , actividad  = ? , mensaje  = ? ,hora  = ?, canal = ? WHERE id = ?",
				[fecha, fechanode, materia, actividad, mensaje, hora,canal, id],
				(error) => {
					if (err) {
						console.error(`Hubo un error al actualizar el recordatorio: ${error}`);
                        rechazada(error);
					}
					else {
                        resuelta();
                    }
				}
			);
		});
	}

    deleteRecordatorio({id}){
        return new Promise((resuelta, rechazada) => {
            this.conexion.run(
                `DELETE FROM recordatorios WHERE id = ?`,
                [id],
                (error) => {
                    if(error){
                        console.error(`Error al eliminar el recordatorio ${error}`);
                        rechazada(error);
                    }
                    resuelta();
                }
            )
        });
    }
}

module.exports = DB;
