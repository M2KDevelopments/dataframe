export function fileDetector(text) {
    if (text.includes(`mongoose`) && (text.includes(`require`) || text.includes(`import`))) {
        return "mongo";
    } else if (text.includes("drizzle-orm") && (text.includes(`require`) || text.includes(`import`))) {
        return "drizzle";
    } else if (text.includes("CREATE") && text.includes("(") && text.includes(")")) {
        return "sql";
    } else if (text.includes("model ")) {
        return "prisma";
    } else {
        try {
            JSON.parse(text);
            return "json";
        } catch (e) {
            console.warn('JSON Parse Error', e.message);
            return ""
        }
    }
}

export function parseDataFrameFile(text) {
    try {
        const json = JSON.parse(text);
        if (!Array.isArray(json)) return [];
        for (const item of json) {
            if (item['timestamp'] == undefined) {
                //console.log('No timestamp')
                return [];
            }

            if (typeof item['timestamp'] != 'boolean') {
                //console.log('No timestamp')
                return [];
            }

            if (!item['name']) {
                //console.log('No name')
                return [];
            }

            if (typeof item['name'] != 'string') {
                //console.log('No name')
                return [];
            }

            if (!item['fields']) {
                //console.log('No fields')
                return [];
            }

            if (!Array.isArray(item['fields'])) {
                //console.log('Fields is not an array')
                return [];
            }

            for (const field of item['fields']) {
                if (!field['name']) {
                    //console.log('No field name')
                    return [];
                }

                if (typeof field['name'] != 'string') {
                    //console.log('No field name')
                    return [];
                }

                if (!field['type']) {
                    //console.log('No field type')
                    return [];
                }

                if (typeof field['type'] != 'string') {
                    //console.log('No field type')
                    return [];
                }


                if (field['foreignkey'] == undefined || field['foreignkey'] == null) {
                    //console.log('No field foreignkey')
                    return [];
                }

                if (typeof field['foreignkey'] != 'string') {
                    //console.log(field)
                    //console.log('No field foreignkey')
                    return [];
                }
            }

            // Auto adjust position on canvas
            if (item['x'] == undefined) item['x'] = 90;
            if (item['y'] == undefined) item['y'] = 90;
        }

        return json;
    } catch (e) {
        console.warn('JSON Parse Error', e.message);
        return [];
    }
}