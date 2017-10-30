class Storage {
    storageGet(key, defaultValue) {
        try {
            return JSON.parse(localStorage.getItem(key)) || defaultValue;
        } catch (e) {
            return defaultValue; 
        }
    }

    storagePut(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

const storage = new Storage();

export default storage;