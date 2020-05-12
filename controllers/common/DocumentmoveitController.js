"use strict";

var Documentmoveit = require("../../model/common/documentsMoveitModel.js");

exports.list_all_documents = function(req, res) {
  Documentmoveit.getAllDocument(function(err, documents) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", documents);
    res.send(documents);
  });
};

exports.list_all_sales_training_documents = function(req, res) {
  Documentmoveit.getAllSalesTrainingDocument(function(err, documents) {
    if (err) res.send(err);
    res.send(documents);
  });
};

exports.create_a_documents = function(req, res) {
  var new_documents = new Documentmoveit(req.body);
  //console.log(req.files);
  //handles null error
  if (!new_documents) {
    res
      .status(400)
      .send({ error: true, message: "Please provide documents name" });
  } else {
    Documentmoveit.createnewDocument(new_documents, function(err, documents) {
      if (err) res.send(err);
      res.json(documents);
    });
  }
};

exports.read_a_documents = function(req, res) {
  Documentmoveit.getDocumentById(req.params.id, function(err, documents) {
    if (err) res.send(err);
    res.json(documents);
  });
};

exports.update_a_documents = function(req, res) {
  Documentmoveit.updateById(
    req.params.id,
    new DocumentSales(req.body),
    function(err, documents) {
      if (err) res.send(err);
      res.json(documents);
    }
  );
};

exports.delete_a_documents = function(req, res) {
  Documentmoveit.remove(req.params.id, function(err, documents) {
    if (err) res.send(err);
    res.json({ message: "Document successfully deleted" });
  });
};

exports.create_a_new_documents = function(req, res) {
  var new_documents = new Documentmoveit(req.body);
  var new_documents_list = req.body.documentlist;
  // console.log(new_documents);
  //console.log(req.files);
  //handles null error
  if (!new_documents || !new_documents_list) {
    res
      .status(400)
      .send({ error: true, message: "Please provide documents name" });
  } else {
    Documentmoveit.createnewDocument(
      new_documents,
      new_documents_list,
      function(err, documents) {
        if (err) res.send(err);
        res.json(documents);
      }
    );
  }
};

exports.remove_s3_sales_doc = function(req, res) {
  if (!req.body.dname) {
    res
      .status(400)
      .send({ error: true, message: "Please provide documents name" });
  } else {
    Documentmoveit.remove(req.body, function(err, documents) {
      if (err) res.send(err);
      res.json(documents);
    });
  }
};

exports.sales_document_view = function(req, res) {
  Documentmoveit.getsalesDocumentById(req.body, function(err, documents) {
    if (err) res.send(err);
    res.json(documents);
  });
};
