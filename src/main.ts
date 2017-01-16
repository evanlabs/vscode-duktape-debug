
import {
    DebugSession, Thread, Source, StackFrame, Scope, Variable, Breakpoint,
    TerminatedEvent, InitializedEvent, StoppedEvent, ContinuedEvent, OutputEvent,
    Handles, ErrorDestination
} from 'vscode-debugadapter';

import { DebugProtocol } from 'vscode-debugprotocol';
import { DukDebugSession as DukDebug1_5_0 } from "./v1_5_0/DukDebugger";

const DEFAULT_VERSION = "2.0.0";

// Intermediate debug session that creates the actual debug session
// depending on the requested version
class ProxyDebugSession extends DebugSession
{
    _impl:DebugSession; // Actual DebugSession

    //-----------------------------------------------------------
    constructor()
    {
        super();
    }

    //-----------------------------------------------------------
    // The 'initialize' request is the first request called by the frontend
    // to interrogate the debug adapter about the features it provides.
    //-----------------------------------------------------------
    protected initializeRequest( response:DebugProtocol.InitializeResponse, 
                                 args:DebugProtocol.InitializeRequestArguments ):void
    {
        // We can't get the 
        let adapter = args.adapterID.toLowerCase().trim().split( "@" );
        if( adapter.length > 2 )
            throw new Error( `Invalid debug adapted id '${args.adapterID}'` );
        
        let version = (adapter[1]|| DEFAULT_VERSION ).trim().toLowerCase();
        
        if( version === "2.0.0" )
        {
            throw new Error( "Unimplemented" );
        }
        else if( version === "1.5.0" )
        {
            this._impl = new DukDebug1_5_0();;
        }
        else
        {
            this.sendErrorResponse( response, 0, 
                `Unsupported duktape debugger protocol version '${version}'` );

            this.sendEvent( new TerminatedEvent( false ) );
        }

        (<any>this._impl).sendResponse = ( response:DebugProtocol.Response ) => {
            this.sendResponse( response );
        };
        (<any>this._impl).sendEvent = ( event:DebugProtocol.Event) => {
            this.sendEvent( event );
        };

        // Forward event debugger implementation to local
        (<any>this._impl).initializeRequest( response, args );
    }


    // Proxy Interface
    protected sendErrorResponse( response: DebugProtocol.Response, 
                                 codeOrMessage: number | DebugProtocol.Message,
                                 format?: string, variables?: any,
                                 dest?: ErrorDestination):void
    {
        this._impl ? (<any>this._impl).sendErrorResponse( response, codeOrMessage, format, variables, dest ) :
                        super.sendErrorResponse( response, codeOrMessage, format, variables, dest );
    }

    runInTerminalRequest( args:DebugProtocol.RunInTerminalRequestArguments, 
                          timeout:number, 
                          cb:(response:DebugProtocol.RunInTerminalResponse) => void):void
    {
        this._impl ? (<any>this._impl).runInTerminalRequest( args, timeout, cb ) :
                        super.runInTerminalRequest( args, timeout, cb );
    }

    /*
    protected dispatchRequest( request:DebugProtocol.Request ):void
    {
        (<any>this._impl).dispatchRequest( request );
    }
    */
    
    protected disconnectRequest( response:DebugProtocol.DisconnectResponse,
                                 args:DebugProtocol.DisconnectArguments):void
    {
         this._impl ? (<any>this._impl).disconnectRequest( response, args ) :
                        super.disconnectRequest( response, args );
    }
    
    protected launchRequest( response:DebugProtocol.LaunchResponse,
                             args:DebugProtocol.LaunchRequestArguments ):void
    {
        (<any>this._impl).launchRequest( response, args );
    }
    
    protected attachRequest( response:DebugProtocol.AttachResponse, 
                             args:DebugProtocol.AttachRequestArguments ):void
    {
        (<any>this._impl).attachRequest( response, args );
    }
    
    protected restartRequest( response:DebugProtocol.RestartResponse,
                              args:DebugProtocol.RestartArguments ):void
    {
        (<any>this._impl).restartRequest( response, args );
    }
    
    protected setBreakPointsRequest( response:DebugProtocol.SetBreakpointsResponse,
                                     args:DebugProtocol.SetBreakpointsArguments ):void
    {
        (<any>this._impl).setBreakPointsRequest( response, args );
    }
    
    protected setFunctionBreakPointsRequest( response:DebugProtocol.SetFunctionBreakpointsResponse,
                                             args:DebugProtocol.SetFunctionBreakpointsArguments ):void
    {
        (<any>this._impl).setFunctionBreakPointsRequest( response, args );
    }
    
    protected setExceptionBreakPointsRequest( response:DebugProtocol.SetExceptionBreakpointsResponse, 
                                              args:DebugProtocol.SetExceptionBreakpointsArguments ):void
    {
        (<any>this._impl).setExceptionBreakPointsRequest( response, args );
    }
    
    protected configurationDoneRequest( response:DebugProtocol.ConfigurationDoneResponse, 
                                        args:DebugProtocol.ConfigurationDoneArguments ):void
    {
        (<any>this._impl).configurationDoneRequest( response, args );
    }
    
    protected continueRequest( response:DebugProtocol.ContinueResponse, 
                               args:DebugProtocol.ContinueArguments ):void
    {
        (<any>this._impl).continueRequest( response, args );
    }
    
