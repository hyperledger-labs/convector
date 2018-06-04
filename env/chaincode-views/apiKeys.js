{
    "views": {
        "all": {
            "map": "function(doc) { if(doc.data.objectType =='io.sibu.interop.APIKey') emit(doc.data.objectType, {id:doc.data.id,name:doc.data.name,description:doc.data.description, createdBy: doc.data.createdBy, created:doc.data.created}) }"
        },
        "byKey":{
            "map":"function(doc) {if (doc.data.objectType === 'io.sibu.interop.APIKey' && doc.data.key) {emit(doc.data.key, null)}}"
        }

    }
}