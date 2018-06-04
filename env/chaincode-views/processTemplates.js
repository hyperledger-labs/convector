{
    "views": {
        "all": {
            "map": "function(doc) { if(doc.data.objectType =='io.sibu.interop.ProcessTemplate') emit(doc.data.objectType, doc) }"
        },
        "allDocumentTemplates": {
            "map": "function(doc) { if(doc.data.objectType =='io.sibu.interop.AttachmentTemplate') emit(doc.data.objectType, doc) }"
        }

    }
}