using System.Collections.Generic;
using Pandora.Definitions.Interfaces;


// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See NOTICE.txt in the project root for license information.


namespace Pandora.Definitions.ResourceManager.AppConfiguration.v2023_03_01.DeletedConfigurationStores;

internal class Definition : ResourceDefinition
{
    public string Name => "DeletedConfigurationStores";
    public IEnumerable<Interfaces.ApiOperation> Operations => new List<Interfaces.ApiOperation>
    {
        new ConfigurationStoresGetDeletedOperation(),
        new ConfigurationStoresListDeletedOperation(),
        new ConfigurationStoresPurgeDeletedOperation(),
    };
}