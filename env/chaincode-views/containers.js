
{
    "views": {
        "all": {
            "map": "function(doc) { emit(doc.data.holder, doc) }"
        },
        "attachments": {
            "map": "function(doc) { doc.data.attachments.forEach(function(attachment) {emit([attachment.country], { attachment: attachment,export: doc.data.export}); }); }"
        },
        "productsByCountry": {
            "map": "function (doc) {emit([doc.data.initiatedAt, doc.data.product, doc.data.status], 1);}",
                "reduce": "function(key, values) {return sum(values); }"
        },
        "exportsByStatus": {
            "map": "function (doc) {emit([doc.data.initiatedAt, doc.data.product, doc.data.status], 1);}",
                "reduce": "function(key, values) {return sum(values); }"
        }
    }
}