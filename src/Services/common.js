export const getPlayerInfo = (socket) => {
    let result;
    console.log(socket);
    socket.emit('client get info', (data) => {
        console.log(data);
        result = data;
    });
    return result;
}
