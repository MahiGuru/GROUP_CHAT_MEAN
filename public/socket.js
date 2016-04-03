module.exports.iop = function () {
    io.on('connection', function (socket) {
        console.log('a user connected');
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
        socket.on('chat message', function (msg) {
            console.log('message: ' + msg);
        });

    });
}
