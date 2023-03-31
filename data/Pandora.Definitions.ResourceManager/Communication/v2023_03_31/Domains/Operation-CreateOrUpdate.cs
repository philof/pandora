using Pandora.Definitions.Attributes;
using Pandora.Definitions.CustomTypes;
using Pandora.Definitions.Interfaces;
using Pandora.Definitions.Operations;
using System;
using System.Collections.Generic;
using System.Net;


// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See NOTICE.txt in the project root for license information.


namespace Pandora.Definitions.ResourceManager.Communication.v2023_03_31.Domains;

internal class CreateOrUpdateOperation : Operations.PutOperation
{
    public override bool LongRunning() => true;

    public override Type? RequestObject() => typeof(DomainResourceModel);

    public override ResourceID? ResourceId() => new DomainId();

    public override Type? ResponseObject() => typeof(DomainResourceModel);


}