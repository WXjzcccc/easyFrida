setImmediate(function () {
    Java.perform(function () {
        function getSharedPreferences() {
            var sharedPrefs = Java.use("android.app.SharedPreferencesImpl")
            sharedPrefs["getString"].overload("java.lang.String", "java.lang.String").implementation = function(name,defaultRet){
                let ret = this["getString"](name,defaultRet)
                send({
                    "类型":'getString',
                    "文件名":this.mFile.value.toString(),
                    "Key":name,
                    "默认值":defaultRet,
                    "返回值":ret
                })
                return ret
            }
            sharedPrefs["getAll"].implementation = function(){
                let ret = this["getAll"]()
                send({
                    "类型":'getAll',
                    "文件名":this.mFile.value.toString(),
                    "说明":'该方法返回值请自行读取文件'
                })
                return ret
            }
            sharedPrefs["getBoolean"].overload("java.lang.String", "boolean").implementation = function(name,defaultRet){
                let ret = this["getBoolean"](name,defaultRet)
                send({
                    "类型":'getBoolean',
                    "文件名":this.mFile.value.toString(),
                    "Key":name,
                    "默认值":defaultRet,
                    "返回值":ret
                })
                return ret
            }
            sharedPrefs["getFloat"].overload("java.lang.String", "float").implementation = function(name,defaultRet){
                let ret = this["getFloat"](name,defaultRet)
                send({
                    "类型":'getFloat',
                    "文件名":this.mFile.value.toString(),
                    "Key":name,
                    "默认值":defaultRet,
                    "返回值":ret
                })
                return ret
            }
            sharedPrefs["getInt"].overload("java.lang.String", "int").implementation = function(name,defaultRet){
                let ret = this["getInt"](name,defaultRet)
                send({
                    "类型":'getInt',
                    "文件名":this.mFile.value.toString(),
                    "Key":name,
                    "默认值":defaultRet,
                    "返回值":ret
                })
                return ret
            }
            sharedPrefs["getLong"].overload("java.lang.String", "long").implementation = function(name,defaultRet){
                let ret = this["getLong"](name,defaultRet)
                send({
                    "类型":'getLong',
                    "文件名":this.mFile.value.toString(),
                    "Key":name,
                    "默认值":defaultRet,
                    "返回值":ret
                })
                return ret
            }
            sharedPrefs["getStringSet"].overload("java.lang.String", "java.util.Set").implementation = function(name,defaultRet){
                let ret = this["getStringSet"](name,defaultRet)
                send({
                    "类型":'getStringSet',
                    "Key":name,
                    "默认值":defaultRet,
                    "返回值":ret
                })
                return ret
            }
        }
        
        getSharedPreferences()
    });
})