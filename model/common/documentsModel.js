"user strict";
var sql = require("../db.js");
var path = require("path");
var url = require("url");
var https = require("https");
var AWS_ACCESS_KEY = "AKIAJJQUEYLIU23E63OA";
var AWS_SECRET_ACCESS_KEY = "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";
const fs = require("fs");
const AWS = require("aws-sdk");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

// AWS.config.update({
//   httpOptions: {
//     agent: proxy('http://52.219.62.68')
//   }
// });

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: "us-east-1"
});

//  var s3 = new AWS.S3({region: 'us-east-1'});
// s3.getObject({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_ACCESS_KEY}, function (err, data) {
//   console.log(err, data);
// });

//Task object constructor

var Documents = function(documents) {
  this.type = documents.type;
  this.url = documents.url;
  this.docid = documents.docid;
  this.image_type = documents.image_type || 0;
  this.created_at = new Date();
};

//https://s3.ap-south-1.amazonaws.com/eattovo/uploads/insurance/MakeIt+Wireframe_flow.pdf

Documents.createDocument = function createDocument(newDocument, result) {
  console.log(newDocument.files.lic.name); // the uploaded file object

  if (Object.keys(newDocument.files).length == 0) {
    return result.status(400).send("No files were uploaded.");
  }
  if (newDocument.files.lic) {
    const fileName = newDocument.files.lic.name;
    fs.readFile(newDocument.files.lic.path, (err, data) => {
      if (err) {
        result(err, null);
        return;
      }
      const params = {
        Bucket: "eattovo", // pass your bucket name
        Key: fileName, // file will be saved as testBucket/contacts.csv
        Body: newDocument.files.lic
      };
      Documents.documentUpload(params,result);
      // s3.upload(params, function(s3Err, data) {
      //   if (s3Err) {
      //     result(s3Err, null);
      //   } else {
      //     result(null, result);
      //   }
      // });
    });
  }
};

