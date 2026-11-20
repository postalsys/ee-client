// Reading back the MIME of sent messages in the specs

// The decoded body of the first MIME part of a type
export function decodePart(source, type) {
    const index = source.indexOf(`Content-Type: ${type}`);
    if (index < 0) {
        return null;
    }
    const part = source.slice(index);
    const headerEnd = part.indexOf('\r\n\r\n');
    const headers = part.slice(0, headerEnd);
    const body = part.slice(headerEnd + 4).split(/\r\n--/)[0];
    if (/Content-Transfer-Encoding: base64/i.test(headers)) {
        return Buffer.from(body.replace(/\s+/g, ''), 'base64').toString('utf8');
    }
    if (/Content-Transfer-Encoding: quoted-printable/i.test(headers)) {
        return Buffer.from(
            body.replace(/[=]\r\n/g, '').replace(/[=]([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))),
            'binary'
        ).toString('utf8');
    }
    return body;
}

export const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A header of a raw message, unfolded
export function headerOf(source, name) {
    const match = source.match(new RegExp(`^${escapeRegExp(name)}: ((?:.*)(?:\\r\\n[ \\t].*)*)`, 'mi'));
    return match ? match[1].replace(/\r\n[ \t]+/g, ' ') : null;
}
