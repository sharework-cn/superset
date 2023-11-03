# INSTRUCTION ABOUT WORK WITH SUPERSET

## Setup the local environment

### Install Python dependencies

* python-ldap  

Downgrade the version of **python-ldap** to 3.4.0, and install the `.whl` file from [Christoph Gohlke’s page](https://www.lfd.uci.edu/~gohlke/pythonlibs/)

## Front End

* puppeteer  
Set the environment variable PUPPETEER_SKIP_DOWNLOAD to true, for windows you may need to set it in **Control Panel**.
* prettier/prettier  
For windows, you may need to config the `prettier/prettier` as:

```js
"prettier/prettier": [
  "error",
  {
    "endOfLine": "auto"
  }
]
```

You need to modify the config file of eslint, which file name is `.eslintrc.js`. Please be noticed that there's some **overrides** configuration.

## Runtime Warnings

There are some warnings when run/build the superset in development mode, it may need to be improved in production.

### In-memory storage for tracking rate limits

UserWarning: Using the in-memory storage for tracking rate limits as no storage was e
xplicitly specified. This is not recommended for production use. See: https://flask-limiter.readthedocs.io#configuring-a-storage-backend for documentation about configuring the storage backend.

### Performance consideration

\superset\superset\commands\importers\v1\utils.py:113: SAWarning: TypeDecorator EncryptedType() will not produce a cache key because the ``cache_ok``
attribute is not set to True.  This can have significant performance implications including some performance degradations in comparison to prior SQLAlchemy versions.  Set this attribute to True if this type object's state is safe to use in a cache key, or False to disable this warning. (Background on this error at: https://sqlalche.me/e/14/cprf)


# SETUP - Run from source
本文档记录了在本地开发环境及生产环境安装和运行**Superset**的步骤和问题。对于湖南财信版本，在安装和配置时有一些特别考虑。本文档中列出的步骤，不一定全部都要执行，比如如果代码已经从湖南财信GitLab中获得，则代码层面的修改就无需重复做了（这种情况被标记为`【CODE REVISION】`）。  
如果仅关心生产环境如何安装，可以直接跳转【[此处](#生产环境安装)】
## 参考运行环境
* Python 3.9
* NodeJs 12.14.0
* Npm 6.13.4
* Git  
* 操作系统为Windows 10或CentOs 7.x（生产环境）
## 下载项目与环境安装
### 下载源代码
通过**Github**下载官网版本：  
`git clone https://github.com/apache/superset.git`  
或者通过其他途径获得湖南财信的定制化版本。在本文档中不涉及此方法。  
### 安装Python
参考以下链接安装Python 3.9及以上版本  
<https://blog.csdn.net/weixin_31476015/article/details/113967501>
### 建立和激活Python虚拟运行环境
每个项目所依赖的Python库或版本都不一样，因此需要为每个项目建立一个虚拟的Python运行环境（添加的依赖包只是本项目使用，对其他项目不产生影响），并进行激活  
* 安装`virtualenv`  
`pip install virtualenv -i https://pypi.tuna.tsinghua.edu.cn/simple`  
* 创建虚拟环境
在项目主目录下执行下列命令创建一个名为`venv`（这是默认名称）的虚拟环境  
`virtualenv`  
并执行下列命令激活虚拟环境  
`venv/scripts/activate`
### 设置项目SDK  
**IntelliJ Idea**
* Project Structure -> SDKs，添加虚拟环境中的可执行文件  

**PyCharm**
* Project -> Project Interpreter，添加虚拟环境中的可执行文件

**VS Code**  
* 参考<https://code.visualstudio.com/docs/python/python-tutorial>获得如何配置Python Interpreter的信息
### 允许项目进行调试  
本项目为Flask项目，因此与一般调试Python程序的方法有所不同。不关心如何调试本项目的话可略过本节。   
**IntelliJ Idea**  
* 对于使用IntelliJ Idea进行调试的方法尚不明了。  

**PyCharm**  
* PyCharm旗舰版提供了调试`Flask Server`的功能，在"Edit Configuration"菜单界面中，添加`Flask Server`，`Target Type`为**Script Path**，`Target`为`<project home>\superset\run.py`，`Application`为`flask`，`FLASK_ENV`为`development`，勾选`FLASK_DEBUG`，并指定`Python Interpreter`即可。参见<https://www.jianshu.com/p/9133ec31bc39>  

**VS Code**  
* 对于VS Code，可以修改`.vscode/launch.json`，参考如下内容进行配置。配置完成后，需要重启VS Code  
```
{
    // 使用 IntelliSense 了解相关属性。 
    // 悬停以查看现有属性的描述。
    // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Flask",
            "type": "python",
            "request": "launch",
            "module": "flask",
            "env": {
                "FLASK_APP": "superset\\app.py",
                "FLASK_ENV": "development"
            },
            "args": [
                "run",
                "--no-debugger"
            ],
            "jinja": true,
            "justMyCode": false
        }
    ]
}
```
### 其他注意事项
#### IntelliJ IDEA性能考虑  
对于IntelliJ Idea来说，本项目可能导致不停创建索引。其原因是前端的`node_modules`目录太大（如果Python的虚拟目录
也在这个项目路径下，也是其中原因之一），此时需要将相关目录排除在项目以外。操作时，为了确保排除生效，可以先Include，再
Exclude。  
排除之后，重启IDE。如果问题仍旧出现，可尝试如下步骤：  
* 删除.idea目录
* 重启IDE
* 暂停正在进行的`indexing`
* 排除上述目录
* 再次重启IDE

### 安装后台依赖
请留意Python虚拟环境是否已经激活（命令提示符前面有(venv)等字样——其中venv为虚拟环境的名称）。在superset项目主目录中，运行
`pip install -r requirements\local.txt -i https://pypi.tuna.tsinghua.edu.cn/simple`  
遇到的主要问题及解决办法  
1. 需要Visual C++ 14.0 Build Tools  
可以参考第3点的问题，在构建相应的依赖包时，直接安装已经编译好的whl包（推荐）。如果没有找到可供安装的whl包，则可以安装单独的Visual C++构建工具。下载地址为：<https://pan.baidu.com/s/1qtwJeFTIpdWCKQJS0c2Ayg>，提取码为**pnic**（安装时，可执行文件名为VisualCppBuildTools_Full.exe，并且需要加载其中的iso文件——以便安装依赖包（solved packages））。  
2. use_2to3 is invalid  
   将setuptools降级（不要试图修改requirements文件，setuptools不适合作为一项requirement安装）：
   `pip install setuptools==57.5.0`
3. 特定依赖包无法编译：下列依赖包在Windows环境中不能顺利地编译，因此从
<https://www.lfd.uci.edu/~gohlke/pythonlibs/>网站中下载相应平台的包（注意平台、Python版本），
直接install，并修改`requirements/development.txt`中引用的版本号  
   * psycopg2-binary==2.9.2  
   * sasl==0.3.1  
   * pillow=8.4.0
   * urllib3 (for Linux)  
本项目中已经包含了适用于Windows环境，Python 3.9的依赖包，  
在`requirements/whl`目录中。可以直接安装：  
`pip install requirements/whl/xxx.whl`  
例如，对于sasl来说，可以直接安装   
`pip install sasl-0.3.1-cp39-cp39-win_amd64.whl`
（留意文件名中`cp39`和`amd64`这样适配特定Python版本和操作系统的字样）
#### Linux安装
在Linux环境中，如果python的版本错乱，典型地，系统中存在python2等，执行时就会出现奇奇怪怪的一些错误。因此首先应当确认python及pip的版本正确（推荐使用3.9版本，不推荐修改python这个软链——因为那样的话系统中很多工具都会报错，而是运行python3及pip3来进行环境安装）  
另外在Linux环境下安装时，可能会存在一些错误，解决办法如下：  
* mysqlclient：  
```
wget http://repo.mysql.com/mysql57-community-release-el7-8.noarch.rpm
yum install mysql57-community-release-el7-8.noarch.rpm
yum install mysql-devel
yum install mysql-connector-c++.x86_64
pip3 install mysqlclient
```
* sasl：
```
yum -y install cyrus-sasl cyrus-sasl-devel cyrus-sasl-lib
```
* cc1plus：
```
yum install gcc-c++
```
### 直接修改依赖包的情形
部分功能直接修改了Python依赖包，需要将其复制到对应的依赖包中，例如：
```
cp -r <project dir>/superset/libpatches <venv dir>/venv/lib/<python with version number>/site-packages
```
### 安装前台依赖
在项目的**superset-frontend**子目录执行下列命令  
* `npm install`
下载时间比较长，如果遇到问题，尝试将一部分内容通过国内源下载，方法如下：
> * 在`package.json`中，将`@storybook`开头的依赖包临时删除（删除的内容临时放到另一个文本文件中），因为这些包在淘宝源中找不到
> * 更改npm源为淘宝，执行安装  
> ```
> npm config set registry https://registry.npm.taobao.org  
> npm install
> ``` 
> * 将`@storybook`开头的依赖包加回来
> * 更改npm源为官方源，执行安装  
> ```
> npm config set registry https://registry.npmjs.org/  
> npm install
> ```
* `【CODE REVISION】`对于Windows系统，在`webpack.config.js`中增加以下代码：  
```
   {  
      test: /(\.jsx|\.js)$/,  
      use: {  
        loader: 'babel-loader',  
        options: {  
          presets: ['@babel/preset-react', '@babel/preset-env'],  
          plugins: ['@babel/plugin-transform-runtime'],  
        },  
      },  
      exclude: /node_modules/,  
   },
```
* `【CODE REVISION】`对于Windows系统，在`package.json`中查找**dev-server**的那一行，确保其命令参数的前面添加了**`cross-dev`**：  
`"dev-server": "cross-env NODE_ENV=development BABEL_ENV=development node --max_old_space_size=4096 ./node_modules/webpack-dev-server/bin/webpack-dev-server.js --mode=development",`，对于Mac OS则需要去掉cross-env
* `【CODE REVISION】`前端默认将后台的端口指向8088，但是在本地开发环境中，这个端口默认为5000，需要在`webpack.proxy-config.js`中，
对如下语句进行修改：  
```
const backend = (supersetUrl || `http://localhost:5000`).replace(
  '//+$/',
  '',
); // strip ending backslash
```

## 系统安装
系统安装参考了以下链接  
* <https://blog.csdn.net/weixin_45557389/article/details/109785210>
* <https://www.jianshu.com/p/b02fcea7eb5b>
* <https://rensong.gitbook.io/superset>
### 安装superset
安装superset后，才能通过这些命令对数据库进行初始化并创建用户(请留意Python虚拟环境是否已经激活)。  
`pip install apache-superset -i https://pypi.tuna.tsinghua.edu.cn/simple`
### 数据库初始化并创建管理员用户
【警告】只有创建新环境时，才需要执行下列操作，否则请跳过。  
* 确认数据库连接配置正确。该配置信息位于`superset/config.py`的`SQLALCHEMY_DATABASE_URI`变量中，对于GitHub中下载的版本，无需修改，因此其使用的是内置的SqlLite数据库
* `superset db upgrade`
* `setx FLASK_APP superset`（Windows）或者`export FLASK_APP=superset`（Linux）
* `flask fab create-admin`（填写默认信息即可，请记住admin的密码）
* `superset init`
### 运行系统
通过以下步骤运行系统：
* 运行后台：在项目主目录运行`python -m flask run`
* 运行前端：在superset-frontend目录执行`npm run dev-server`
## 生产环境安装
### 前提条件
生产环境安装，假定已经满足下列条件：  
* 操作系统版本CentOs 7.x
* 已经安装Python 3.7+，并且已经设置好python3和pip3的软链
* 已经通过virtualenv等工具创建了python虚拟环境，虚拟环境的目录当前用户可读写，并且已经激活
* 代码已经通过git等方法抓取到了服务器上
* 已经提供了Nginx、数据库服务器和Redis，并且通过telnet等方法确认可以正常访问  
### 部署架构和环境
生产环境的目标部署架构为：  
graph LR
  nginx("Nginx:8079")-->superset("Superset:5000")
  superset-->db("mysql:3306")
  superset-->redis("redis:6379")

在目录结构方面，建议以如下方式安排目录：  
```
/opt  
  /touyan  
    src(软链，指向源码目录)
    superset.prod.conf（生产环境配置文件）
    start.sh（生产环境启动文件）
/home/<user home>
  /src
    /touyan（源码目录）
```  
上述方式较好地实现了代码和配置分离，无论代码如何被更新，生产的配置不会被无意更改。  

### 安装步骤
#### 安装Python运行环境依赖包
1. 确保当前是在正确的python虚拟环境（命令行提示符前有(xxx)字样）  
2. setuptools降级：`pip install setuptools==57.5.0`
3. 准备操作系统方面的依赖包：  
```
wget http://repo.mysql.com/mysql57-community-release-el7-8.noarch.rpm
yum install mysql57-community-release-el7-8.noarch.rpm
yum install -y mysql-devel mysql-connector-c++.x86_64 cyrus-sasl cyrus-sasl-devel cyrus-sasl-lib gcc-c++
```  
4. 安装Python依赖包  
```
cd <project dir>
pip3 install -r requirements/local.txt
```
5. 修改Python依赖包  
部分功能直接修改了Python依赖包，需要将其复制到对应的依赖包中，例如：
```
cp -r <project dir>/superset/libpatches <venv dir>/venv/lib/<python with version number>/site-packages
```
#### 准备前端静态文件
前端静态文件可以从开发环境打包，再复制到项目的目录，如下所示：  
* 开发环境
```
cd <project dir>/superset-frontend
npm install
npm run build
```
该构建过程会将前端代码打包至`<project dir>/superset/static`目录
* 生产环境  
将开发环境的`<project dir>/superset/static`目录覆盖至生产环境。

#### 安装superset以及对数据库进行初始化
【警告】这个步骤可能会对数据库进行修改，如果不是初始安装，可以跳过此步骤
1. 确认数据库连接配置正确。该配置信息位于`superset/config.py`的`SQLALCHEMY_DATABASE_URI`变量中，例如：  
`SQLALCHEMY_DATABASE_URI = 'mysql://<user_name>:<password>@host:port/schema_name'`
2. 安装superset（只是获得其可执行文件用于数据库初始化）  
`pip install apache-superset -i https://pypi.tuna.tsinghua.edu.cn/simple`
3. 执行下列命令：   
```
superset db upgrade
export FLASK_APP=superset
flask fab create-admin
superset init
```  
#### 生产环境运行目录准备
1. 创建目录：
```
sudo mkdir -p /opt/touyan
sudo mkdir -p /var/log/superset
sudo ln -s <project dir> /opt/touyan/src
```   
2. 设置目录权限：  
```
sudo chmod 644 /opt/touyan
sudo chmod 666 /var/log/superset
```
3. 编辑启动文件：`sudo vi /opt/touyan/start.sh`  
在下面的启动文件中，将激活python虚拟环境，设置环境变量，并运行superset。  
```
cd /opt/touyan/src
source ./venv/bin/activate
export FLASK_APP=superset
export HNCHASING_CONFIGURATION_FILE="/opt/touyan/superset.prod.conf"
nohup python3 -m flask run -p 5000 --with-threads --reload > /var/log/superset/superset.log &
```
4. 获知生产可用字体：
```
[touyan]$ fc-list
/usr/share/fonts/dejavu/DejaVuSansCondensed-Oblique.ttf: DejaVu Sans,DejaVu Sans Condensed:style=Condensed Oblique,Oblique
...
```   
上述`/usr/share/fonts/dejavu/DejaVuSansCondensed-Oblique.ttf`即是可用的字体文件  
4. 编辑生产环境配置文件：`sudo vi /opt/touyan/superset.prod.conf`  
Superset可供配置的地方非常多（参见源码中的`superset/config.py`），而在现在这个配置文件中，仅仅把生产需要用到的提取出来进行覆盖：  
```
# ----------------------------------
# The SQLAlchemy connection string.
# ----------------------------------
SQLALCHEMY_DATABASE_URI = 'mysql://<user_name>:<password>@<host>:<port>/<scheme_name>'
# ----------------------------
# Redis based Session storage
# ----------------------------
SESSION_TYPE = 'redis'  # Use sqlalchemy
SESSION_KEY_PREFIX = 'superset-session:'  # value prefix
SESSION_REDIS_HOST = "<redis host>"
SESSION_REDIS_PORT = <redis port>
SESSION_REDIS_USERNAME = "default"
SESSION_REDIS_PASSWORD = "<password>"
# ---------------
# Other settings
# ---------------
# Secret Key
SECRET_KEY = "ffb89bff7b696c65b0ad3c5294d3c8a33744fa77fb1237b25f7338521c7bebc8"
# Server Name
SERVER_NAME = "localhost:5000"   # Since this server is delegated by Nginx, only request from localhost is accepted
# Session timeout in minutes
SESSION_TIMEOUT_IN_MINUTE = 15
# Font path for captcha display
PIL_FONT_PATH = "/usr/share/fonts/dejavu/DejaVuSansCondensed-Oblique.ttf"
LOG_LEVEL = "DEBUG"
```  
除了数据库和Redis配置，上述要留意的还包括：
* SERVER_NAME：加上localhost:5000，则Superset只允许本机访问
* SESSION_TIMEOUT_IN_MINUTE：会话会在无操作15分钟后过期
* PIL_FONT_PATH：图形验证码字体文件
* LOG_LEVEL：日志输出的级别（运行稳定后，应该改为WARNING）
#### Nginx配置
在生产环境，Superset不直接对外访问，而是在其之外加了一层Nginx，这样做的好处是Nginx性能较高，擅长进行一些策略设置，而且当以后架构变化时只需要修改Nginx即可。  
Nginx配置如下：
```
[chasing]$ sudo vi /etc/nginx/conf.d/superset.conf
server {
    listen   8079;
    # listen   8079 ssl;
    # server_name  *;

    location / {
        proxy_pass http://localhost:5000;
        root    html;
        index   index.html index.htm;
    }

#    ssl_certificate         <path to cert.pem>;
#    ssl_certificate_key     <path to privkey.pem>;
#    ssl_session_timeout     5m;
#    ssl_protocols           TLSv1.2;
#    ssl_ciphers             TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDH
E-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
#    ssl_prefer_server_ciphers on;
}
```   
在上述配置中，Nginx为Superset配置了8079的访问端口，所有访问这个端口的请求都将被导向`http://localhost:5000`。   
【注意】在生产环境进一步阶段，如果已经明确了域名，发放了证书，则可以修改此配置文件以使其支持https方式访问（配置文件已经准备相关的配置参数）。
#### 日志切割配置
Supserset的日志将输出至/var/log/supserset目录，为了避免日志过大，对其按1M大小，每天进行切割（先到达的条件为准），保留最近10个日志文件，如下所示：
```
[chasing]$ sudo vi /etc/logrotate.d/superset
/var/log/superset/*log {
    create 0664 <user> <group>
    daily
    dateext
    minsize 1M
    rotate 10
    missingok
    notifempty
    sharedscripts
}
```

#### 防火墙配置
主机需要允许外部访问8079端口，如果已经启用主机防火墙，则需要打开8079端口，如下所示：  
```
sudo firewall-cmd --add-port=8079/tcp --per
sudo systemctl restart firewalld
```
#### 运行Superset
1. 运行Superset：`/opt/touyan/start.sh`
2. 检查Superset是否已经运行：`wget http://localhost:5000`
3. 重启Nginx：`nginx -s reload`
4. 检查外部是否可以访问Superset（通过浏览器访问`http://<server ip>:8079`）
#### 更多配置
包括配置服务器证书，配置Nginx的Server Name等，在此不再一一描述。

