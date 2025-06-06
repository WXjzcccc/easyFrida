(() => {
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
                        var message = {};
                        message["jsname"] = "equals.js";
                        message["data"] = '"' + this + '".equals("' + arg + '")';
                        send(message)
                    }
                }
                if (className != '' && getClassName().indexOf(className) == 0) {
                    var message = {};
                    message["jsname"] = "equals.js";
                    message["data"] = '"' + this + '".equals("' + arg + '")';
                    send(message)
                } else if (className != '' && (this == className.toString() | arg == className.toString())) {
                    var message = {};
                    message["jsname"] = "equals.js";
                    message["data"] = '"' + this + '".equals("' + arg + '")';
                    send(message)
                }
                let ret = this['equals'](arg);
                return ret
            }

        }

        function hook_equalsIgnoreCase(className = '') {
            let string = Java.use("java.lang.String")
            string['equalsIgnoreCase'].implementation = function (arg) {
                if (className == '') {
                    if (!isDefault()) {
                        var message = {};
                        message["jsname"] = "equals.js";
                        message["data"] = '"' + this + '".equalsIgnoreCase("' + arg + '")';
                        send(message)
                    }
                }
                if (className != '' && getClassName().indexOf(className) == 0) {
                    var message = {};
                    message["jsname"] = "equals.js";
                    message["data"] = '"' + this + '".equalsIgnoreCase("' + arg + '")';
                    send(message)
                } else if (className != '' && (this == className.toString() | arg == className.toString())) {
                    var message = {};
                    message["jsname"] = "equals.js";
                    message["data"] = '"' + this + '".equalsIgnoreCase("' + arg + '")';
                    send(message)
                }
                let ret = this['equalsIgnoreCase'](arg);
                return ret
            }
        }

        function hookEquals() {
            recv(function (args) {
                var className = args[0];
                if (className != '') {
                    hook_equals(className);
                    hook_equalsIgnoreCase(className);
                } else {
                    hook_equals();
                    hook_equalsIgnoreCase();
                }
            })
        }

        Java.perform(() => {
            hookEquals();
        })
    }
)();