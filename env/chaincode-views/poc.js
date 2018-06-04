{
    "views": {
        "all": {
            "map": "function(doc) { if(doc.data.objectType =='POCAsset') {emit(doc.data.holder, doc)} }"
        },
        "attachments":{
            "map":"function(doc) { if(doc.data.objectType =='POCAsset'){ doc.data.attachments.forEach(function(attachment) {emit([attachment.country], { attachment: attachment,export: doc.data.export}); }); } }"
        },
        "productsByCountry":{
            "map":"function (doc) {if(doc.data.objectType =='POCAsset') { emit([doc.data.initiatedAt, doc.data.product, doc.data.status], 1);} }",
            "reduce":"function(key, values) {return sum(values); }"
        },
        "exportsByStatus":{
            "map":"function (doc) { if(doc.data.objectType =='POCAsset'){ emit([doc.data.initiatedAt, doc.data.product, doc.data.status], 1);}}",
            "reduce": "function(key, values) {return sum(values); }"
        }
    }
}