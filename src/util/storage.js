// 本地存储

const storageAdapter = {
    setItem(key, val) {
        uni.setStorageSync(key, val)
    },
    getItem(key) {
        return uni.getStorageSync(key)
    },
    removeItem(key) {
        return uni.removeStorageSync(key)
    }
}

const storageMap = new Map()
// 管理本地存储的键值数据
export default function createStorageModel(key, storage = storageAdapter) {
    // 相同key返回单例
    if (storageMap.has(key)) {
        return storageMap.get(key)
    }

    const model = {
        key,
        set(val, stringify = true) {
            if (stringify) {
                val = JSON.stringify(val)
            }
            storage.setItem(this.key, val)
        },
        get(parse = true) {
            let val = storage.getItem(this.key)
            if (parse) {
                try {
                    val = JSON.parse(val)
                } catch (e) {
                    // console.log(e)
                }
            }
            return val
        },
        remove() {
            storage.removeItem(this.key)
        },
        // 针对保存长json的数据进行更新，在cb中对val进行更新
        update(cb, defaultValue = {}) {
            const val = this.get() || defaultValue
            this.set(cb(val))
        }
    }
    storageMap.set(key, model)
    return model
}


// 系统内常用的本地存储数据

const customsModel = createStorageModel('customs_record')

export {
    customsModel
}
