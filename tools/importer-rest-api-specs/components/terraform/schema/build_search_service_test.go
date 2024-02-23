// Copyright (c) HashiCorp, Inc.
// SPDX-License-Identifier: MPL-2.0

package schema

import (
	"testing"

	"github.com/hashicorp/go-azure-helpers/lang/pointer"
	"github.com/hashicorp/go-hclog"
	"github.com/hashicorp/pandora/tools/data-api-sdk/v1/models"
	importerModels "github.com/hashicorp/pandora/tools/importer-rest-api-specs/models"
	"github.com/hashicorp/pandora/tools/sdk/resourcemanager"
)

func TestBuildForSearchServiceUsingRealData(t *testing.T) {
	t.Skipf("TODO: update schema gen & re-enable this test")
	r := resourceUnderTest{
		Name: "search_service",
	}
	builder := Builder{
		constants: map[string]models.SDKConstant{
			"AdminKeyKind": {
				Type: models.StringSDKConstantType,
				Values: map[string]string{
					"Primary":   "primary",
					"Secondary": "secondary",
				},
			},
			"HostingMode": {
				Type: models.StringSDKConstantType,
				Values: map[string]string{
					"Default":     "default",
					"HighDensity": "highDensity",
				},
			},
			"PrivateLinkServiceConnectionStatus": {
				Type: models.StringSDKConstantType,
				Values: map[string]string{
					"Approved":     "Approved",
					"Disconnected": "Disconnected",
					"Pending":      "Pending",
					"Rejected":     "Rejected",
				},
			},
			"ProvisioningState": {
				Type: models.StringSDKConstantType,
				Values: map[string]string{
					"Failed":       "failed",
					"Provisioning": "provisioning",
					"Succeeded":    "succeeded",
				},
			},
			"PublicNetworkAccess": {
				Type: models.StringSDKConstantType,
				Values: map[string]string{
					"Disabled": "disabled",
					"Enabled":  "enabled",
				},
			},
			"SearchServiceStatus": {
				Type: models.StringSDKConstantType,
				Values: map[string]string{
					"Degraded":     "degraded",
					"Deleting":     "deleting",
					"Disabled":     "disabled",
					"Error":        "error",
					"Provisioning": "provisioning",
					"Running":      "running",
				},
			},
			"SharedPrivateLinkResourceStatus": {
				Type: models.StringSDKConstantType,
				Values: map[string]string{
					"Pending":      "Pending",
					"Approved":     "Approved",
					"Rejected":     "Rejected",
					"Disconnected": "Disconnected",
				},
			},
			"SkuName": {
				Type: models.StringSDKConstantType,
				Values: map[string]string{
					"Free":                 "free",
					"Basic":                "basic",
					"Standard":             "standard",
					"StandardTwo":          "standard2",
					"StandardThree":        "standard3",
					"StorageOptimizedLOne": "storage_optimized_l1",
					"StorageOptimizedLTwo": "storage_optimized_l2",
				},
			},
		},
		models: map[string]models.SDKModel{
			"SearchService": {
				Fields: map[string]models.SDKField{
					"Name": {
						JsonName: "name",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.StringSDKObjectDefinitionType,
						},
						Optional: true,
					},
					"Identity": {
						JsonName: "identity",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.SystemAssignedIdentitySDKObjectDefinitionType,
						},
						Optional: true,
					},
					"Location": {
						JsonName: "location",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.LocationSDKObjectDefinitionType,
						},
						Optional: true,
					},
					"Properties": {
						JsonName: "properties",
						ObjectDefinition: models.SDKObjectDefinition{
							Type:          models.ReferenceSDKObjectDefinitionType,
							ReferenceName: pointer.To("SearchServiceProperties"),
						},
						Optional: true,
					},
					"Sku": {
						JsonName: "sku",
						ObjectDefinition: models.SDKObjectDefinition{
							Type:          models.ReferenceSDKObjectDefinitionType,
							ReferenceName: pointer.To("Sku"),
						},
						Optional: true,
					},
					"Tags": {
						JsonName: "tags",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.TagsSDKObjectDefinitionType,
						},
						Optional: true,
					},
				},
			},
			"IPRule": {
				Fields: map[string]models.SDKField{
					"Value": {
						JsonName: "value",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.StringSDKObjectDefinitionType,
						},
					},
				},
			},
			"NetworkRuleSet": {
				Fields: map[string]models.SDKField{
					"IPRules": {
						JsonName: "ipRules",
						ObjectDefinition: models.SDKObjectDefinition{
							// Note: This is a collapsed tree to a list of strings, rather than a list of models.
							Type:          models.ListSDKObjectDefinitionType,
							ReferenceName: pointer.To("IPRule"),
						},
					},
				},
			},
			"SearchServiceProperties": {
				Fields: map[string]models.SDKField{
					"HostingMode": {
						JsonName: "hostingMode",
						ObjectDefinition: models.SDKObjectDefinition{
							Type:          models.ReferenceSDKObjectDefinitionType,
							ReferenceName: pointer.To("HostingMode"),
						},
						Optional: true,
					},
					"NetworkRuleSet": {
						JsonName: "networkRuleSet",
						ObjectDefinition: models.SDKObjectDefinition{
							Type:          models.ReferenceSDKObjectDefinitionType,
							ReferenceName: pointer.To("NetworkRuleSet"),
						},
						Optional: true,
					},
					"PartitionCount": {
						JsonName: "partitionCount",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.IntegerSDKObjectDefinitionType,
						},
						Optional: true,
					},
					"PrivateEndpointConnections": {
						JsonName: "privateEndpointConnections",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.ListSDKObjectDefinitionType,
							NestedItem: &models.SDKObjectDefinition{
								Type:          models.ReferenceSDKObjectDefinitionType,
								ReferenceName: pointer.To("PrivateEndpointConnection"),
							},
						},
					},
					"ProvisioningState": {
						JsonName: "provisioningState",
						ObjectDefinition: models.SDKObjectDefinition{
							Type:          models.ReferenceSDKObjectDefinitionType,
							ReferenceName: pointer.To("ProvisioningState"),
						},
					},
					"PublicNetworkAccess": {
						JsonName: "publicNetworkAccess",
						ObjectDefinition: models.SDKObjectDefinition{
							Type:          models.ReferenceSDKObjectDefinitionType,
							ReferenceName: pointer.To("PublicNetworkAccess"),
						},
						Optional: true,
					},
					"ReplicaCount": {
						JsonName: "replicaCount",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.IntegerSDKObjectDefinitionType,
						},
						Optional: true,
					},
					"SharedPrivateLinkResources": {
						JsonName: "sharedPrivateLinkResources",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.ListSDKObjectDefinitionType,
							NestedItem: &models.SDKObjectDefinition{
								ReferenceName: pointer.To("SharedPrivateLinkResource"),
								Type:          models.ReferenceSDKObjectDefinitionType,
							},
						},
					},
					"Status": {
						JsonName: "status",
						ObjectDefinition: models.SDKObjectDefinition{
							Type:          models.ReferenceSDKObjectDefinitionType,
							ReferenceName: pointer.To("SearchServiceStatus"),
						},
					},
					"StatusDetails": {
						JsonName: "statusDetails",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.StringSDKObjectDefinitionType,
						},
						Optional: true,
					},
				},
			},
			"PrivateEndpoint": {
				Fields: map[string]models.SDKField{
					"Properties": {
						JsonName: "properties",
						ObjectDefinition: models.SDKObjectDefinition{
							Type:          models.ReferenceSDKObjectDefinitionType,
							ReferenceName: pointer.To("PrivateEndpointProperties"),
						},
					},
				},
			},
			"PrivateEndpointProperties": {
				Fields: map[string]models.SDKField{
					"Id": {
						JsonName: "id",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.StringSDKObjectDefinitionType,
						},
					},
				},
			},
			"PrivateEndpointConnection": {
				Fields: map[string]models.SDKField{
					"Properties": {
						JsonName: "properties",
						ObjectDefinition: models.SDKObjectDefinition{
							ReferenceName: pointer.To("PrivateEndpointConnectionProperties"),
							Type:          models.ReferenceSDKObjectDefinitionType,
						},
					},
				},
			},
			"PrivateEndpointConnectionProperties": {
				Fields: map[string]models.SDKField{
					"Properties": {
						JsonName: "properties",
						ObjectDefinition: models.SDKObjectDefinition{
							ReferenceName: pointer.To("PrivateEndpointConnectionPropertiesProperties"),
							Type:          models.ReferenceSDKObjectDefinitionType,
						},
					},
				},
			},
			"PrivateEndpointConnectionPropertiesProperties": {
				Fields: map[string]models.SDKField{
					"PrivateEndpoint": {
						JsonName: "privateEndpoint",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.ListSDKObjectDefinitionType,
							NestedItem: &models.SDKObjectDefinition{
								Type:          models.ReferenceSDKObjectDefinitionType,
								ReferenceName: pointer.To("PrivateEndpoint"),
							},
						},
					},
					"PrivateLinkServiceConnectionState": {
						JsonName: "privateLinkServiceConnectionState",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.ListSDKObjectDefinitionType,
							NestedItem: &models.SDKObjectDefinition{
								Type:          models.ReferenceSDKObjectDefinitionType,
								ReferenceName: pointer.To("PrivateLinkServiceConnectionState"),
							},
						},
					},
				},
			},
			"PrivateLinkServiceConnectionState": {
				Fields: map[string]models.SDKField{
					"Properties": {
						JsonName: "properties",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.ListSDKObjectDefinitionType,
							NestedItem: &models.SDKObjectDefinition{
								Type:          models.ReferenceSDKObjectDefinitionType,
								ReferenceName: pointer.To("PrivateLinkServiceConnectionStateProperties"),
							},
						},
					},
				},
			},
			"PrivateLinkServiceConnectionStateProperties": {
				Fields: map[string]models.SDKField{
					"Status": {
						JsonName: "status",
						ObjectDefinition: models.SDKObjectDefinition{
							Type:          models.ReferenceSDKObjectDefinitionType,
							ReferenceName: pointer.To("PrivateLinkServiceConnectionStatus"),
						},
					},
					"Description": {
						JsonName: "description",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.StringSDKObjectDefinitionType,
						},
					},
					"ActionsRequired": {
						JsonName: "actions_required",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.StringSDKObjectDefinitionType,
						},
					},
				},
			},
			"SharedPrivateLinkResource": {
				Fields: map[string]models.SDKField{
					"Properties": {
						JsonName: "properties",
						ObjectDefinition: models.SDKObjectDefinition{
							ReferenceName: pointer.To("SharedPrivateLinkResourceProperties"),
							Type:          models.ReferenceSDKObjectDefinitionType,
						},
					},
				},
			},
			"SharedPrivateLinkResourceProperties": {
				Fields: map[string]models.SDKField{
					"Properties": {
						JsonName: "properties",
						ObjectDefinition: models.SDKObjectDefinition{
							ReferenceName: pointer.To("SharedPrivateLinkResourcePropertiesProperties"),
							Type:          models.ReferenceSDKObjectDefinitionType,
						},
					},
				},
			},
			"SharedPrivateLinkResourcePropertiesProperties": {
				Fields: map[string]models.SDKField{
					"PrivateLinkResourceId": {
						JsonName: "privateLinkResourceId",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.StringSDKObjectDefinitionType,
						},
					},
					"GroupId": {
						JsonName: "groupId",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.StringSDKObjectDefinitionType,
						},
					},
					"RequestMessage": {
						JsonName: "requestMessage",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.StringSDKObjectDefinitionType,
						},
					},
					"ResourceRegion": {
						JsonName: "resourceRegion",
						ObjectDefinition: models.SDKObjectDefinition{
							Type: models.StringSDKObjectDefinitionType,
						},
					},
					"Status": {
						JsonName: "status",
						ObjectDefinition: models.SDKObjectDefinition{
							Type:          models.ReferenceSDKObjectDefinitionType,
							ReferenceName: pointer.To("SharedPrivateLinkResourceStatus"),
						},
					},
				},
			},
			"Sku": {
				Fields: map[string]models.SDKField{
					"Name": {
						JsonName: "name",
						ObjectDefinition: models.SDKObjectDefinition{
							Type:          models.ReferenceSDKObjectDefinitionType,
							ReferenceName: pointer.To("SkuName"),
						},
						Required: true,
					},
				},
			},
		},
		operations: map[string]models.SDKOperation{
			"Create": {
				LongRunning: false,
				Method:      "PUT",
				RequestObject: &models.SDKObjectDefinition{
					ReferenceName: pointer.To("SearchService"),
					Type:          models.ReferenceSDKObjectDefinitionType,
				},
				ResourceIDName: pointer.To("SearchServiceId"),
			},
			"Delete": {
				LongRunning:    true,
				Method:         "DELETE",
				ResourceIDName: pointer.To("SearchServiceId"),
			},
			"Get": {
				LongRunning: false,
				Method:      "GET",
				ResponseObject: &models.SDKObjectDefinition{
					ReferenceName: pointer.To("SearchService"),
					Type:          models.ReferenceSDKObjectDefinitionType,
				},
				ResourceIDName: pointer.To("SearchServiceId"),
			},
			"Update": {
				LongRunning: false,
				Method:      "PUT",
				RequestObject: &models.SDKObjectDefinition{
					ReferenceName: pointer.To("SearchService"),
					Type:          models.ReferenceSDKObjectDefinitionType,
				},
				ResourceIDName: pointer.To("SearchServiceId"),
			},
		},
		resourceIds: map[string]models.ResourceID{
			"SearchServiceId": {
				CommonIDAlias: pointer.To("ResourceGroup"),
				ConstantNames: nil,
				ExampleValue:  "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Search/searchServices/{searchServiceName}",
				Segments: []models.ResourceIDSegment{
					models.NewStaticValueResourceIDSegment("subscriptions", "subscriptions"),
					models.NewSubscriptionIDResourceIDSegment("subscriptionId"),
					models.NewStaticValueResourceIDSegment("resourceGroups", "resourceGroups"),
					models.NewResourceGroupNameResourceIDSegment("resourceGroupName"),
					models.NewStaticValueResourceIDSegment("providers", "providers"),
					models.NewResourceProviderResourceIDSegment("microsoftSearch", "Microsoft.Search"),
					models.NewStaticValueResourceIDSegment("searchServices", "searchServices"),
					models.NewUserSpecifiedResourceIDSegment("searchServiceName", "searchServiceName"),
				},
			},
		},
	}

	input := resourcemanager.TerraformResourceDetails{
		ApiVersion: "2020-08-01",
		CreateMethod: resourcemanager.MethodDefinition{
			Generate:         true,
			MethodName:       "Create",
			TimeoutInMinutes: 30,
		},
		DeleteMethod: resourcemanager.MethodDefinition{},
		DisplayName:  "Search Service",
		ReadMethod: resourcemanager.MethodDefinition{
			Generate:         true,
			MethodName:       "Get",
			TimeoutInMinutes: 5,
		},
		Resource:        "SearchService",
		ResourceIdName:  "SearchServiceId",
		ResourceName:    "SearchService",
		SchemaModelName: "SearchService",
		UpdateMethod: &resourcemanager.MethodDefinition{
			Generate:         true,
			MethodName:       "Update",
			TimeoutInMinutes: 30,
		},
	}

	var inputResourceBuildInfo *importerModels.ResourceBuildInfo

	actualModels, actualMappings, err := builder.Build(input, inputResourceBuildInfo, hclog.New(hclog.DefaultOptions))
	if err != nil {
		t.Fatalf("building schema: %+v", err)
	}

	if actualModels == nil {
		t.Fatalf("expected 6 models but got nil")
	}
	if len(*actualModels) != 14 { // TODO - Revise this when we have a "definitive" rules list...
		t.Errorf("expected 14 models but got %d", len(*actualModels))
	}
	if actualMappings == nil {
		// TODO: tests for Mappings
		t.Fatalf("expected some mappings but got nil")
	}

	r.CurrentModel = "SearchService"
	currentModel, ok := (*actualModels)[r.CurrentModel]
	if !ok {
		t.Errorf("expected there to be a model %q, but there wasn't", r.CurrentModel)
	} else {
		r.checkFieldName(t, currentModel)
		r.checkFieldLocation(t, currentModel)
		r.checkFieldTags(t, currentModel)

		r.checkField(t, currentModel, expected{
			FieldName: "SkuName",
			HclName:   "sku_name",
			Required:  true,
			ForceNew:  true,
			FieldType: resourcemanager.TerraformSchemaFieldTypeString,
			Validation: &expectedValidation{
				Type:               resourcemanager.TerraformSchemaValidationTypePossibleValues,
				PossibleValueCount: 7,
			},
		})
		r.checkField(t, currentModel, expected{
			FieldName:     "HostingMode",
			HclName:       "hosting_mode",
			Optional:      true,
			FieldType:     resourcemanager.TerraformSchemaFieldTypeString,
			ReferenceName: pointer.To("HostingMode"),
			Validation: &expectedValidation{
				Type:               resourcemanager.TerraformSchemaValidationTypePossibleValues,
				PossibleValueCount: 2,
			},
		})
		r.checkField(t, currentModel, expected{
			FieldName:     "AllowedIPs",
			HclName:       "allowed_ips",
			Optional:      true,
			FieldType:     resourcemanager.TerraformSchemaFieldTypeList,
			ReferenceName: pointer.To("IPRules"),
		})
		r.checkField(t, currentModel, expected{
			FieldName: "PartitionCount",
			HclName:   "partition_count",
			Optional:  true,
			ForceNew:  false,
			FieldType: resourcemanager.TerraformSchemaFieldTypeInteger,
		})
		r.checkField(t, currentModel, expected{
			FieldName: "PrivateEndpointId", // Note: This is a really deep collapse of models
			HclName:   "private_endpoint_id",
			Computed:  true,
			FieldType: resourcemanager.TerraformSchemaFieldTypeString,
		})
		r.checkField(t, currentModel, expected{
			FieldName: "PublicNetworkAccess",
			HclName:   "public_network_access",
			Optional:  true,
			FieldType: resourcemanager.TerraformSchemaFieldTypeBoolean,
		})
		r.checkField(t, currentModel, expected{
			FieldName: "ReplicaCount",
			HclName:   "replica_count",
			Optional:  true,
			FieldType: resourcemanager.TerraformSchemaFieldTypeInteger,
		})
		r.checkField(t, currentModel, expected{
			FieldName:           "SharedPrivateLinkResource",
			HclName:             "shared_private_link_resource",
			Computed:            true,
			FieldType:           resourcemanager.TerraformSchemaFieldTypeList,
			NestedReferenceName: pointer.To("SearchServiceSharedPrivateLinkResource"),
			NestedReferenceType: resourcemanager.TerraformSchemaFieldTypeReference,
		})
		r.checkField(t, currentModel, expected{
			FieldName:           "AllowedIPs",
			HclName:             "allowed_ips",
			Optional:            true,
			FieldType:           resourcemanager.TerraformSchemaFieldTypeList,
			NestedReferenceType: resourcemanager.TerraformSchemaFieldTypeString,
		})
	}

	r.CurrentModel = "SearchServiceProperties"
	currentModel, ok = (*actualModels)[r.CurrentModel]
	if ok {
		t.Errorf("expected there not to be a model %q, but there was", r.CurrentModel)
	}

	r.CurrentModel = "IPRule"
	currentModel, ok = (*actualModels)[r.CurrentModel]
	if ok {
		t.Errorf("expected there not to be a model %q, but there was", r.CurrentModel)
	}

	r.CurrentModel = "NetworkRuleSet"
	currentModel, ok = (*actualModels)[r.CurrentModel]
	if ok {
		t.Errorf("expected there not to be a model %q, but there was", r.CurrentModel)
	}

	r.CurrentModel = "SearchServicePrivateEndpointConnection"
	currentModel, ok = (*actualModels)[r.CurrentModel]
	if !ok {
		t.Errorf("expected there to be a model %q, but there wasn't", r.CurrentModel)
	} else {
		r.checkField(t, currentModel, expected{
			FieldName: "Id",
			HclName:   "id",
			Computed:  true,
			FieldType: resourcemanager.TerraformSchemaFieldTypeString,
		})
		r.checkField(t, currentModel, expected{
			FieldName: "Name",
			HclName:   "name",
			Computed:  true,
			FieldType: resourcemanager.TerraformSchemaFieldTypeString,
		})
		r.checkField(t, currentModel, expected{
			FieldName:     "PrivateEndpoint",
			HclName:       "private_endpoint",
			Computed:      true,
			FieldType:     resourcemanager.TerraformSchemaFieldTypeReference,
			ReferenceName: pointer.To("PrivateEndpoint"),
		})
	}

	r.CurrentModel = "SearchServicePrivateEndpoint"
	currentModel, ok = (*actualModels)[r.CurrentModel]
	if ok {
		t.Errorf("expected there not to be a model %q, but there was", r.CurrentModel)
	}

	r.CurrentModel = "SearchServicePrivateEndpointConnectionProperties"
	currentModel, ok = (*actualModels)[r.CurrentModel]
	if ok {
		t.Errorf("expected there not to be a model %q, but there was", r.CurrentModel)
	}

	r.CurrentModel = "SearchServicePrivateLinkServiceConnectionStateProperties"
	currentModel, ok = (*actualModels)[r.CurrentModel]
	if ok {
		t.Errorf("expected there not to be a model %q, but there was", r.CurrentModel)
	}

	r.CurrentModel = "SearchServiceSharedPrivateLinkResource"
	currentModel, ok = (*actualModels)[r.CurrentModel]
	if !ok {
		t.Errorf("expected there to be a model %q, but there wasn't", r.CurrentModel)
	}
}
