sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/Fragment", "sap/m/MessageToast"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Fragment, MessageToast) {
    "use strict";

    return Controller.extend("com.smod.todolistapp.controller.View1", {
      onInit: function () {
        var oViewModel = new sap.ui.model.json.JSONModel({
          Busy: false,
          NewTodo: this._getInitialTodo(),
          TodoSet: [
            {
              ItemId: this._generateUid(),
              ItemText: "Learn Javascript",
              IsCompleted: false,
              CreationDate: new Date("2022-03-01T17:30:00"),
              CompletionDate: null,
            },
            {
              ItemId: this._generateUid(),
              ItemText: "Learn ABAP",
              IsCompleted: false,
              CreationDate: new Date("2022-01-10T10:22:00"),
              CompletionDate: null,
            },
            {
              ItemId: this._generateUid(),
              ItemText: "Learn FIORI",
              IsCompleted: false,
              CreationDate: new Date("2022-05-20T13:48:00"),
              CompletionDate: null,
            },
          ],
          CurrentTodo: null,
        });

        this.getView().setModel(oViewModel, "todoModel");
      },

      onItemButtonPressed: function (event) {
        var oView = this.getView();
        var oButton = event.getSource();
        var itemId = oButton.data("itemId");
        var oViewModel = oView.getModel("todoModel");

        oViewModel.setProperty("/CurrentTodo", oButton.data("currentItem"));

        if (!this._oActionSheet) {
          this._oActionSheet = Fragment.load({
            id: oView.getId(),
            name: "com.smod.todolistapp.fragment.TodoActions",
            controller: this,
          }).then(
            function (oActionSheet) {
              oActionSheet.data("itemId", itemId);
              this._oActionSheet = oActionSheet;
              // to get access to the controller's model
              this.getView().addDependent(this._oActionSheet);
              this._oActionSheet.openBy(oButton);
              return this._oActionSheet;
            }.bind(this)
          );
        } else {
          this._oActionSheet.data("itemId", itemId);
          this._oActionSheet.openBy(oButton);
        }
      },

      onDeleteItem: function (event) {
        var oButton = event.getSource();
        var oActionSheet = oButton.getParent();

        this._dispatchAction("delete", oActionSheet.data("itemId"));
      },
      onCompleteItem: function (event) {
        var oButton = event.getSource();
        var oActionSheet = oButton.getParent();

        this._dispatchAction("complete", oActionSheet.data("itemId"));
      },
      onUndoItem: function (event) {
        var oButton = event.getSource();
        var oActionSheet = oButton.getParent();

        this._dispatchAction("incomplete", oActionSheet.data("itemId"));
      },

      onAddNewItem: function () {
        var oViewModel = this.getView().getModel("todoModel");
        var aToDo = oViewModel.getProperty("/TodoSet");
        var oNewItem = oViewModel.getProperty("/NewTodo");
        var that = this;

        if (!oNewItem.ItemText || oNewItem.ItemText.trim().length === 0) {
          MessageToast.show("Please enter an item text!");
          return;
        }

        var delayedAction = new Promise(function (resolve, reject) {
          setTimeout(function () {
            oNewItem.CreationDate = new Date();
            oNewItem.ItemId = that._generateUid();

            aToDo.push(oNewItem);
            resolve(aToDo);
          }, 1000);
        });

        oViewModel.setProperty("/Busy", true);
        delayedAction.then(function (changedTodo) {
          MessageToast.show("Item has been added!");
          oViewModel.setProperty("/Busy", false);
          oViewModel.setProperty("/TodoSet", changedTodo);
          oViewModel.setProperty("/NewTodo", that._getInitialTodo());
        });
      },

      _getInitialTodo: function () {
        return {
          ItemId: null,
          ItemText: null,
          IsCompleted: false,
          CreationDate: null,
          CompletionDate: null,
        };
      },

      _dispatchAction: function (action, itemId) {
        var oViewModel = this.getView().getModel("todoModel");
        var aToDo = oViewModel.getProperty("/TodoSet");
        var i = this._findIndex(aToDo, itemId);

        var delayedAction = new Promise(function (resolve, reject) {
          setTimeout(function () {
            switch (action) {
              case "delete":
                aToDo.splice(i, 1);
                break;
              case "complete":
                aToDo[i].CompletionDate = new Date();
                aToDo[i].IsCompleted = true;
                break;
              case "incomplete":
                aToDo[i].CompletionDate = null;
                aToDo[i].IsCompleted = false;
                break;
              default:
                return;
            }
            resolve(aToDo);
          }, 1500);
        });

        oViewModel.setProperty("/Busy", true);
        delayedAction.then(function (changedTodo) {
          MessageToast.show("Operation successful!");
          oViewModel.setProperty("/Busy", false);
          oViewModel.setProperty("/TodoSet", changedTodo);
        });
      },

      _findIndex: function (aTodo, itemId) {
        var index = -1;

        index = aTodo.findIndex(function (oTodo) {
          return oTodo.ItemId === itemId;
        });

        return index;
      },

      _generateUid: function () {
        var uid = crypto.randomUUID();

        return uid;
      },
    });
  }
);
