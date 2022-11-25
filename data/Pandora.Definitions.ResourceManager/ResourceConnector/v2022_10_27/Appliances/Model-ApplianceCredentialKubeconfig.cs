using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Pandora.Definitions.Attributes;
using Pandora.Definitions.Attributes.Validation;
using Pandora.Definitions.CustomTypes;


// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See NOTICE.txt in the project root for license information.


namespace Pandora.Definitions.ResourceManager.ResourceConnector.v2022_10_27.Appliances;


internal class ApplianceCredentialKubeconfigModel
{
    [JsonPropertyName("name")]
    public AccessProfileTypeConstant? Name { get; set; }

    [JsonPropertyName("value")]
    public string? Value { get; set; }
}