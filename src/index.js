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
    stores: Object;

    attachers: Object;

    filters: Object;

    constructor() {
        this.stores = {};
        this.attachers = {};
        this.filters = {};
    }

    attachTo(actionType: string, callBack: (store: any, action: ActionResult) => any): attatchToActionType {
        if (!this.attachers[actionType]) {
            this.attachers[actionType] = [];
        }
        this.attachers[actionType].push(callBack);
    }

    register(storeFn: () => Object): () => any {
        this.stores[storeFn.name] = storeFn();
        if (!this.stores[storeFn.name]) {
            this.stores[storeFn.name] = {};
        }
        const useStore = (customConfig?: Array, ...actions: Function): any => {
            let setState: (state: any) => void = null;
            let store = this.stores[storeFn.name];
            let state = this.stores[storeFn.name];
            let component = null;
            let cmpSetState = null;
            let classState = null;
            if (Array.isArray(customConfig)) {
                component = customConfig[0];
                cmpSetState = customConfig[0].setState;
                classState = customConfig[0].state;
            }
            if (!Array.isArray(customConfig)) {
                actions = [customConfig, ...actions];
                const [stateConst, setReactState] = useState(this.stores[storeFn.name]);
                state = stateConst;
                setState = setReactState;
            } else {
                setState = (newState) => {
                    classState[storeFn.name] = newState;
                    cmpSetState.call(component, classState);
                };
            }

            const dispatch = (actionResult: ActionResult) => {
                console.log('*** dispatching action result', actionResult);
                store = Object.assign(store);
                const setFilteredArray = (name: string, arr: Array) => {
                    if(!store[`${name}WithFilter`]) {
                        store[`${name}WithFilter`] = [ ...arr];
                    }
                    store[`${name}WithFilter`] = [...arr];
                }
                const checkFilter = (arrayName: string) => {
                    if(this.filters[`${storeFn.name}.${arrayName}`]) {
                        const filter = this.filters[`${storeFn.name}.${arrayName}`];
                        const result = filter.filterFunction(store[arrayName], filter.param);
                        setFilteredArray(arrayName, result);
                    }
                }
                const resetFilter = (arrayName: string) => {
                    this.filters[`${storeFn.name}.${arrayName}`] = null;
                    store[`${arrayName}WithFilter`] = null
                }
                if (isObject(actionResult)) {
                    if (this.attachers[actionResult.type]) {
                        this.attachers[actionResult.type].forEach(callback => {
                            store = callback(store, actionResult, this.stores);
                        });
                    } else if (actionResult.toArray) {
                        actionResult.toArray.obj._key = getUUID();
                        store[actionResult.toArray.name].push(actionResult.toArray.obj);
                        checkFilter(actionResult.toArray.name);
                    } else if (actionResult.fromArray) {
                        const toRemove = actionResult.fromArray.obj;
                        let arr = store[actionResult.fromArray.name];
                        for (let i = 0; i < arr.length; i++) {
                            if (toRemove._key === arr[i]._key) {
                                arr.splice(i, 1);
                                break;
                            }
                        }
                        store[actionResult.fromArray.name] = arr;
                        checkFilter(actionResult.fromArray.name);
                    } else if (actionResult.updateArray) {
                        const toUpdate = actionResult.updateArray.obj;
                        let arr = store[actionResult.updateArray.name];
                        for (let i = 0; i < arr.length; i++) {
                            if (toUpdate._key === arr[i]._key) {
                                arr[i] = toUpdate;
                                break;
                            }
                        }
                        checkFilter(actionResult.updateArray.name);

                    } else if (actionResult._____filter) {

                        // if there is a property filter
                        // it means this action should filter exisiting store property
                        // in this case, of course this property is an array, 
                        // and property name is action.filter.name added in forFilterArray utility function.
                        // here we'll refer only as arr to such store property
                        const originalArray = store[actionResult._____filter.name];
                        // on of the filter properies, such as name, is also filterFunction
                        // we need to execute filterFunction to get result and tu put this results somewhere.
                        const result = actionResult._____filter.filterFunction(originalArray, actionResult);
                        setFilteredArray(actionResult._____filter.name, result);
                        this.filters[`${storeFn.name}.${actionResult._____filter.name}`] = {
                            param: { ...actionResult },
                            filterFunction:actionResult._____filter.filterFunction
                        };
                    } else if (actionResult.type === '!cancelFilter') {
                        resetFilter(actionResult.collectionName);
                    } else {
                        store = { ...store, ...actionResult };
                    }
                    this.stores[storeFn.name] = { ...store };
                    setState(this.stores[storeFn.name]);
                    Object.keys(actionResult).forEach(key => {
                        delete actionResult[key];
                    });
                    delete [actionResult];
                    actionResult = null;
                }
            };
            const useAction = (action: AtionType): any => (...params: any) => {
                params.push(dispatch);
                return dispatch(action(...params));
            };
            const wrappedActions = actions ? actions.map(action => useAction(action)) : [];
            return Array.isArray(customConfig) ? [...wrappedActions] : [state, ...wrappedActions];
        };
        return useStore;
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

type bindingProp = [
    string,
    (element: HTMLElement) => any
];

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
        let result = add(...params);
        const arrayMember = paramsToObj(...params);
        result.toArray = { name: arrayName, obj: arrayMember};
        return result;
    }
    return newAdd;
};

