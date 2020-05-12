"use strict";

var Document = require("../../model/common/documentsModel.js");
var DocumentSales = require("../../model/common/documentsSalesModel.js");

exports.list_all_documents = function(req, res) {
  Document.getAllDocument(function(err, documents) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", documents);
    res.send(documents);
  });
};

exports.list_all_sales_training_documents = function(req, res) {
  Document.getAllSalesTrainingDocument(function(err, documents) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", documents);
    res.send(documents);
  });
};

exports.create_a_documents = function(req, res) {
  var new_documents = new Document(req.body);
  //console.log(req.files);
  //handles null error
  if (!new_documents) {
    res
      .status(400)
      .send({ error: true, message: "Please provide documents name" });
  } else {
    Document.createDocument(req, function(err, documents) {
      if (err) res.send(err);
      res.json(documents);
    });
  }
};

exports.read_a_documents = function(req, res) {
  Document.getDocumentById(req.params.id, function(err, documents) {
    if (err) res.send(err);
    res.json(documents);
  });
};

exports.update_a_documents = function(req, res) {
  Document.updateById(req.params.id, new Document(req.body), function(
    err,
    documents
  ) {
    if (err) res.send(err);
    res.json(documents);
  });
};

exports.delete_a_documents = function(req, res) {
  Document.remove(req.params.id, function(err, documents) {
    if (err) res.send(err);
    res.json({ message: "Document successfully deleted" });
  });
};

exports.upload_a_documents = function(req, res) {
  var new_documents = new Document(req.body);
  //handles null error
  //console.log("new_documents",new_documents);
  if (!new_documents) {
    res
      .status(400)
      .send({ error: true,status:false,message:"Please provide documents" });
  } else {
    Document.newdocumentupload(req, function(err, documents) {
      if (err) res.send(err);
      res.json(documents);
    });
  }
};

exports.remove_s3_sales_doc = function(req, res) {
  if (!req.body.dname) {
    res
      .status(400)
      .send({ error: true, message: "Please provide documents name" });
  } else {
    Document.remove_document(req.body, function(err, documents) {
      if (err) res.send(err);
      res.json(documents);
    });
  }
};

exports.moveit_upload_a_documents = function(req, res) {
  var new_documents = new Document(req.body);

  if (!new_documents) {
    res
      .status(400)
      .send({ error: true, message: "Please provide documents name" });
  } else {
    Document.newmoveitdocumentupload(req, function(err, documents) {
      if (err) res.send(err);
      res.json(documents);
    });
  }
};

exports.sales_upload_a_documents = function(req, res) {
  var new_documents = new Document(req.body);

  if (!new_documents) {
    res
      .status(400)
      .send({ error: true, message: "Please provide documents name" });
  } else {
    Document.newsalesdocumentupload(req, function(err, documents) {
      if (err) res.send(err);
      res.json(documents);
    });
  }
};

exports.makeit_upload_a_documents = function(req, res) {
  var new_documents = new Document(req.body);

  if (!new_documents) {
    res
      .status(400)
      .send({ error: true, message: "Please provide documents name" });
  } else {
    Document.newmakeitdocumentupload(req, function(err, documents) {
      if (err) res.send(err);
      res.json(documents);
    });
  }
};

exports.makeit_product_upload_a_document = function(req, res) {
  var new_documents = new Document(req.body);
  if (!new_documents) {
    res
      .status(400)
      .send({ error: true, message: "Please provide documents name" });
  } else {
    Document.makeit_product_upload_a_document(req, function(err, documents) {
      if (err) res.send(err);
      res.json(documents);
    });
  }
};
