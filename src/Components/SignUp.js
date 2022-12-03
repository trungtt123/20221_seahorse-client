import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import { API_URL } from '../constant';
const SignUp = (props) => {
    const socket = props.socket;
    const [modalIsOpen, setIsOpen] = useState(true);
    const [showError, setShowError] = useState(false);
    const [userName, setUserName] = useState();
    const register = () => {
        socket.emit('client register', { username: userName });
    }
    useEffect(() => {
        socket.on('server create user', (data) => {
            if (data.message === 'success') {
                setIsOpen(false);
                props.sendPlayerData(data.player);
            }
            else {
                setShowError(true);
            }
        });
    }, []);
    return (
        <div>
            <Modal
                isOpen={modalIsOpen}
                contentLabel="Example Modal"
                ariaHideApp={false}
            >
                <div>Nhập tên nhân vật: </div>
                <input onChange={(e) => { setUserName(e.target.value); setShowError(false) }} />
                <button onClick={() => register()}>Gửi</button>
                {showError && <div style={{ color: 'red' }}>Tên nhân vật đã tồn tại</div>}
            </Modal>
        </div>
    );
};

export default SignUp;
