from tools.PrintTool import print_yellow,print_red
import os

def get_relative_path(relative_path):
    """获取配置文件的绝对路径"""
    base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)

def hookAll(plugin_list,process,onMessage=None,className='',isMethod=None):
    mapper = {
        'equals':'../scripts/equals.js',
        'sofileopen':'../scripts/file.js',
        'tracer':'../scripts/tracer.js',
        'strcmp':'../scripts/strcmp.js',
        'r0capture':'../scripts/r0capture.js',
        'share':'../scripts/SharedPreferences.js',
        'javaEnc':'../scripts/JavaEnc.js',
        'log':'../scripts/log.js',
        'database':'../scripts/sqlcipher.js',
        'event':'../scripts/hookEvent.js',
    }
    jsCode = ''
    for plugin in plugin_list:
        if plugin in mapper.keys():
            with open(get_relative_path(mapper[plugin]), 'r', encoding='utf8') as fr:
                jsCode += fr.read()+'\n'
    script = process.create_script(jsCode)
    script.on('message',onMessage)
    script.load()
    script.post([className,isMethod])
