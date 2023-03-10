using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Pandora.Definitions.Attributes;
using Pandora.Definitions.Attributes.Validation;
using Pandora.Definitions.CustomTypes;


// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See NOTICE.txt in the project root for license information.


namespace Pandora.Definitions.ResourceManager.StorageMover.v2023_03_01.Endpoints;

[ValueForType("NfsMount")]
internal class NfsMountEndpointPropertiesModel : EndpointBasePropertiesModel
{
    [JsonPropertyName("export")]
    [Required]
    public string Export { get; set; }

    [JsonPropertyName("host")]
    [Required]
    public string Host { get; set; }

    [JsonPropertyName("nfsVersion")]
    public NfsVersionConstant? NfsVersion { get; set; }
}