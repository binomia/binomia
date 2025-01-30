

let size = 10


for (let i = 1; i <= size; i++) {
    let leaf = "#".repeat(i)
    const leftSpace = (size - leaf.length)


    console.log(leftSpace, leaf, size - leftSpace);


}

// size - i