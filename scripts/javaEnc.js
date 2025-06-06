(() => {
    // Author: dqzg12300, sjh00

// 调整设置
    var num_datamaxlen = 0; // 指定返回参数值的最大长度，不小于4，0表示不限制
    var passclasskeyword = [
        "\(Native Method\)",
        "^java",
        "^android",
        "^com\.android\.",
        "\.umeng\.",
        "\.netease\.",
        "\.alipay\.",
        "\.blankj\.",
        "\.bumptech\.",
        "^com\.google\."
    ]; // 排除原生和无须关注的类名关键字
    var ignoreclasskeyword = [
        "^com\.stub\.StubApp", // 加固解壳类名关键字
        "\.zip.+InputStream", // zip流类处理关键字
    ]; // 只要出现就全部忽略的类名关键字


    var curlogstr = ''; // 当前输出的文字，用于判断是否连续重复输出
    function klog(data) {
        if (curlogstr === data) return;
        curlogstr = data;
        var message = {};
        message["jsname"] = "javaEnc.js";
        message["data"] = data;
        send(message);
    }

    function klogData(data, key, value) {
        var message = {};
        message["jsname"] = "javaEnc.js";
        message["data"] = data;
        message[key] = value;
        send(message);
    }

    var N_ENCRYPT_MODE = 1
    var N_DECRYPT_MODE = 2

    var pckre = new RegExp(passclasskeyword.join("|"), "i"); // 过滤类名正则表达式
    var igcre = new RegExp(ignoreclasskeyword.join("|"), "i"); // 忽略类名正则表达式

    function getmld(str) {
        // 处理超过最大长度限制的值
        str = str.trim(); // 去除首尾空格
        if (num_datamaxlen > 3 && str.length > num_datamaxlen) {
            str = str.substring(0, num_datamaxlen - 3) + "...";
        }
        return str;
    }

    function getStacks() {
        var Exception = Java.use("java.lang.Exception");
        var ins = Exception.$new("Exception");
        var straces = ins.getStackTrace();

        if (undefined == straces || null == straces) {
            return '';
        }

        let res = '';
        for (var i = 0; i < straces.length; i++) {
            var str = straces[i].toString();
            if (igcre.test(str)) return false; // 只要出现就全部忽略
            if (pckre.test(str)) continue; // 过滤掉原生和无须关注的堆栈信息
            res += "\n" + str;
        }
        Exception.$dispose();
        if (res != '') {
            res = "\n\n---------------- This Stack ----------------" + res + "\n--------------------------------------------\n";
        }
        return res;
    }

//工具相关函数
    var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        base64DecodeChars = new Array((-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), 62, (-1), (-1), (-1), 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, (-1), (-1), (-1), (-1), (-1), (-1), (-1), 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, (-1), (-1), (-1), (-1), (-1), (-1), 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, (-1), (-1), (-1), (-1), (-1));

    function stringToBase64(e) {
        var r, a, c, h, o, t;
        for (c = e.length, a = 0, r = ''; a < c;) {
            if (h = 255 & e.charCodeAt(a++), a == c) {
                r += base64EncodeChars.charAt(h >> 2),
                    r += base64EncodeChars.charAt((3 & h) << 4),
                    r += '==';
                break
            }
            if (o = e.charCodeAt(a++), a == c) {
                r += base64EncodeChars.charAt(h >> 2),
                    r += base64EncodeChars.charAt((3 & h) << 4 | (240 & o) >> 4),
                    r += base64EncodeChars.charAt((15 & o) << 2),
                    r += '=';
                break
            }
            t = e.charCodeAt(a++),
                r += base64EncodeChars.charAt(h >> 2),
                r += base64EncodeChars.charAt((3 & h) << 4 | (240 & o) >> 4),
                r += base64EncodeChars.charAt((15 & o) << 2 | (192 & t) >> 6),
                r += base64EncodeChars.charAt(63 & t)
        }
        return getmld(r);
    }

    function base64ToString(e) {
        var r, a, c, h, o, t, d;
        for (t = e.length, o = 0, d = ''; o < t;) {
            do
                r = base64DecodeChars[255 & e.charCodeAt(o++)];
            while (o < t && r == -1);
            if (r == -1)
                break;
            do
                a = base64DecodeChars[255 & e.charCodeAt(o++)];
            while (o < t && a == -1);
            if (a == -1)
                break;
            d += String.fromCharCode(r << 2 | (48 & a) >> 4);
            do {
                if (c = 255 & e.charCodeAt(o++), 61 == c)
                    return d;
                c = base64DecodeChars[c]
            } while (o < t && c == -1);
            if (c == -1)
                break;
            d += String.fromCharCode((15 & a) << 4 | (60 & c) >> 2);
            do {
                if (h = 255 & e.charCodeAt(o++), 61 == h)
                    return d;
                h = base64DecodeChars[h]
            } while (o < t && h == -1);
            if (h == -1)
                break;
            d += String.fromCharCode((3 & c) << 6 | h)
        }
        return getmld(d);
    }

    function hexToBase64(str) {
        return getmld(base64Encode(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))));
    }

    function base64ToHex(str) {
        for (var i = 0, bin = base64Decode(str.replace(/[ \n]+$/, "")), hex = []; i < bin.length; ++i) {
            var tmp = bin.charCodeAt(i).toString(16);
            if (tmp.length === 1)
                tmp = "0" + tmp;
            hex[hex.length] = tmp;
        }
        return hex.join("");
    }

    function hexToBytes(str) {
        var pos = 0;
        var len = str.length;
        if (len % 2 != 0) {
            return null;
        }
        len /= 2;
        var hexA = new Array();
        for (var i = 0; i < len; i++) {
            var s = str.substr(pos, 2);
            var v = parseInt(s, 16);
            hexA.push(v);
            pos += 2;
        }
        return getmld(hexA);
    }

    function bytesToHex(arr) {
        var str = '';
        var k, j;
        for (var i = 0; i < arr.length; i++) {
            k = arr[i];
            j = k;
            if (k < 0) {
                j = k + 256;
            }
            if (j < 16) {
                str += "0";
            }
            str += j.toString(16);
        }
        return getmld(str);
    }

    function stringToHex(str) {
        var val = "";
        for (var i = 0; i < str.length; i++) {
            if (val == "")
                val = str.charCodeAt(i).toString(16);
            else
                val += str.charCodeAt(i).toString(16);
        }
        return getmld(val);
    }

    function stringToBytes(str) {
        var ch, st, re = [];
        for (var i = 0; i < str.length; i++) {
            ch = str.charCodeAt(i);
            st = [];
            do {
                st.push(ch & 0xFF);
                ch = ch >> 8;
            }
            while (ch);
            re = re.concat(st.reverse());
        }
        return getmld(re);
    }

