from tools.PrintTool import print_yellow,print_red

def javaEnc(process,onMessage):
    '''
    @process:       附加的进程
    @onMessage:     消息回调函数
    @className:     需要过滤的类名，默认为空
    '''
    with open('scripts/javaEnc.js','r',encoding='utf8') as fr:
        jsCode = fr.read()
    script = process.create_script(jsCode)
    script.on('message',onMessage)
    script.load()

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


def num_to_ip(num):
    parts = [num >> 24 & 0xff, num >> 16 & 0xff, num >> 8 & 0xff, num & 0xff]
    return ".".join(map(str, parts))

def onMessage(message,data):
    if message['type'] == 'send':
        payload = message['payload']  
        if 'src_addr' in payload.keys():
            payload['src_addr'] = num_to_ip(payload['src_addr'])
            payload['dst_addr'] = num_to_ip(payload['dst_addr'])
        payload['bdata'] = data
        print_yellow(payload)
    elif message['type'] == 'error':
        print_red(message['description'])
    else:
        print(message)

def r0capture(process):
    '''
    @process:       附加的进程
    @onMessage:     消息回调函数
    @className:     需要过滤的类名，默认为空
    '''
    with open('scripts/r0capture.js','r',encoding='utf8') as fr:
        jsCode = fr.read()
    script = process.create_script(jsCode)
    script.on('message',onMessage)
    script.load()

def hook_event(process,onMessage):
    '''
    @process:       附加的进程
    @onMessage:     消息回调函数
    @className:     需要过滤的类名，默认为空
    '''
    with open('scripts/hookEvent.js','r',encoding='utf8') as fr:
        jsCode = fr.read()
    script = process.create_script(jsCode)
    script.on('message',onMessage)
    script.load()