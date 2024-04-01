
export function getStack(xy, l) {
    const stack = Math.floor(xy/l)
    const stackBox = Math.round(((xy/l)-stack) * l)
    const iStart = stack*l  
    const iEnd = iStart+(l-1)
    return [iStart, iEnd, {
        stack,
        stackBox
    }]
}

export function getLineH(cell, x,y,l=3) {
    const [iStartH,iEndH] = getStack(x, l)
    const [iStartV,iEndV] = getStack(y, l)
    const indexs = []
    let j = iStartV
    console.log(iStartV);
    const line = cell.slice(iStartV, iEndV+1).map(v => {
        for (let i = 0; i < l; i++) {
            indexs.push({x: j, y: iStartH+i})
        }
        j++
        return v.slice(iStartH, iEndH+1)
    }).flat()

    console.log('H', line, indexs);
    return {
        type: 'horizontal',
        val: cell[x][y],
        line,
        indexs
    }
}

export function getLineV(cell, x,y,l=3) {
    const [_a,_b, {stackBox}] = getStack(x, l)
    const val = cell[x][y]
    x = stackBox
    const ln = []
    const indexs = []
    for (let j = 0; j < l; j++) {
        const r = cell[x]
        let s = y
        for (let i = 0; i < l; i++) {
            ln.push(r[s])
            indexs.push({x: x, y: s})
            s+=l
        }
        x+=l
    }

    console.log('V', ln);

    return {
        type: 'vertical',
        val,
        line: ln,
        indexs, 
    }
}


function getRowLine(board) {
    board.
}