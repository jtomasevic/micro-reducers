/* eslint-disable no-underscore-dangle */
// @flow
/* eslint-disable no-mixed-operators */
/* eslint-disable no-bitwise */

/**
 * I'm very aware that this code needs serious refactoring, and I promisse I'll do my best.
 * considering my dailly job, family, etc...
 * I know there are some non-sense lines, and code organization,
 * and I would highly appreciate any suggestion, proposal, collaboration, etc...
 */

import { useState } from 'react';
import { getUUID } from './utils';

export type ActionResult = { type: string } | void;
export type dispatchType = (actionResult: ActionResult) => void;

export type Action = (...params: any) => ActionResult;
export type AsyncAction = (...params: any) => void;
export type AtionType = Action | AsyncAction;
export type useActionType = (action: Action) => any;

export type useStoreType = () => [any, (Action) => any];
export type attatchToActionType = (actionName: string, callBack: (store: any, action: ActionResult) => any) => void;

export type filterType = {
    param: ActionResult;
    filterFunction: Function;
}
/**
 * If obj is 'just' object, simply if it's json return true. If it's function, return false.
 * @param {any} obj json object, function, whatever
 */
const isObject = (obj) => obj === Object(obj);

/**
     * Probably better name will be 'super store' because it's content is set of individual stores.
     * Each of these stores have own objects, state, etc.
     * It's possible to use multiple 'individual stores' inside one UI component.
     * Also, in complex applications we can have multiple 'super stores'. See more about it in description for createStore function.
 */
export class Store {
    /**
     * parts of store this is an dictionary but I still didn't do full refactoring
     */
    stores: [];

    /**
     * again dictionary, key is name of action, and value is function.
     * again need more refactoring.
     */
    attachers: { [string]: Function };

    /**
     * Here we keep filters configuration. It's a dictionary.
     * @key name of array in store
     * @value filter configuration with filter function
     */
    filters: { [string]: filterType };

    constructor() {
        this.stores = {};
        this.attachers = {};
        this.filters = {};
        this.addToCollection = this.addToCollection.bind(this);
        this.attachTo = this.attachTo.bind(this);
        this.setFilteredArray = this.setFilteredArray.bind(this);
        this.checkFilter = this.checkFilter.bind(this);
        this.resetFilter = this.resetFilter.bind(this);
        this.addToCollection = this.addToCollection.bind(this);
        this.removeFromCollection = this.removeFromCollection.bind(this);
        this.setFilter = this.setFilter.bind(this);
        this.updateCollectionMember = this.updateCollectionMember.bind(this);
        this.handleCollectionOperation = this.handleCollectionOperation.bind(this);
    }

    /**
     * This is replacement for reducers. Not to use directly but with 'useReducer' utility function.
     * @param {string} actionType type of action to subcribe
     * @param {Function} callBack callBack function to be called when action is happened.
     * This is starting point to replace traditional reducers
     */
    attachTo(actionType: string, callBack: (store: any, action: ActionResult) => any): attatchToActionType {
        if (!this.attachers[actionType]) {
            this.attachers[actionType] = [];
        }
        this.attachers[actionType].push(callBack);
    }

    /**
     * This method check set filter on array (member of store)
     * @param {any} store part of global store
     * @param {string} storeName name of store
     * @param {ActionResult} actionResult result of action. 
     */
    setFilter(store: any, storeName, actionResult: ActionResult) {
        // if there is a property filter
        // it means this action should filter exisiting store member.
        // in this case, of course this member is an array,
        // and member name is action.filter.name added in forFilterArray utility function.
        // here we'll refer only as arr to such store property
        const originalArray = store[actionResult._____filter.name];
        // on of the filter properies, such as name, is also filterFunction
        // we need to execute filterFunction to get result and tu put this results somewhere.
        const result = actionResult._____filter.filterFunction(originalArray, actionResult);
        this.setFilteredArray(store, actionResult._____filter.name, result);
        this.filters[`${storeName}.${actionResult._____filter.name}`] = {
            param: { ...actionResult },
            filterFunction: actionResult._____filter.filterFunction
        };
    }
    /**
     * Check if filter exist. If exist then get filter configuration for this array,
     * call filter function and set state.
     * @param {any} store store that will be updated if filer exist
     * @param {string} atoreName  name of store
     * @param {string} arrayName name of array in store
     */
    checkFilter(store: any, storeName: string, arrayName: string) {
        if (this.filters[`${storeName}.${arrayName}`]) {
            const filter = this.filters[`${storeName}.${arrayName}`];
            const result = filter.filterFunction(store[arrayName], filter.param);
            this.setFilteredArray(store, arrayName, result);
        }
    }

