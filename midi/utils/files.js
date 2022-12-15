const fsPromises = require('fs/promises')

exports.GetMidiFilesInFolder = (folderName) => {
    try {
        // directory path

        const files = fs.readdirSync(folderName)

        // files object contains all files names
        // log them on console
        files.forEach(file => {
            console.log(file)
        })

        return files;
    } catch (err) {
        console.error(err)
        return [];
    }
}

