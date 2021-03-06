/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.f.DynamicPage control
sap.ui.define([],
	function() {
	"use strict";

	return {
		aggregations : {
			title : {
				domRef : ":sap-domref .sapFDynamicPageTitle"
			},
			header : {
				domRef : ":sap-domref .sapFDynamicPageHeader"
			},
			content : {
				domRef :  ":sap-domref .sapFDynamicPageContent"
			},
			footer : {
				domRef : ":sap-domref .sapFDynamicPageActualFooterControl"
			}
		},
		scrollContainers : [{
				domRef : "> .sapFDynamicPageContentWrapper",
				aggregations : ["header", "content"]
			},
			{
				domRef : function(oElement) {
					return oElement.$("vertSB-sb").get(0);
				}
			}]
	};

}, /* bExport= */ false);