//将byte[]转成String的方法
    function bytesToString(arr) {
        var str = '';
        arr = new Uint16Array(arr);
        for (var i in arr) {
            str += String.fromCharCode(arr[i]);
        }
        return getmld(str);
    }

    function bytesToBase64(e) {
        var r, a, c, h, o, t;
        for (c = e.length, a = 0, r = ''; a < c;) {
            if (h = 255 & e[a++], a == c) {
                r += base64EncodeChars.charAt(h >> 2),
                    r += base64EncodeChars.charAt((3 & h) << 4),
                    r += '==';
                break
            }
            if (o = e[a++], a == c) {
                r += base64EncodeChars.charAt(h >> 2),
                    r += base64EncodeChars.charAt((3 & h) << 4 | (240 & o) >> 4),
                    r += base64EncodeChars.charAt((15 & o) << 2),
                    r += '=';
                break
            }
            t = e[a++],
                r += base64EncodeChars.charAt(h >> 2),
                r += base64EncodeChars.charAt((3 & h) << 4 | (240 & o) >> 4),
                r += base64EncodeChars.charAt((15 & o) << 2 | (192 & t) >> 6),
                r += base64EncodeChars.charAt(63 & t)
        }
        return getmld(r);
    }

    function base64ToBytes(e) {
        var r, a, c, h, o, t, d;
        for (t = e.length, o = 0, d = []; o < t;) {
            do
                r = base64DecodeChars[255 & e.charCodeAt(o++)];
            while (o < t && r == -1);
            if (r == -1)
                break;
            do
                a = base64DecodeChars[255 & e.charCodeAt(o++)];
            while (o < t && a == -1);
            if (a == -1)
                break;
            d.push(r << 2 | (48 & a) >> 4);
            do {
                if (c = 255 & e.charCodeAt(o++), 61 == c)
                    return d;
                c = base64DecodeChars[c]
            } while (o < t && c == -1);
            if (c == -1)
                break;
            d.push((15 & a) << 4 | (60 & c) >> 2);
            do {
                if (h = 255 & e.charCodeAt(o++), 61 == h)
                    return d;
                h = base64DecodeChars[h]
            } while (o < t && h == -1);
            if (h == -1)
                break;
            d.push((3 & c) << 6 | h)
        }
        return getmld(d);
    }

