
import {
    DebugSession, Thread, Source, StackFrame, Scope, Variable, Breakpoint,
    TerminatedEvent, InitializedEvent, StoppedEvent, ContinuedEvent, OutputEvent,
    Handles, ErrorDestination
} from 'vscode-debugadapter';

import { DebugProtocol } from 'vscode-debugprotocol';
import { DukDebugSession as DukDebug1_5_0 } from "./v1_5_0/DukDebugger";

// Intermediate debug session that creates the actual debug session
// depending on the requested version
class ProxyDebugSession extends DebugSession
{
    _impl:DebugSession; // Actual DebugSession

    constructor()
    {
        super();
    }

    protected initializeRequest( response:DebugProtocol.InitializeResponse, 
                                 args:DebugProtocol.InitializeRequestArguments ):void
    {
        let adapter = args.adapterID.toLowerCase().trim().split( "@" );
        if( adapter.length > 2 )
            throw new Error( `Invalid debug adapted id '${args.adapterID}'` );
        
        let version = (adapter[1]|| "1.5.0").trim().toLowerCase();
        

        let props = [];
        for( var n in this )
        {
            //if( this.hasOwnProperty(n) )
                props.push( n );
        }

        if( version === "1.5.0" )
        {
            let session:any = new DukDebug1_5_0();
            
            let sprops = [];
            for( var n in this )
            {
                if( this.hasOwnProperty(n) )
                    sprops.push( n );
            }

            console.log( sprops );
        }
        else
        {
            this.sendErrorResponse( response, 0, 
                `Unsupported duktape debugger protocol version '${version}'` );

            this.sendEvent( new TerminatedEvent( false ) );
        }
    }

    // Proxy Interface
    //shutdown(): void
    /*
    protected sendErrorResponse(response: DebugProtocol.Response, codeOrMessage: number | DebugProtocol.Message,
                                 format?: string, variables?: any, dest?: ErrorDestination): void
    {
        super.sendErrorResponse( response, codeOrMessage, format, variables, dest );
    }

    runInTerminalRequest(args: DebugProtocol.RunInTerminalRequestArguments, timeout: number, cb: (response: DebugProtocol.RunInTerminalResponse) => void): void
    {

    }

    protected dispatchRequest(request: DebugProtocol.Request): void
    {

    }
    
    protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments): void
    {

    }
    
    protected launchRequest(response: DebugProtocol.LaunchResponse, args: DebugProtocol.LaunchRequestArguments): void
    {

    }
    
    protected attachRequest(response: DebugProtocol.AttachResponse, args: DebugProtocol.AttachRequestArguments): void
    {

    }
    
    protected restartRequest(response: DebugProtocol.RestartResponse, args: DebugProtocol.RestartArguments): void
    {

    }
    
    protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): void
    {

    }
    
    protected setFunctionBreakPointsRequest(response: DebugProtocol.SetFunctionBreakpointsResponse, args: DebugProtocol.SetFunctionBreakpointsArguments): void
    {

    }
    
    protected setExceptionBreakPointsRequest(response: DebugProtocol.SetExceptionBreakpointsResponse, args: DebugProtocol.SetExceptionBreakpointsArguments): void
    {

    }
    
    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void
    {

    }
    
    protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): void
    {

    }
    
    protected nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): void
    {

    }
    
    protected stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments): void
    {

    }
    
    protected stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments): void
    {

    }
    
    protected stepBackRequest(response: DebugProtocol.StepBackResponse, args: DebugProtocol.StepBackArguments): void
    {

    }
    
    protected reverseContinueRequest(response: DebugProtocol.ReverseContinueResponse, args: DebugProtocol.ReverseContinueArguments): void
    {

    }
    
    protected restartFrameRequest(response: DebugProtocol.RestartFrameResponse, args: DebugProtocol.RestartFrameArguments): void
    {

    }
    
    protected gotoRequest(response: DebugProtocol.GotoResponse, args: DebugProtocol.GotoArguments): void
    {

    }
    
    protected pauseRequest(response: DebugProtocol.PauseResponse, args: DebugProtocol.PauseArguments): void
    {

    }
    
    protected sourceRequest(response: DebugProtocol.SourceResponse, args: DebugProtocol.SourceArguments): void
    {

    }
    
    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void
    {

    }
    
    protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): void
    {

    }
    
    protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void
    {

    }
    
    protected variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments): void
    {

    }
    
    protected setVariableRequest(response: DebugProtocol.SetVariableResponse, args: DebugProtocol.SetVariableArguments): void
    {

    }
    
    protected evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments): void
    {

    }
    
    protected stepInTargetsRequest(response: DebugProtocol.StepInTargetsResponse, args: DebugProtocol.StepInTargetsArguments): void
    {

    }
    
    protected gotoTargetsRequest(response: DebugProtocol.GotoTargetsResponse, args: DebugProtocol.GotoTargetsArguments): void
    {

    }
    
    protected completionsRequest(response: DebugProtocol.CompletionsResponse, args: DebugProtocol.CompletionsArguments): void
    {

    }

    protected customRequest(command: string, response: DebugProtocol.Response, args: any): void
    {

    }
    
    protected convertClientLineToDebugger(line: number): number
    {
        return super.convertClientLineToDebugger( line );
    }
    
    protected convertDebuggerLineToClient(line: number): number
    {
         return super.convertDebuggerLineToClient( line );
    }
    
    protected convertClientColumnToDebugger(column: number): number
    {
        return super.convertClientColumnToDebugger( column );
    }
    
    protected convertDebuggerColumnToClient(column: number): number
    {
        return super.convertDebuggerColumnToClient( column );
    }
    
    protected convertClientPathToDebugger(clientPath: string): string
    {
        return super.convertClientPathToDebugger( clientPath );
    }
    
    protected convertDebuggerPathToClient(debuggerPath: string): string
    {
        return super.convertDebuggerPathToClient( debuggerPath );
    }
    */
}

DebugSession.run( ProxyDebugSession );
