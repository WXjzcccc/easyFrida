import json
import os

def get_relative_path(relative_path):
    """获取配置文件的绝对路径"""
    base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)

def get_scripts_path():
    """获取插件脚本的路径"""
    base_path = "../scripts"
    scripts_path = {}
    with open(get_relative_path('../scripts/plugins.json'), 'r', encoding='utf-8') as f:
        plugin = json.load(f)
        for name in plugin.keys():
            scripts_path[name] = os.path.join(base_path,plugin[name]['fileName'])
    return scripts_path

def hookAll(plugin_list,process,onMessage=None,className='',isMethod=None):
    mapper = get_scripts_path()
    jsCode = ''
    for plugin in plugin_list:
        if plugin in mapper.keys():
            with open(get_relative_path(mapper[plugin]), 'r', encoding='utf8') as fr:
                jsCode += fr.read()+'\n'
                print(f'加载插件: {plugin}')
    script = process.create_script(jsCode)
    script.on('message',onMessage)
    script.load()
    script.post([className,isMethod])
