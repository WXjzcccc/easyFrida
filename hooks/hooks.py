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

_className = ''
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
    if className != '':
        global _className 
        _className= className
    script.post(_className)

def hook_strcmp(process,onMessage,className=''):
    '''
    @process:       附加的进程
    @onMessage:     消息回调函数
    @className:     需要过滤的类名，默认为空
    '''
    with open('scripts/strcmp.js','r',encoding='utf8') as fr:
        jsCode = fr.read()
    script = process.create_script(jsCode)
    script.on('message',onMessage)
    script.load()
    if className != '':
        global _className 
        _className= className
    script.post(_className)

def logMessage(message,data):
    if message['type'] == 'send':
        payload = message['payload']  
        tag = payload['TAG']
        format = payload['format'] if 'format' in payload.keys() is not None else ''
        args = payload['args']
        print_yellow(f'{tag}:{format}<-{args}')
    elif message['type'] == 'error':
        print_red(message['description'])
    else:
        print(message)

def hook_log(process,onMessage=''):
    with open('scripts/log.js','r',encoding='utf8') as fr:
        jsCode = fr.read()
    script = process.create_script(jsCode)
    script.on('message',logMessage)
    script.load()

def num_to_ip(num):
    parts = [num >> 24 & 0xff, num >> 16 & 0xff, num >> 8 & 0xff, num & 0xff]
    return ".".join(map(str, parts))

def r0Message(message,data):
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

def r0capture(process,onMessage=''):
    '''
    @process:       附加的进程
    @onMessage:     消息回调函数
    @className:     需要过滤的类名，默认为空
    '''
    with open('scripts/r0capture.js','r',encoding='utf8') as fr:
        jsCode = fr.read()
    script = process.create_script(jsCode)
    script.on('message',r0Message)
    script.load()

def hook_event(process,onMessage):
    with open('scripts/hookEvent.js','r',encoding='utf8') as fr:
        jsCode = fr.read()
    script = process.create_script(jsCode)
    script.on('message',onMessage)
    script.load()

def dbMessage(message,data):
    def find_all_occurrences(string, char):
        positions = []
        for i in range(len(string)):
            if string[i] == char:
                positions.append(i)
        return positions
    if message['type'] == 'send':
        payload = message['payload']
        if type(payload) == dict and 'type' in payload.keys():
            if payload['type'] == 'sql':
                sql = payload['sql']
                args = payload['args']
                positions = find_all_occurrences(sql, '?')
                tmp = list(sql)
                for i in range(len(positions)):
                    tmp[positions[i]] = args[i]
                sql = ''.join(tmp)
                print_red(f'↓↓↓↓↓↓↓↓↓↓↓执行了sql↓↓↓↓↓↓↓↓↓↓↓')
                print_yellow(sql)
                print_red(f'↑↑↑↑↑↑↑↑↑↑↑执行了sql↑↑↑↑↑↑↑↑↑↑↑')
        else:
            print_yellow(message['payload'])
    elif message['type'] == 'error':
        pass
    else:
        print(message)

def sqlcipher(process,onMessage=''):
    with open('scripts/sqlcipher.js','r',encoding='utf8') as fr:
        jsCode = fr.read()
    script = process.create_script(jsCode)
    script.on('message',dbMessage)
    script.load()

def shareMessage(message,data):
    if message['type'] == 'send':
        payload = message['payload']
        if payload['类型'] == 'getAll':
            print_red(payload)
        else:
            print_yellow(payload)
    elif message['type'] == 'error':
        print_red(message['description'])
    else:
        print(message)

def shareP(process,onMessage=''):
    with open('scripts/SharedPreferences.js','r',encoding='utf8') as fr:
        jsCode = fr.read()
    script = process.create_script(jsCode)
    script.on('message',shareMessage)
    script.load()


def fileMessage(message,data):
    if message['type'] == 'send':
        payload = message['payload']
        if type(payload) == dict and 'type' in payload.keys():
            if payload['type'] == 'module open':
                print_yellow(payload)
        else:
            print_yellow(payload)
    else:
        print_red(message)

def soFile(process,onMessage=''):
    with open('scripts/file.js','r',encoding='utf8') as fr:
        jsCode = fr.read()
    script = process.create_script(jsCode)
    script.on('message',fileMessage)
    script.load()