Documents.getDocumentById = function getDocumentById(id, result) {
  sql.query("Select * from Document where documentsid = ? ", id, function(
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
Documents.getAllDocument = function getAllDocument(result) {
  sql.query("Select * from Documents", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Documents.getAllSalesTrainingDocument = function getAllSalesTrainingDocument(
  result
) {
  sql.query("Select * from SalesTraining", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};

//create_a_sales_training_documents
Documents.updateById = function(id, documents, result) {
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

Documents.remove = function(id, result) {
  sql.query("DELETE FROM Documents WHERE docid = ?", [id], function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Documents.newdocumentupload = function newdocumentupload(newDocument, result) {
  if (
    !newDocument.files ||
    !newDocument.files.lic ||
    Object.keys(newDocument.files).length == 0
  ) {
    result(
      { error: true, status: false, message: "No files uploaded." },
      null
    );
  }else{
  var fileName = newDocument.files.lic;
  var name = fileName.name;
  var name = Date.now() + "-" + name;

  const params = {
    Bucket: "eattovo/upload/sales/makeit", // pass your bucket name
    Key: name, // file will be saved as testBucket/contacts.csv
    Body: fileName.data,
    ContentType: "image/jpg",
    ACL: "public-read"
  };

  Documents.documentUpload(params,result);

  // s3.upload(params, (err, data) => {
  //   if (err) {
  //     result(err, null);
  //   } else {
  //     let message = "Document uploaded successfully";
  //     let resobj = {
  //       success: true,
  //       status:true,
  //       message: message,
  //       data: data
  //     };
  //     result(null, resobj);
  //   }
  // });
}
};

Documents.createnewDocumentlist = function createnewDocumentlist(
  documentlist,
  res
) {
  sql.query("INSERT INTO Documents set ?", documentlist, function(err, result) {
    if (err) {
      res(err, null);
    }
  });
};

Documents.addNewkitchan = function addNewkitchan(documentlist) {
  return sql.query("INSERT INTO Documents set ?", documentlist);
};

Documents.updateNewkitchan = function updateNewkitchan(document, res) {
  sql.query(
    "UPDATE Documents set url = '" +
      document.url +
      "' where did='" +
      document.did +
      "'",
    function(err, result) {
      if (err) {
        res(null, false);
      } else res(null, true);
    }
  );
};

Documents.createnewinfoDocument = async function createnewinfoDocument(documentlist,result) {
  var Documentscount = await query("Select * From Documents where docid = '" +documentlist.docid +"' and type = '" +documentlist.type +"' and image_type = '" +documentlist.image_type +"'");
  if (Documentscount.length === 0) {
    var newDocumentsinsert = await query("INSERT INTO Documents set ?",documentlist);
  } else {
    var newDocumentsinsert = await query(
      "Update Documents set url = '" +
        documentlist.url +
        "' where docid = '" +
        documentlist.docid +
        "' and type = '" +
        documentlist.type +
        "' and image_type = '" +
        documentlist.image_type +
        "'"
    );
  }

  let resobj = {
    success: true,
    status :true,
    message: "Docuemnt updated successfully"
  };
  result(null, resobj);
};

Documents.createkitchenImageUpload = async function createkitchenImageUpload(
  kitchanImageList, docid,type,
) {
    var limit =5;
    var kitchenImages = await query("Select * From Documents where docid = '" +docid +"' and type = '"+type+"'");
    var balance =limit-kitchenImages.length;
    if(kitchanImageList.length>balance) {
      return false;
    }else {
      for (var i = 0; i < kitchanImageList.length; i++) {
        var document = new Documents(kitchanImageList[i]);
        document.docid = docid;
        await Documents.addNewkitchan(document);
      }
      return true;
    }
  
};

Documents.deletekitchenImage = async function deletekitchenImage(
  documentdeletelist,
  result
) {
  if (documentdeletelist && documentdeletelist.length > 0) {
    var deletedIds = documentdeletelist.toString();
    var deleteQuery = "DELETE From Documents where did IN (" + deletedIds + ")";
    var kitchenImagedelete = await query(deleteQuery);
    result(null, kitchenImagedelete);
  }
};

Documents.remove_document = function(req, result) {
  const fs = require("fs");
  const AWS = require("aws-sdk");
  const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  });

  var dname = req.dname;
  const params = {
    Bucket: "eattovo", // pass your bucket name
    Key: dname // file will be saved as testBucket/contacts.csv
  };
  s3.deleteObject(params, (err, data) => {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status :true,
        message: "Document deleted successfully",
        data: data
      };
      result(null, resobj);
    }
  });
};

Documents.newmoveitdocumentupload = function newmoveitdocumentupload(
  newDocument,
  result
) {
  if (Object.keys(newDocument.files).length == 0) {
    return result.status(400).send("No files were uploaded.");
  }

  var fileName = newDocument.files.lic;
  var name = fileName.name;
  var name = Date.now() + "-" + name;
  const params = {
    Bucket: "eattovo/upload/admin/moveit", // pass your bucket name
    Key: name, // file will be saved as testBucket/contacts.csv
    Body: fileName.data,
    ContentType: "image/jpg",
    ACL: "public-read"
  };

  // s3.upload(params, (err, data) => {
  //   if (err) {
  //     result(err, null);
  //   } else {
  //     let resobj = {
  //       success: true,
  //       status :true,
  //       message: "Document uploaded successfully",
  //       data: data
  //     };
  //     result(null, resobj);
  //   }
  // });
  Documents.documentUpload(params,result);
};

Documents.newsalesdocumentupload = function newsalesdocumentupload(
  newDocument,
  result
) {
  if (Object.keys(newDocument.files).length == 0) {
    return result.status(400).send("No files were uploaded.");
  }
  var fileName = newDocument.files.lic;
  var name = fileName.name;
  var name = Date.now() + "-" + name;
  const params = {
    Bucket: "eattovo/upload/admin/sales", // pass your bucket name
    Key: name, // file will be saved as testBucket/contacts.csv
    Body: fileName.data,
    ContentType: "image/jpg",
    ACL: "public-read"
  };

  // s3.upload(params, (err, data) => {
  //   if (err) {
  //     result(err, null);
  //   } else {
  //     let resobj = {
  //       success: true,
  //       status :true,
  //       message: "Document uploaded successfully",
  //       data: data
  //     };
  //     result(null, resobj);
  //   }
  // });
  Documents.documentUpload(params,result);
};

Documents.newmakeitdocumentupload = function newmakeitdocumentupload(newDocument,result) {
  //console.log(newDocument.files.lic); // the uploaded file object
 
  if (Object.keys(newDocument.files).length == 0) {
    return result.status(400).send("No files were uploaded.");
  }
  var fileName = newDocument.files.lic;
  var name = fileName.name;
  var name = Date.now() + "-" + name;
  const params = {
    Bucket: "eattovo/upload/admin/makeit", // pass your bucket name
    Key: name, // file will be saved as testBucket/contacts.csv
    Body: fileName.data,
    ContentType: "image/jpg",
    ACL: "public-read"
  };

  // s3.upload(params, (err, data) => {
  //   if (err) {
  //     result(err, null);
  //   } else {
  //     let resobj = {
  //       success: true,
  //       status :true,
  //       message: "Document uploaded successfully",
  //       data: data
  //     };
  //     result(null, resobj);
  //   }
  // });
  Documents.documentUpload(params,result);
};

Documents.makeit_product_upload_a_document = function makeit_product_upload_a_document(newDocument,result) {
  if (Object.keys(newDocument.files).length == 0) {
    return result.status(400).send("No files were uploaded.");
  }
  var fileName = newDocument.files.lic;
  var name = fileName.name;
  var name = Date.now() + "-" + name;
  const params = {
    Bucket: "eattovo/upload/admin/makeit/product", // pass your bucket name
    Key: name, // file will be saved as testBucket/contacts.csv
    Body: fileName.data,
    ContentType: "image/jpg",
    ACL: "public-read"
  };
  // s3.upload(params, (err, data) => {
  //   if (err) {
  //     result(err, null);
  //   } else {
  //     let resobj = {
  //       success: true,
  //       status :true,
  //       message: "Document uploaded successfully",
  //       data: data
  //     };
  //     result(null, resobj);
  //   }
  // });
  Documents.documentUpload(params,result);
};

Documents.documentUpload = function documentUpload(params,result) {
  s3.upload(params, (err, data) => {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status :true,
        message: "Document uploaded successfully",
        data: data
      };
      result(null, resobj);
    }
  });
}

module.exports = Documents;
