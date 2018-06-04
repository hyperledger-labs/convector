{
    "views": {
        "byProcessStage": {
            "map": "function(doc) {if (doc.data.objectType === 'io.sibu.interop.Asset') emit([doc.data.processTemplate.name.split('/')[0], {id: doc.data.processTemplate.id,name: doc.data.processTemplate.name.split('/')[1]}, {id: doc.data.currentStage,name: doc.data.stages[doc.data.currentStage].name}], 1);}",
                "reduce": "function (keys, values, rereduce) {if (rereduce) {return sum(values);} else {return values.length;}}"
        },
        "byDate": {
            "reduce": "_sum",
                "map": "function (doc) {\n  \n  if (doc.data.objectType === 'io.sibu.interop.Asset') emit([doc.data.processTemplate.name.split('/')[0], new Date(doc.data.created * 1000).getDay()], 1);\n    \n}"
        }

    }
}


