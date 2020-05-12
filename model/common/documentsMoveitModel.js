"user strict";
var sql = require("../db.js");

//Task object constructor
var Documentmoveit = function(documentmoveit) {
  this.moveit_userid = documentmoveit.moveit_userid;
  this.driver_lic = documentmoveit.driver_lic;
  this.vech_insurance = documentmoveit.vech_insurance;
  this.vech_rcbook = documentmoveit.vech_rcbook;
  this.photo = documentmoveit.photo;
  this.legal_document = documentmoveit.legal_document;
};

Documentmoveit.createnewDocument = function createnewDocument(
  newdocument,
  res
) {
  sql.query("INSERT INTO Documents_Moveit set ?", newdocument, function(
    err,
    res1
  ) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status :true,
        message: "Moveit document stored successfully"
      };
      res(null, resobj);
    }
  });
};

Documentmoveit.getDocumentById = function getDocumentById(id, result) {
  sql.query(
    "Select * from Documents_Moveit where documentsid = ? ",
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
Documentmoveit.getAllDocument = function getAllDocument(result) {
  sql.query("Select * from Documents_Moveit", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Documentmoveit.getAllSalesTrainingDocument = function getAllSalesTrainingDocument(
  result
) {
  sql.query("Select * from Documents_Moveit", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status :true,
        result: res
      };
      result(null, resobj);
    }
  });
};

//create_a_sales_training_documents

Documentmoveit.updateById = function(id, documents, result) {
  sql.query(
    "UPDATE Documents_Moveit SET Documents = ? WHERE docid = ?",
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

Documentmoveit.remove = function(req, result) {
  console.log(req);
  sql.query("DELETE FROM Documents_Moveit WHERE docid = ?", [req.did], function(
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

Documentmoveit.getsalesDocumentById = function getsalesDocumentById(
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

module.exports = Documentmoveit;
