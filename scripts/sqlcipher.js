setImmediate(function () {
    Java.perform(function () {
        function netSqlcipher() {
            let sqliteOpenHelper = Java.use("net.sqlcipher.database.SQLiteOpenHelper")
            sqliteOpenHelper['getWritableDatabase'].overload("java.lang.String").implementation = function (arg) {
                let ret = this['getWritableDatabase'](arg);
                send('数据库密钥：'+arg+'\t数据库路径：'+this.mDatabase.value.mPath.value)
                return ret
            }
        }
        netSqlcipher()
        // TODO 需要支持其他包
    });
})