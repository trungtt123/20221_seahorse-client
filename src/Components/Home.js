import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useHistory, useLocation } from "react-router-dom";
import * as MESSAGE from '../Utils/constant';
function Home(props) {
	const socket = props.socket;
	const { state } = useLocation();
	const [player, setPlayer] = useState(props.player);
	const [listRoom, setListRoom] = useState();
	const isKicked = state?.isKicked;
	const roomKick = state?.roomKick;
	const history = useHistory();
	const createRoom = () => {
		socket.emit(MESSAGE.CLIENT_CREATE_ROOM);
	}
	const joinWaitRoom = (room) => {
		socket.emit(MESSAGE.CLIENT_JOIN_WAIT_ROOM, { room });
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
		socket.on(MESSAGE.SERVER_CREATE_ROOM, (data) => {
			if (data.message === 'success') {
				joinWaitRoom(data.room);
			}
		});

		socket.on(MESSAGE.SERVER_TO_CLIENT_JOINED_WAIT_ROOM, (data) => {
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

		socket.on(MESSAGE.SERVER_SEND_LIST_WAIT_ROOM, (data) => {
			if (data.message === 'success') {
				setListRoom(data.rooms);
			}
		});
	}, []);
	useEffect(() => {
		if (isKicked) {
			alert('Bạn đã bị kick khỏi phòng');
			socket.emit(MESSAGE.CLIENT_LEAVE_WAIT_ROOM_AFTER_KICKED, { roomId: roomKick._id });
		}
	}, [isKicked])
	return (
		<div>
			<button onClick={() => createRoom()}>Tạo phòng</button>
			{listRoom?.map((room, index) => {
				return <div key={room._id}>
					<div>ID: {room._id}</div>
					{
						room.play
							? <div>Game đã bắt đầu</div>
							: <>
								<div>{getSlotInRoom(room.players)}</div>
								<button onClick={() => joinWaitRoom(room)}>Join room</button>
							</>
					}
				</div>
			})}
		</div>
	);
}

export default Home;