import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";

type SettingInputProps = {
	name: string;
	title: string;
}

export default function SettingInput(props: SettingInputProps): JSX.Element {
	const value = useSelector((state: State) => state[props.name]);
	const dispatch = useDispatch();
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		dispatch({type: "num", field: props.name, value: event.target.value});
		dispatch({type: "dirty", value: 1});
	};
	return (
		<div className="input-group mb-2 mr-sm-2">
			<div className="input-group-prepend">
				<div className="input-group-text monospace-group-prepend">{props.title}</div>
			</div>
			<input type="number" className="form-control" id={props.name} value={value} onChange={onChange}/>
		</div>
	);
}
