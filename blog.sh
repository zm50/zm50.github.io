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
            pre=${1#??}
            s=$s"<a href=\"$pre/$file\">$file</a><br>"
        fi
    done
}

dfs "./blog"

sed -i '18,$ d' ./blog.html

echo $s >> ./blog.html

echo '`' >> ./blog.html

echo '} else {
                var xhr;
                if (window.XMLHttpRequest) {
                    xhr = new XMLHttpRequest();
                } else {
                    xhr = new ActiveXObject('Microsoft.XMLHttp');
                }
    
                xhr.onreadystatechange = function() {
                    if(xhr.readyState == 4 && xhr.status == 200) {
                        var s = marked.parse(xhr.responseText);
                        document.getElementById('content').innerHTML = s;
                    }
                }
                console.log("https://go75.github.io/blog/"+path)
                xhr.open("GET", "https://go75.github.io/blog/"+path)
                xhr.send()
            }
        }
    </script>
</body>
</html>' >> ./blog.html

echo blog脚本执行成功