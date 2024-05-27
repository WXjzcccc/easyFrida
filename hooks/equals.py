def hook_equals(process,onMessage,className=''):
    '''
    @process:       附加的进程
    @onMessage:     消息回调函数
    @className:     需要过滤的类名，默认为空
    '''
    with open('scripts/equals.js','r',encoding='utf8') as fr:
        jsCode = fr.read()
    script = process.create_script(jsCode)
    script.on('message',onMessage)
    script.load()
    script.post(className)