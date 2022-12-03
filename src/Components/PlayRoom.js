import React, { useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import { useHistory, useLocation } from "react-router-dom";
import ModalSignUp from './SignUp';
import { API_URL } from '../constant';
import { getPlayerInfo } from '../Services/common';
import { compareArraysAsSet } from '@testing-library/jest-dom/dist/utils';
const PlayRoom = (props) => {
	const socket = props.socket;
	const { state } = useLocation();
	const [playRoom, setPlayRoom] = useState(state.room);
	const [dataBoard, setDataBoard] = useState();
	const spin = () => {
		socket.emit('client spin');
	}
	const selectPath = (pathIndex) => {
		if (pathIndex !== 'x') {
			socket.emit('client select path', { pathIndex: pathIndex });
		}
	}
	const getStylePlayer = (color) => {
		if (color === 'red') return {
			top: 200,
			left: 0,
			color: color,
			position: 'absolute'
		}
		if (color === 'blue') return {
			top: 200,
			right: 0,
			color: color,
			position: 'absolute'
		}
		if (color === 'yellow') return {
			bottom: 200,
			left: 0,
			color: 'orange',
			position: 'absolute'
		}
		if (color === 'green') return {
			bottom: 200,
			right: 0,
			color: color,
			position: 'absolute'
		}
	}
	useEffect(() => {
		socket.on('play room send data', (data) => {
			console.log('dataBoard', data?.room?.dataBoard);
			if (data.message === 'success') {
				let { dataBoard } = data.room;
				setPlayRoom(data.room);
			}
			else {
				//alert(data.reason);
			}
		});
	}, []);
	useEffect(() => {
		setDataBoard(playRoom.dataBoard);
	}, [playRoom]);
	console.log(playRoom);
	return (
		<>
			<div>PlayRoom</div>
			<div style={{ textAlign: 'center' }}>
				{dataBoard?.currentTurn?.socketId === socket.id
					? <div>
						<div>Đến lượt bạn</div>
						{dataBoard.dice === null && <button onClick={() => spin()}>Quay</button>}
						{dataBoard.dice !== null && <div>Quay được: {dataBoard.dice}</div>}
						{dataBoard.dice !== null && dataBoard.cases.length === 0 && <div>Không có nước đi</div>}
						{(dataBoard.dice !== null && dataBoard.cases.length !== 0) &&
							<select onChange={(e) => selectPath(e.target.value)}>
								<option value={'x'}>Không chọn</option>
								{dataBoard.cases.map((item, index) => {
									return <option value={index} key={index}>
										{`Cá ngựa ${item.source.index}: từ vị trí: ${item.source.position}, status: ${item.source.status}
										di chuyển đến ${item.target.index}: từ vị trí: ${item.target.position}, status: ${item.target.status}
										`}
									</option>
								})}
							</select>
						}
					</div>
					: <div>
						<div>Đến lượt {dataBoard?.currentTurn?.color}</div>
						{dataBoard !== undefined && dataBoard.dice !== null && <div>Quay được: {dataBoard.dice}</div>}
					</div>
				}
			</div>
			{playRoom?.players?.map((item, index) => {
				const style = getStylePlayer(item.color);
				return <div key={index}
					style={style}>
					<div>{item.color}</div>
					<div>{item.username}</div>
					{item.type === 'machine' && !item.isBlocked && <div>Máy</div>}
				</div>
			})}
		</>
	);
};

export default PlayRoom;
