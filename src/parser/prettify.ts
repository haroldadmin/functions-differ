export default function prettify(obj: unknown, jsonSpacing = 2): string {
    return JSON.stringify(obj, null, jsonSpacing);
}
