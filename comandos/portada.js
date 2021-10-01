const { enviarLog, formatearFecha} = require("../utils");
const { giveplz } = require("../config.json");
const megadb = require("megadb");
var PizZip = require("pizzip");
var Docxtemplater = require("docxtemplater");
var fs = require("fs").promises;
var path = require("path");

// funciones que permite ver mas detalladamente informacion de un error
function replaceErrors(key, value) {
    if (value instanceof Error) {
        return Object.getOwnPropertyNames(value).reduce(function (error, key) {
            error[key] = value[key];
            return error;
        }, {});
    }
    return value;
}

function errorHandler(error) {
    console.log(JSON.stringify({ error: error }, replaceErrors));

    if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors
            .map(function (error) {
                return error.properties.explanation;
            })
            .join("\n");
        console.log("errorMessages", errorMessages);
    }
    throw error;
}

module.exports = {
    nombre: "portada",
    descripcion: "Te envia una portada para tu trabajo",
    args: false,
    admins: false,
    soloServer: false,
    borrable: true,
    categoria: "ayuda",
    usos: "-t tema del trabajo -m materia que desea [por ejemplo tsi, fisica3 etc] -f fecha del trabajo [si no se especfica toma la de este dia]",
    async ejecutar(cliente, mensaje, args) {
        try {
            var tema = [];
            var materia = [];
            var fecha = [];
            var cual = "";
            for (const arg of args) {
                if (arg.startsWith("-")) {
                    cual = arg;
                    continue;
                }
                switch (cual) {
                    case "-m":
                        materia.push(arg);
                        break;
                    case "-t":
                        tema.push(arg);
                        break;
                    case "-f":
                        fecha.push(arg);
                        break;
                }
            }
            tema = tema.join(" ");
            materia = materia.join(" ");
            fecha = fecha.join(" ");

            var archivo = "";
            var plantilla = {
                tema: tema,
                asignatura: materia,
                nombres: "",
                apellidos: "",
                carnet: "",
                docente: "",
                fecha: fecha,
            };

            var txt = "";
            if (!tema && !materia && !fecha) {
                archivo = "./recursos/portada_vacia.docx";
            } else {
                if (!fecha) {
                    //no se puso fecha
                    plantilla.fecha = formatearFecha(new Date());
                }
                if (materia){
                    //materia si especificada
                    let db = new megadb.crearDB("docentes");
                    let docente = await db.obtener(materia);
                    if (docente){
                        plantilla.docente = docente.nombre;
                        plantilla.asignatura = docente.materia;
                    }
                }
                // se abre el archivo docx como binario
                var content = await fs.readFile(
                    "./recursos/plantilla.docx",
                    "binary"
                );
                var zip = new PizZip(content);
                var doc;
                try {
                    doc = new Docxtemplater(zip, {
                        paragraphLoop: true,
                        linebreaks: true,
                    });
                } catch (error) {
                    // Catch compilation errors (errors caused by the compilation of the template: misplaced tags)
                    errorHandler(error);
                }

                //preparamos los datos
                let db = new megadb.crearDB("sujetos");
                let datos = await db.obtener(mensaje.author.id);
                if (datos){
                    plantilla.nombres = datos.nombre;
                    plantilla.apellidos = datos.apellido;
                    plantilla.carnet = datos.carnet;
                }
                else {
                    txt += "**Registrate para que te haga la portada bien chiva :slight_smile:**\n";
                }
                try {
                    // render the document
                    doc.render(plantilla);
                } catch (error) {
                    // Catch rendering errors (errors relating to the rendering of the template: angularParser throws an error)
                    errorHandler(error);
                }
                // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
                var buf = doc.getZip().generate({ type: "nodebuffer" });
                await fs.writeFile("./recursos/portada.docx", buf);
                archivo = "./recursos/portada.docx";
            }

            if (
                mensaje.author.id === "240558868038549504" ||
                mensaje.author.id === "688544642408513573"
            ) {
                txt += `Aqui tiene amo y señor <@${mensaje.author.id}>`;
            } else {
                txt += `Aqui tenes tu portada <@${mensaje.author.id}>`;
            }
            txt += ` ${giveplz}`;
            mensaje.channel.send({
                content: txt,
                files: [archivo],
            });
        } catch (error) {
            enviarLog({
                cliente: cliente,
                error: error,
                lugar: "comando -> portada",
                quien: mensaje.author.username,
                comando: mensaje,
            });
        }
    },
};
