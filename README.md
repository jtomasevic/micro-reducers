# Micro reducers
Micro reducers is library inspired by Redux, especially with concept of `actions` and `action creators`. The main difference is in reducer implementation. 

In Redux reducers are usually implemented as function receiving state and action, and returning new state. This is tipically done using switch/case when we merege action result with new state. 

Go here to learn from example:
https://github.com/jtomasevic/evax/edit/master/README.md

### Quick Intro
- Hello World
```javascript
import React from 'react';
import { createStore } from 'mini-reducers';

// define store
const messages = () => ({ message: undefined });
// create store
const [useMessages] = createStore(messages);
// create action
const getMesssage = (message) => ({
    type: 'messageReceived',
    message
});
// create ui element
export const HelloWorld = () => {
    const [store, GetMesssage] = useMessages(getMesssage);
    if (!store.message) {
        // call action directly, no wrapping etc.
        GetMesssage('somebody');
    }
    console.log('render', store);
    return (
        <div>
            {store.message}
        </div>
    );
};
```
- Hello World - async
```javascript
import React from 'react';
import { createStore } from '../../lib';

// define store
const messages = () => ({ message: undefined });

// create store
const [useMessages] = createStore(messages);

// create action
const messageReceived = (message) => ({
    type: 'messageReceived',
    message
});

// create action creator (async action)
const messageRequest = (name, dispatch) => {
    setTimeout(() => {
        dispatch(messageReceived(`Hello world to ${name}`));
    }, 1000);
};

// create ui element
export const HelloWorld = () => {
    const [store, MessageRequest] = useMessages(messageRequest);
    if (!store.message) {
        // call action directly, no wrapping etc.
        MessageRequest('somebody');
    }
    return (
        <div>
            {store.message}
        </div>
    );
};
```
- Bind reducer actions to UI
```javascript
import React from 'react';
import { createStore, bindActionProps } from '../../lib';

// define store
const lottery = () => ({ userName: undefined, lotteryTicketNo: 0, messageForUser: '' });
// create store
const [useLottery] = createStore(lottery);
// create action
const lotteryResult = (won, amount, messageForUser) => {
    console.log(`user result: ${won}, and amount: ${amount}`);
    return {
        type: 'lotteryResult',
        won,
        amount,
        messageForUser
    };
};
// create action creator
const lotterySubmit = (userName, lotteryTicketNo, dispatch) => {
    // imitate server call with timout function
    console.log(`calling async method and send ${userName} and ${lotteryTicketNo} to some API`);
    setTimeout(() => {
        // so let's pretend that variables won and amount are result from API code.
        const won = !(Math.floor(Math.random() * 2) > 0);
        const getRndAmount = (min, max) => Math.floor(Math.random() * (max - min)) + min;
        let amount = 0;
        if (won !== 0) {
            amount = getRndAmount(1000, 300000);
        }
        const message = won ? `Bravo! You just won $ ${amount}!` : 'Sorry try next time';
        // now call action (notice it's async)
        dispatch(lotteryResult(won, amount, message));
    }, 200);
};

// create ui element
const HelloWorld = () => {
    const [store, LotterySubmit] = useLottery(lotterySubmit);
    // bind action arguments in the same order as action signature.
    // in this case lotterSubmit has arguments (userName, lotteryTicketNo) see above.
    // bindActionProps will create function ready to pick up values from ui and to invoke action, so it's easy to bind to UI.
    const submit = bindActionProps(LotterySubmit,
        'user.userName',
        'user.lotteryNo');
    return (
        <>
            <h3>Hello world example for action bindings (sync)</h3>
            <div>
                User name: <input type='text' id='user.userName' />
            </div>
            <div>
                Lottery No <input type='text' id='user.lotteryNo' />
            </div>
            <div>
                <button onClick={submit}>Submit</button>
            </div>
            <p>
                {store.messageForUser}
            </p>
        </>
    );
};
export default HelloWorld;
```
- [Bind reducer actions to UI - async](https://github.com/jtomasevic/evax/wiki/4.-Action-Bindings-(async))
- [Bind reducer actions to UI - more](https://github.com/jtomasevic/evax/wiki/5.-Action-bindings-value-manipulation-(input-text))

### Store action binded to UI example:
```javascript
import React from 'react';
import { createStore, bindActionProps } from '../../lib';

// define store
const lottery = () => ({ userName: undefined, lotteryTicketNo: 0, messageForUser: '' });
// create store
const [useLottery] = createStore(lottery);
// create action
const lotterySubmit = (userName, lotteryTicketNo) => {
    console.log(`user submit lottery number ${lotteryTicketNo}, for this example this will be sync function.`);
    return {
        type: 'lotterySubmit',
        messageForUser: `Dear ${userName} you won 1000$!`
    };
};
// create ui element
const HelloWorld = () => {
    const [store, LotterySubmit] = useLottery(lotterySubmit);
    // bind action arguments in the same order as action signature.
    // in this case lotterSubmit has arguments (userName, lotteryTicketNo) see above.
    // bindActionProps will create function ready to pick up values from ui and to invoke action, so it's easy to bind to UI.
    const submit = bindActionProps(LotterySubmit,
        'user.userName',
        'user.lotteryNo');
    return (
        <>
            <h3>Hello world example for action bindings (sync)</h3>
            <div>
                User name: <input type='text' id='user.userName' />
            </div>
            <div>
                Lottery No <input type='text' id='user.lotteryNo' />
            </div>
            <div>
                <button onClick={submit}>Submit</button>
            </div>
            <p>
                {store.messageForUser}
            </p>
        </>
    );
};
export default HelloWorld;
```


Go here to learn from example:
https://github.com/jtomasevic/evax/edit/master/README.md