    protected nextRequest( response:DebugProtocol.NextResponse,
                           args:DebugProtocol.NextArguments ):void
    {
        (<any>this._impl).nextRequest( response, args );
    }
    
    protected stepInRequest( response:DebugProtocol.StepInResponse,
                             args:DebugProtocol.StepInArguments ):void
    {
        (<any>this._impl).stepInRequest( response, args );
    }
    
    protected stepOutRequest( response:DebugProtocol.StepOutResponse,
                              args:DebugProtocol.StepOutArguments ):void
    {
        (<any>this._impl).stepOutRequest( response, args );
    }
    
    protected stepBackRequest( response:DebugProtocol.StepBackResponse, 
                               args:DebugProtocol.StepBackArguments ):void
    {
        (<any>this._impl).stepBackRequest( response, args );
    }
    
    protected reverseContinueRequest( response:DebugProtocol.ReverseContinueResponse,
                                      args:DebugProtocol.ReverseContinueArguments ):void
    {
        (<any>this._impl).reverseContinueRequest( response, args );
    }
    
    protected restartFrameRequest( response:DebugProtocol.RestartFrameResponse, 
                                   args:DebugProtocol.RestartFrameArguments ):void
    {
        (<any>this._impl).restartFrameRequest( response, args );
    }
    
    protected gotoRequest( response:DebugProtocol.GotoResponse,
                           args:DebugProtocol.GotoArguments ):void
    {
        (<any>this._impl).gotoRequest( response, args );
    }
    
    protected pauseRequest( response:DebugProtocol.PauseResponse,
                            args:DebugProtocol.PauseArguments ):void
    {
        (<any>this._impl).pauseRequest( response, args );
    }
    
    protected sourceRequest( response:DebugProtocol.SourceResponse,
                             args:DebugProtocol.SourceArguments ):void
    {
        (<any>this._impl).sourceRequest( response, args );
    }
    
    protected threadsRequest( response:DebugProtocol.ThreadsResponse ):void
    {
        (<any>this._impl).threadsRequest( response );
    }
    
    protected stackTraceRequest( response:DebugProtocol.StackTraceResponse, 
                                 args:DebugProtocol.StackTraceArguments ):void
    {
        (<any>this._impl).stackTraceRequest( response, args );
    }
    
    protected scopesRequest( response:DebugProtocol.ScopesResponse, 
                             args:DebugProtocol.ScopesArguments ):void
    {
        (<any>this._impl).scopesRequest( response, args );
    }
    
    protected variablesRequest( response:DebugProtocol.VariablesResponse, 
                                args:DebugProtocol.VariablesArguments ):void
    {
        (<any>this._impl).variablesRequest( response, args );
    }
    
    protected setVariableRequest( response:DebugProtocol.SetVariableResponse,
                                  args:DebugProtocol.SetVariableArguments ):void
    {
        (<any>this._impl).setVariableRequest( response, args );
    }
    
    protected evaluateRequest( response:DebugProtocol.EvaluateResponse,
                               args:DebugProtocol.EvaluateArguments ):void
    {
        (<any>this._impl).evaluateRequest( response, args );
    }
    
    protected stepInTargetsRequest( response:DebugProtocol.StepInTargetsResponse, 
                                    args:DebugProtocol.StepInTargetsArguments): void
    {
        (<any>this._impl).stepInTargetsRequest( response, args );
    }
    
    protected gotoTargetsRequest( response:DebugProtocol.GotoTargetsResponse, 
                                  args:DebugProtocol.GotoTargetsArguments ):void
    {
        (<any>this._impl).gotoTargetsRequest( response, args );
    }
    
    protected completionsRequest( response:DebugProtocol.CompletionsResponse, 
                                  args:DebugProtocol.CompletionsArguments ):void
    {
        (<any>this._impl).completionsRequest( response, args );
    }

    protected customRequest( command:string, response:DebugProtocol.Response, args:any ):void
    {
        (<any>this._impl).customRequest( command, response, args );
    }
    
    protected convertClientLineToDebugger( line:number ):number
    {
        return this._impl ? (<any>this._impl).convertClientLineToDebugger( line ) :
                            super.convertClientLineToDebugger( line );
    }
    
    protected convertDebuggerLineToClient( line:number ):number
    {
         return this._impl ? (<any>this._impl).convertDebuggerLineToClient( line ) :
                             super.convertDebuggerLineToClient( line );
    }
    
    protected convertClientColumnToDebugger( column:number ):number
    {
        return this._impl ? (<any>this._impl).convertClientColumnToDebugger( column ) :
                            super.convertClientColumnToDebugger( column );
    }
    
    protected convertDebuggerColumnToClient( column:number ):number
    {
        return this._impl ? (<any>this._impl).convertDebuggerColumnToClient( column ) : 
                            super.convertDebuggerColumnToClient( column );
    }
    
    protected convertClientPathToDebugger( clientPath:string ):string
    {
        return this._impl ? (<any>this._impl).convertClientPathToDebugger( clientPath ) :
                            super.convertClientPathToDebugger( clientPath );
    }
    
    protected convertDebuggerPathToClient( debuggerPath:string ):string
    {
        return this._impl ? (<any>this._impl).convertDebuggerPathToClient( debuggerPath ) :
                            super.convertDebuggerPathToClient( debuggerPath );
    }
}

DebugSession.run( ProxyDebugSession );
