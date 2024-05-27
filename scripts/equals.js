setImmediate(function () {
    Java.perform(function () {
        function getStacks() {
            var Thread = Java.use("java.lang.Thread");
            var currentThread = Thread.currentThread();
            var stackTrace = currentThread.getStackTrace();
            return stackTrace.slice(2);
        }

        function showStacks() {
            var stackTrace = getStacks();
            console.log("Stack Trace:");
            for (var i = 0; i < stackTrace.length; i++) {
                console.log(stackTrace[i].toString());
            }
        }

        function isDefault() {
            var stackTrace = getStacks();
            // equals会在第二行
            if (stackTrace[1].toString().indexOf('android') == 0) {
                return true
            }
            if (stackTrace[1].toString().indexOf('java.util') == 0) {
                return true
            }
            return false
        }

        // 获取调用equals的方法包路径，用于判断类
        function getClassName() {
            var stackTrace = getStacks();
            return stackTrace[1].toString()
        }

        function hook_equals(className = '') {
            let string = Java.use("java.lang.String")
            string['equals'].implementation = function (arg) {
                if (className == '') {
                    if (!isDefault()) {
                        send('"' + this + '".equals("' + arg + '")')
                    }
                }
                if (className != '' && getClassName().indexOf(className) == 0) {
                    send('"' + this + '".equals("' + arg + '")')
                }
                let ret = this['equals'](arg);
                return ret
            }
        }
        recv(function (className) {
            if (className != '') {
                hook_equals(className);
            } else {
                hook_equals();
            }
        })

    });
})