const wrapToAsync = (arrayName: string, operation: Action, paramsToObj: Function, attachParamName: string) => {
    const newOperation = (...params: any) => {
        let dispatch = params[params.length-1];
        console.log('*** old dispatch', dispatch);
        const arrayMember = paramsToObj(...params);
        const newDispatch = (actionResult: ActionResult) => {    
            console.log('*** call new dispatch');
            actionResult[attachParamName] = { name: arrayName, obj: arrayMember };
            console.log('*** result to dispatch', actionResult );
            dispatch(actionResult);
        }
        params.splice(params.length-1, 1);
        params.push(newDispatch);
        console.log('*** filnal params', params);
        operation(...params);
    }
    return newOperation;
}

export const forArrPushAsync = (arrayName: string, add: Action, paramsToObj: Function) => {
    return wrapToAsync(arrayName, add, paramsToObj, 'toArray');
    // const newAdd = (...params: any) => {
    //     let dispatch = params[params.length-1];
    //     console.log('*** old dispatch', dispatch);
    //     const arrayMember = paramsToObj(...params);
    //     const newDispatch = (actionResult: ActionResult) => {    
    //         console.log('*** call new dispatch');
    //         actionResult.toArray = { name: arrayName, obj: arrayMember };
    //         console.log('*** result to dispatch', actionResult );
    //         dispatch(actionResult);
    //     }
    //     params.splice(params.length-1, 1);
    //     params.push(newDispatch);
    //     console.log('*** filnal params', params);
    //     add(...params);
    // }
    // return newAdd;
}

export const forArrRemove = (arrayName: string, remove: Action, paramsToObj: Function) => {
    const newRemove = (...params: any) => {
        let result = remove(...params);
        // execute original action, get json result
        const arrayMember = paramsToObj(...params);
        // attach to original meessage additional attributes.
        result.fromArray = { name: arrayName, obj: arrayMember};
        return result;
    }
    return newRemove;
};

export const forArrRemoveAsync = (arrayName: string, remove: Action, paramsToObj: Function) => {
    return wrapToAsync(arrayName, remove, paramsToObj, 'fromArray');
};

export const forUpdateArray = (arrayName: string, updateObj: Action, paramsToObj: Function) => {
    const newUpdate = (...params: any) => {
        let result = updateObj(...params);
        // execute original action, get json result
        const arrayMember = paramsToObj(...params);
        // attach to original meessage additional attributes.
        result.updateArray = { name: arrayName, obj: arrayMember};
        return result;
    }
    return newUpdate;
}

export const forUpdateArrayAsync = (arrayName: string, updateObj: Action, paramsToObj: Function) => {
    return wrapToAsync(arrayName, updateObj, paramsToObj, 'updateArray');
}

export const forFilterArray = (arrayName: string, filterAction: Action, filterFunction: Function) => {
    const newFilter = (...params: any) => {
        // execute original action, get json result
        let result = filterAction(...params);
        // attach to original meessage additional attributes.
        result._____filter = { name: arrayName, filter: result, filterFunction: filterFunction};
        return result;
    }
    return newFilter;
}

export const forFilterArrayAsync = (arrayName: string, filterAction: Action, filterFunction: Function) => {
    const newOperation = (...params: any) => {
        let dispatch = params[params.length-1];
        console.log('*** old dispatch', dispatch);
        
        const newDispatch = (actionResult: ActionResult) => {    
            console.log('*** filter call new dispatch', actionResult);
            actionResult._____filter = { name: arrayName, filter: {...actionResult}, filterFunction: filterFunction};
            console.log('*** result to dispatch', actionResult );
            dispatch(actionResult);
        }
        params.splice(params.length-1, 1);
        params.push(newDispatch);
        console.log('*** filnal params', params);
        filterAction(...params);
    }
    return newOperation;
}