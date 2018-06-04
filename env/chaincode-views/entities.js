{
    "views": {
        "all": {
            "map": "function(doc) { if(doc.data.objectType =='io.sibu.interop.Entity') emit(doc.data.id, doc) }"
        }

    }
}