    /**
     * If not exist, create new array with name by convention:
     * {arrayNam}WithArray, and then just set value.
     * @param {string} name name of array in store
     * @param {Array} arr filtered array
     */
    setFilteredArray(store: any, name: string, arr: Array) {
        if (!store[`${name}WithFilter`]) {
            store[`${name}WithFilter`] = [...arr];
        }
        store[`${name}WithFilter`] = [...arr];
    }

    /**
     * Remove filter, deleting filter array
     * @param {string} arrayName name of array in store
     */
    resetFilter(store: any, storeName, arrayName: string) {
        this.filters[`${storeName}.${arrayName}`] = null;
        store[`${arrayName}WithFilter`] = null;
    }

    /**
     * Add new memeber to collection which is part of store.
     * Examples: tasks, books...
     * @param {store} store one of may stores object, that has collection where we want to put new element
     * @actionResult {Action}
     */
    addToCollection(store, actionResult) {
        actionResult.toArray.obj._key = getUUID();
        store[actionResult.toArray.name].push(actionResult.toArray.obj);
    }

    /**
     * Remove member from collection (array)
     * @param {any} store part of global store
     * @param {ActionResult} actionResul
     */
    removeFromCollection(store, actionResult) {
        const toRemove = actionResult.fromArray.obj;
        const arr = store[actionResult.fromArray.name];
        for (let i = 0; i < arr.length; i++) {
            if (toRemove._key === arr[i]._key) {
                arr.splice(i, 1);
                break;
            }
        }
        store[actionResult.fromArray.name] = arr;
    }
    /**
     * Update memeber of collection which is property in store.
     * @param {any} store
     * @param {actionResult} result of action. 
     */
    updateCollectionMember(store: any, actionResult: ActionResult) {
        const toUpdate = actionResult.updateArray.obj;
        const arr = store[actionResult.updateArray.name];
        for (let i = 0; i < arr.length; i++) {
            if (toUpdate._key === arr[i]._key) {
                arr[i] = toUpdate;
                break;
            }
        }
    }
    /**
     * This method handle collection operation. Check for especial tagas and depens on tag value
     * performs one of action
     * - add item to array
     * - remove from array
     * - updat member of array
     * - set filter on array
     * - cance filters
     * @param {any} store part of global store
     * @param {string} storeName name of store
     * @param {ActioResult} actionResult result of action
     */
    handleCollectionOperation(store, storeName, actionResult) {
        if (actionResult.toArray) {
            this.addToCollection(store, actionResult);
            this.checkFilter(store, storeName, actionResult.toArray.name);
        } else if (actionResult.fromArray) {
            this.removeFromCollection(store, actionResult);
            this.checkFilter(store, storeName, actionResult.fromArray.name);
        } else if (actionResult.updateArray) {
            this.updateCollectionMember(store, actionResult);
            this.checkFilter(store, storeName, actionResult.updateArray.name);
        } else if (actionResult._____filter) {
            this.setFilter(store, storeName, actionResult);
        } else if (actionResult.type === '!cancelFilter') {
            this.resetFilter(store, storeName, actionResult.collectionName);
        }
    }

