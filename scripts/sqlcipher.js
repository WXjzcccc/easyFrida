setImmediate(function () {
    Java.perform(function () {
        function findAllOccurrences(str, char) {
            var positions = [];
            for (var i = 0; i < str.length; i++) {
              if (str.charAt(i) === char) {
                positions.push(i);
              }
            }
            return positions;
          }
        function netSqlcipher() {
            let sqliteOpenHelper = Java.use("net.sqlcipher.database.SQLiteOpenHelper")
            sqliteOpenHelper['getWritableDatabase'].overload("java.lang.String").implementation = function (arg) {
                let ret = this['getWritableDatabase'](arg);
                send('数据库密钥：'+arg+'\t数据库路径：'+this.mDatabase.value.mPath.value)
                return ret
            }
            let SQLiteQuery = Java.use("net.sqlcipher.database.SQLiteQuery");
            SQLiteQuery["$init"].overload('net.sqlcipher.database.SQLiteDatabase', 'java.lang.String', 'int', '[Ljava.lang.String;').implementation = function (sQLiteDatabase, str, i, strArr) {
                this["$init"](sQLiteDatabase, str, i, strArr);
                var res = {
                    'type': 'sql',
                    'sql':str,
                    'args':strArr
                }
                send(res);
                // this["$init"](sQLiteDatabase, str, i, strArr);
            };
            SQLiteQuery["$init"].overload('net.sqlcipher.database.SQLiteDatabase', 'java.lang.String', 'int', '[Ljava.lang.Object;').implementation = function (sQLiteDatabase, str, i, objArr) {
                this["$init"](sQLiteDatabase, str, i, objArr);
                var res = {
                    'type': 'sql',
                    'sql':str,
                    'args':objArr
                }
                send(res);
            };
            let SQLiteProgram = Java.use("net.sqlcipher.database.SQLiteProgram");
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
        function _sqlite(){
            let sqliteDB = Java.use("android.database.sqlite.SQLiteDatabase");
            sqliteDB["execSQL"].overload('java.lang.String', '[Ljava.lang.Object;').implementation = function (str, objArr) {
                this["execSQL"](str, objArr);
                var res = {
                    'type': 'sql',
                    'sql':str,
                    'args':objArr
                }
                send(res);
            };
            sqliteDB["execSQL"].overload('java.lang.String').implementation = function (str, objArr) {
                this["execSQL"](str, objArr);
                var res = {
                    'type': 'sql',
                    'sql':str,
                    'args':[]
                }
                send(res);
            };
            sqliteDB["query"].overload("java.lang.String", "[Ljava.lang.String;", "java.lang.String", "[Ljava.lang.String;", "java.lang.String", "java.lang.String", "java.lang.String").implementation = function (args) {
                this["query"](args);
                var res = {
                    'type': 'sql',
                    'sql':args[0],
                    'args':args[1]
                }
                send(res);
            };
            sqliteDB["getPath"].implementation = function () {
                var ret = this["getPath"]();
                send('数据库文件：'+ret);
                return ret
            };
            let SQLiteProgram1 = Java.use("android.database.sqlite.SQLiteProgram");
            SQLiteProgram1["bind_string"].implementation = function (i, str) {
                send(`绑定第_${i}_个参数，值为:${str}=====>${this.mCompiledSql.value.mSqlStmt.value}`)
                this["bind_string"](i, str);
            };
            SQLiteProgram1["bind_double"].implementation = function (i, d) {
                send(`绑定第_${i}_个参数，值为:${str}=====>${this.mCompiledSql.value.mSqlStmt.value}`)
                this["bind_double"](i, d);
            };
            SQLiteProgram1["bind_long"].implementation = function (i, j) {
                send(`绑定第_${i}_个参数，值为:${str}=====>${this.mCompiledSql.value.mSqlStmt.value}`)
                this["bind_long"](i, j);
            };
            SQLiteProgram1["bind_null"].implementation = function (i) {
                send(`绑定第_${i}_个参数，值为:${str}=====>${this.mCompiledSql.value.mSqlStmt.value}`)
                this["bind_null"](i);
            };
            SQLiteProgram1["bind_blob"].implementation = function (i, bArr) {
                send(`绑定第_${i}_个参数，值为:${str}=====>${this.mCompiledSql.value.mSqlStmt.value}`)
                this["bind_blob"](i, bArr);
            };
        }
        netSqlcipher()
        _sqlite()
        // TODO 需要支持其他包
    });
})