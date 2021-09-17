const maria = require('mariadb');
const config = require('./configdb.json');

class DB {
    constructor(){
        this.conexion = maria.createConnection(config);
    }


    async ping(){
        let con = await this.conexion;
        await con.ping();
        return true
    }

    async getRecordatoriosSemanales(){
        /*
            Retorna el resultset con los datos solicitados
        */
        let con = await this.conexion;
        let resultados = await con.query({
            sql: "SELECT * FROM recordatorios WHERE fecha BETWEEN DATE(NOW()) AND  DATE(NOW() + INTERVAL 7 DAY) ORDER by fecha"
        });
        con.end();
        return resultados;
    }

    async getRecordatoriosDiarios(){
        /*
            Retorna el resultset con los datos solicitados
        */
        let con = await this.conexion;
        let resultados = await con.query({
            sql: "SELECT * FROM recordatorios WHERE fecha BETWEEN DATE(NOW()) AND DATE(NOW() + INTERVAL 1 DAY) ORDER by fecha"
        });
        con.end();
        return resultados;
    }

    async getRecordatoriosMateria(materia){
        /*
            retorna el resulset
        */
        let con = await this.conexion;
        let resultados = await con.query({
            sql: "SELECT * FROM recordatorios WHERE materia = ? AND fecha >= DATE(NOW()) ORDER by fecha"
        }, [materia]);
        con.end();
        return resultados;
    }

    async getRecordatoriosFM(materia, fecha){
        /*
            retorna el resulset
        */
        let con = await this.conexion;
        let resultados = await con.query({
            sql: "SELECT * FROM recordatorios WHERE fecha = ? AND materia = ? ORDER by fecha"
        }, [fecha, materia]);
        con.end();
        return resultados;
    }

    async getRecordatoriosFecha(fecha, materia){
        /*
            retorna el resulset
        */
        let con = await this.conexion;
        let resultados = await con.query({
            sql: "SELECT materia, actividad, mensaje, fecha, hora, canal FROM recordatorios WHERE fecha = ? ORDER by fecha"
        }, [fecha]);
        con.end();
        return resultados;
    }

    async setRecordatorios({fecha , fecha_node, materia, actividad, mensaje, hora, canal,id_canal,usuario}){
        let con = await this.conexion;
        let resultados = await con.query({
            sql: "INSERT INTO recordatorios(fecha, fecha_node, materia, actividad, mensaje, hora, canal,id_canal,usuario) VALUES (?,?,?,?,?,?,?,?,?)"
        }, [fecha , fecha_node, materia, actividad, mensaje, hora, canal,id_canal,usuario]);
        con.end();
        return resultados;
    }

    async updateRecordatorios({fecha , fecha_node, materia, actividad, mensaje, hora, canal,id_canal,usuario, id}){
        let con = await this.conexion;
        let resultados = await con.query({
            sql: "UPDATE recordatorios SET fecha = ? , fecha_node  = ? , materia  = ? , actividad  = ? , mensaje  = ? ,hora  = ?, canal = ?, id_canal = ?, usuario = ? WHERE id = ?"
        }, [fecha , fecha_node, materia, actividad, mensaje, hora, canal,id_canal,usuario,id]);
        con.end();
        return resultados;
    }

    async deleteREcordatorio(id){
        let con = await this.conexion;
        let resultados = await con.query({
            sql: "DELETE FROM recordatorios WHERE id = ?"
        },[id]);
        con.end();
        return resultados;
    }
}

module.exports = DB;
