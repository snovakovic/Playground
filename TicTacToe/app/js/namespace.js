/**ttt namespace - window object is only polluted with _ttt and ttt variables
* ttt is defined as _ttt.client (shorthand property) in client module, 
* its the only module which should communicate with the client app directly 
*/
var _ttt = {
    ttt: {}, 
    logic: {}, 
    canvas: {}, 
    socket: {},
    resources: {},
    view: {},
};