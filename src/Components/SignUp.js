import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import * as MESSAGE from '../Utils/constant';
const SignUp = (props) => {
    const socket = props.socket;
    const [modalIsOpen, setIsOpen] = useState(true);
    const [showError, setShowError] = useState(false);
    const [userName, setUserName] = useState();
    const register = () => {
        socket.emit(MESSAGE.CLIENT_REGISTER, { username: userName });
    }
    useEffect(() => {
        socket.on(MESSAGE.SERVER_CREATE_USER, (data) => {
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
