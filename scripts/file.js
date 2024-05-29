Java.perform(function () {
    function soFile(){
        Interceptor.attach(Module.findExportByName('libc.so', 'open'), {
            onEnter: function (args) {
              var path = Memory.readUtf8String(args[0]);
              var ret = {
                  'type':'module open',
                  '模块':Process.findModuleByAddress(this.returnAddress).name,
                  '路径':path
              }
              send(ret)
            }
          });
    }
    try{
        soFile()
    }catch(e){
        console.log(e)
    }
});