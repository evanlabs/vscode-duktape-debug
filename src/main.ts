
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
    private createInstance():void
    {

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

        // Forward event debugger implementation to local
        (<any>this._impl).initializeRequest( response, args );
    }


    // Proxy Interface
    protected sendErrorResponse( response: DebugProtocol.Response, 
                                 codeOrMessage: number | DebugProtocol.Message,
                                 format?: string, variables?: any,
                                 dest?: ErrorDestination):void
    {
        (<any>this._impl).sendErrorResponse( response, codeOrMessage, format, variables, dest );
    }

    runInTerminalRequest( args:DebugProtocol.RunInTerminalRequestArguments, 
                          timeout:number, 
                          cb:(response:DebugProtocol.RunInTerminalResponse) => void):void
    {
        super.runInTerminalRequest( args, timeout, cb );
    }

    protected dispatchRequest( request:DebugProtocol.Request ):void
    {
        super.dispatchRequest( request );
    }
    
    protected disconnectRequest( response:DebugProtocol.DisconnectResponse,
                                 args:DebugProtocol.DisconnectArguments):void
    {
        super.disconnectRequest( response, args );
    }
    
    protected launchRequest( response:DebugProtocol.LaunchResponse,
                             args:DebugProtocol.LaunchRequestArguments ):void
    {
        super.launchRequest( response, args );
    }
    
    protected attachRequest( response:DebugProtocol.AttachResponse, 
                             args:DebugProtocol.AttachRequestArguments ):void
    {
        super.attachRequest( response, args );
    }
    
    protected restartRequest( response:DebugProtocol.RestartResponse,
                              args:DebugProtocol.RestartArguments ):void
    {
        super.restartRequest( response, args );
    }
    
    protected setBreakPointsRequest( response:DebugProtocol.SetBreakpointsResponse,
                                     args:DebugProtocol.SetBreakpointsArguments ):void
    {
        super.setBreakPointsRequest( response, args );
    }
    
    protected setFunctionBreakPointsRequest( response:DebugProtocol.SetFunctionBreakpointsResponse,
                                             args:DebugProtocol.SetFunctionBreakpointsArguments ):void
    {
        super.setFunctionBreakPointsRequest( response, args );
    }
    
    protected setExceptionBreakPointsRequest( response:DebugProtocol.SetExceptionBreakpointsResponse, 
                                              args:DebugProtocol.SetExceptionBreakpointsArguments ):void
    {
        super.setExceptionBreakPointsRequest( response, args );
    }
    
    protected configurationDoneRequest( response:DebugProtocol.ConfigurationDoneResponse, 
                                        args:DebugProtocol.ConfigurationDoneArguments ):void
    {
        super.configurationDoneRequest( response, args );
    }
    
    protected continueRequest( response:DebugProtocol.ContinueResponse, 
                               args:DebugProtocol.ContinueArguments ):void
    {
        super.continueRequest( response, args );
    }
    
    protected nextRequest( response:DebugProtocol.NextResponse,
                           args:DebugProtocol.NextArguments ):void
    {
        super.nextRequest( response, args );
    }
    
    protected stepInRequest( response:DebugProtocol.StepInResponse,
                             args:DebugProtocol.StepInArguments ):void
    {
        super.stepInRequest( response, args );
    }
    
    protected stepOutRequest( response:DebugProtocol.StepOutResponse,
                              args:DebugProtocol.StepOutArguments ):void
    {
        super.stepOutRequest( response, args );
    }
    
    protected stepBackRequest( response:DebugProtocol.StepBackResponse, 
                               args:DebugProtocol.StepBackArguments ):void
    {
        super.stepBackRequest( response, args );
    }
    
    protected reverseContinueRequest( response:DebugProtocol.ReverseContinueResponse,
                                      args:DebugProtocol.ReverseContinueArguments ):void
    {
        super.reverseContinueRequest( response, args );
    }
    
    protected restartFrameRequest( response:DebugProtocol.RestartFrameResponse, 
                                   args:DebugProtocol.RestartFrameArguments ):void
    {
        super.restartFrameRequest( response, args );
    }
    
    protected gotoRequest( response:DebugProtocol.GotoResponse,
                           args:DebugProtocol.GotoArguments ):void
    {
        super.gotoRequest( response, args );
    }
    
    protected pauseRequest( response:DebugProtocol.PauseResponse,
                            args:DebugProtocol.PauseArguments ):void
    {
        super.pauseRequest( response, args );
    }
    
    protected sourceRequest( response:DebugProtocol.SourceResponse,
                             args:DebugProtocol.SourceArguments ):void
    {
        super.sourceRequest( response, args );
    }
    
    protected threadsRequest( response:DebugProtocol.ThreadsResponse ):void
    {
        super.threadsRequest( response );
    }
    
    protected stackTraceRequest( response:DebugProtocol.StackTraceResponse, 
                                 args:DebugProtocol.StackTraceArguments ):void
    {
        super.stackTraceRequest( response, args );
    }
    
    protected scopesRequest( response:DebugProtocol.ScopesResponse, 
                             args:DebugProtocol.ScopesArguments ):void
    {
        super.scopesRequest( response, args );
    }
    
    protected variablesRequest( response:DebugProtocol.VariablesResponse, 
                                args:DebugProtocol.VariablesArguments ):void
    {
        super.variablesRequest( response, args );
    }
    
    protected setVariableRequest( response:DebugProtocol.SetVariableResponse,
                                  args:DebugProtocol.SetVariableArguments ):void
    {
        super.setVariableRequest( response, args );
    }
    
    protected evaluateRequest( response:DebugProtocol.EvaluateResponse,
                               args:DebugProtocol.EvaluateArguments ):void
    {
        super.evaluateRequest( response, args );
    }
    
    protected stepInTargetsRequest( response:DebugProtocol.StepInTargetsResponse, 
                                    args:DebugProtocol.StepInTargetsArguments): void
    {
        super.stepInTargetsRequest( response, args );
    }
    
    protected gotoTargetsRequest( response:DebugProtocol.GotoTargetsResponse, 
                                  args:DebugProtocol.GotoTargetsArguments ):void
    {
        super.gotoTargetsRequest( response, args );
    }
    
    protected completionsRequest( response:DebugProtocol.CompletionsResponse, 
                                  args:DebugProtocol.CompletionsArguments ):void
    {
        super.completionsRequest( response, args );
    }

    protected customRequest( command:string, response:DebugProtocol.Response, args:any ):void
    {
        super.customRequest( command, response, args );
    }
    
    protected convertClientLineToDebugger( line:number ):number
    {
        return super.convertClientLineToDebugger( line );
    }
    
    protected convertDebuggerLineToClient( line:number ):number
    {
         return super.convertDebuggerLineToClient( line );
    }
    
    protected convertClientColumnToDebugger( column:number ):number
    {
        return super.convertClientColumnToDebugger( column );
    }
    
    protected convertDebuggerColumnToClient( column:number ):number
    {
        return super.convertDebuggerColumnToClient( column );
    }
    
    protected convertClientPathToDebugger( clientPath:string ):string
    {
        return super.convertClientPathToDebugger( clientPath );
    }
    
    protected convertDebuggerPathToClient( debuggerPath:string ):string
    {
        return super.convertDebuggerPathToClient( debuggerPath );
    }
}

DebugSession.run( ProxyDebugSession );
