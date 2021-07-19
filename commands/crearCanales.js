const {Client, MessageEmbed} = require('discord.js');

module.exports = {
    nombre:"crearMateria",
    descripcion: "Crear la categoria, canales texto y voz",
    
ejecutar (cliente,message,args){

    var perms= message.member.hasPermission('ADMINISTRATOR');
    if (!perms) {return message.reply('Me dijeron que no te hiciera caso :wink: :ok_hand:')}

    
    var nombre = []
    var rol = []
    var cual = ""
    
    for(var i = 0;i < args.length; i++){
        if (args[i].startsWith("-")) {
            cual = args[i];
            continue;
        }
        switch(cual){
            case "-n":
                nombre.push(args[i]);
                break;
            case "-r":
                rol.push(args[i]);
                break;
        }
    }

    var concatenado=nombre.join(' ')

    for (var i of rol){
        var role = message.guild.roles.cache.find(role => role.name === i);
        if(!role){
            message.guild.roles.create({
                data:{
                    name: i,
                }
            })
        }
    }
    
    message.guild.channels.create(concatenado, {
        type: 'category',
        permissionOverwrites: [ 
            {
            id: '866800467560759317',
            },
            
        ],
    });

    message.guild.channels.create('texto '+concatenado, {
        type: 'text',
        permissionOverwrites: [ 
            {
            id: '866800467560759317', 
            },
        ],
    }) .then(channel => {
        let category = cliente.channels.cache.find(c => c.name == concatenado && c.type == "category");
    
        if (!category) throw new Error("Category channel does not exist");
        channel.setParent(category.id);
      }).catch(console.error);

      message.guild.channels.create('voz '+concatenado, {
        type: 'voice',
        permissionOverwrites: [ 
            {
            id: '866800467560759317', 
            },
        ],
    }) .then(channel => {
        let category = cliente.channels.cache.find(c => c.name == concatenado && c.type == "category");
    
        if (!category) throw new Error("Category channel does not exist");
        channel.setParent(category.id);
      }).catch(console.error);
    }
};