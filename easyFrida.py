import frida
import os
import sys
import argparse
from tools.PrintTool import print_yellow,print_red,print_green,print_dict
from hooks.hooks import *
import rich
import threading
import json

res_savepath = ''
def num_to_ip(num):
    parts = [num >> 24 & 0xff, num >> 16 & 0xff, num >> 8 & 0xff, num & 0xff]
    return ".".join(map(str, parts))
def find_all_occurrences(string, char):
    positions = []
    for i in range(len(string)):
        if string[i] == char:
            positions.append(i)
    return positions
def onMessage(message,data):
    outstr = ''
    if message['type'] == 'send':
        if isinstance(message['payload'],dict) and 'jsname' in message['payload']:
            for key in message['payload']:
                if key == 'jsname' or key == 'data': continue
                outstr += f", {key}={message['payload'][key]}"
            outstr = outstr.lstrip(',').strip()
            jsname = message['payload']['jsname']
            mdata = message['payload']['data'] if 'data' in message['payload'].keys() else {}
            payload = message['payload']
            if jsname == 'r0capture.js':
                if 'src_addr' in payload.keys():
                    payload['src_addr'] = num_to_ip(payload['src_addr'])
                    payload['dst_addr'] = num_to_ip(payload['dst_addr'])
                payload['bdata'] = data
                outstr += f'\n{jsname} --> {str(payload)}\n'
            elif jsname == 'sqlcipher.js':
                if type(payload) == dict and 'type' in payload.keys():
                    if payload['type'] == 'sql':
                        sql = payload['sql']
                        args = payload['args']
                        positions = find_all_occurrences(sql, '?')
                        tmp = list(sql)
                        for i in range(len(positions)):
                            tmp[positions[i]] = args[i]
                        sql = ''.join(tmp)
                        outstr+=f'↓↓↓↓↓↓↓↓↓↓↓执行了sql↓↓↓↓↓↓↓↓↓↓↓\n'
                        outstr+=f"\n{jsname} --> {sql}"
                        outstr+=f'↑↑↑↑↑↑↑↑↑↑↑执行了sql↑↑↑↑↑↑↑↑↑↑↑\n'
                else:
                    outstr += f"\n{jsname} --> {payload}"
            else:
                outstr += str(mdata)
                outstr = f"\n{jsname} --> {outstr}"
        else:
            outstr = message['payload']
        print_yellow(outstr)
    elif message['type'] == 'error':
        try:
            outstr = f"{message['description']} in {message['fileName']} at line {message['lineNumber']}\nmessage['stack']"
            print_red(outstr)
        except:
            outstr = message
            print_red(outstr)
    else:
        outstr = message
        print(outstr)
    if res_savepath: # 如果res_savepath不为空，则将结果追加进文件
        with open(res_savepath,'a+',encoding='utf-8') as f:
            f.write(outstr+'\n')

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

def spawnNew(device,package_name,plugin_list=[],onMessage=None,className='',isMethod=None):
    pending = []
    sessions = []
    scripts = []
    event = threading.Event()
    def spawn_added(spawn):
        print('spawn_added:', spawn)
        event.set()
        if(spawn.identifier.startswith(package_name)):
            session = device.attach(spawn.pid)
            hookAll(plugin_list,session,onMessage,className,isMethod)
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
    parser.add_argument('--className',type=str,default='',help='执行脚本需要的类名(可选，部分脚本可添加该参数)')
    parser.add_argument('-l',type=str,help='要执行的插件')
    parser.add_argument('--list',action='store_true',help='列出支持的插件')
    parser.add_argument('-o',default='',help='结果以utf8编码保存到本地output文件夹，默认不保存')
    parser.add_argument('-m',action='store_true',help='是否函数名')
    args = parser.parse_args()
    rich.print(description)
    className = ''
    packageName = ''
    isMethod = None
    plugin_list = []
    def list_plugins():
        lst = []
        idx = 0
        with open(get_relative_path('scripts/plugins.json'),'r',encoding='utf-8') as f:
            plugin = json.load(f)
            for name in plugin.keys():
                description = plugin[name]['description']
                idx += 1
                lst.append({"序号":idx,"插件":name,"帮助":description})
        print_dict(lst,lst[0],title='插件列表')
        sys.exit()
    if check_arg(args.list):
        list_plugins()
    if check_arg(args.S):
        device = get_device(args.S)
    else:
        device = get_device()
    if check_arg(args.className):
        className = args.className
    if check_arg(args.p):
        pnameorid = args.p
        process = attach(device,pnameorid)
    if check_arg(args.m):
        isMethod = True
    else:
        isMethod = False
    if check_arg(args.l):
        plugin = args.l
        if plugin.__contains__(','):
            plugin_list = plugin.split(',')
        else:
            plugin_list.append(plugin)
    else:
        print_red('未指定插件, -h 查看帮助')
        list_plugins()
        sys.exit()
    if check_arg(args.f):
        packageName = args.f
        device,process,pid = spawnNew(device,packageName,plugin_list,onMessage,className,isMethod)
    hookAll(plugin_list,process,onMessage,className,isMethod)
    if check_arg(args.o):
        output_path = args.o
        os.makedirs(output_path,exist_ok=True)
        res_savepath = f"{output_path}\\{packageName}_{plugin}.txt"
    in_data = sys.stdin.readline()
    if in_data in ['exit','quit']:
        sys.exit(0)
# TODO 多进程与加固？至少需要支持加固