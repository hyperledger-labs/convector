{
    "views": {
        "allOrgs": {
            "map": "function(doc) { if(doc.data.objectType =='io.sibu.interop.Organization') emit(doc.data.id, doc) }"
        },
        "allParticipants":{
            "map":"function(doc) {if (doc.data.objectType === 'io.sibu.interop.Participant') {emit(doc.data.id, doc)}}"
        }

    }
}