sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/Fragment"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Fragment) {
    "use strict";

    return Controller.extend("com.smod.todolistapp.controller.View1", {
      onInit: function () {
        var oViewModel = new sap.ui.model.json.JSONModel({
          NewTodo: {
            ItemId: null,
            ItemText: null,
            IsCompleted: false,
            CreationDate: null,
            CompletionDate: null,
          },
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
        });

        this.getView().setModel(oViewModel, "todoModel");
      },

      onItemMenuPressed: function (event) {
        var oView = this.getView(),
          oButton = event.getSource();

        var itemId = oButton.data("itemId");

        if (!this._oMenuFragment) {
          this._oMenuFragment = Fragment.load({
            id: oView.getId(),
            name: "com.smod.todolistapp.fragment.TodoActions",
            controller: this,
          }).then(
            function (oMenu) {
              oMenu.data("itemId", itemId);
              oMenu.openBy(oButton);
              this._oMenuFragment = oMenu;
              return this._oMenuFragment;
            }.bind(this)
          );
        } else {
          this._oMenuFragment.data("itemId", itemId);
          this._oMenuFragment.openBy(oButton);
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

        oNewItem.CreationDate = new Date();
        oNewItem.ItemId = this._generateUid();

        aToDo.push(oNewItem);

        oViewModel.setProperty("/TodoSet", aToDo);

        oViewModel.setProperty("/NewTodo", {
          ItemId: null,
          ItemText: null,
          IsCompleted: false,
          CreationDate: null,
          CompletionDate: null,
        });
      },

      _dispatchAction: function (action, itemId) {
        var oViewModel = this.getView().getModel("todoModel");
        var aToDo = oViewModel.getProperty("/TodoSet");
        var i = this._findIndex(aToDo, itemId);

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

        oViewModel.setProperty("/TodoSet", aToDo);
      },

      _findIndex: function (aTodo, itemId) {
        var index = -1;
        aTodo.forEach(function (oTodo, i) {
          if (oTodo.ItemId === itemId) {
            index = i;
            return;
          }
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
