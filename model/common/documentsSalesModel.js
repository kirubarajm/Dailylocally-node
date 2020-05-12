"user strict";
var sql = require("../db.js");
var Documents = require("./documentsModel.js");
var PackagingBox = require("./packagingboxModel.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var Documentsales = function(documentsales) {
  this.remarks = documentsales.remarks;
  this.sales_userid = documentsales.sales_userid;
  this.makeit_userid = documentsales.makeit_userid;
};

Documentsales.createnewDocument = function createnewDocument(
  newdocument,
  new_documents_list,
  packagingdetails,
  res
) {
  sql.query("INSERT INTO Documents_Sales set ?", newdocument, function(
    err,
    res1
  ) {
    if (err) {
      res(err, null);
    } else {
      var docid = res1.insertId;
      for (var i = 0; i < new_documents_list.length; i++) {
        var documentlist = new Documents(new_documents_list[i]);
        documentlist.docid = docid;
        Documents.createnewinfoDocument(documentlist, function(err, result) {
          if (err) res(err, null);
        });
      }

      for (var i = 0; i < packagingdetails.length; i++) {
        var newpackagingdetails = new PackagingBox(packagingdetails[i]);
        newpackagingdetails.sales_userid = newdocument.sales_userid;
        newpackagingdetails.makeit_userid = newdocument.makeit_userid;
        newpackagingdetails.aid = newdocument.aid;
        PackagingBox.createnewPackagingBox(newpackagingdetails, function(
          err,
          result
        ) {
          if (err)  res(err, null);
        });
      }

      let resobj = {
        success: true,
        status:true,
        message: "Document stored successfully",
        docid: docid
      };
      res(null, resobj);
    }
  });
};

Documentsales.createkitchenDoument = async function createkitchenDoument(newdocument,kitchanImage,kitchanApplicationImage,packagingdetails,document_delete_list,res) {
  try{
    var salesdocu = await query(
      "Select * From Documents_Sales where sales_userid = '" +
        newdocument.sales_userid +
        "' and makeit_userid = '" +
        newdocument.makeit_userid +
        "'"
    );
    var docid = 0;
    if (salesdocu.length === 0) {
      var salesinsert = await query(
        "INSERT INTO Documents_Sales set ?",
        newdocument
      );
      docid = salesinsert.insertId;
    } else {
      docid = salesdocu[0].docid;
    }
  
    if (document_delete_list&&document_delete_list.length !== 0) {
      await Documents.deletekitchenImage(document_delete_list, function(err,result) {
        if (err) return res(err, null);
      });
    }
  
    if (kitchanImage && docid) {
      var isUploaded=await Documents.createkitchenImageUpload(kitchanImage,docid,1);
      if(!isUploaded) return res({ status: false, message: "Your kitchen image uploaded limt exiteded." } ,null);
    }
  
    if (kitchanApplicationImage && docid) {
      var iskaUploaded=await Documents.createkitchenImageUpload(kitchanApplicationImage,docid,2);
      if(!iskaUploaded)  return res({ status: false, message: "Your kitchen application image uploaded limt exiteded." } ,null);
    }
  
   
  
    if (packagingdetails && docid) {
      for (var i = 0; i < packagingdetails.length; i++) {
        var newpackagingdetails = new PackagingBox(packagingdetails[i]);
        newpackagingdetails.sales_userid = newdocument.sales_userid;
        newpackagingdetails.makeit_userid = newdocument.makeit_userid;
        newpackagingdetails.aid = docid;
        await PackagingBox.createPackagingBox(newpackagingdetails, function(
          err,
          result
        ) {
          if (err) return res(err, null);
          
        });
      }
    }
  
    let resobj = {
      success: true,
      status:true,
      message: "Document stored successfully",
      docid: docid
    };
    res(null, resobj);
  }catch(e){
    console.log("error--",e);
  }
  
};

Documentsales.infodocumentcreate = async function infodocumentcreate(newdocument,new_documents_list,document_delete_list,res) {

  
  var salesdocu = await query(
    "Select * From Documents_Sales where sales_userid = '" +
      newdocument.sales_userid +
      "' and makeit_userid = '" +
      newdocument.makeit_userid +
      "'"
  );
  var docid = 0;
  if (salesdocu.length === 0) {
    var salesinsert = await query(
      "INSERT INTO Documents_Sales set ?",
      newdocument
    );
    docid = salesinsert.insertId;
  } else {
    docid = salesdocu[0].docid;
  }

  if (document_delete_list&&document_delete_list.length !== 0) {
    await Documents.deletekitchenImage(document_delete_list, function(err,result) {
      if (err) return res(err, null);
    });
  }

  if (new_documents_list && docid) {
    for (var i = 0; i < new_documents_list.length; i++) {
      var documentlist = new Documents(new_documents_list[i]);
      documentlist.docid = docid;
      await Documents.createnewinfoDocument(documentlist, function(
        err,
        result
      ) {
        if (err) res(err, null);
      });
    }
  }

  let resobj = {
    success: true,
    status: true,
    message: "Document stored successfully",
    docid: docid
  };
  res(null, resobj);
};

Documentsales.getDocumentById = function getDocumentById(id, result) {
  sql.query(
    "Select * from Documents_Sales where documentsid = ? ",
    id,
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};
Documentsales.getAllDocument = function getAllDocument(result) {
  sql.query("Select * from Documents_Sales", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Documentsales.getAllSalesTrainingDocument = function getAllSalesTrainingDocument(
  result
) {
  sql.query("Select * from SalesTraining", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status: true,
        result: res
      };
      result(null, resobj);
    }
  });
};

//create_a_sales_training_documents

Documentsales.updateById = function(id, documents, result) {
  sql.query(
    "UPDATE MoveitUser SET Documents = ? WHERE docid = ?",
    [documents.task, id],
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

Documentsales.remove = function(req, result) {
  console.log(req);
  sql.query("DELETE FROM Documents_Sales WHERE docid = ?", [req.did], function(
    err,
    res
  ) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Documentsales.getsalesDocumentById = function getsalesDocumentById(
  req,
  result
) {
  sql.query(
    "Select * from Documents_Sales as dcs left join Documents as dc on dcs.docid=dc.docid where dcs.sales_userid = ?  and dcs.makeit_userid = ?",
    [req.sales_userid, req.makeit_userid],
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

module.exports = Documentsales;
