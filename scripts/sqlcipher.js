let loaderFlag = false
let targetClasses = {
    "net.sqlcipher.database.SQLiteOpenHelper":{
        "function" :netSqlcipher,
        "flag":false,
        "hooked":false
    },
    "net.zetetic.database.sqlcipher.SQLiteDatabase":{
        "function" :zeteticSQLCipher,
        "flag":false,
        "hooked":false
    },
    "com.tencent.wcdb.database.SQLiteDatabase":{
        "function" :wcdb,
        "flag":false,
        "hooked":false
    },
    "android.database.sqlite.SQLiteDatabase":{
        "function" :_sqlite,
        "flag":false,
        "hooked":false
    },
}
function findClassLoader(){
    if(loaderFlag){
        return
    }
    Java.perform(function (){
        Java.enumerateClassLoaders({
            onMatch : function(loader){
                try {
                    for(var clazz of Object.keys(targetClasses)){
                        if(loader.findClass(clazz)){
                            Java.classFactory.loader = loader;
                            loaderFlag = true;
                            targetClasses[clazz]["flag"] = true;
                            break;
                            // console.log(`Class ${clazz} found! ClassLoader${loader}`);
                        }
                    }
                } catch (error) {
                    
                }
            },
            onComplete: function(){}
        })
    })
}

function hookFunction(){
    for(var clazz of Object.keys(targetClasses)){
        // console.log(`${clazz}:{
        //     ${targetClasses[clazz]["flag"]}
        //     ${targetClasses[clazz]['function']}}`)
        if(targetClasses[clazz]["flag"] && !targetClasses[clazz]["hooked"]){
            try{
                var func = targetClasses[clazz]["function"]
                func();
                targetClasses[clazz]["hooked"] = true;
            }catch(e){}
        }
    }
}

function hookLoadClass(){
    Java.perform(function (){
        //创建一个DexClassLoader的wapper
        var classLoader = Java.use("java.lang.ClassLoader");
        //hook 它的构造函数$init，我们将它的四个参数打印出来看看。
        classLoader.loadClass.overload("java.lang.String").implementation = function(dexPath){
            // console.log(`${dexPath} loaded.`);
            var ret = this.loadClass(dexPath);
            findClassLoader();
            // hookFunction();
            if(loaderFlag){
                hookFunction();
            }
            return ret;
        }
        
    })
}

function netSqlcipher() {
    let sqliteOpenHelper = Java.classFactory.use("net.sqlcipher.database.SQLiteOpenHelper")
    sqliteOpenHelper['getWritableDatabase'].overload("java.lang.String").implementation = function (arg) {
        let ret = this['getWritableDatabase'](arg);
        send('数据库密钥：' + arg + '\t数据库路径：' + this.mDatabase.value.mPath.value)
        return ret
    }
    let SQLiteQuery = Java.classFactory.use("net.sqlcipher.database.SQLiteQuery");
    SQLiteQuery["$init"].overload('net.sqlcipher.database.SQLiteDatabase', 'java.lang.String', 'int', '[Ljava.lang.String;').implementation = function (sQLiteDatabase, str, i, strArr) {
        this["$init"](sQLiteDatabase, str, i, strArr);
        var res = {
            'type': 'sql',
            'sql': str,
            'args': strArr
        }
        send(res);
        // this["$init"](sQLiteDatabase, str, i, strArr);
    };
    SQLiteQuery["$init"].overload('net.sqlcipher.database.SQLiteDatabase', 'java.lang.String', 'int', '[Ljava.lang.Object;').implementation = function (sQLiteDatabase, str, i, objArr) {
        this["$init"](sQLiteDatabase, str, i, objArr);
        var res = {
            'type': 'sql',
            'sql': str,
            'args': objArr
        }
        send(res);
    };
    let SQLiteProgram = Java.classFactory.use("net.sqlcipher.database.SQLiteProgram");
    SQLiteProgram["native_bind_string"].implementation = function (i, str) {
        send(`绑定第_${i}_个参数，值为:${str}=====>${this.mCompiledSql.value.mSqlStmt.value}`)
        this["native_bind_string"](i, str);
    };
    SQLiteProgram["native_bind_double"].implementation = function (i, d) {
        send(`绑定第_${i}_个参数，值为:${str}=====>${this.mCompiledSql.value.mSqlStmt.value}`)
        this["native_bind_double"](i, d);
    };
    SQLiteProgram["native_bind_long"].implementation = function (i, j) {
        send(`绑定第_${i}_个参数，值为:${str}=====>${this.mCompiledSql.value.mSqlStmt.value}`)
        this["native_bind_long"](i, j);
    };
    SQLiteProgram["native_bind_null"].implementation = function (i) {
        send(`绑定第_${i}_个参数，值为:${str}=====>${this.mCompiledSql.value.mSqlStmt.value}`)
        this["native_bind_null"](i);
    };
    SQLiteProgram["native_bind_blob"].implementation = function (i, bArr) {
        send(`绑定第_${i}_个参数，值为:${str}=====>${this.mCompiledSql.value.mSqlStmt.value}`)
        this["native_bind_blob"](i, bArr);
    };
}

