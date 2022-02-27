import mensajesApi from '../../api/mensajes.js'

export default async function configurarSocket(socket, sockets) {
    const mensajes = await mensajesApi.listarAll()
    socket.emit('mensajes', mensajes)

    socket.on('nuevoMensaje', async mensaje => {
        mensaje.fyh = new Date().toLocaleString()
        await mensajesApi.guardar(mensaje)
        const mensajes = await mensajesApi.listarAll()
        sockets.emit('mensajes', mensajes)
    })
}