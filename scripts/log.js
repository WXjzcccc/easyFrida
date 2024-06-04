Java.perform(function () {
    function getCharNum(str, char) {
        var cnt = 0
        for (var i = 0; i < str.length; i++) {
            if (str[i] == char) {
                cnt += 1
            }
        }
        return cnt
    }
    var className = "android.util.Log";
    var Log = Java.use(className);
    Log.d.overload('java.lang.String', 'java.lang.String').implementation = function (tag, msg) {
        send({
            'TAG': tag,
            'args': msg
        })
        return this.d(tag + '_hook', msg);
    };
    Log.e.overload('java.lang.String', 'java.lang.String').implementation = function (tag, msg) {
        send({
            'TAG': tag,
            'args': msg
        })
        return this.e(tag + '_hook', msg);
    };
    var addr = Module.findExportByName("liblog.so", "__android_log_print");
    Interceptor.attach(addr, {
        onEnter: function (args) {
            var tag = Memory.readUtf8String(args[1]);
            var format = Memory.readUtf8String(args[2]);
            let num = getCharNum(format, '%')
            var _args = []
            for (var i = 0; i < num; i++) {
                _args.push(Memory.readUtf8String(args[i + 3]))
            }
            send({
                'TAG': tag,
                'format': format,
                'args': _args
            })
        },
        onLeave: function (retval) {
        }
    });
})