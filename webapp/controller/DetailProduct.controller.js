sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/m/library"
], function (BaseController, JSONModel, formatter, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

	return BaseController.extend("com.iaj.productmanag.controller.DetailProduct", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit : function () {
            debugger;
 
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy : false,
				delay : 0
			});

			this.getRouter().getRoute("detailProduct").attachPatternMatched(this._onObjectMatched, this);
            
			this.setModel(oViewModel, "detailProductView");

            this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

            var oModel =  this.getOwnerComponent().getModel();

            var oView = this.getView();
            var oPanel = oView.byId("DetailsPanel");
   //       var oPanel = oPanel.setModel(sap.ui.getCore().getModel());
            oPanel.setModel(oModel);

            this._showFormFragment("Display");
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Updates the item count within the line item table's header
		 * @param {object} oEvent an event containing the total number of items in the list
		 * @private
		 */
		onListUpdateFinished : function (oEvent) {
			var sTitle,
				oViewModel = this.getModel("detailProductView");


		},



        onProductEditPress : function(evt) {

            // Set de right form type
             this._showFormFragment("EditProduct");

             // enable Product ID field
             sap.ui.getCore().byId("inputProductId").setEnabled(false);
 
        },
        /**
         * Delete Product
         * @param {*} oEvent 
         */
        onProductDeletePress :  function(oEvent) {
        
             var that = this;
             var oContext = this.getView().byId().getBindingContext("detailProduct");

             sap.m.MessageBox.show("Confirma exclusão do Produto " + oContext.getProperty("ProducName") + " ?",
                    {
                        icon : sap.m.MessageBox,
                        title : "Confirmar exclusão",
                        actions : [ sap.m.MessageBox.Action.YES,
                                    sap.m.MessageBox.Action.NO  ],
                        onClose :  function(oAction) {
                              if (oAction === "YES") {
                                var sPath = oContext.getPath();
                                var oModel = sap.ui.getCore().getModel();
                                oModel.remove(sPath, {}, {
                                      success : function(data, response) {
                                            sap.m.MessageToast.show("Produto excluido com sucesso!",
                                                        { duration : 5000 });       
                                            that._showFormFragment("Display"); // ou...  that._showFormFragment("Details")                                                     
                                      },
                                      error : function(error){
                                            sap.m.MessageToast.show("Delete failed : " + error.response, {
                                                duration : 5000
                                            });                                          
                                      }
                                    });
                              }

                        }           
                    });
        },

        onBuPaEditPress : function(oEvent) {
            // Set de right form type
             this._showFormFragment("EditBuPa");

             sap.ui.getCore().byId("BuPaEditForm").setBindingContext(
                  oEvent.getSource().getParent().getBindingContext()
             );
        },

        /**
         * 
         * @param {*} oEvent 
         */
        onProductCreatePress :  function(oEvent) {
             debugger;
               
            var oModel =  this.getOwnerComponent().getModel(); 


             var detailsView =  this.getView();  
             var oDetailsPanel = detailsView.byId("DetailsPanel");
/*             
             var oBindCtx = oDetailsPanel.getBindingContext();
             var oCtxObj = oDetailsPanel.getBindingContext().getObject();             
             var sPath =  oDetailsPanel.getBindingContext().getPath();
             var sProp =  oDetailsPanel.getBindingContext().getProperty("ProductId");
*/
             oDetailsPanel.setBindingContext(null);
             this._showFormFragment("EditProduct");

             // enable Product ID field
             var oProdId = sap.ui.getCore().byId("inputProductId");
             oProdId.setEnabled(true);

             //set selected category
//             var oContext = sap.ui.getCore().byId("detail--lineItemsList")
//                             .getSelectedItem().getBindingContext();
             var oCategorySelect = sap.ui.getCore().byId("selectCategory");
//           oCategorySelect.setSelectedKey(oContext.getProperty("Category"));
//           oCategorySelect.setEnabled(false);

        },

        /**
         * Save Product
         * @param {*} oEvent 
         */
        onProductSavePress : function(oEvent) {
              debugger;

              var that = this;

              var view   = this.getView();
//            var oModel = sap.ui.getCore().getModel();
              var oModel =  this.getOwnerComponent().getModel();              
              var oContext = oEvent.getSource().getBindingContext();

            var payload =  {
                ProductId    : sap.ui.getCore().byId("inputProductId").getValue(),
                ProducName   : sap.ui.getCore().byId("inputProductName").getValue(),
                Category     : sap.ui.getCore().byId("selectCategory").getSelectedKey(),
                CurrencyCode : sap.ui.getCore().byId("inputCurrencyCode").getValue(),
                Price        : sap.ui.getCore().byId("inputPrice").getValue(),
                SupplierId   : sap.ui.getCore().byId("selectSupplierId").getSelectedKey()
            };                 

              if (oContext){
                  // update Product
                    var bProductSaved =  false;

                    var sPath = oContext.getPath();
                    oModel.update(sPath, payload, {
                        success : function(data, response) {

                            bProductSaved = true;

                            sap.m.MessageToast.show("Produto alterado com sucesso!",
                                { duration : 5000 });                            
  
                            that._showFormFragment("Display");   
                            
//                          var oDetailsPanel = detailsView.byId("DetailsPanel"); 
//                          var oDeps = oDetailsPanel.getDependents();
//                          oDetailsPanel.getDependents()[0].getElementBinding().refresh();
                            
                        },
                        error :  function(error) {
                            var body = JSON.parse(error);
                            var sMessage = body.error.message.value;
                            sap.m.MessageToast.show("Erro ao salvar : " + sMessage, {
                                duration : 5000
                            });
                        },
                        merge : true
                    });


              } else {
                  // Create Product
                  var sPath = "/ProductHeaderSet";
                  oModel.create(sPath, payload, {
                            success : function (data, response) {
                                
                                sap.m.MessageToast.show("Produto criado com sucesso!",
                                    { duration : 5000 });

                                that._showFormFragment("Display");
                        
//                              var oProductList = sap.ui.getCore().byId("detail--lineItemsList");
//                              oProductList.getBinding("items").refresh();
    //                          Select new Product
//                                oProductList.attachEventOnce("updateFinished" , function() {
//                                  var aItems =  oProductList.getItems();
//                                  var index;
//                                  var cIndex;
//                                  for (index = 0; aItems.length; index++) {
//                                      if (aItems[index].getTitle() == sap.ui.getCore().byId("inputProductId").getValue() ) {
//                                              cIndex =  index;  
//                                              break;  
//                                      }
//                                  }
                                  
//                                  oProductList.fireEvent("itemPress", {
//                                          listItem: aItems[cIndex]
//                                  });
//                                  oProductList.setSelectedItem(aItems[cIndex]);   
//                              });

                               var detailsView =   that.getView();
                               var oDetailsPanel = detailsView.byId("DetailsPanel");

                              oDetailsPanel.setModel(oModel);
                              oDetailsPanel.setBindingContext();

                               detailsView.getElementBinding().refresh(true);

                            },
                            error : function(error) {
                                var oMessage = JSON.parse(error.response.body);
                                var sMessage = oMessage.error.message.value;
                                sap.m.MessageToast.show("Save Failed: " + sMessage, {
                                        duration : 5000                                    
                                });
                            }
                    });

              }
        },

        /**
         * Save Business Partner
         * @param {*} oEvent 
         */
        onBuPaSavePress : function(oEvent) {
            var that = this;

            var bBuPaSaved = false;

            var oBuPa = oEvent.getSource().getBindingContext()
                        .getProperty("ToBusinessPartner2");
            var sBuPaUri = oBuPa.__metadata.uri;
            var sBuPaPath = sBuPaUri.substr(sBuPaUri.lastIndexOf('/'),
                                            sBuPaUri.length);
//          var oModel = sap.ui.getCore().getModel(); 
//          var oContext = oEvent.getSource().getBindingContext();
            var oModel =  this.getOwnerComponent().getModel();              

            oModel.update(sBuPaPath, {
                CompanyName   : sap.ui.getCore().byId("inputCompanyName").getValue(),
                LegalForm     : sap.ui.getCore().byId("inputLegalForm").getValue(),
                Street        : sap.ui.getCore().byId("inputStreet").getValue(),
                Building      : sap.ui.getCore().byId("inputBuilding").getValue(),                
                PostalCode    : sap.ui.getCore().byId("inputZIPCode").getValue(),                
                City          : sap.ui.getCore().byId("inputCity").getValue(),                                
                EmailAddress  : sap.ui.getCore().byId("inputEmailAddress").getValue(),                                
                PhoneNumber   : sap.ui.getCore().byId("inputPhoneNumber").getValue()                                               
            }, {
                success : function(data, response) {

                    bBuPaSaved = true;

                    sap.m.MessageToast.show("Fornecedor atualizado com sucesso!",
                        { duration : 5000 });                            

                    that._showFormFragment("Display");   
                    
//                  var detailsView = sap.ui.getCore().byId("detailProduct");
//                  var oDetailsPanel = detailsView.byId("DetailsPanel"); 
//                  oDetailsPanel.getDependents()[0].getElementBinding().refresh();
                    
                },
                error :  function(error) {
                    var oMessage = JSON.parse(error.response.body);
                    var sMessage = oMessage.error.message.value;
                    sap.m.MessageToast.show("Erro ao salvar Fornecedor : " + sMessage, {
                        duration : 5000
                    });
                },
                merge : true
            });            


        },

        /**
         * onInputChange
         */
        onInputChange : function(oEvent) {
          var sPath = oEvent.getsource().getBindingContext().getPath();
          var sElement = oEvent.getSource().getBinding("value").getPath();
          var sNewValue = oEvent.getParameter("value");
          var oModel = sap.ui.getCore().getModel();
          var oData = {};
          oData[sElement] = sNewValue;
          oModel.update(sPath, oData, {
              success :  function(data, response){
                    sap.m.MessageToast.show("Save succesfull!",
                        { duration : 5000 });                            
              }, 
              error : function(error) {
                    sap.m.MessageToast.show("Save  Failed!: " + error.response,
                        { duration : 5000 });                                              
              },
              merge : true
          });
            
        },

        /**
         * 
         */
        onBuPaTogglePress: function (evt) {
               var btnEditProduct = this.getView().byId("btnEditProduct");
               if (btnEditProduct.getPressed() === true ){
                   sap.m.MessageBox.show("Please leave Product Edit Mode first.", {
                      icon: sap.m.MessageBox.Icon.WARNING,
                      title: "Product Edit Mode Active",
                      actions: [ sap.m.MessageBox.Action.OK ]
                   });
                   evt.getSource().setPressed(false);
               } else {
                   this._showFormFragment(evt.getSource().getPressed() ?
                            "EditBuPa" :  "Display" );
               }
        },

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/** 
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched : function (oEvent) {
            debugger;

            var sObjectId =  oEvent.getParameter("arguments").produdctId;
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel().metadataLoaded().then( function() {
				var sObjectPath = this.getModel().createKey("ProductHeaderSet", {
					ProductId :  sObjectId
				});
				this._bindView("/" + sObjectPath);
            }.bind(this));

            var oModel =  this.getOwnerComponent().getModel();

            oModel.read( "/ProductHeaderSet('" + sObjectId + "')", {
                     urlParameters: {
                         $expand: "ToBusinessPartner2"
                    },
                    success: function(oData, response) {
                        var data = oData.results;
                        console.log(data);

                    }
                });

            
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView : function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailProductView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path : sObjectPath,
				events: {
					change : this._onBindingChange.bind(this),
					dataRequested : function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange : function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.Categoryy,
				sObjectName = oObject.Categoryy,
				oViewModel = this.getModel("detailProductView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);


		},

		_onMetadataLoaded : function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailProductView");


			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/lineItemTableDelay", 0);



			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		/**
		 * Set the full screen mode to false and navigate to master page
		 */
		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		/**
		 * Toggle between full and non full screen mode.
		 */
		toggleFullScreen: function () {
			var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			if (!bFullScreen) {
				// store current layout and go full screen
				this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
				this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			} else {
				// reset to previous layout
				this.getModel("appView").setProperty("/layout",  this.getModel("appView").getProperty("/previousLayout"));
			}
        },
        
        _formFragments : {},

        _getFormFragment : function(sFragmentName) {
            var oFormFragment = this._formFragments[sFragmentName];

            if (oFormFragment) {
                return oFormFragment;
            }

            oFormFragment = sap.ui.xmlfragment("com.iaj.productmanag.view." + sFragmentName, 
                           this);

            return this._formFragments[sFragmentName] = oFormFragment;
        },

        /**
         * Show Form Fragment
         */
        _showFormFragment : function(sFragmentName) {
            var oPanel = this.getView().byId("DetailsPanel");

            oPanel.removeAllContent();
            oPanel.insertContent(this._getFormFragment(sFragmentName));
        }
	});

});