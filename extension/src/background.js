import * as rpcserver from "./rpc_server.js";

const srv = new rpcserver.RPCServer(browser);

srv.start();
