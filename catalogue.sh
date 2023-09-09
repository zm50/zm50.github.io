#!/bin/bash

s=""

dfs(){
    for file in $(ls $1)
    do
        if [ -d "$1/$file" ];
        then
            s=$s$file'\n'
            s=$s'<blockquote>\n'
            dfs $1/$file
            s=$s'</blockquote>\n'
        else
            src=https://go75.github.io/blog#${1#???????}/$file
            s=$s"<a href=\"$src\">$file</a><br>"
        fi
    done
}

dfs "./blog"

sed -i '9,$ d' ./catalogue.html

echo $s >> ./catalogue.html

echo '</body>
</html>' >> ./catalogue.html

echo blog脚本执行成功