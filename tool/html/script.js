input.value = '<h1>醉墨居士</h1>'
output.innerHTML = input.value
opt = 0
var turn = new TurndownService()
input.oninput = (evt) => {
    input.value = evt.target.value
    switch (opt) {
        case 0:
            output.innerHTML = input.value
            break
        case 1:
            output.innerText = turn.turndown(input.value)
            break
    }
}

preview.onclick = () => {
    opt = 0
    output.innerHTML = input.value
}

html2md.onclick = () => {
    opt = 1
    output.innerText = turn.turndown(input.value)
}