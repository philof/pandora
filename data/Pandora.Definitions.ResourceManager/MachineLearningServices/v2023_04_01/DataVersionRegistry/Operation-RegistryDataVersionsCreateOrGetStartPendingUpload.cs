using Pandora.Definitions.Attributes;
using Pandora.Definitions.CustomTypes;
using Pandora.Definitions.Interfaces;
using System;
using System.Collections.Generic;
using System.Net;


// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See NOTICE.txt in the project root for license information.


namespace Pandora.Definitions.ResourceManager.MachineLearningServices.v2023_04_01.DataVersionRegistry;

internal class RegistryDataVersionsCreateOrGetStartPendingUploadOperation : Pandora.Definitions.Operations.PostOperation
{
    public override IEnumerable<HttpStatusCode> ExpectedStatusCodes() => new List<HttpStatusCode>
        {
                HttpStatusCode.OK,
        };

    public override Type? RequestObject() => typeof(PendingUploadRequestDtoModel);

    public override ResourceID? ResourceId() => new VersionId();

    public override Type? ResponseObject() => typeof(PendingUploadResponseDtoModel);

    public override string? UriSuffix() => "/startPendingUpload";


}