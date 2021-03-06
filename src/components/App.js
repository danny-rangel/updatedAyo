import React, { useState, useEffect } from 'react';
import { createGlobalStyle, ThemeProvider, css } from "styled-components";
import styled from 'styled-components';
import { reset, themes } from 'react95';
import { db, firebase, setupPresence } from './firebase'; 

import ChatWindow from './ChatWindow';
import BuddyList from './BuddyList';
import Login from './Login';

const ResetStyles = createGlobalStyle`
  ${reset}
`;

const size = {
  small: 400,
  medium: 900,
  large: 1140
}

const media = Object.keys(size).reduce((acc, label) => {
  acc[label] = (...args) => css`
      @media (max-width: ${size[label]}px) {
          ${css(...args)}
      }
  `
  return acc;
}, {});

const AppDiv = styled.div`
  height: 100vh;
  background-Color: teal;
  width: 100%;

  ${media.medium`
    height: 100%;
  `} 
`;

const LoginDiv = styled.div`
  height: 100vh;
  background-Color: teal;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
`;

const MainDiv = styled.div`
  padding: 5rem;
  display: grid;
  grid-template-columns: auto 300px;
  grid-gap: 40px;
  justify-items: center;
  align-items: center;
  margin-bottom: 40px;

  ${media.medium`
      grid-template-columns: 1fr;
      grid-gap: 40px;
      padding: 10px;
      width: 95%;
  `} 
`;



const App = () => {

  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setIsLoading] = useState(false);
  

  useEffect(() => {
    setIsLoading(true);
    return firebase.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        let colors = ['red', 'green', 'blue', 'orange', 'gold', 'deeppink', 'aqua'];
        let chosenOne = colors[Math.floor(Math.random() * colors.length)];
        const user = {
          displayName: firebaseUser.displayName,
          uid: firebaseUser.uid,
          color: chosenOne
        }
        setAdmin(user);
        db.collection('users').doc(user.uid).set(user, { merge: true });
        db
          .collection('messages')
          .add({
              createdAt: new Date(),
              username: user.displayName,
              userId: user.uid,
              color: user.color,
              type: 'signOn'
            });
        setupPresence(user);
        setIsLoading(false);
      } else {
        setAdmin(null);
        setIsLoading(false);
      }
    });
  }, [])

  useEffect(() => {
    return db.collection('users').onSnapshot(snapshot => {
      const documents = [];
      snapshot.forEach(doc => {
        documents.push({
          ...doc.data(),
          id: doc.id
        })
      });
      setUsers(documents);
    });
  }, [])

  const handleLogOut = () => {
    db
      .collection('messages')
      .add({
          createdAt: new Date(),
          username: admin.displayName,
          userId: admin.uid,
          color: admin.color,
          type: 'signOff'
      });
    firebase.auth().signOut();
  }


  const handleSignIn = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await firebase.auth().signInWithPopup(provider);
    } catch(error) {
      alert(error);
    }
  }

    if (loading) {
      return (
        <AppDiv />
      );
    }

    return admin ? (
      <AppDiv >
        <ResetStyles />
        <ThemeProvider theme={themes.default}>
          <MainDiv>
            <ChatWindow admin={admin} handleLogOut={handleLogOut} />
            <BuddyList admin={admin} users={users} handleLogOut={handleLogOut} />
          </MainDiv>
        </ThemeProvider>
      </AppDiv> ) 
      : 
      (
        <LoginDiv>
          <ResetStyles />
          <ThemeProvider theme={themes.default}>
            <Login handleSignIn={handleSignIn} />
          </ThemeProvider>  
        </LoginDiv>
      )
    
}

export default App;
