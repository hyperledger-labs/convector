{
    "views": {
        "all": {
            "map": "function(doc) { if(doc.data.objectType =='io.sibu.interop.Asset') emit(doc.data.key, doc) }"
        }

    }
}