import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useHistory, useLocation } from "react-router-dom";
import * as MESSAGE from '../Utils/constant';
function WaitRoom(props) {
	const socket = props.socket;
	const { state } = useLocation();
	const [waitRoom, setWaitRoom] = useState(state.room);
	const history = useHistory();
	const player = props.player;
	const playerLeaveRoom = () => {
		socket.emit(MESSAGE.CLIENT_LEAVE_WAIT_ROOM);
	}
	const roomOwnerBlockPlayer = (playerIndex) => {
		socket.emit(MESSAGE.ROOM_OWNER_BLOCK_PLAYER, { roomId: waitRoom._id, playerIndex: playerIndex });
	}
	const roomOwnerUnlockPlayer = (playerIndex) => {
		console.log('playerIndex', playerIndex);
		socket.emit(MESSAGE.ROOM_OWNER_UNLOCK_PLAYER, { roomId: waitRoom._id, playerIndex: playerIndex });
	}
	const roomOwnerKickPlayer = (playerIndex) => {
		socket.emit(MESSAGE.ROOM_OWNER_KICK_PLAYER, { roomId: waitRoom._id, playerIndex: playerIndex });
	}
	const roomOwnerChangeTypePlayer = (type, playerIndex) => {
		socket.emit(MESSAGE.ROOM_OWNER_CHANGE_TYPE_PLAYER, { roomId: waitRoom._id, playerIndex: playerIndex, type });
	}
	const startGame = () => {
		socket.emit(MESSAGE.CLIENT_START_GAME);
	}
	useEffect(() => {
		socket.on(MESSAGE.WAIT_ROOM_SEND_PLAYER_KICK, (data) => {
			if (data.message === 'success') {
				history.push({
					pathname: '/',
					state: {
						isKicked: true,
						roomKick: waitRoom
					}
				})
			}
		})
		socket.on(MESSAGE.WAIT_ROOM_SEND_DATA, (data) => {
			console.log('send');
			if (data.message === 'success') {
				setWaitRoom(data.room);
			}
			else {
				alert(data.reason);
			}
		});
		socket.on(MESSAGE.SERVER_TO_CLIENT_LEAVE_WAIT_ROOM, (data) => {
			//console.log(data);
			if (data.message === 'success'){
				history.push('/');
			}
		});
		socket.on(MESSAGE.SERVER_START_GAME, (data) => {
			console.log(data);
			if (data.message === 'success'){
				// bat dau game
				history.push({
					pathname: '/play',
					state: {
						room: data.room
					}
				})
			}
			else {
				alert(data.reason);
			}
		})
	}, []);
	console.log(waitRoom);
	return (
		<div>
			<button onClick={() => playerLeaveRoom()}>Rời phòng</button>
			<div className="grid-container">
				{waitRoom?.players?.map((item, index) => {

					if (item.type !== 'person') {
						if (item.isBlocked) {
							return <div key={index} className="grid-item">
								<div>Player {index + 1}</div>
								<div>Type: {item.type}</div>
								<div>Đã khóa</div>
								{player.username === waitRoom.owner.username ?
									<button onClick={() => roomOwnerUnlockPlayer(index)}>Mở khóa</button>
									: <></>}
							</div>
						} else return <div key={index} className="grid-item">
							<div>Player {index + 1}</div>
							<div>Type: {item.type}</div>
							{player.username === waitRoom.owner.username ?
								<>
									
									<select defaultValue="machine" onChange={(e) => roomOwnerChangeTypePlayer(e.target.value, index)}>
										<option value="person">person</option>
										<option value="machine">machine</option>
									</select>
									<button onClick={() => roomOwnerBlockPlayer(index)}>Khóa</button>
								</>
								: <></>}
						</div>
					} else {
						if (item.isBlocked) {
							return <div key={index} className="grid-item">
								<div>Player {index + 1}</div>
								<div>{item.username}</div>
								<div>Type: {item.type}</div>
								<div>Đã khóa</div>
								{player.username === waitRoom.owner.username ?
									<button onClick={() => roomOwnerUnlockPlayer(index)}>Mở khóa</button>
									: <></>}
							</div>
						} else return <div key={index} className="grid-item">
							<div>Player {index + 1}</div>
							<div>{item.username}</div>
							<div>Type: {item.type}</div>
							<div>{item.username === waitRoom.owner.username ? 'Chủ phòng' : ''}</div>
							{player.username === waitRoom.owner.username
								&& item.username !== waitRoom.owner.username
								&& item.username === null ?
								<>
									
									<select defaultValue="person" onChange={(e) => roomOwnerChangeTypePlayer(e.target.value, index)}>
										<option value="person">person</option>
										<option value="machine">machine</option>
									</select>
									<button onClick={() => roomOwnerBlockPlayer(index)}>Khóa</button>
									
								</> : <></>}
							{player.username === waitRoom.owner.username
								&& item.username !== waitRoom.owner.username
								&& item.username !== null ?
								<button onClick={() => roomOwnerKickPlayer(index)}>Kick</button>
								: <></>}
						</div>
					}
				})}

			</div>
			{
				waitRoom.owner.socketId === socket.id &&
				<button onClick={() => startGame()}>Bắt đầu</button>
			}
		</div>
	);
}

export default WaitRoom;