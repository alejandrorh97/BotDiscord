module.exports = {
	nombre: 'caracola',
	descripcion: 'Haz una pregunta, a ver que tan salado estas',
    args: false,
	admins: false,
    soloServer: false,
	borrable: false,
	usos: "Solo pon tu pregunta despues del comando",
	ejecutar(cliente,mensaje, args) {
		var respuestas = [
            "No lo se tu dime :detective:",
            "Ya veremos dijo el ciego",
            "Si te bañaras talves",
            "Joder claro que si",
            "No lo creo",
            "Lo sentimos se ha acabado tu cupos para preguntar",
            "Yo que se",
            "Cuando saquen el spiderverse",
            "Cuando Barrera de clases",
            "No porque arrunaria la sagrada linea del tiempo :crocodile:",
            "Si asi lo decidio la sagrada linea del tiempo :crocodile:",
            "Acaso quieres que explote el universo",
            "Que alguien llame a alguien",
            "No",
            "Si",
            "Dejame lo anoto en mi maquina de escribir",
            "Cuando ella te ame",
            "Cuando el te ame",
            "Cuando Ash crezca",
            "Error 404",
            "Preguntale a Oliva",
            "Cuando Alex saque 10 de promedio",
            "1% de probabilidad 99% de fe",
            "Ten Fe",
            "Intenta preguntando de nuevo",
            "tatara tatarata tuturutu",
            "https://youtu.be/dQw4w9WgXcQ",
            "Solo gozalo",
            "A veces cuando planeas una cosa, te sale otra completamente diferente",
            "Andate a dormir",
            "Esta ya no es hora de preguntar",
            "Que pregunta es esa???? ",
            "Preguntale a este señor https://twitter.com/jcpenya",
            "De hecho hay una clase de Zamora que lo explica",
            "Cuando One Piece termine",
            "Cuando JC Aguilar (aka coursera) suba notas",
            "Solo hechale pimienta negra recien molida",
            "Estas aburrido va?",
            "Va pa saber",
            "Ke v3rg@",
            "Tene $5 y no preguntes mas",
            "De hecho hay curso que lo explica",
            "Imagen khabi",
            "Imagen 9k",
            "Imagen risitas",
            "Imagen kun",
            "Solo soy bot"
        ]

        let r = respuestas.splice(Math.floor(Math.random() * respuestas.length), 1).join(' ');
        
        if (r.startsWith("Imagen ")) {
            mensaje.reply({
                files: [`./recursos/imagenes/${r.split(' ').splice(1,1)}.png`]
            })
        }
        else {
            mensaje.reply(r);
            mensaje.channel.send("La caracola ha hablado :shell:")
        }
	}
};