function findAllOccurrences(str, char) {
    var positions = [];
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) === char) {
            positions.push(i);
        }
    }
    return positions;
}

function zeteticSQLCipher() {
    let SQLiteDatabase = Java.classFactory.use("net.zetetic.database.sqlcipher.SQLiteDatabase");
    SQLiteDatabase["openDatabase"].overload('java.lang.String', '[B', 'net.zetetic.database.sqlcipher.SQLiteDatabase$CursorFactory', 'int', 'net.zetetic.database.DatabaseErrorHandler', 'net.zetetic.database.sqlcipher.SQLiteDatabaseHook').implementation = function (str, bArr, cursorFactory, i11, databaseErrorHandler, sQLiteDatabaseHook) {
        let result = this["openDatabase"](str, bArr, cursorFactory, i11, databaseErrorHandler, sQLiteDatabaseHook);
        send('数据库密钥(字节数组)：' + bArr + '\t数据库路径：' + str)
        send('数据库密钥(字符串)：' + Java.use('java.lang.String').$new(bArr) + '\t数据库路径：' + str)
        return result;
    };
}

function wcdb() {
    let SQLiteDatabase = Java.classFactory.use("com.tencent.wcdb.database.SQLiteDatabase");
    SQLiteDatabase["openDatabase"].overload('java.lang.String', '[B', 'com.tencent.wcdb.database.SQLiteCipherSpec', 'com.tencent.wcdb.database.SQLiteDatabase$CursorFactory', 'int', 'com.tencent.wcdb.DatabaseErrorHandler', 'int').implementation = function (str, bArr, sQLiteCipherSpec, cursorFactory, i, databaseErrorHandler, i2) {
        let result = this["openDatabase"](str, bArr, sQLiteCipherSpec, cursorFactory, i, databaseErrorHandler, i2);
        send('数据库密钥(字节数组)：' + bArr + '\t数据库路径：' + str)
        send('数据库密钥(字符串)：' + Java.use('java.lang.String').$new(bArr) + '\t数据库路径：' + str)
        return result;
    };
}

function _sqlite() {
    let sqliteDB = Java.classFactory.use("android.database.sqlite.SQLiteDatabase");
    sqliteDB["execSQL"].overload('java.lang.String', '[Ljava.lang.Object;').implementation = function (str, objArr) {
        this["execSQL"](str, objArr);
        var args = [];
        for (var i = 0; i < objArr.length; i++) {
            args.push(objArr[i].toString());
        }
        var res = {
            'type': 'sql',
            'sql': str,
            'args': args
        }
        send(res);
    };
    sqliteDB["execSQL"].overload('java.lang.String').implementation = function (str) {
        this["execSQL"](str, objArr);
        var res = {
            'type': 'sql',
            'sql': str,
            'args': []
        }
        send(res);
    };
    // sqliteDB['query'].overload('java.lang.String', '[Ljava.lang.String;', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String', 'java.lang.String', 'java.lang.String').implementation = function(arg0,arg1,arg2,arg3,arg4,arg5,arg6){
    //     console.log(arg0,arg1,arg2,arg3,arg4,arg5,arg6)
    //     this['query'](arg0,arg1,arg2,arg3,arg4,arg5,arg6)
    // }
    // sqliteDB['query'].overload('java.lang.String', '[Ljava.lang.String;', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String').implementation = function(arg0,arg1,arg2,arg3,arg4,arg5,arg6,arg7){
    //     this['query'](arg0,arg1,arg2,arg3,arg4,arg5,arg6,arg7)
    // }
    // sqliteDB['query'].overload('boolean', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String').implementation = function(arg0,arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8){
    //     this['query'](arg0,arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8)
    // }
    // sqliteDB['query'].overload('boolean', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'android.os.CancellationSignal').implementation = function(arg0,arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9){
    //     this['query'](arg0,arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9)
    // }
    sqliteDB["getPath"].implementation = function () {
        var ret = this["getPath"]();
        send('数据库文件：' + ret);
        return ret
    };
}


function main(){
    hookLoadClass();
}

setImmediate(main);