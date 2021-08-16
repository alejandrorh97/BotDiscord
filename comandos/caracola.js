const {enviarLog} = require('../utils');
module.exports = {
	nombre: 'caracola',
	descripcion: 'Prueba tu suerte',
    args: false,
	admins: false,
    soloServer: false,
	borrable: false,
	usos: "Solo pon tu pregunta despues del comando",
	ejecutar(cliente,mensaje, args) {
        try {
            if(args.length === 0){
                //por si solo ponen caracola
                mensaje.reply('Va pa saber');
                return;
            }
            var respuestas = [
                "No lo se tu dime :detective:",
                "Ya veremos dijo el ciego",
                "Si te bañaras talves",
                "Joder claro que si",
                "No lo creo",
                "Lo sentimos se ha acabado tus cupos para preguntar",
                "Yo que se",
                "Cuando saquen el spiderverse",
                "Cuando Barrera de clases",
                "No, porque arrunaria la sagrada linea del tiempo :crocodile:",
                "Si, asi lo decidio la sagrada linea del tiempo :crocodile:",
                "Acaso quieres que explote el universo",
                "No",
                "Si",
                "Dejame lo anoto en mi maquina de escribir",
                "Cuando ella te ame",
                "Cuando el te ame",
                "Cuando Ash crezca",
                "Error 404",
                "con 1% de esfuerzo 99% de fe",
                "Ten Fe",
                "Intenta preguntando de nuevo",
                "tatara tatarata tuturutu",
                "https://youtu.be/dQw4w9WgXcQ",
                "No preguntes, Solo gozalo",
                "A veces cuando planeas una cosa, te sale otra completamente diferente",
                "Andate a dormir",
                "Esta ya no es hora de preguntar",
                "Que pregunta es esa???? ",
                "Preguntale a este señor https://twitter.com/jcpenya",
                "De hecho hay una clase de Zamora que lo explica",
                "Cuando One Piece termine",
                "Cuando JC Aguilar suba notas",
                "Solo hechale pimienta negra recien molida",
                "Estas aburrido va?",
                "Ke v3rg@",
                "Tene $5 y no preguntes mas",
                "Imagen khabi",
                "Imagen 9k",
                "Imagen risitas",
                "Imagen kun",
                "Solo soy bot",
                "Claro que no, ¿Qué somos monos?"
            ]
            let r = respuestas.splice(Math.floor(Math.random() * respuestas.length), 1).join(' ');
            if (r.startsWith("Imagen ")) {
                mensaje.reply({
                    files: [`./recursos/imagenes/${r.split(' ').splice(1,1)}.png`]
                });
                return;
            } else {
                mensaje.reply(r);
                mensaje.channel.send("La caracola ha hablado :shell:");
                return;
            }
        } catch (error) {
            enviarLog({
				cliente: cliente,
				lugar: "comando -> caracola",
				error: error,
				quien: mensaje.author.username,
				comando: mensaje.content
			});
        }
	}
};