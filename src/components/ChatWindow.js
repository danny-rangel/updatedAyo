import React, { useState, useEffect } from 'react';
import { TextArea, Window, WindowContent, Button } from 'react95';
import styled, { css }  from 'styled-components'
import MessageField from './MessageField';
import WindowBar from './WindowBar';
import { db } from './firebase';


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


const StyledForm = styled.form`
    padding: 0;
    margin: 0;
    outline: none;
    border: none;
    color: black;
    height: 100%;
    box-sizing: border-box;
`;

const StyledWindow = styled(Window)`
    width: 80%;
    height: 600;
    margin: 0; 
    display: grid;
    grid-template-rows: 40px 30px auto;


    ${media.medium`
      width: 95%;
    `} 
`;



const ChatWindow = ({ admin, handleLogOut }) => {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState(null);
    const [fetching, isFetching] = useState(true);

    useEffect(() => {
        isFetching(true);
        return db.collection('messages')
            .orderBy('createdAt')
            .onSnapshot(snapshot => {
                const docs = [];
                snapshot.forEach(doc => {
                    docs.push({
                        ...doc.data(),
                        id: doc.id
                    })
                });
                setMessages(docs);
                isFetching(false);
            });
    }, [])

    const handleChange = (e) => {
        setMessage(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        db
          .collection('messages')
          .add({
              text: message,
              createdAt: new Date(),
              username: admin.displayName,
              userId: admin.uid,
              color: admin.color,
              type: 'message'
            });
        
        setMessage('');
    }

    


    return  (
        <>
            <StyledWindow>
                <WindowBar logout toolbar header="Ayo" handleLogOut={handleLogOut}/>
                <WindowContent style={{
                        display: 'grid',
                        gridGap: '20px',
                        gridTemplateRows: '2fr 1fr',
                        height: '500px'
                    }}>
                    {fetching ? (<div>Loading...</div>) : (<MessageField messages={messages} />) }
                    <StyledForm>
                        <TextArea 
                            value={message}
                            placeholder="Type something..."
                            onChange={handleChange}
                            height='60%'
                        />
                        <Button fullWidth onClick={handleSubmit} style={{
                            margin: '20px 0 0 0'
                        }} >
                            Send
                        </Button>
                    </StyledForm>
                </WindowContent>
            </StyledWindow>
        </>
    );
}

export default ChatWindow;