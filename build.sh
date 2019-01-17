#!/bin/bash

PACKAGE=""

function usage(){
    echo "使用方法: ./build.sh -T dev|beta|gray|prod [other args]..."
    echo "例如  ./build.sh -T dev2 --install false --mini false"
}

function notify(){
    echo "__BUILD_PACKAGE__: $PACKAGE" >&2
}

#######################################################################
#  自定义脚本
#######################################################################
function compile(){
    local env=$(echo $tag | sed 's/[0-9]//g')
    local group=$(echo $tag | sed 's/[^0-9]//g')
    local install="$install"
    local mini="$mini"

    # 默认执行 npm install 默认 压缩代码
    if [ "$install" == "" ]; then
        install="true"
    fi
    if [ "$mini" == "" ]; then
        mini="true"
    fi
    
    # 线上发布强制安装包并压缩代码
    if [ "$env" == "prod" ] ; then
        install="true"
        mini="true"
    fi

    if [ "$install" == "true" ]; then
        echo "更新缓存 npm install"
        # npm install >/dev/null
        npm install
        if [[ $? != 0 ]]; then
            echo "更新缓存失败"
            return 1
        fi
        echo "更新缓存完成"
    else
        echo "不更新node module缓存"
    fi
    
    export env="$env"
    if [ "$group" != "" ]; then
        export num="$group"
    fi

    if [ "$mini" == "true" ]; then
        export mini="true"
    fi

    echo "编译 npm start"
    # npm start >/dev/null
     npm start
    if [[ $? != 0 ]]; then
        echo "编译失败"
        return 1
    fi
    return 0
}
function build(){
    echo "Tag: $tag"
    echo "============================="

    TARGET='target'
    FILENAME='package.zip'

    echo "准备环境.."
    if [[ ! -d "$TARGET" ]]; then
        mkdir -p "$TARGET"
    fi
    package="$TARGET/$FILENAME"

    echo ""编译源码..
    compile
    if [[ $? != 0 ]]; then
        echo "构建失败"
        return 1
    fi

    echo "打包.."
    zip -r $package dist
    if [[ $? == 0 ]]; then
        PACKAGE=$package
        echo "构建完成"
        return 0
    fi
  
    echo "构建失败"
    return 1
}
#######################################################################


#### 参数解析 #####
key=''
value=''
for it in "$@" ; do
    if [[ $it == '-T' ]]; then
        key='tag'
    elif [[ $it == --* ]]; then
        key=${it##*--}
    elif [[ $it == -* ]]; then
        key=${it##*-}
    else
        value="$it"
        eval "$key='$value'"
        key=''
        value=''
    fi
done

if [[ ! $tag =~ ^(dev|beta|gray|prod) ]]; then
    usage
    exit 1
fi

build && notify
