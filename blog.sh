#!/bin/bash

s=""

dfs(){
    prefix=$1
    for file in $(ls $prefix)
    do
        if [ -d "$prefix/$file" ];
        then
            s=$s$file'\n'
            s=$s'<blockquote>\n'
            dfs $prefix/$file
            s=$s'</blockquote>\n'
        else
        pre=${prefix#??}
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
                        console.log(s)
                    }
                }
                let location = window.location.pathname.substring(index + 1)
                xhr.open(GET, "https://go75.github.io/blog/"+window.location.hash)
                xhr.send()
            }
            xhr.open('GET', "https://go75.github.io/README.md");
            xhr.send();
        }
    </script>
</body>
</html>' >> ./blog.html

echo blog脚本执行成功