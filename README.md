> - Library inspired by Redux (inherit from Flux) philosophy.
> - Trying to **automate state management** whenever it's possible.
> - Reduce reducers with **write only when needed** aproach.
> - Introduce **binding action parameters to UI concept**.

#### ['Todo list' example (last version - with async operations)](https://codesandbox.io/s/angry-mestorf-kk8q1)
> - Add, emove, update tasks, filter by status
> - All operation **without classic reducer, but in more declarative way**. This example also ilustrate **binding action params to UI.**
> 
> [click to see code example in sandbox](https://codesandbox.io/s/nifty-nash-ul2jp)
> 
> [same example with **ALL ASYNC** operation](https://codesandbox.io/s/angry-mestorf-kk8q1)

#### Very quick intro: 
- [Very simple Todo app](https://codesandbox.io/s/compassionate-butterfly-3mc7w?fontsize=14&hidenavigation=1&theme=dark)
- [Very simple Todo app without reducers (!!!)](https://codesandbox.io/s/zen-resonance-tjqjx)
- [Last todo example with statuses](https://codesandbox.io/s/nifty-nash-ul2jp)

Here you can  find more examples: https://github.com/jtomasevic/evax

# Micro reducers

Micro reducers is state management library (currently only for React) inspired by Redux, inherit from Flux, philosophy, especially with concepts of `actions` and `action creators`. 

## Why Micro ?

Comparison. How Redux works.

> 1. In Redux reducers receive current state and result of action (json). 
> 
> 2. Reducer create new state 'merging' current state with action result 
> 3. This is typically done using switch/case when we merge action result with new state. 
> 4. Redux framework check all reducers to find first appropriate action result, (which may cause performance issues).

#### Reducing reducers

In micro reducers we eliminate flow above whenever (3) is only 'merging states'

#### Why ?

In many cases, especially when actions are carefully designed considering store structure, reducer just do simple merging, nothing else. 
So what we do:

> 1. Assume that in most of the cases (or whenever it's possible) new state is just simple result of merging current state with new one.
> 
> 2. **WRITE reducer only** when necessary.
> 3. **CALL reducer directly**. We are using here event listener pattern, so no wasting time to look for correct reducer. ```It's direct method call```

**NOTE: We could say this framework is appropriate for 'action driven models'.**

## What Else ?

### Action Bindings (new)!

- Yeap, we can bind action/action creator arguments to UI. 

> We call bind method during component initialization and as **result** we receive method without arguments.

Then we can simply use this method on UI without complication with passing arguments, or calling popular dispatch method.

This could be **new approach in defining UI**. It's not perfect, but, it's very **'declarative'**, therefore easier to understand, write and maintain.

Little example (from react function component type):
```javascript
    const login = bindActionProps(UserSignIn,
        'user.email',
        'user.password');
```
and latter: 
```html
<input type='text' id='user.email' />
<input type='text' id='user.password' />
<a href='#' onClick={login} >Login</a>
```
to put all together, when link 'Login' is pressed this action will be called:
```javascript
function (email, password, dispatch) {
    someApiCall(email, password).then((user) => {
        dispatch(userSignedIn(user));
    });
};
```
but with binding, we can simplify this to zero-argument method, ```and do not care about dispatch function``` in UI layer.

## Why else MICRO ?

Because you can use createStore function for different part of application. 

 * It means for different part of application createStore could be used multiple times in absolute isolation. 
 * Isolation level is also aplied to actions, and action creators. 

## Quick Intro

### Examples on code sandbox

- [Very simple Todo app](https://codesandbox.io/s/compassionate-butterfly-3mc7w?fontsize=14&hidenavigation=1&theme=dark)

### Hello World

- Hello World examples
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
import { createStore } from 'micro-reducers';

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

### Bind action to UI

- Bind reducer actions to UI (sync)
```javascript
import React from 'react';
import { createStore, bindActionProps } from 'micro-reducers';

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
### Make your arrays auto add/remove without reducers (new from 1.5)
Use utility methods
- forArrPush
- forArrRemove

to bind actions to add/remove operation under arrays, to avoid adding reducers.

>Here is sandbox:
[Very simple Todo app without reducers](https://codesandbox.io/s/zen-resonance-tjqjx)

and portion of code
```javascript
import React from 'react';
import { bindActionProps, forArrPush, forArrRemove } from 'micro-reducers';
import { useTodoList } from './store';
import { addTask, completeTask } from './actions';

const Task = ({ task, onComplete }) => (
    <li>
        {task.name}
        <br/>
        <button onClick={(e) => { e.stopPropagation(); onComplete(task); }}> Complete </button>
    </li>
);
const TodoList = () => {
    // here we bind input action params to function which create object for array 
    const addParamsToObj = (taskName) => ({ name: taskName });
    // here we bind input params to function which return object to be removed from array
    const removeParamsToObj = (task) => (task);
    const [store, AddTask, CompleteTask] = useTodoList(
        // now we wrap our actions
        // as first parameter we need to say which colllection we are maintaining.
        // second parameter is action, and last params to object functions
        forArrPush('tasks', addTask, addParamsToObj),
        forArrRemove('tasks', completeTask, removeParamsToObj)
    );
    const tasks = store.tasks.map((task) => <Task key={task._key} task={task} onComplete={CompleteTask} />);
    const add = bindActionProps(AddTask, 'task.name');
    const onAdd = (e) => {
        e.stopPropagation();
        add();
        document.getElementById('task.name').value = '';
    };
    return (
        <>
            <div>
                    Task list
                <ul>
                    {tasks}
                </ul>
            </div>
            <div>
                <input type='text' id='task.name' />
            </div>
            <div>
                <button onClick={onAdd}>Add</button>
            </div>
        </>
    );
};
```

## Finally Reducers.

When we need reducer we write function for specific action.

Also we can split code in several functions (reducers), and include/exclude features as we test/want/etc...

I need to write more about this but here is one example to ilustrate. We have online book store, and we can add and remove from our shoping bag. 
> Let's say we are not using feature explained in chapter above
> Make your arrays auto add/remove without reducers (new from 1.5) 

As we have array of books and total price in state, we need reducers. Apologies for not very well explained example, but I'll work more on this in following days.

```javascript
    const onRemoveFromBasket = (store, actionResult) => {
        const basketBooks: Array<Book> = store.books ? store.books : [];
        for (let i = basketBooks.length - 1; i >= 0; i--) {
            if (basketBooks[i].id === actionResult.book.id) {
                basketBooks.splice(i, 1);
                break;
            }
        }
        return { ...store, books: basketBooks };
    };

    const onRemoveFromBasketAdjustPrice = (store, actionResult) => {
        const total: number = store.totalPrice - actionResult.book.price;
        return { ...store, totalPrice: total };
    };

    // use two reducer function for this action
    useReducer('removeFromBasket', onRemoveFromBasket);
    useReducer('removeFromBasket', onRemoveFromBasketAdjustPrice);
```

## Todo example with filternig, and status changing (add, remove, complete)
I put lot of comments, hpefully lot of thigs can be figure out from there, and I'm preparing sand box:
```javascript
import React from 'react';
import './style.css';
import { bindActionProps, forArrPush, forArrRemove, forUpdateArray, forFilterArray } from 'micro-reducers';
import { useTodoList } from './store';
import { addTask, completeTask, deleteTask, filterTasks, taskStatus, cancelFilter } from './actions';

const Task = ({ task, onComplete, onDelete }) => (
    <>
        <div className={`tname ${task.status}`}>
            {task.name}
        </div>
        <div className ='tompl'>
            <button className='todo-button' disabled={ task.status === 'completed'} onClick={(e) => { e.stopPropagation(); onComplete(task); }}> Complete </button>
        </div>
        <div className ='tremv'>
            <button className='todo-button' onClick={(e) => { e.stopPropagation(); onDelete(task); }}> Delete </button>
        </div>
    </>
);

const TodoList = () => {
    const [store, AddTask, CompleteTask, DeleteTask, FilterTasks, CancelFilter] = useTodoList(
        // This means: let my addTask action become push operation under 'tasks' array
        // Last attribute is function that transforme action parameters into object to
        // be added to arry. In this case we know that addTask method has one parameter
        // which is task name.
        forArrPush('tasks', addTask, (taskName) => ({ name: taskName, status: 'active' })),
        // This means: let my completeTask become 'update array member' operation under
        // task array. Last attribute is function that is returning new object state
        // Remember, each object has key, so that's how library will find original and update.
        forUpdateArray('tasks', completeTask, (task) => ({ ...task, status: 'completed' })),
        // This means: let my deleteTask action become delete operation under 'tasks' array
        // Last attribute is function that is returning object that should be deleted
        forArrRemove('tasks', deleteTask, (task) => (task)),
        // This means: I want to use filtering under tasks array with filterTasks action
        // Last attribute is function with two parameters:
        //  1. original array
        //  2. attributes from dispatched action.
        forFilterArray('tasks', filterTasks, (arr, params) => (arr.filter(t => t.status === params.status))),
        // This just simply means I want to wrap cancelFilter function to be used in UI.
        // Nothing especiall, BUT this action returns
        // { type: '!cancelFilter', collectionName: 'tasks' } which by convention means reset filer on array tasks
        cancelFilter
    );
    // Here we said: first parameter of AddTask (originally addTask) action
    // Will be picked up from ui element with id 'task.name'.
    // In this case this is input text field.
    // Latter we can just call add() add binding will do the rest.
    // NOTR: For more complex binding see example on: https://github.com/jtomasevic/evax
    //      (example after app installed: http://localhost:7000/signUp)
    //      source in wiki: https://github.com/jtomasevic/evax/wiki/8.-Very-complex-binding
    const add = bindActionProps(AddTask, 'task.name');
    // Same for filter for task statuses, but this time we have select element.
    const filter = bindActionProps(FilterTasks, 'tasks.filterStatus');
    // On add we want to clean text field for new text, and that's reason we have this
    // function here. Otherewise we'll just simple call <button onClick={add} ...
    const onAdd = (e) => {
        e.stopPropagation();
        add();
        document.getElementById('task.name').value = '';
    };
    /**
     * User can coose some value from list,
     * but also user can choose to cancel filter.
     * Because of that we put first element in list with value='cancelStatusFilter'.
     * You'll see bellow in ui
     * ....
     * <option value='cancelStatusFilter'>Filter by status</option>
     * ....
     * When use chose this first option we want to show all task, in other words to cancel filter.
     * @param {event} e react event
     */
    const onFilterChange = (e) => {
        if (e.target.value === 'cancelStatusFilter') {
            CancelFilter('tasks');
        } else {
            filter();
        }
    };
    // Generating select options for task status filter
    const filterOptions = taskStatus.map((op: string) => <option key={op} value={op} >{op}</option>);
    // Because we are using filtering, by default library generate store property <...>WithFilter
    // That's why we have this here. While filtering is on we'll bind filtered list, otherwise original one.
    let tasks = store.tasksWithFilter ? store.tasksWithFilter : store.tasks;
    tasks = tasks.map((task) => <Task key={task._key} task={task} onComplete={CompleteTask} onDelete={DeleteTask} />);
    console.log('RENDER store.tasks', store);
    return (
        <>
            <h1>Task list</h1>
            <div className='todo-grid'>
                <div className='tname'>
                    <input type='text' id='task.name' />
                </div>
                <div className='tadd'>
                    <button className='todo-button' onClick={onAdd}>Add</button>
                </div>
            </div>
            <br/>
            <div className='tasks-grid'>
                {tasks}
                <div className='tasks-filter'>
                    <select id='tasks.filterStatus' onChange={onFilterChange}>
                        <option value='cancelStatusFilter'>Filter by status</option>
                        {filterOptions}
                    </select>
                </div>
            </div>
        </>
    );
};

export default TodoList;

```

Go here to learn from example:
https://github.com/jtomasevic/evax