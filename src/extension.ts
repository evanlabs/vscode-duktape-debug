
'use strict';

import * as vscode from 'vscode';

export function activate( context:vscode.ExtensionContext )
{
	context.subscriptions.push( 
		vscode.commands.registerCommand( "extension.duk-debug.startSession",
			cfg => {

				let type = cfg.type;
				let name = cfg.name;
				let req  = cfg.req;

				vscode.commands.executeCommand( "vscode.startDebug", cfg );

		})
	);
}

export function deactivate() {
}
