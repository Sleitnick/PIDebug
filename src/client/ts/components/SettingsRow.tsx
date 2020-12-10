import * as React from "react";

type SettingsRowProps = {
	children?: React.ReactNode;
}

export default function SettingsRow(props: SettingsRowProps): JSX.Element {
	return (
		<form className="form-inline">
			{props.children}
		</form>
	);
}
