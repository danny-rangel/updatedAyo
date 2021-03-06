import React from 'react';
import { Window, WindowContent } from 'react95';
import TextField from './TextField';
import WindowBar from './WindowBar';


const BuddyList = ({ users, handleLogOut }) => {
    return (
        <>
            <Window style={{
                width: 300, 
                height: 600, 
                margin: '0', 
                display: 'grid',
                gridTemplateRows: '40px 30px auto'
            }}>
                <WindowBar logout toolbar header="Buddy List" handleLogOut={handleLogOut}/>
                <WindowContent >
                    <TextField >
                        {users}
                    </TextField>
                </WindowContent>
            </Window>
        </>
    );
}

export default BuddyList;