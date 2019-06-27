let commands = require("./data.json");

function loadCOmmands() {

    commands = {};

    $('#commands > div.container > ul > li').each(function() {
        let expression = $(this).find('>a>span.command').text().replace(/\s+/g, ' ').trim();
        let cmd = expression.match(/^([-\w]+)/)[1].toLowerCase();
        cmd = commands[cmd] = {
            expression,
            description: $(this).find('>a>span.summary').text().replace(/\s+/g, ' ').trim(),
            "args": expression.match(/\[.+?\]|[-\w]+/g).slice(1).map(x => x[0] === '[' ? {
                "required": false,
                "pieces": x.slice(1, -1).match(/\S+|\.+/g),
                "array": false
            } : {
                "required": true,
                "pieces": [x],
                "array": false
            })
        };
    });
}

const newCommands = [];

for (const k in commands) {

    const raw = commands[k];

    if (!raw.expression) {

        continue;
    }

    const cmd = {
        "name": raw.expression.match(/^\w+/)[0].toLowerCase(),
        "params": []
    };
    let ok = true;

    for (let i = 0; i < raw.args.length; i++) {

        const a = raw.args[i];

        if (!i) {

            cmd.params.push(raw.args[i]);
            continue;
        }

        if (a.pieces[a.pieces.length - 1] !== "...") {

            cmd.params.push(raw.args[i]);
            continue;
        }

        if (a.pieces.slice(0, -1).join(",") !== cmd.params.slice(-a.pieces.length + 1).map(x => x.pieces.join(",")).join(",")) {

            ok = false;
            break;
        }

        a.pieces.pop();
        a.required = a.array = true;

        cmd.params.splice(-a.pieces.length, a.pieces.length);
        cmd.params.push(a);
    }

    if (!ok) {

        console.error(cmd);
    }

    newCommands.push(cmd);
}

console.log(JSON.stringify(newCommands, null, 2));
