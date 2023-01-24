using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Pandora.Definitions.Attributes;
using Pandora.Definitions.Attributes.Validation;
using Pandora.Definitions.CustomTypes;


// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See NOTICE.txt in the project root for license information.


namespace Pandora.Definitions.ResourceManager.Automation.v2020_01_13_preview.SourceControl;


internal class SourceControlCreateOrUpdateParametersModel
{
    [JsonPropertyName("properties")]
    [Required]
    public SourceControlCreateOrUpdatePropertiesModel Properties { get; set; }
}