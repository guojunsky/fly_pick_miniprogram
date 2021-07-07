class Schema {
    constructor(descriptor) {
        this.descriptor = descriptor;
    }

    handleRule(val, rule) {
        const {key, params, message} = rule;
        let ruleMap = {
            required() {
                return !val;
            },
            max() {
                return val > params;
            },
            validator() {
                return params(val);
            },
        };

        let handler = ruleMap[key];
        if (handler && handler()) {
            throw message;
        }
    }

    validate(data) {
        return new Promise((resolve, reject) => {
            let keys = Object.keys(data);
            let errors = [];
            for (let key of keys) {
                const ruleList = this.descriptor[key];
                if (!Array.isArray(ruleList) || !ruleList.length) continue;

                const val = data[key];
                for (let rule of ruleList) {
                    try {
                        this.handleRule(val, rule);
                    } catch (e) {
                        errors.push(e.toString());
                    }
                }
            }
            if (errors.length) {
                reject(errors);
            } else {
                resolve();
            }
        });
    }
}

export default Schema
