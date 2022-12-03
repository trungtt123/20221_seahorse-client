import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useHistory, useLocation } from "react-router-dom";
import ModalSignUp from './SignUp';
import { API_URL } from '../constant';
import { getPlayerInfo } from '../Services/common';

function WaitRoom(props) {
	const socket = props.socket;
	const { state } = useLocation();
	const [waitRoom, setWaitRoom] = useState(state.room);
	const history = useHistory();
	const player = props.player;
	const playerLeaveRoom = () => {
		socket.emit('client leave wait room');
	}
	const roomOwnerBlockPlayer = (playerIndex) => {
		socket.emit('room owner block player', { roomId: waitRoom._id, playerIndex: playerIndex });
	}
	const roomOwnerUnlockPlayer = (playerIndex) => {
		console.log('playerIndex', playerIndex);
		socket.emit('room owner unlock player', { roomId: waitRoom._id, playerIndex: playerIndex });
	}
	const roomOwnerKickPlayer = (playerIndex) => {
		socket.emit('room owner kick player', { roomId: waitRoom._id, playerIndex: playerIndex });
	}
	const roomOwnerChangeTypePlayer = (type, playerIndex) => {
		socket.emit('room owner change type player', { roomId: waitRoom._id, playerIndex: playerIndex, type });
	}
	const startGame = () => {
		socket.emit('client start game');
	}
	useEffect(() => {
		socket.on('wait room send player kick', (data) => {
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
		socket.on('wait room send data', (data) => {
			console.log('send');
			if (data.message === 'success') {
				setWaitRoom(data.room);
			}
			else {
				alert(data.reason);
			}
		});
		socket.on('server to client leave wait room', (data) => {
			//console.log(data);
			if (data.message === 'success'){
				history.push('/');
			}
		});
		socket.on('server start game', (data) => {
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