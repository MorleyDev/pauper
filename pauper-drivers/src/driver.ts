import * as React from "react";

import { AssetLoader } from "@morleydev/pauper-core/assets/asset-loader.service";
import { AudioService } from "@morleydev/pauper-core/audio/audio.service";
import { Keyboard } from "@morleydev/pauper-core/input/Keyboard";
import { Mouse } from "@morleydev/pauper-core/input/Mouse";
import { System } from "@morleydev/pauper-core/input/System";

export type Driver = {
	readonly assets: AssetLoader;
	readonly input: {
		readonly mouse: Mouse;
		readonly keyboard: Keyboard;
		readonly system: System;
	};
	readonly audio: AudioService;
	readonly start: (elem: React.ReactNode) => () => void;
};

