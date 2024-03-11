/*
Sourced from:
https://www.npmjs.com/package/stringinject
https://www.github.com/tjcafferkey/stringinject

Copied directly because I don't need the packages it depends on.
*/

export const stringInject = function (str: string, data: any) {
    if (typeof str === 'string' && (data instanceof Array)) {
        return str.replace(/({\d})/g, function(i: any) {
            return data[i.replace(/{/, '').replace(/}/, '')];
        });
    } else if (typeof str === 'string' && (data instanceof Object)) {
        if (Object.keys(data).length === 0) {
            return str;
        }

        for (let k in data) {
            return str.replace(/({([^}]+)})/g, function(i) {
                let key = i.replace(/{/, '').replace(/}/, '');
				
                if (!data[key]) {
                    return i;
                }

                return data[key];
            });
        }
    } else if (typeof str === 'string' && data instanceof Array === false || typeof str === 'string' && data instanceof Object === false) {
		return str;
    }
    return '';
}