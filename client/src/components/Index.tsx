import * as React from "react";

import SettingsRow from "./SettingsRow";
import SettingInput from "./SettingInput";

export default function Index(): JSX.Element {
	return (
		<div className="container">
			<h1>PIDebug</h1>
			<SettingsRow>
				<SettingInput name="kp" title="kP"/>
				<SettingInput name="ki" title="kI"/>
				<SettingInput name="kd" title="kD"/>
			</SettingsRow>
			<SettingsRow>
				<SettingInput name="min" title="Min"/>
				<SettingInput name="max" title="Max"/>
				<SettingInput name="time" title="Time"/>
			</SettingsRow>
			<canvas id="graph"></canvas>
		</div>
	);
}
