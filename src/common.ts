import { sign } from "jsonwebtoken";

export function pick<T extends object, K extends keyof T>(obj: T, props: K[]): Pick<T, K> {
    return Object.fromEntries(props.filter(prop => prop in obj).map(prop => [prop, obj[prop]])) as Pick<T, K>;
}

export function extend(first: any, ...rest: any[]) {
    return Object.assign(first, ...rest)
}

export function omit(obj: any, ...keys: string[]) {
    const result = extend({}, obj)
    keys.forEach((key) => delete result[key])
    return result
}

export async function defaults(schema: any, doc: any, params: any) {
    const arr = Object.keys(schema)
        .filter(key => schema[key].default && typeof schema[key].default === 'string' && schema[key].default.includes('$.'))
        .map(key => ({ name: key, default: schema[key].default }));

    for (let index = 0; index < arr.length; index++) {
        const { name, default: defaultValue } = arr[index]

        if (!doc[name])
            doc[name] = defaultValue
    }

    return await replacer(doc, params);;
}

export async function replacer(value: any, params: any) {
    if (typeof value === 'string' && value.includes('$.')) {
        const [_, a, b] = value.split('.');

        switch (typeof params[a]) {
            case "object":
                return await replacer(params[a][b], params);
            case "function":
                return await params[a](b);
            default:
                return params[a];
        }
    } else if (typeof value === 'object' && value !== null) {
        for (const key in value) {
            value[key] = await replacer(value[key], params);
        }
    }
    return value;
}

export function hasPermission(
    userPermissions: string[],
    permissionsJson: any,
    method: string
): boolean {
    if (!userPermissions) {
        userPermissions = ["*"];
    }

    if (!userPermissions.includes("*")) {
        userPermissions.push("*");
    }

    if (typeof permissionsJson !== "object" || permissionsJson === null) {
        return false;
    }

    for (const permission of userPermissions) {
        if (permissionsJson[permission] === true) {
            return true;
        }

        if (typeof permissionsJson[permission] === "object") {
            const methodPermissions = permissionsJson[permission];
            if (methodPermissions === true) {
                return true;
            }

            if (method in methodPermissions) {
                const methodValue = methodPermissions[method];
                if (methodValue === true || typeof methodValue === "object") {
                    return true;
                }
            }
        }
    }
    return false;
}

export function getPermissions(permissions: string[], json: {
    [key: string]: boolean | { [method in string]?: boolean | { [key: string]: any } };
}, method: string, key: string): any {
    if (!permissions)
        permissions = ["*"]

    if (!permissions.includes("*"))
        permissions.push("*")

    for (const perm of permissions) {
        if (!json[perm]) continue;

        const value = json[perm];
        if (value === true) return true;

        if (typeof value === "object" && method in value) {
            const methodValue = value[method];
            if (methodValue === true) return true;
            if (typeof methodValue === "object" && key in methodValue) return methodValue[key];
        }
    }

    return false;
}

export function findHashFields(schema: { [name: string]: { type: string } }) {
    const hashFields: string[] = []

    for (const [field, details] of Object.entries(schema)) {
        if (details.type === 'hash') {
            hashFields.push(field);
        }
    }

    return hashFields.length ? hashFields : null;
}


export function extract(permissions: string[], json: {
    [key: string]: boolean | { [method in string]?: boolean | { [key: string]: any } };
}, method: string): any {
    if (!permissions)
        permissions = ["*"]

    if (!permissions.includes("*"))
        permissions.push("*")

    for (const perm of permissions) {
        if (!json[perm]) continue;

        const value = json[perm];
        if (value === true) return true;

        if (typeof value === "object" && method in value) {
            const methodValue = value[method];
            if (methodValue === true) return true;
            return methodValue;
        }
    }

    return false;
}

export function getTokens(user: any, config: any) {
    const { _id, permissions } = user
    const access = sign({ _id, permissions }, config.auth.secret, { expiresIn: config.auth.access })
    const refresh = config.auth.refresh && sign({ _id }, config.auth.refreshsecret ?? config.auth.secret, { expiresIn: config.auth.refresh })
    return { access, refresh }
}

export function deepMerge<T>(base: Partial<T>, ...overrides: Partial<T>[]): Partial<T> {
    const result: any = { ...base };

    for (const override of overrides) {
        for (const key in override) {
            const overrideValue = override[key];
            const baseValue = result[key];

            if (
                overrideValue &&
                typeof overrideValue === 'object' &&
                !Array.isArray(overrideValue)
            ) {
                result[key] = deepMerge(baseValue ?? {}, overrideValue);
            } else if (overrideValue !== undefined) {
                result[key] = overrideValue;
            }
        }
    }

    return result;
}