/*global QUnit sinon*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/dt/DesignTime',
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/plugin/Remove',
	'sap/ui/rta/plugin/ControlVariant',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/m/Button',
	'sap/ui/layout/VerticalLayout',
	'sap/ui/dt/OverlayRegistry',
	'sap/m/Label',
	'sap/ui/core/Title',
	'sap/m/Input',
	'sap/ui/layout/form/Form',
	'sap/ui/layout/form/FormContainer',
	'sap/ui/layout/form/SimpleForm',
	'sap/uxap/ObjectPageSection'
],
function(
	DesignTime,
	Plugin,
	Remove,
	ControlVariant,
	CommandFactory,
	ChangeRegistry,
	Button,
	VerticalLayout,
	OverlayRegistry,
	Label,
	Title,
	Input,
	Form,
	FormContainer,
	SimpleForm,
	ObjectPageSection
) {
	"use strict";
	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given this the Plugin is initialized", {
		beforeEach : function(assert) {
			var done = assert.async();

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"VerticalLayout" : {
					"moveControls": "default"
				}
			});

			this.oButton = new Button();
			this.oLayout = new VerticalLayout({
				content : [
					this.oButton
				]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout]
			});

			this.oPlugin = new sap.ui.rta.plugin.Plugin({
				commandFactory : new CommandFactory()
			});
			this.oRemovePlugin = new Remove();

			sandbox.stub(this.oPlugin, "_isEditable").returns(true);
			sandbox.stub(this.oRemovePlugin, "_isEditable").returns(true);

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				done();
			}.bind(this));

		},
		afterEach : function() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when the hasChangeHandler function is called", function(assert) {
		assert.strictEqual(this.oPlugin.hasChangeHandler("moveControls", this.oLayout), true, "then the function returns true");
	});

	QUnit.test("when the addToPluginsList and removeFromPluginsList methods are called", function(assert) {

		assert.notOk(this.oButtonOverlay.getEditable(), "then the Overlay is not editable");

		this.oPlugin.registerElementOverlay(this.oButtonOverlay);
		assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 1, "then a plugin got added");
		assert.equal(this.oButtonOverlay.getEditableByPlugins()[0], "sap.ui.rta.plugin.Plugin", "then the name of the added plugin is correct");
		assert.ok(this.oButtonOverlay.getEditable(), "then the Overlay is editable");

		this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);
		assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 2, "then another plugin got added");
		assert.equal(this.oButtonOverlay.getEditableByPlugins()[1], "sap.ui.rta.plugin.Remove", "then the name of the added plugin is correct");
		assert.ok(this.oButtonOverlay.getEditable(), "then the Overlay is editable");

		this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
		assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 1, "then a plugin got removed");
		assert.equal(this.oButtonOverlay.getEditableByPlugins()[0], "sap.ui.rta.plugin.Plugin", "then the name of the plugin left is correct");
		assert.ok(this.oButtonOverlay.getEditable(), "then the Overlay is editable");

		this.oPlugin.deregisterElementOverlay(this.oButtonOverlay);
		assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 0, "then all plugins got removed");
		assert.notOk(this.oButtonOverlay.getEditable(), "then the Overlay is not editable");
	});

	QUnit.test("when the control has no stable id and hasStableId method is called", function(assert) {
		assert.strictEqual(this.oPlugin.hasStableId(this.oButtonOverlay), false, "then it returns false");
	});

	QUnit.module("Given this the Plugin is initialized", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oButton = new Button("button");
			this.oLayout = new VerticalLayout({
				content : [
					this.oButton
				]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout]
			});

			this.oPlugin = new sap.ui.rta.plugin.Plugin();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				done();
			}.bind(this));

		},
		afterEach : function() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when the control has a stable id and hasStableId method is called", function(assert) {
		assert.ok(this.oPlugin.hasStableId(this.oButtonOverlay), "then it returns true");
	});

	QUnit.module("Given the Plugin is initialized", {
		beforeEach : function(assert) {

			this.oGroup = new FormContainer("group");
			this.oForm = new Form("Form", {
				formContainers : [this.oGroup]
			}).placeAt("content");


			sap.ui.getCore().applyChanges();

			this.oPlugin = new sap.ui.rta.plugin.Plugin({
				commandFactory : new CommandFactory()
			});
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oForm
				],
				plugins: []
			});

			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oFormOverlay = OverlayRegistry.getOverlay(this.oForm);
				this.oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);
				done();
			}.bind(this));
		},
		afterEach : function(assert) {
			this.oForm.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when DesignTimeMetadata has no actions but aggregations with actions and checkAggregationsOnSelf method is called", function(assert) {
		this.oFormOverlay.setDesignTimeMetadata({
			aggregations : {
				formContainers : {
					actions : {
						changeType: "addGroup"
					}
				}
			}
		});

		assert.ok(this.oPlugin.checkAggregationsOnSelf(this.oFormOverlay, "changeType"), "then it returns true");
	});

	QUnit.test("when DesignTimeMetadata has actions and checkAggregations method is called without the action name", function(assert) {
		this.oFormOverlay.setDesignTimeMetadata({
			actions : {}
		});

		assert.notOk(this.oPlugin.checkAggregationsOnSelf(this.oFormOverlay, undefined), "then it returns false");
	});

	QUnit.module("Given the Plugin is initialized.", {
		beforeEach : function(assert) {

			this.oTitle0 = new Title({id : "Title0"});
			this.oLabel0 = new Label({id : "Label0"});
			this.oInput0 = new Input({id : "Input0"});
			this.oSimpleForm = new SimpleForm("SimpleForm", {
				title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0]
			});

			this.oVerticalLayout = new VerticalLayout({
				content : [this.oSimpleForm]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oForm = this.oSimpleForm.getAggregation("form");
			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];

			this.oPlugin = new sap.ui.rta.plugin.Plugin({
				commandFactory : new CommandFactory()
			});
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oVerticalLayout
				],
				plugins: []
			});

			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oSimpleFormOverlay = OverlayRegistry.getOverlay(this.oSimpleForm);
				this.oFormOverlay = OverlayRegistry.getOverlay(this.oForm);
				this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
				done();
			}.bind(this));
		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when DesignTimeMetadata has no actions but aggregations with actions and checkAggregations method is called", function(assert) {
		this.oFormOverlay.setDesignTimeMetadata({
			aggregations : {
				formContainer : {
					actions : {
						createContainer : {
							changeType : "addSimpleFormGroup",
							changeOnRelevantContainer : true
						}
					}
				}
			}
		});

		assert.ok(this.oPlugin.checkAggregationsOnSelf(this.oFormOverlay, "createContainer"), "then it returns true");
	});

	QUnit.test("when control has no stable id and hasStableId method is called", function(assert) {
		this.oFormContainerOverlay.setDesignTimeMetadata({
			aggregations : {
				form : {
					actions : {
						getStableElements : function(oElement) {
							var aStableElements = [];
							var oLabel;
							var oTitleOrToolbar;
							if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
								oLabel = oElement.getLabel();
								if (oLabel) {
									aStableElements.push(oLabel);
								}
								aStableElements = aStableElements.concat(oElement.getFields());
							} else if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormContainer") {
								oTitleOrToolbar = oElement.getTitle() || oElement.getToolbar();
								if (oTitleOrToolbar) {
									aStableElements[0] = oTitleOrToolbar;
								}
								oElement.getFormElements().forEach(function(oFormElement) {
									oLabel = oFormElement.getLabel();
									if (oLabel) {
										aStableElements.push(oLabel);
									}
									aStableElements = aStableElements.concat(oFormElement.getFields());
								});
							}
							return aStableElements;
						}
					}
				}
			}
		});
		assert.ok(this.oPlugin.hasStableId(this.oFormContainerOverlay), "then it returns true");
	});

	QUnit.module("Given this the Plugin is initialized.", {
		beforeEach : function(assert) {

			this.oTitle0 = new Title();
			this.oLabel0 = new Label();
			this.oInput0 = new Input();
			this.oSimpleForm = new SimpleForm("SimpleForm", {
				title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0]
			});

			this.oVerticalLayout = new VerticalLayout({
				content : [this.oSimpleForm]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];

			this.oPlugin = new sap.ui.rta.plugin.Plugin();
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oVerticalLayout
				],
				plugins: []
			});

			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oSimpleFormOverlay = OverlayRegistry.getOverlay(this.oSimpleForm);
				this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
				done();
			}.bind(this));
		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when the control has no stable id and hasStableId method is called", function(assert) {
		this.oFormContainerOverlay.setDesignTimeMetadata({
			aggregations : {
				form : {
					actions : {
						getStableElements : function(oElement) {
							var aStableElements = [];
							var oLabel;
							var oTitleOrToolbar;
							if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
								oLabel = oElement.getLabel();
								if (oLabel) {
									aStableElements.push(oLabel);
								}
								aStableElements = aStableElements.concat(oElement.getFields());
							} else if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormContainer") {
								oTitleOrToolbar = oElement.getTitle() || oElement.getToolbar();
								if (oTitleOrToolbar) {
									aStableElements[0] = oTitleOrToolbar;
								}
								oElement.getFormElements().forEach(function(oFormElement) {
									oLabel = oFormElement.getLabel();
									if (oLabel) {
										aStableElements.push(oLabel);
									}
									aStableElements = aStableElements.concat(oFormElement.getFields());
								});
							}
							return aStableElements;
						}
					}
				}
			}
		});
		assert.notOk(this.oPlugin.hasStableId(this.oFormContainerOverlay), "then it returns false");
	});

	QUnit.test("when the control has no stable id, no actions and hasStableId method is called", function(assert) {
		this.oFormContainerOverlay.setDesignTimeMetadata({
			aggregations : {
				form : {
					actions : {}
				}
			}
		});
		assert.notOk(this.oPlugin.hasStableId(this.oFormContainerOverlay), "then it returns false");
	});

	QUnit.module("Given the Plugin is initialized", {
		beforeEach : function(assert) {
			var done = assert.async();

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"ObjectPageSection" : {
					"rename": "sap/ui/fl/changeHandler/BaseRename"
				},
				"sap.m.Button" : {
					"removeButton": "sap/ui/fl/changeHandler/Base"
				}
			});

			this.oObjectPageSection = new ObjectPageSection();
			this.oButton = new Button();
			this.oLayout = new VerticalLayout({
				content : [this.oObjectPageSection, this.oButton]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout]
			});

			this.oPlugin = new sap.ui.rta.plugin.Plugin({
				commandFactory : new CommandFactory()
			});
			this.oControlVariantPlugin = new sap.ui.rta.plugin.ControlVariant({
				commandFactory : new CommandFactory()
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oObjectPageSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				done();
			}.bind(this));

		},
		afterEach : function() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when the control is checked for a variant change handler", function(assert) {
		var bVariantChangeHandlerForSectionRename = this.oPlugin._hasVariantChangeHandler("rename", this.oObjectPageSection);
		var bVariantChangeHandlerForButtonRemove = this.oPlugin._hasVariantChangeHandler("removeButton", this.oButton);
		assert.ok(bVariantChangeHandlerForSectionRename, "then the control has a variant ChangeHandler");
		assert.notOk(bVariantChangeHandlerForButtonRemove, "then the control has no variant ChangeHandler");
	});

	QUnit.test("when calling 'getVariantManagementReference'", function(assert) {
		this.oButtonOverlay.setDesignTimeMetadata({
			actions: {
				remove: {
					changeType: "removeButton"
				}
			}
		});

		sandbox.stub(this.oObjectPageSectionOverlay, "getVariantManagement").returns("variant-test");
		sandbox.stub(this.oButtonOverlay, "getVariantManagement").returns(undefined);
		var oObjectPageSectionAction = this.oObjectPageSectionOverlay.getDesignTimeMetadata().getAction("rename", this.oObjectPageSectionOverlay.getElementInstance());
		var oButtonAction = this.oButtonOverlay.getDesignTimeMetadata().getAction("remove", this.oButtonOverlay.getElementInstance());

		var sVarMgmtRefForObjectPageSection = this.oPlugin.getVariantManagementReference(this.oObjectPageSectionOverlay, oObjectPageSectionAction);
		var sVarMgmtRefForButton = this.oPlugin.getVariantManagementReference(this.oButtonOverlay, oButtonAction);
		assert.equal(sVarMgmtRefForObjectPageSection, "variant-test", "then for the control with variant ChangeHandler the variant management reference is returned");
		assert.equal(sVarMgmtRefForButton, undefined, "then for the control without variant ChangeHandler undefined is returned");
	});

});