//stringToBase64 stringToHex stringToBytes
//base64ToString base64ToHex base64ToBytes
//               hexToBase64  hexToBytes
// bytesToBase64 bytesToHex bytesToString


    function hookJavaEnc() {
        klogData("", "init", "javaEnc.js init hook success")
        var secretKeySpec = Java.use('javax.crypto.spec.SecretKeySpec');
        secretKeySpec.$init.overload('[B', 'java.lang.String').implementation = function (a, b) {
            let stacksInfo = getStacks();
            var result = this.$init(a, b);
            if (stacksInfo != '') klog(`${b}\n密钥: ${bytesToString(a)}, Hex: ${bytesToHex(a)}, B64: ${bytesToBase64(a)}${stacksInfo}`);
            return result;
        }

        var DESKeySpec = Java.use('javax.crypto.spec.DESKeySpec');
        DESKeySpec.$init.overload('[B').implementation = function (a) {
            let stacksInfo = getStacks();
            var result = this.$init(a);
            var bytes_key_des = this.getKey();
            if (stacksInfo != '') klog(`DES\n密钥: ${bytesToString(bytes_key_des)}, Hex: ${bytesToHex(bytes_key_des)}, B64: ${bytesToBase64(bytes_key_des)}${stacksInfo}`);
            return result;
        }

        DESKeySpec.$init.overload('[B', 'int').implementation = function (a, b) {
            let stacksInfo = getStacks();
            var result = this.$init(a, b);
            var bytes_key_des = this.getKey();
            if (stacksInfo != '') klog(`DES\n密钥: ${bytesToString(bytes_key_des)}, Hex: ${bytesToHex(bytes_key_des)}, B64: ${bytesToBase64(bytes_key_des)}${stacksInfo}`);
            return result;
        }

        var mac = Java.use('javax.crypto.Mac');
        var mac_algorithm = ''; // 算法名
        mac.getInstance.overload('java.lang.String').implementation = function (a) {
            var result = this.getInstance(a);
            mac_algorithm = a;
            return result;
        }
        mac.update.overload('[B').implementation = function (a) {
            // let stacksInfo = getStacks();
            this.update(a);
            // klog("======================================");
            // klog("update:" + bytesToString(a))
        }
        mac.update.overload('[B', 'int', 'int').implementation = function (a, b, c) {
            // let stacksInfo = getStacks();
            this.update(a, b, c)
            // klog("======================================");
            // klog("update:" + bytesToString(a) + "|" + b + "|" + c);
        }
        mac.doFinal.overload().implementation = function () {
            let stacksInfo = getStacks();
            var result = this.doFinal();
            if (stacksInfo != '') klog(`${mac_algorithm}\n${bytesToString(result)}, Hex: ${bytesToHex(result)}, B64: ${bytesToBase64(result)}${stacksInfo}`);
            return result;
        }
        mac.doFinal.overload('[B').implementation = function (a) {
            let stacksInfo = getStacks();
            var result = this.doFinal(a);
            let canshu = bytesToString(a).trim().split("\n");
            canshu = canshu.length > 1 ? canshu[0] + "..." : canshu[0];
            if (stacksInfo != '') klog(`${mac_algorithm}\n参数: ${canshu}\n结果: ${bytesToString(result)}\n - Hex: ${bytesToHex(result)}\n - B64: ${bytesToBase64(result)}${stacksInfo}`);
            return result;
        }

        var md = Java.use('java.security.MessageDigest');
        var md_algorithm = ''; // 算法名
        md.getInstance.overload('java.lang.String', 'java.lang.String').implementation = function (a, b) {
            // let stacksInfo = getStacks();
            md_algorithm = a;
            return this.getInstance(a, b);
        }
        md.getInstance.overload('java.lang.String').implementation = function (a) {
            // let stacksInfo = getStacks();
            md_algorithm = a;
            return this.getInstance(a);
        }
        md.update.overload('[B').implementation = function (a) {
            // let stacksInfo = getStacks();
            // klog("======================================");
            // klog("update:" + bytesToString(a))
            return this.update(a);
        }
        md.update.overload('[B', 'int', 'int').implementation = function (a, b, c) {
            // let stacksInfo = getStacks();
            // klog("======================================");
            // klog("update:" + bytesToString(a) + "|" + b + "|" + c);
            return this.update(a, b, c);
        }
        md.digest.overload().implementation = function () {
            let stacksInfo = getStacks();
            var result = this.digest();
            if (stacksInfo != '') klog(`${md_algorithm}\n结果Hex: ${bytesToHex(result)}\n -  B64: ${bytesToBase64(result)}${stacksInfo}`);
            return result;
        }
        md.digest.overload('[B').implementation = function (a) {
            let stacksInfo = getStacks();
            var result = this.digest(a);
            let canshu = bytesToString(a).trim().split("\n");
            canshu = canshu.length > 1 ? canshu[0] + "..." : canshu[0];
            if (stacksInfo != '') klog(`${md_algorithm}\n参数: ${canshu}\n结果Hex: ${bytesToHex(result)}\n -  B64: ${bytesToBase64(result)}${stacksInfo}`);
            return result;
        }

        var ivParameterSpec = Java.use('javax.crypto.spec.IvParameterSpec');
        ivParameterSpec.$init.overload('[B').implementation = function (a) {
            let stacksInfo = getStacks();
            var result = this.$init(a);
            let ivstr = bytesToString(a);
            let ivhex = bytesToHex(a);
            if (stacksInfo != '') {
                if (ivstr.length * 2 < ivhex.length) klog(`IV向量\nHex: ${ivhex}${stacksInfo}`);
                else klog(`IV向量, ${ivstr}\nHex: ${ivhex}${stacksInfo}`);
            }
            return result;
        }

        var cipher = Java.use('javax.crypto.Cipher');
        var cipher_res = '';
        cipher.getInstance.overload('java.lang.String').implementation = function (a) {
            // let stacksInfo = getStacks();
            var result = this.getInstance(a);
            cipher_res = a; // 模式填充
            return result;
        }
        cipher.init.overload('int', 'java.security.Key').implementation = function (a, b) {
            let stacksInfo = getStacks();
            var result = this.init(a, b);
            let _restemp = '';
            if (N_ENCRYPT_MODE == a) _restemp += " 加密\n";
            else if (N_DECRYPT_MODE == a) _restemp += " 解密\n";
            else _restemp += "\n";
            var bytes_key = b.getEncoded();
            _restemp += `密钥: ${bytesToString(bytes_key)}, Hex: ${bytesToHex(bytes_key)}, B64: ${bytesToBase64(bytes_key)}`;
            if (stacksInfo != '' && cipher_res.indexOf(_restemp) == -1) cipher_res += _restemp;
            return result;
        }
        cipher.init.overload('int', 'java.security.cert.Certificate').implementation = function (a, b) {
            let stacksInfo = getStacks();
            var result = this.init(a, b);
            let _restemp = '';
            if (N_ENCRYPT_MODE == a) _restemp += " 加密\n";
            else if (N_DECRYPT_MODE == a) _restemp += " 解密\n";
            else _restemp += "\n";
            if (stacksInfo != '' && cipher_res.indexOf(_restemp) == -1) cipher_res += _restemp;
            return result;
        }
        cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function (a, b, c) {
            let stacksInfo = getStacks();
            var result = this.init(a, b, c);
            let _restemp = '';
            if (N_ENCRYPT_MODE == a) _restemp += " 加密\n";
            else if (N_DECRYPT_MODE == a) _restemp += " 解密\n";
            else _restemp += "\n";
            var bytes_key = b.getEncoded();
            _restemp += `密钥: ${bytesToString(bytes_key)}, Hex: ${bytesToHex(bytes_key)}, B64: ${bytesToBase64(bytes_key)}`;
            if (stacksInfo != '' && cipher_res.indexOf(_restemp) == -1) cipher_res += _restemp;
            return result;
        }
        cipher.init.overload('int', 'java.security.cert.Certificate', 'java.security.SecureRandom').implementation = function (a, b, c) {
            let stacksInfo = getStacks();
            var result = this.init(a, b, c);
            let _restemp = '';
            if (N_ENCRYPT_MODE == a) _restemp += " 加密\n";
            else if (N_DECRYPT_MODE == a) _restemp += " 解密\n";
            else _restemp += "\n";
            if (stacksInfo != '' && cipher_res.indexOf(_restemp) == -1) cipher_res += _restemp;
            return result;
        }
        cipher.init.overload('int', 'java.security.Key', 'java.security.SecureRandom').implementation = function (a, b, c) {
            let stacksInfo = getStacks();
            var result = this.init(a, b, c);
            let _restemp = '';
            if (N_ENCRYPT_MODE == a) _restemp += " 加密\n";
            else if (N_DECRYPT_MODE == a) _restemp += " 解密\n";
            else _restemp += "\n";
            var bytes_key = b.getEncoded();
            _restemp += `密钥: ${bytesToString(bytes_key)}, Hex: ${bytesToHex(bytes_key)}, B64: ${bytesToBase64(bytes_key)}`;
            if (stacksInfo != '' && cipher_res.indexOf(_restemp) == -1) cipher_res += _restemp;
            return result;
        }
        cipher.init.overload('int', 'java.security.Key', 'java.security.AlgorithmParameters').implementation = function (a, b, c) {
            let stacksInfo = getStacks();
            var result = this.init(a, b, c);
            let _restemp = '';
            if (N_ENCRYPT_MODE == a) _restemp += " 加密\n";
            else if (N_DECRYPT_MODE == a) _restemp += " 解密\n";
            else _restemp += "\n";
            var bytes_key = b.getEncoded();
            _restemp += `密钥: ${bytesToString(bytes_key)}, Hex: ${bytesToHex(bytes_key)}, B64: ${bytesToBase64(bytes_key)}`;
            if (stacksInfo != '' && cipher_res.indexOf(_restemp) == -1) cipher_res += _restemp;
            return result;
        }
        cipher.init.overload('int', 'java.security.Key', 'java.security.AlgorithmParameters', 'java.security.SecureRandom').implementation = function (a, b, c, d) {
            let stacksInfo = getStacks();
            var result = this.init(a, b, c, d);
            let _restemp = '';
            if (N_ENCRYPT_MODE == a) _restemp += " 加密\n";
            else if (N_DECRYPT_MODE == a) _restemp += " 解密\n";
            else _restemp += "\n";
            var bytes_key = b.getEncoded();
            _restemp += `密钥: ${bytesToString(bytes_key)}, Hex: ${bytesToHex(bytes_key)}, B64: ${bytesToBase64(bytes_key)}`;
            if (stacksInfo != '' && cipher_res.indexOf(_restemp) == -1) cipher_res += _restemp;
            return result;
        }
        cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec', 'java.security.SecureRandom').implementation = function (a, b, c, d) {
            let stacksInfo = getStacks();
            var result = this.init(a, b, c, d);
            let _restemp = '';
            if (N_ENCRYPT_MODE == a) _restemp += " 加密\n";
            else if (N_DECRYPT_MODE == a) _restemp += " 解密\n";
            else _restemp += "\n";
            var bytes_key = b.getEncoded();
            _restemp += `密钥: ${bytesToString(bytes_key)}, Hex: ${bytesToHex(bytes_key)}, B64: ${bytesToBase64(bytes_key)}`;
            if (stacksInfo != '' && cipher_res.indexOf(_restemp) == -1) cipher_res += _restemp;
            return result;
        }
        cipher.update.overload('[B').implementation = function (a) {
            // let stacksInfo = getStacks();
            var result = this.update(a);
            // klog("======================================");
            // klog("update:" + bytesToString(a));
            return result;
        }
        cipher.update.overload('[B', 'int', 'int').implementation = function (a, b, c) {
            // let stacksInfo = getStacks();
            var result = this.update(a, b, c);
            // klog("======================================");
            // klog("update:" + bytesToString(a) + "|" + b + "|" + c);
            return result;
        }
        cipher.doFinal.overload().implementation = function () {
            let stacksInfo = getStacks();
            var result = this.doFinal();
            cipher_res += `\n结果: ${bytesToString(result)}\n - Hex: ${bytesToHex(result)}\n - B64: ${bytesToBase64(result)}${stacksInfo}`;
            if (stacksInfo != '') klog(cipher_res);
            return result;
        }
        cipher.doFinal.overload('[B').implementation = function (a) {
            let stacksInfo = getStacks();
            var result = this.doFinal(a);
            let canshu = '';
            if (cipher_res.indexOf(" 解密") != -1) {
                canshu = bytesToBase64(a);
            } else {
                canshu = bytesToString(a).trim().split("\n");
                canshu = canshu.length > 1 ? canshu[0] + "..." : canshu[0];
            }
            cipher_res += `\n参数: ${canshu}\n结果: ${bytesToString(result)}\n - Hex: ${bytesToHex(result)}\n - B64: ${bytesToBase64(result)}${stacksInfo}`;
            if (stacksInfo != '') klog(cipher_res);
            return result;
        }

        var x509EncodedKeySpec = Java.use('java.security.spec.X509EncodedKeySpec');
        x509EncodedKeySpec.$init.overload('[B').implementation = function (a) {
            let stacksInfo = getStacks();
            var result = this.$init(a);
            if (stacksInfo != '') klog(`RSA\n密钥: ${bytesToBase64(a)}, B64: ${bytesToBase64(a)}${stacksInfo}`);
            return result;
        }

        var rSAPublicKeySpec = Java.use('java.security.spec.RSAPublicKeySpec');
        rSAPublicKeySpec.$init.overload('java.math.BigInteger', 'java.math.BigInteger').implementation = function (a, b) {
            let stacksInfo = getStacks();
            var result = this.$init(a, b);
            if (stacksInfo != '') klog(`RSA\n密钥N: ${a.toString(16)}\n密钥E: ${b.toString(16)}${stacksInfo}`);
            return result;
        }

        var KeyPairGenerator = Java.use('java.security.KeyPairGenerator');
        KeyPairGenerator.generateKeyPair.implementation = function () {
            let stacksInfo = getStacks();
            var result = this.generateKeyPair();
            var str_private = result.getPrivate().getEncoded();
            var str_public = result.getPublic().getEncoded();
            if (stacksInfo != '') klog(`密钥对\n公钥Hex: ${bytesToHex(str_public)}\n私钥Hex: ${bytesToHex(str_private)}${stacksInfo}`);
            return result;
        }

        KeyPairGenerator.genKeyPair.implementation = function () {
            let stacksInfo = getStacks();
            var result = this.genKeyPair();
            var str_private = result.getPrivate().getEncoded();
            var str_public = result.getPublic().getEncoded();
            if (stacksInfo != '') klog(`密钥对\n公钥Hex: ${bytesToHex(str_public)}\n私钥Hex: ${bytesToHex(str_private)}${stacksInfo}`);
            return result;
        }
    };

    Java.perform(() => {
        hookJavaEnc();
    })
})();