(() => {
    function soFile() {
        Interceptor.attach(Module.findExportByName('libc.so', 'open'), {
            onEnter: function (args) {
                var path = Memory.readUtf8String(args[0]);
                var message = {};
                message["jsname"] = "file.js";
                var ret = {
                    'type': 'module open',
                    '模块': Process.findModuleByAddress(this.returnAddress).name,
                    '路径': path
                }
                message["data"] = ret;
                send(message)
            }
        });
    }
    soFile();
})();
