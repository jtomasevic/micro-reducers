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

### Complex example with bindings (combo box, radio box group, converting to number):
```javascript
/* eslint-disable radix */
import React from 'react';
import { bindActionProps } from 'micro-reducers';
import { useSession } from '../../store';
import { userSignUp } from '../actions';
import history from '../../../common/history';


// this will be our hellper structure for 'how did tou find us' which is usually get from API, but let's keep things simple for now.
const howDidYouFinUsOptions = [
    'Recomendation',
    'Googling about bookd',
    'Facebook',
    'Instagram'
];

// more/less like howDidYouFinUsOptions, also it could be object like: {genter:'Male, id:1}, etc...
const genders = [
    'Male',
    'Female'
];

const SignUp = () => {
    const [store, UserSignup] = useSession(userSignUp);
    if (store.user) {
        history.push('/basket');
    }
    /**
     * Binding works in this way.
     * 1. First parameter is Action.
     * 2. Then by action signature order, goes id's of controls that in some way keep value for action parameter.
     * In given example UserSignup is wrapper for action that has following signature:
     *  userSignUp = (email: string,
     *                password: string,
     *                userName: string,
     *                age: number,
     *                source: string,
     *                gender:string)
     * It is very important to NOTICE that bidings are in the sam order as parameters.
     * Look next statement just bellow this comment and compare with action declaration.
     */
    const signUp = bindActionProps(UserSignup,
        'user.email',
        'user.password',
        'user.userName',
        ['user.age', (element: HTMLElement) => parseInt(element.value)],
        'user.source',
        'user.gender');
    // generating select option.
    const options = howDidYouFinUsOptions.map((op: string) => <option key={op} value={op}>{op}</option>);
    // we need a trick for radio-button. trick is that one element can connect id and value attribute to enable bindings.
    // try to figure out next few lines (more explanation coming).
    const onGenderChange = (e) => (document.getElementById('user.gender').setAttribute('value', e.target.value));
    const genderOptions = genders.map((gender: string) => <span key={gender}>
        <label>{gender}</label>
        <input type='radio' name='gender' value={gender} onChange={onGenderChange}/>
    </span>);

    return (
        <>
            <h1>Sign up now!</h1>
            <div className='sigin-up-grid-container'>
                <div className='user-email-label'>
                    <span className='asterix'>*</span> Email
                </div>
                <div className='user-email-text'>
                    <input type='text' id='user.email' />
                </div>
                <div className='user-pass-label'>
                    <span className='asterix'>*</span> Password
                </div>
                <div className='user-pass-text'>
                    <input type='text' id='user.password' />
                </div>
                <div className='user-name-label'>
                    Desired user name
                </div>
                <div className='user-name-text'>
                    <input type='text' id='user.userName' />
                </div>
                <div className='user-age'>
                    Please enter your age
                </div>
                <div className='user-age'>
                    <input type='text' id='user.age' />
                </div>
                <div className='source-list'>
                    <select id='user.source'>
                        <option>How did you hear about us?</option>
                        {options}
                    </select>
                </div>
                <div className='user-gender-title' id='user.gender'>
                    Gender
                </div>
                <div className='user-gender-list'>
                    {genderOptions}
                </div>
                <div className='register-btn'>
                    <a href="#" className='standard-button' onClick={signUp}>Sign Up</a>
                </div>
            </div>
        </>);
};

export default SignUp;
```


Go here to learn from example:
https://github.com/jtomasevic/evax/edit/master/README.md