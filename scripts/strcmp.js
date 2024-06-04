setImmediate(function () {
    Java.perform(function () {
        function hook_strcmp(className = '') {
            var addr = Module.findExportByName("libc.so", "strcmp");
            Interceptor.attach(addr, {
                onEnter: function (args) {
                    var arg0 = Memory.readUtf8String(args[0]);
                    var arg1 = Memory.readUtf8String(args[1]);
                    if(className != ''){
                        if (arg0.includes(className) || arg1.includes(className)) {
                            send(`strcmp(${arg0},${arg1})`)
                        }
                    }
                    else{
                        send(`strcmp(${arg0},${arg1})`)
                    }
                    
                },
                onLeave: function (retval) {
                }
            });
        }
        recv(function (className) {
            if (className != '') {
                hook_strcmp(className);
            } else {
                hook_strcmp();
            }
        })

    });
})