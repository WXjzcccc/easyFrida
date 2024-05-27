import frida
import sys
import argparse
from tools.PrintTool import print_yellow,print_red,print_green,print_dict
from hooks.equals import hook_equals

def onMessage(message,data):
    if message['type'] == 'send':
        print_yellow(message['payload'])
    elif message['type'] == 'error':
        print_red(message['description'])
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

if __name__ == '__main__':
    description = '''
                               ____                 __              
                              /\  _`\        __    /\ \             
   __     __      ____  __  __\ \ \L\_\_ __ /\_\   \_\ \     __     
 /'__`\ /'__`\   /',__\/\ \/\ \\ \  _\/\`'__\/\ \  /'_` \  /'__`\   
/\  __//\ \L\.\_/\__, `\ \ \_\ \\ \ \/\ \ \/ \ \ \/\ \L\ \/\ \L\.\_ 
\ \____\ \__/.\_\/\____/\/`____ \\ \_\ \ \_\  \ \_\ \___,_\ \__/.\_\
 \/____/\/__/\/_/\/___/  `/___/> \\/_/  \/_/   \/_/\/__,_ /\/__/\/_/
                            /\___/                                  
                            \/__/                                   Author: WXjzc'''
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
    print(description)
    className = ''
    packageName = ''
    if check_arg(args.l):
        lst = []
        idx = 0
        with open('scripts/plugins.list','r',encoding='utf-8') as f:
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
        device,process,pid = spawn(device,packageName)
    if check_arg(args.p):
        pnameorid = args.p
        process = attach(device,pnameorid)
    if check_arg(args.plugin):
        plugin = args.plugin
        if plugin == 'equals':
            hook_equals(process,onMessage,className=className)
    else:
        print_red('请选择插件')
        sys.exit()
    in_data = sys.stdin.readline()
    if in_data in ['exit','quit']:
        sys.exit(0)