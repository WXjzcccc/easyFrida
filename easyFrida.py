import frida
import os
import sys
import argparse
from tools.PrintTool import print_yellow,print_red,print_green,print_dict
from hooks.hooks import *
import rich
import threading

def onMessage(message,data):
    if message['type'] == 'send':
        outstr = ''
        for key in message['payload']:
            if key == 'jsname' or key == 'data': continue
            outstr += f', {key}={message["payload"][key]}'
        outstr = outstr.lstrip(',').strip()
        if 'data' in message['payload']:
            outstr = message['payload']['data'] + outstr
        if 'jsname' in message['payload']:
            outstr = f'{message['payload']['jsname']} > {outstr}'
        print_yellow(outstr)
    elif message['type'] == 'error':
        try:
            print_red(f"{message['description']} in {message['fileName']} at line {message['lineNumber']}")
            print_red(message['stack'])
        except:
            print_red(message)
    else:
        print(message)

def check_arg(arg):
    if arg is None or arg == '' or arg == False:
        return False
    return True

def attach(device,name_or_pid):
    try:
        process = device.attach(name_or_pid)
        print_green('附加成功')
        return process
    except:
        print_red('附加失败')
        sys.exit()

def spawn(device,package_name):
    try:
        pid = device.spawn(package_name)
        process = device.attach(pid)
        device.resume(pid)
        print_green('附加成功')
        return device,process,pid
    except:
        print_red('附加失败')
        sys.exit()

my_func = None

def spawnNew(device,package_name):
    pending = []
    sessions = []
    scripts = []
    event = threading.Event()
    def spawn_added(spawn):
        print('spawn_added:', spawn)
        event.set()
        if(spawn.identifier.startswith(package_name)):
            session = device.attach(spawn.pid)
            my_func(session,onMessage)
            device.resume(spawn.pid)
    def on_spawned(spawn):
        print('on_spawned:', spawn)
        pending.append(spawn)
        event.set() 
    def spawn_removed(spawn):
        print('spawn_added:', spawn)
        event.set()
    device.on('spawn-added', spawn_added)
    device.on('spawn-removed', spawn_removed)
    device.on('child-added', on_spawned)
    device.on('child-removed', on_spawned)
    device.on('process-crashed', on_spawned)
    device.on('output', on_spawned)
    device.on('uninjected', on_spawned)
    device.on('lost', on_spawned)
    device.enable_spawn_gating()
    event = threading.Event()
    pid = device.spawn([package_name])
    session = device.attach(pid)
    print("[*] Attach Application id:",pid)
    device.resume(pid)
    return device,session,pid

def get_device(name=''):
    try:
        if name != '':
            device = frida.get_device_manager().get_device(name)
        else:
            device = frida.get_device_manager().enumerate_devices()[-1]
        return device
    except:
        print_red('device not found!')
        sys.exit()

def get_relative_path(relative_path):
    # 获取配置文件路径
    base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)

if __name__ == '__main__':
    description = r'''
                       _____     _     _       
   ___  __ _ ___ _   _|  ___| __(_) __| | __ _ 
  / _ \/ _` / __| | | | |_ | '__| |/ _` |/ _` |
 |  __/ (_| \__ \ |_| |  _|| |  | | (_| | (_| |
  \___|\__,_|___/\__, |_|  |_|  |_|\__,_|\__,_|
                 |___/                         Author: WXjzc, sjh00'''
    parser = argparse.ArgumentParser(formatter_class=argparse.RawTextHelpFormatter,description=description)
    parser.add_argument('-R',action='store_true',help='使用远程连接方式')
    parser.add_argument('-S',type=str,default='',help='要附加的设备名(仅在连接了多台设备时需要)')
    group = parser.add_mutually_exclusive_group()
    group.add_argument('-f',type=str,default='',help='要附加的应用包名')
    group.add_argument('-p',type=str,default='',help='要附加的进程名或进程ID')
    parser.add_argument('--className',type=str,default='',help='执行脚本需要的类名(非强制，部分脚本可以添加该参数)')
    parser.add_argument('--plugin',type=str,help='要执行的插件')
    parser.add_argument('-l',action='store_true',help='列出支持的插件')
    args = parser.parse_args()
    rich.print(description)
    className = ''
    packageName = ''
    if check_arg(args.l):
        lst = []
        idx = 0
        with open(get_relative_path('scripts/plugins.list'),'r',encoding='utf-8') as f:
            for line in f.readlines():
                name = line.split(' ')[0]
                _help = line.split(' ')[1].strip()
                idx += 1
                lst.append({"序号":idx,"插件":name,"帮助":_help})
        print_dict(lst,lst[0],title='插件列表')
        sys.exit()
    if check_arg(args.S):
        device = get_device(args.S)
    else:
        device = get_device()
    if check_arg(args.className):
        className = args.className
    if check_arg(args.f):
        packageName = args.f
        device,process,pid = spawnNew(device,packageName)
    if check_arg(args.p):
        pnameorid = args.p
        process = attach(device,pnameorid)
    if check_arg(args.plugin):
        plugin = args.plugin
        if plugin == 'equals':
            my_func = hook_equals
            hook_equals(process,onMessage,className=className)
        elif plugin == 'strcmp':
            my_func = hook_strcmp
            hook_strcmp(process,onMessage,className=className)
        elif plugin == 'r0capture':
            my_func = r0capture
            r0capture(process)
        elif plugin == 'javaEnc':
            my_func = javaEnc
            javaEnc(process,onMessage)
        elif plugin == 'event':
            my_func = hook_event
            hook_event(process,onMessage)
        elif plugin == 'database':
            my_func = sqlcipher
            sqlcipher(process)
        elif plugin == 'share':
            my_func = shareP
            shareP(process)
        elif plugin == 'sofileopen':
            my_func = soFile
            soFile(process)
        elif plugin == 'log':
            my_func = hook_log
            hook_log(process)
    else:
        print_red('请选择插件')
        sys.exit()
    in_data = sys.stdin.readline()
    if in_data in ['exit','quit']:
        sys.exit(0)
# TODO 多进程与加固？至少需要支持加固