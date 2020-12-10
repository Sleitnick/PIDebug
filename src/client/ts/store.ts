import { createStore } from "redux";

const initialState = {
	kp: 0,
	ki: 0,
	kd: 0,
	min: -5,
	max: 5,
	time: 3,
	dirty: 0,
}

interface ChangeNumberAction {
	type: string
	field: string
	value: number
}

type StateActionTypes = ChangeNumberAction;

export type State = {[key: string]: number};

function reducer(state: State = initialState, action: StateActionTypes) {
	switch (action.type) {
		case "num":
			return {
				...state,
				[action.field]: action.value
			};
		case "dirty":
			return {
				...state,
				dirty: action.value
			};
		default:
			return state;
	}
}

export default createStore(reducer);
