import * as React from 'react';

export interface React {
    useEffect: typeof React.useEffect;
    useState: typeof React.useState;
}

export interface PermissionMap {
    get?: boolean;
    list?: boolean;
    create?: boolean;
    update?: boolean;
    delete?: boolean;
    read?: boolean;
    write?: boolean;
}

export interface UserPermissionsMap {
    [key: string]: PermissionMap;
}

/**
 * Splits permissions and the rest of the fields on a document.
 */
export function splitPermissions(combinedData: unknown): [UserPermissionsMap, any] {
    if (typeof combinedData === 'object' && combinedData !== null && (combinedData as any).permissions) {
        const { permissions, ...data } = combinedData as any;
        return [permissions, data];
    } else {
        return [{}, combinedData];
    }
}

/**
 * Retrieves a value from an object given a 'dot-walk' path. If not present,
 * undefined is returned.
 * @param obj Source object to retrieve data from
 * @param path Dot-delimited key-path to requested value
 */
export function dotGet(obj: { [key: string]: any }, path: string): any {
    if (!path) {
        return obj;
    }
    let result = obj;
    try {
        path.split('.').forEach((key) => {
            result = result[key];
        });
        return result;
    } catch (e) {
        return undefined;
    }
}

/**
 * Generates a sparce/deep object for a nested object defined by a dot-path
 * and a provided value.
 * @param path Dot-delimited key-path for the value in the resulting nested object.
 * @param value Value to nest in the generated object
 */
export function dotGen(path: string, value: any): any {
    if (!path) {
        return value;
    }
    const pathArr = path.split('.');
    const result = {} as any;
    let current = result;
    pathArr.forEach((key, idx) => {
        current[key] = idx === pathArr.length - 1 ? value : {};
        current = current[key];
    });
    return result;
}
