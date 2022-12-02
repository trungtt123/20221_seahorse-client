import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useHistory, useLocation } from "react-router-dom";
function Home(props) {
	const socket = props.socket;
	const { state } = useLocation();
	const [player, setPlayer] = useState(props.player);
	const [listRoom, setListRoom] = useState();
	const isKicked = state?.isKicked;
	const roomKick = state?.roomKick;
	const history = useHistory();
	const createRoom = () => {
		socket.emit('client create room');
	}
	const joinWaitRoom = (room) => {
		socket.emit('client join wait room', { room });
	}
	const getSlotInRoom = (players) => {
		let d = 0;
		for (let i = 0; i < 4; i++) {
			let player = players[i];
			if (!player.isBlocked && player.type === 'person'
				&& player.username === null && player.socketId === null) d++;
		}
		if (d === 0) return 'Phòng đã đầy';
		return `Còn ${d} ${d === 1 ? 'slot' : 'slots'}`;
	}
	useEffect(() => {
		socket.on('server create room', (data) => {
			if (data.message === 'success') {
				joinWaitRoom(data.room);
			}
		});

		socket.on('server to client joined wait room', (data) => {
			//console.log(data);
			if (data.message === 'success') {
				history.push({
					pathname: '/wait',
					state: {
						room: data.room
					}
				});
			}
		});

		socket.on('server send list wait room', (data) => {
			if (data.message === 'success') {
				setListRoom(data.rooms);
			}
		});
	}, []);
	useEffect(() => {
		if (isKicked) {
			alert('Bạn đã bị kick khỏi phòng');
			socket.emit('client leave wait room after kicked', {roomId: roomKick._id});
		}
	}, [isKicked])
	return (
		<div>
			<button onClick={() => createRoom()}>Tạo phòng</button>
			{listRoom?.map((room, index) => {
				return <div key={room._id}>
					<div>ID: {room._id}</div>
					<div>{getSlotInRoom(room.players)}</div>
					<button onClick={() => joinWaitRoom(room)}>Join room</button>
				</div>
			})}
		</div>
	);
}

export default Home;