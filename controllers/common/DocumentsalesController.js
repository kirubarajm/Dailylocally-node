"use strict";

var DocumentSales = require("../../model/common/documentsSalesModel.js");

exports.list_all_documents = function(req, res) {
  DocumentSales.getAllDocument(function(err, documents) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", documents);
    res.send(documents);
  });
};

exports.list_all_sales_training_documents = function(req, res) {
  DocumentSales.getAllSalesTrainingDocument(function(err, documents) {
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
    DocumentSales.createDocument(req, function(err, documents) {
      if (err) res.send(err);
      res.json(documents);
    });
  }
};

exports.read_a_documents = function(req, res) {
  DocumentSales.getDocumentById(req.params.id, function(err, documents) {
    if (err) res.send(err);
    res.json(documents);
  });
};

exports.update_a_documents = function(req, res) {
  DocumentSales.updateById(req.params.id, new DocumentSales(req.body), function(
    err,
    documents
  ) {
    if (err) res.send(err);
    res.json(documents);
  });
};

exports.delete_a_documents = function(req, res) {
  DocumentSales.remove(req.params.id, function(err, documents) {
    if (err) res.send(err);
    res.json({ message: "Document successfully deleted" });
  });
};

exports.create_a_new_documents = function(req, res) {
  var new_documents = new DocumentSales(req.body);
  var kitchanImage = req.body.kitchanimage;
  var kitchanApplicationImage = req.body.kitchan_application_image;
  var packagingdetails = req.body.packagingdetails;
  var document_delete_list = req.body.documentdeletelist;
  
  if (!new_documents) {
    res
      .status(400)
      .send({ error: true, message: "Please provide documents" });
  } else {
    DocumentSales.createkitchenDoument(new_documents,kitchanImage,kitchanApplicationImage,packagingdetails,document_delete_list,function(
      err,
      documents
    ) {
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
    DocumentSales.remove(req.body, function(err, documents) {
      if (err) res.send(err);
      res.json(documents);
    });
  }
};

exports.sales_document_view = function(req, res) {
  DocumentSales.getsalesDocumentById(req.body, function(err, documents) {
    if (err) res.send(err);
    res.json(documents);
  });
};



exports.create_a_new_infodocument = function(req, res) {
  var new_documents = new DocumentSales(req.body);
  var new_documents_list = req.body.documentlist;
  var document_delete_list = req.body.documentdeletelist;
  // console.log(new_documents);
  //console.log(req.files);
  //handles null error
  if (!new_documents) {
    res
      .status(400)
      .send({ error: true, message: "Please provide documents" });
  } else {
    DocumentSales.infodocumentcreate(new_documents, new_documents_list,document_delete_list, function(
      err,
      documents
    ) {
      if (err) res.send(err);
      res.json(documents);
    });
  }
};