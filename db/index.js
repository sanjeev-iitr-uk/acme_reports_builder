const { DataStore } = require('notarealdb');

const store = new DataStore('./data');
const mapping = store.collection('mapping');

const createObject = (item) => {
    return mapping.create(item);
}

const deleteObject = (id) => {
    mapping.delete(id);
}

const getObject = (id) => {
    return mapping.get(id);
}

module.exports = {
    createObject,
    deleteObject,
    getObject
};