    /**
     * Register new piece of store
     * @param {Function} storeFn Function that return initial state.
     * @returns {Function} Return useStore utility function
     */
    register(storeFn: () => Object): () => any {
        this.stores[storeFn.name] = storeFn();
        if (!this.stores[storeFn.name]) {
            this.stores[storeFn.name] = {};
        }
        const useStore = (customConfig?: Array, ...actions: Function): any => {
            let setState: (state: any) => void = null;
            let store = this.stores[storeFn.name];
            // =let state = this.stores[storeFn.name];
            // these three are used if store is used from class component.
            let component = null;
            let cmpSetState = null;
            let classState = null;
            // if first memeber is array it's configuration for class components.
            // for now it's just array with one member, pointer to component itself.
            if (Array.isArray(customConfig)) {
                // as expalained above first element is component (react class component)
                component = customConfig[0];
                // ... which always has setState function
                cmpSetState = customConfig[0].setState;
                // ... and must have defined state property
                classState = customConfig[0].state;
            }
            if (!Array.isArray(customConfig)) {
                // if first element it's not an array then this is part where we
                // handle functional components.
                // first join first element (which is Action, not config)
                actions = [customConfig, ...actions];
                // use react hook to handle state
                const [stateConst, setReactState] = useState(store);
                store = stateConst;
                setState = setReactState;
            } else {
                // this is only for class component.
                setState = (newState) => {
                    classState[storeFn.name] = newState;
                    cmpSetState.call(component, classState);
                };
            }
            // this method will be used inside wraped action so that 
            // developer don't need to call dispatch, but only action as function
            // exception is in async function when developer will explicitly call dispatch(action())
            const _dispatch = (actionResult: ActionResult) => {
                this.dispatch(actionResult, store, storeFn.name, setState);
            };
            // this will wrap action into another one, 
            // just to add _dispatch method as last one.
            // we are adding this params (method dispatch) to be used by async function
            const wrapAction = (action: AtionType): any => (...params: any) => {
                // this is how dispatch method become parameter in async actions
                // which we usually call action creators.
                params.push(_dispatch);
                return _dispatch(action(...params));
            };
            // wrap all function passed as params to useStore hook
            const wrappedActions = actions ? actions.map(action => wrapAction(action)) : [];
            // this is to support usage of this library in class components.
            // if first parameter (customConfig) is array it means class component is using it.
            // then we just return wrapped actions while state is handled in different way (not using react useState hook)
            // otherwise return store and wrapped actions
            return Array.isArray(customConfig) ? [...wrappedActions] : [store, ...wrappedActions];
        };
        return useStore;
    }

    /**
     * Dispatch will first check what to do with action result.
     * These are oprtion:
     * - (auto) array operation
     * - call dispetcher to set new state
     * - merge state with current state
     * - do nothing, because action result is not an object so probably we are in the middle of async method execution
     * @param {ActionResult} actionResult result of an action
     * @param {any} store part of global store, for exampe tasks
     * @param {string} storeName name of store
     * @param {Function} setState "hook" function to set state of UI component.
     */
    dispatch(actionResult: ActionResult, store, storeName, setState) {
        // store = Object.assign(store);
        // check if result is object (json)
        // why ? because if it's async function it will first return undefined or nul
        // and latter will dispatch action
        if (isObject(actionResult)) {
            // first check if we are dealing with array and auto commands.
            // latter we can apply additional operation with attachers/reducers
            if (actionResult.toArray || actionResult.fromArray
                || actionResult.updateArray || actionResult._____filter
                || actionResult.type === '!cancelFilter') {
                this.handleCollectionOperation(store, storeName, actionResult);
            } else if (this.attachers[actionResult.type]) { // here we check attachers (or reducers)
            // it is important in which order attachers change state.
            // here is FIFO implementation.
                this.attachers[actionResult.type].forEach(callback => {
                    store = callback(store, actionResult, this.stores);
                });
            } else {
                // if it's not array, it's not filter, there is not attachers - reducers
                // then just merge store.
                store = { ...store, ...actionResult };
            }
            this.stores[storeName] = { ...store };
            setState(this.stores[storeName]);
            Object.keys(actionResult).forEach(key => {
                delete actionResult[key];
            });
            delete [actionResult];
            actionResult = null;
        }
    }
}

/**
 * Create 'super' store (set of individual stores) which is part of function scope.
 * It means for different part of application createStore could be used multiple times in absolute isolation.
 * Isolation level is also aplied to actions, and action creators.
 * @param  {...any} stores functions that returns objects. Each of them describing signle store instance.
 * If first parameters is array this means we are using store inside class component.
 */
export const createStore = (...stores: Function) => {
    const globalStore = new Store();
    const registretedStores = [];
    stores.forEach((store) => {
        registretedStores.push(globalStore.register(store));
    });
    const useReducer = (actionName: string,
        callback: (store: any, action: ActionResult & any) => any) => {
        globalStore.attachTo(actionName, callback);
    };

    const store = () => globalStore.stores;
    registretedStores.push(store);
    registretedStores.push(useReducer);

    return registretedStores;
};

/**
 * Define type for binding action props. Acctually props are attributes of action
 * First member is id of control.
 * Second is function thatis returning value from html element.
 */
type bindingProp = [
    string,
    (element: HTMLElement) => any
];

/**
 * This means: let my param:operation action become push operation under array
 * which is part of store with name param:arrayName
 * Second attribute is function that transforme action parameters into object.
 * Last param is operation type which can be:
 * - toArray
 * - fromArray
 * - updateArray
 */
