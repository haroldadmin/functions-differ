export default function prettify(obj: any, jsonSpacing = 2): string {
    return JSON.stringify(obj, null, jsonSpacing);
}
