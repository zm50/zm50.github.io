input.value = '# 醉墨居士'
output.innerHTML = marked.parse(input.value)
opt = 0
input.oninput = (evt) => {
    input.value = evt.target.value
    let text = marked.parse(input.value)
    switch (opt) {
        case 0:
            output.innerHTML = text
            break
        case 1:
            output.innerText = text
            break
    }
}

preview.onclick = () => {
    opt = 0
    output.innerHTML = marked.parse(input.value)
}

md2html.onclick = () => {
    opt = 1
    output.innerText = marked.parse(input.value)
}