const wrapToAsync = (arrayName: string, operation: Action, paramsToObj: Function, attachParamName: string) => {
    const newOperation = (...params: any) => {
        const dispatch = params[params.length - 1];
        const arrayMember = paramsToObj(...params);
        const newDispatch = (actionResult: ActionResult) => {
            actionResult[attachParamName] = { name: arrayName, obj: arrayMember };
            dispatch(actionResult);
        };
        params.splice(params.length - 1, 1);
        params.push(newDispatch);
        operation(...params);
    };
    return newOperation;
};


/**
 * Bind UI elements to action. It can be simple bindings providing just html element id or more complicated
 * when you need to send mehod to transform value in wanted value. For example convert to int.
 * @param {Actio} action action which arguments we want to bind to UI elements
 * @param  {...any} bindings binding configuration.
 * - If parameter is just string then argument is bind to 'value' argument of HTML element where id is
 * provided parameter.
 * - If parameter is array, first param is HTML element id, and second mehod that is triggered when value
 * attribute is changed
 */
export const bindActionProps = (action: Action, ...bindings: bindingProp) => () => {
    const params = [];
    bindings.forEach((binding: bindingProp) => {
        const element: HTMLElement = (Array.isArray(binding))
            ? document.getElementById(binding[0])
            : document.getElementById(binding);
        // eslint-disable-next-line no-nested-ternary
        const value = (Array.isArray(binding))
            ? binding[1](element)
            : element.value ? element.value : element.getAttribute('value');
        params.push(value);
    });
    action(...params);
};

export const forArrPush = (arrayName: string, add: Action, paramsToObj: Function) => {
    const newAdd = (...params: any) => {
        const result = add(...params);
        const arrayMember = paramsToObj(...params);
        result.toArray = { name: arrayName, obj: arrayMember };
        return result;
    };
    return newAdd;
};

export const forArrPushAsync = (arrayName: string, add: Action, paramsToObj: Function) => wrapToAsync(arrayName, add, paramsToObj, 'toArray');

export const forArrRemove = (arrayName: string, remove: Action, paramsToObj: Function) => {
    const newRemove = (...params: any) => {
        const result = remove(...params);
        // execute original action, get json result
        const arrayMember = paramsToObj(...params);
        // attach to original meessage additional attributes.
        result.fromArray = { name: arrayName, obj: arrayMember };
        return result;
    };
    return newRemove;
};

export const forArrRemoveAsync = (arrayName: string, remove: Action, paramsToObj: Function) => wrapToAsync(arrayName, remove, paramsToObj, 'fromArray');

export const forUpdateArray = (arrayName: string, updateObj: Action, paramsToObj: Function) => {
    const newUpdate = (...params: any) => {
        const result = updateObj(...params);
        // execute original action, get json result
        const arrayMember = paramsToObj(...params);
        // attach to original meessage additional attributes.
        result.updateArray = { name: arrayName, obj: arrayMember };
        return result;
    };
    return newUpdate;
};

export const forUpdateArrayAsync = (arrayName: string, updateObj: Action, paramsToObj: Function) => wrapToAsync(arrayName, updateObj, paramsToObj, 'updateArray');

export const forFilterArray = (arrayName: string, filterAction: Action, filterFunction: Function) => {
    const newFilter = (...params: any) => {
        // execute original action, get json result
        const result = filterAction(...params);
        // attach to original meessage additional attributes.
        result._____filter = { name: arrayName, filter: result, filterFunction };
        return result;
    };
    return newFilter;
};

export const forFilterArrayAsync = (arrayName: string, filterAction: Action, filterFunction: Function) => {
    const newOperation = (...params: any) => {
        const dispatch = params[params.length - 1];

        const newDispatch = (actionResult: ActionResult) => {
            actionResult._____filter = { name: arrayName, filter: { ...actionResult }, filterFunction };
            dispatch(actionResult);
        };
        params.splice(params.length - 1, 1);
        params.push(newDispatch);
        filterAction(...params);
    };
    return newOperation;
};

/**
 * This is still in experimental phase, so if you face any troubles,
 * please report bug, and we'll do our best to fix it. 
 */
const Notification = (function () {
    let message; // hold our state in module scope
    let notificatioCallBack;
    return {
        useNotifcation(callBack) {
            notificatioCallBack = callBack;
            return [message];
        },
        sendNotification(msg) {
            message = msg;
            if(notificatioCallBack) {
                notificatioCallBack(message);
            }
        }
    };
}());
const useNotification = Notification.useNotifcation;
const sendNotification = Notification.sendNotification;
export { useNotification, sendNotification };