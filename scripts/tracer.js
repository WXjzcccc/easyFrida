(()=>{
    function klog(msg){
        var message = {}
        message['jsname'] = 'tracer.js'
        message['data'] = msg
        send(message)
    }
    let loaderFlag = false
let hookedFlag = {}

function findClassLoader(classPath) {
    if (loaderFlag) {
        return
    }
    Java.enumerateClassLoaders({
        onMatch: function (loader) {
            try {
                loader.findClass(classPath)
                Java.classFactory.loader = loader;
                loaderFlag = true;
                // console.log(`Class ${clazz} found! ClassLoader${loader}`);
            } catch (error) {

            }
        },
        onComplete: function () {
        }
    })

}

function trace(classPath, methodName) {
    //创建一个DexClassLoader的wapper
    var classLoader = Java.use("java.lang.ClassLoader");
    //hook 它的构造函数$init，我们将它的四个参数打印出来看看。
    classLoader.loadClass.overload("java.lang.String").implementation = function (dexPath) {
        // console.log(`${dexPath} loaded.`);
        var ret = this.loadClass(dexPath);
        findClassLoader(classPath);
        // hookFunction();
        if (loaderFlag) {
            traceClass(classPath, methodName);
        }
        return ret;
    }

}

function traceMethod(clazz, methodName) { // 容易引起APP崩溃，原因暂时未知
    var overloadCount = clazz[methodName].overloads.length;
    for (var i = 0; i < overloadCount; i++) {
        var key = `${clazz}.${methodName}.${clazz[methodName].overloads[i]}`;
        if (Object.keys(hookedFlag).includes(key)) {
            if (hookedFlag[key]) {
                continue;
            }
        } else {
            hookedFlag[key] = false;
        }
        clazz[methodName].overloads[i].implementation = function () {
            hookedFlag[key] = true;
            var message = {
                "name": `${clazz}.${methodName}被调用了`,
                "args": undefined,
                "retVal": undefined,
                "stack": "",
            }
            message["args"] = JSON.stringify(arguments);
            message["stack"] = getStacks();
            var retVal = this[methodName].apply(this, arguments);
            message["retVal"] = retVal;
            klog(message);
            return retVal;
        }
    }
}

function traceClass(classPath, methodName = '') {
    var clazz = Java.classFactory.use(classPath);
    if (methodName === '' || methodName === undefined || methodName === null) {
        var methods = clazz.class.getDeclaredMethods();
        let methodSet = new Set();
        methods.forEach(element => {
            methodSet.add(element.toString().split(classPath)[1].split("(")[0].substring(1));
        });
        for (var method of methodSet) {
            traceMethod(clazz, method);
        }
    } else {
        traceMethod(clazz, methodName);
    }
}

function getStacks() {
    var Thread = Java.classFactory.use("java.lang.Thread");
    var currentThread = Thread.currentThread();
    var stackTrace = currentThread.getStackTrace();
    var slices = stackTrace.slice(2);
    var stacks = [];
    for (var stack of slices) {
        stacks.push(stack.toString())
    }
    return stacks;
}

function tracer() {
        console.log("123")
    recv(function (args) {
        console.log(className,isMethod)
        var className = args[0];
        var isMethod = args[1];
        console.error(className,isMethod)
        if (isMethod) {
            var index = className.lastIndexOf(".");
            var classPath = className.substring(0, index);
            var methodName = className.substring(index + 1);
            trace(classPath, methodName);
        } else {
            trace(className);
        }
    })
}

Java.perform(()=>{
    tracer();
})
})();