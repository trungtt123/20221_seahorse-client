import React from "react";
import { BrowserRouter as Router, Switch, Route, useHistory, Redirect } from "react-router-dom";
import Home from "./Components/Home";
import PlayRoom from "./Components/PlayRoom";
import WaitRoom from "./Components/WaitRoom";
import SignUp from "./Components/SignUp";
import io from 'socket.io-client';
import { API_URL } from './Utils/constant';
import { useEffect } from "react";
import { useState } from "react";
import * as MESSAGE from './Utils/constant';
const socket = io(API_URL);
function App() {
  const history = useHistory();
  const [isConnected, setIsConnected] = useState();
  const [player, setPlayer] = useState();
  const [numberPlayer, setNumberPlayer] = useState();
  useEffect(() => {
    //socket on
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    socket.on(MESSAGE.SERVER_SEND_NUMBER_OF_PLAYERS, (data) => {
      console.log(data);
      setNumberPlayer(data);
    })
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    };
  }, []);
  if (socket !== undefined) {
    if (player !== undefined)
      return <>
        <div className="App">
          <div>Connected: {'' + isConnected}</div>
          <div>Xin chào, {player?.username}</div>
          <div>Số lượng người chơi: {numberPlayer}</div>
          <Router>
            <Switch>
              <Route path="/" exact>
                <Home socket={socket} player={player} />
              </Route>
              <Route path="/wait" exact>
                <WaitRoom socket={socket} player={player} />
              </Route>
              <Route path="/play" exact>
                <PlayRoom socket={socket} player={player} />
              </Route>
              <Route path="*">
                <Redirect to="/" />
              </Route>
            </Switch>
          </Router>
        </div>
      </>
    else
      return <>
        <div className="App">
          <Router>
            <Switch>
              <Route path="/signup" exact>
                <SignUp socket={socket} sendPlayerData={
                  (data) => {
                    setPlayer(data);
                  }
                } />
              </Route>
              <Route path="*">
                <Redirect to="/signup" />
              </Route>
            </Switch>
          </Router>
        </div>
      </>
  }
}

export default App;
