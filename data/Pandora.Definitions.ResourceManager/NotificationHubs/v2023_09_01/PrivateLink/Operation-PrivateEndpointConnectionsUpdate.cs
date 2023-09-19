using Pandora.Definitions.Attributes;
using Pandora.Definitions.CustomTypes;
using Pandora.Definitions.Interfaces;
using System;
using System.Collections.Generic;
using System.Net;


// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See NOTICE.txt in the project root for license information.


namespace Pandora.Definitions.ResourceManager.NotificationHubs.v2023_09_01.PrivateLink;

internal class PrivateEndpointConnectionsUpdateOperation : Pandora.Definitions.Operations.PutOperation
{
    public override bool LongRunning() => true;

    public override Type? RequestObject() => typeof(PrivateEndpointConnectionResourceModel);

    public override ResourceID? ResourceId() => new PrivateEndpointConnectionId();

    public override Type? ResponseObject() => typeof(PrivateEndpointConnectionResourceModel);


}
