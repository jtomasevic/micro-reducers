// @flow
import { useState } from 'react';

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

    constructor() {
        this.stores = {};
        this.attachers = {};
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
                    // console.log('>>> classState', classState);
                    // console.log('>>> old value', store);
                    // console.log('>>> new state', newState);
                    classState[storeFn.name] = newState;
                    cmpSetState.call(component, classState);
                    // console.log('>>> set state called', classState, storeFn.name);
                };
            }

            const dispatch = (actionResult: ActionResult) => {
                store = Object.assign(store);
                if (isObject(actionResult)) {
                    if (this.attachers[actionResult.type]) {
                        this.attachers[actionResult.type].forEach(callback => {
                            store = callback(store, actionResult, this.stores);
                        });
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
 * @param  {...any} stores functions that returns objects. Each of then describing signle store instance.
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
