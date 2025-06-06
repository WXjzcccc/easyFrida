(() => {
    function klog(msg){
        var message = {}
        message['jsname'] = 'strcmp.js'
        message['data'] = msg
        send(message)
    }
    function hook_strcmp(className = '') {
        var addr = Module.findExportByName("libc.so", "strcmp");
        Interceptor.attach(addr, {
            onEnter: function (args) {
                var arg0 = Memory.readUtf8String(args[0]);
                var arg1 = Memory.readUtf8String(args[1]);
                if (className != '') {
                    if (arg0.includes(className) || arg1.includes(className)) {
                        klog(`strcmp(${arg0},${arg1})`)
                    }
                } else {
                    klog(`strcmp(${arg0},${arg1})`)
                }

            },
            onLeave: function (retval) {
            }
        });
    }

    function hookStrCmp() {
        recv(function (args) {
            var className = args[0];
            if (className != '') {
                hook_strcmp(className);
            } else {
                hook_strcmp();
            }
        })
    }
    hookStrCmp();
})();